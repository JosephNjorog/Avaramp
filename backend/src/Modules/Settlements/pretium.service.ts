/**
 * Settlement provider adapter — fiat payout + FX rates.
 *
 * Payout (`payout()`) and FX (`getRate()`) field names below are confirmed
 * against the live API (validation-error probing against real credentials,
 * 2026-09-06) — this is the one part of this integration NOT based on guesswork.
 *
 * Two things are still unconfirmed and must be resolved before
 * PRETIUM_SKIP_SETTLEMENT is turned off in production:
 *   1. PRETIUM_SETTLEMENT_ADDRESS (the on-chain address `payout()` sweeps USDC
 *      to before calling the provider) is a placeholder — get the real
 *      receiving address from the provider's dashboard/support.
 *   2. Whether the provider's transaction-hash verification even supports
 *      Avalanche C-Chain (chain id 43114, what AvaRamp deposits run on) is
 *      unconfirmed — confirm with their support before relying on this path.
 */
import axios from "axios";
import { logger } from "../../shared/Utils/Logger";
import { walletService } from "../blockchain/wallet.service";

type PayoutType = "phone" | "till" | "paybill";

interface PayoutOptions {
  paymentId: string;
  currency: string;
  amountFiat: number;
  payoutType: PayoutType;
  payoutAccount: string;
  payoutAccountRef?: string;
  mobileNetwork?: string | null;
  depositPk: string;
}

interface PayoutResult {
  reference: string;
  status: "PENDING" | "COMPLETED";
}

const TYPE_MAP: Record<PayoutType, "MOBILE" | "PAYBILL" | "BUY_GOODS"> = {
  phone: "MOBILE",
  paybill: "PAYBILL",
  till: "BUY_GOODS",
};

function client() {
  return axios.create({
    baseURL: process.env.PRETIUM_BASE_URL,
    timeout: 20_000,
    headers: { "x-api-key": process.env.PRETIUM_API_KEY! },
  });
}

export class PretiumService {
  async payout(opts: PayoutOptions): Promise<PayoutResult> {
    // The provider verifies an on-chain transfer before releasing fiat, so the
    // USDC held at this payment's deposit address has to move to the
    // provider's receiving address first.
    const settlementAddress = process.env.PRETIUM_SETTLEMENT_ADDRESS!;
    const transactionHash = await walletService.sweepUsdcTo(opts.depositPk, settlementAddress);

    const type = TYPE_MAP[opts.payoutType];

    const payload: Record<string, unknown> = {
      transaction_hash: transactionHash,
      type,
      shortcode: opts.payoutAccount,
      amount: opts.amountFiat,
    };
    if (type === "MOBILE") payload.mobile_network = opts.mobileNetwork;
    if (type === "PAYBILL") payload.account_number = opts.payoutAccountRef ?? opts.paymentId;

    const { data } = await client().post(`/v1/pay/${opts.currency}`, payload);

    if (data?.code && data.code !== 200) {
      throw new Error(`Settlement payout failed: ${data.message ?? "unknown error"}`);
    }

    const reference = data?.data?.transaction_code;
    if (!reference) {
      throw new Error("Settlement payout succeeded but returned no transaction_code");
    }

    logger.info({ paymentId: opts.paymentId, transactionHash, reference }, "Settlement payout initiated");

    return { reference, status: "PENDING" };
  }

  /** Returns units of `currency` per 1 USD, or null if unavailable — caller falls back. */
  async getRate(currency: string): Promise<number | null> {
    try {
      const { data } = await client().post("/v1/exchange-rate", { currency_code: currency });
      const rate = data?.data?.selling_rate;
      return typeof rate === "number" ? rate : null;
    } catch (err: any) {
      logger.warn({ currency, err: err.message }, "Settlement provider FX lookup failed, falling back");
      return null;
    }
  }
}

export const pretiumService = new PretiumService();
