import { SettlementRepository } from "./Settlemet.repository";
import { ledger } from "../../shared/database/ledger";
import { webhookQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";
import { logger } from "../../shared/Utils/Logger";
import { pretiumService } from "./pretium.service";
import { DEFAULT_FEE_BPS } from "../../shared/constants";

const repo = new SettlementRepository();

export class SettlementService {
  async settle(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    if (payment.status !== "CONFIRMED") {
      throw new ValidationError(
        `Payment ${paymentId} is not in CONFIRMED state (current: ${payment.status})`
      );
    }

    const merchant = payment.merchant;
    const currency = (payment.fiatCurrency as string) || merchant.payoutCurrency || "KES";
    const grossFiat = parseFloat(payment.amountFiat as string);

    // ── Platform fee — deducted from the merchant's payout, not charged on top ──
    const feeBps = merchant.feeOverrideBps ?? DEFAULT_FEE_BPS;
    const feeAmount = Math.round(grossFiat * feeBps) / 10000;
    const netFiat = grossFiat - feeAmount;
    const netFiatStr = netFiat.toFixed(2);
    const feeAmountStr = feeAmount.toFixed(2);

    // ── Skip mode: mark settled without calling the settlement provider ──
    // (explicit env flag for local/staging testing, or a payment made with a test API key)
    if (process.env.PRETIUM_SKIP_SETTLEMENT === "true" || payment.isTest) {
      logger.warn(
        { paymentId, isTest: payment.isTest },
        "Settlement skip mode — marking settled without a real payout call"
      );
      const fakeReference = `SKIP_${Date.now()}`;
      const settled = await repo.markSettled(paymentId, {
        settlementReference: fakeReference,
        feeBps,
        feeAmount: feeAmountStr,
      });
      await this.recordSettlementLedger({ paymentId, merchantId: merchant.id, currency, netFiatStr, feeAmountStr, reference: fakeReference, skipped: true });
      await webhookQueue.add("deliver", {
        paymentId,
        event: "payment.settled",
        payload: { paymentId, reference: fakeReference, amount: netFiatStr, feeBps, feeAmount: feeAmountStr, currency, isTest: payment.isTest },
      });
      return settled;
    }

    // ── Determine payout destination ───────────────────────────────────────
    const payoutType = (merchant.payoutType || "till") as "phone" | "till" | "paybill";
    const payoutAccount = merchant.payoutAccount;
    const payoutRef = merchant.payoutAccountRef ?? undefined;

    const { reference } = await pretiumService.payout({
      paymentId,
      currency,
      amountFiat: netFiat,
      payoutType,
      payoutAccount,
      payoutAccountRef: payoutRef,
      mobileNetwork: merchant.mobileNetwork,
      depositPk: payment.depositPk,
    });

    logger.info({ paymentId, reference, payoutType, payoutAccount, feeBps, feeAmount: feeAmountStr }, "Settlement payout initiated");

    // Mark payment as SETTLED in DB (settlement webhook will confirm/reconcile)
    const settled = await repo.markSettled(paymentId, {
      settlementReference: reference,
      feeBps,
      feeAmount: feeAmountStr,
    });

    await this.recordSettlementLedger({ paymentId, merchantId: merchant.id, currency, netFiatStr, feeAmountStr, reference, payoutType, payoutAccount });

    await webhookQueue.add("deliver", {
      paymentId,
      event: "payment.settled",
      payload: { paymentId, reference, amount: netFiatStr, feeBps, feeAmount: feeAmountStr, currency },
    });

    return settled;
  }

  private async recordSettlementLedger(opts: {
    paymentId: string; merchantId: string; currency: string;
    netFiatStr: string; feeAmountStr: string; reference: string;
    skipped?: boolean; payoutType?: string; payoutAccount?: string;
  }) {
    const { paymentId, merchantId, currency, netFiatStr, feeAmountStr, reference } = opts;

    await ledger.record({
      paymentId,
      type: opts.skipped ? "SETTLEMENT_COMPLETED" : "SETTLEMENT_INITIATED",
      debitAcct: "escrow",
      creditAcct: `merchant:${merchantId}`,
      amount: netFiatStr,
      currency,
      metadata: { reference, skipped: opts.skipped, payoutType: opts.payoutType, payoutAccount: opts.payoutAccount },
    });

    // Platform fee — only record if there's actually a fee (0-bps merchants skip this entry)
    if (parseFloat(feeAmountStr) > 0) {
      await ledger.record({
        paymentId,
        type: "PROTOCOL_FEE",
        debitAcct: "escrow",
        creditAcct: "treasury",
        amount: feeAmountStr,
        currency,
        metadata: { reference },
      });
    }
  }

  async getSettlement(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    return payment;
  }
}
