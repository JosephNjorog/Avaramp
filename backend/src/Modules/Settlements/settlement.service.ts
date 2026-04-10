import axios from "axios";
import { SettlementRepository } from "./Settlemet.repository";
import { ledger } from "../../shared/database/ledger";
import { webhookQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";
import { logger } from "../../shared/Utils/Logger";

const repo = new SettlementRepository();

const PAYSTACK_BASE = "https://api.paystack.co";
const PAYSTACK_SECRET = () => process.env.PAYSTACK_SECRET_KEY!;

// ── Currency → Paystack config mapping ──────────────────────────────────────
// payout type "phone"   → personal mobile money / M-Pesa
// payout type "till"    → business till (buy-goods number)
// payout type "paybill" → business paybill (pay-bill number + account ref)

type PaystackRecipientType = "mpesa" | "mobile_money" | "nuban" | "ghipss";

interface CurrencyConfig {
  recipientType: PaystackRecipientType;
  bankCode: string; // Paystack bank_code or mobile network code
}

const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  KES: { recipientType: "mpesa",        bankCode: "MPESA"    },
  NGN: { recipientType: "nuban",        bankCode: "058"      }, // GTBank default; override per merchant
  GHS: { recipientType: "mobile_money", bankCode: "MTN"      },
  TZS: { recipientType: "mobile_money", bankCode: "VODACOM"  },
  UGX: { recipientType: "mobile_money", bankCode: "AIRTEL"   },
};

export class SettlementService {
  // ── Create Paystack transfer recipient ─────────────────────────────────────
  private async createRecipient(opts: {
    name: string;
    account: string;          // phone, till, or paybill number
    accountRef?: string;      // paybill account reference
    currency: string;
    payoutType: string;       // "phone" | "till" | "paybill"
    bankCode?: string;        // override for NGN bank codes
  }): Promise<string> {
    const currencyCfg = CURRENCY_MAP[opts.currency] ?? CURRENCY_MAP["KES"];
    const bankCode = opts.bankCode ?? currencyCfg.bankCode;

    // For paybill: Paystack account_number = "<paybill>/<accountRef>"
    const accountNumber =
      opts.payoutType === "paybill" && opts.accountRef
        ? `${opts.account}/${opts.accountRef}`
        : opts.account;

    const payload: Record<string, string> = {
      type:           currencyCfg.recipientType,
      name:           opts.name,
      account_number: accountNumber,
      bank_code:      bankCode,
      currency:       opts.currency,
    };

    const { data } = await axios.post(
      `${PAYSTACK_BASE}/transferrecipient`,
      payload,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET()}` } }
    );

    if (!data.status) {
      throw new Error(`Paystack create recipient failed: ${data.message}`);
    }

    return data.data.recipient_code;
  }

  // ── Initiate Paystack transfer ─────────────────────────────────────────────
  private async initiateTransfer(opts: {
    recipientCode: string;
    amountInSmallestUnit: number;   // e.g. KES in cents (×100), NGN in kobo (×100)
    currency: string;
    reason: string;
    reference: string;
  }): Promise<string> {
    const { data } = await axios.post(
      `${PAYSTACK_BASE}/transfer`,
      {
        source:    "balance",
        amount:    opts.amountInSmallestUnit,
        recipient: opts.recipientCode,
        reason:    opts.reason,
        reference: opts.reference,
        currency:  opts.currency,
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET()}` } }
    );

    if (!data.status) {
      throw new Error(`Paystack transfer failed: ${data.message}`);
    }

    // data.data.transfer_code e.g. "TRF_xxxxxxxx"
    return data.data.transfer_code as string;
  }

  // ── Core settlement ────────────────────────────────────────────────────────
  async settle(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    if (payment.status !== "CONFIRMED") {
      throw new ValidationError(
        `Payment ${paymentId} is not in CONFIRMED state (current: ${payment.status})`
      );
    }

    const merchant = payment.merchant;
    const currency  = (payment.fiatCurrency as string) || merchant.payoutCurrency || "KES";
    const amountFiat = parseFloat(payment.amountFiat as string);

    // ── Skip mode: mark settled without calling Paystack (for testing / staging) ──
    if (process.env.PAYSTACK_SKIP_SETTLEMENT === "true" || process.env.MPESA_SKIP_SETTLEMENT === "true") {
      logger.warn({ paymentId }, "SKIP_SETTLEMENT=true — marking settled without real Paystack call");
      const fakeReceiptId = `SKIP_${Date.now()}`;
      const settled = await repo.markSettled(paymentId, { mpesaReceiptId: fakeReceiptId });
      await ledger.record({
        paymentId,
        type:       "PAYSTACK_SETTLED",
        debitAcct:  "escrow",
        creditAcct: `merchant:${merchant.id}`,
        amount:     payment.amountFiat as string,
        currency,
        metadata:   { transferCode: fakeReceiptId, skipped: true },
      });
      await webhookQueue.add("deliver", {
        paymentId,
        event:   "payment.settled",
        payload: { paymentId, transferCode: fakeReceiptId, amount: payment.amountFiat, currency },
      });
      return settled;
    }

    // ── Determine payout destination ───────────────────────────────────────
    const payoutType    = merchant.payoutType    || "till";
    const payoutAccount = merchant.payoutAccount || merchant.mpesaTill;
    const payoutRef     = merchant.payoutAccountRef ?? undefined;

    // Paystack amounts are in the smallest currency unit (KES/GHS/etc × 100)
    const amountInSmallestUnit = Math.round(amountFiat * 100);

    // Step 1 — create recipient
    const recipientCode = await this.createRecipient({
      name:       merchant.name,
      account:    payoutAccount,
      accountRef: payoutRef,
      currency,
      payoutType,
    });

    logger.info({ paymentId, recipientCode, payoutType, payoutAccount }, "Paystack recipient created");

    // Step 2 — initiate transfer
    const transferCode = await this.initiateTransfer({
      recipientCode,
      amountInSmallestUnit,
      currency,
      reason:    `AvaRamp settlement – payment ${paymentId}`,
      reference: paymentId, // idempotency key for Paystack
    });

    logger.info({ paymentId, transferCode }, "Paystack transfer initiated");

    // Mark payment as SETTLED in DB (Paystack webhooks will confirm)
    const settled = await repo.markSettled(paymentId, { mpesaReceiptId: transferCode });

    // Double-entry ledger: debit escrow, credit merchant
    await ledger.record({
      paymentId,
      type:       "PAYSTACK_SETTLED",
      debitAcct:  "escrow",
      creditAcct: `merchant:${merchant.id}`,
      amount:     payment.amountFiat as string,
      currency,
      metadata:   { transferCode, payoutType, payoutAccount },
    });

    // Notify merchant via webhook
    await webhookQueue.add("deliver", {
      paymentId,
      event:   "payment.settled",
      payload: { paymentId, transferCode, amount: payment.amountFiat, currency },
    });

    return settled;
  }

  async getSettlement(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    return payment;
  }
}
