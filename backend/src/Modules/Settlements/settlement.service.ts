import axios from "axios";
import { SettlementRepository } from "./Settlemet.repository";
import { ledger } from "../../shared/database/ledger";
import { webhookQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";
import { logger } from "../../shared/Utils/Logger";

const repo = new SettlementRepository();

const MPESA_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export class SettlementService {
  // ── M-Pesa auth ────────────────────────────────────────────────────────────
  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const { data } = await axios.get(
      `${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` } }
    );
    return data.access_token;
  }

  // ── Core settlement ────────────────────────────────────────────────────────
  async settle(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    if (payment.status !== "CONFIRMED") {
      throw new ValidationError(`Payment ${paymentId} is not in CONFIRMED state (current: ${payment.status})`);
    }

    const merchant = payment.merchant;
    const accessToken = await this.getAccessToken();

    // B2C — Business to Customer (sends money to a phone/till)
    const payload = {
      InitiatorName:       process.env.MPESA_INITIATOR_NAME,
      SecurityCredential:  process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID:           "BusinessPayment",
      Amount:              Math.round(parseFloat(payment.amountFiat as string)),
      PartyA:              process.env.MPESA_SHORTCODE,
      PartyB:              merchant.mpesaTill,
      Remarks:             `AvaRamp settlement for payment ${paymentId}`,
      QueueTimeOutURL:     process.env.MPESA_B2C_TIMEOUT_URL,
      ResultURL:           process.env.MPESA_B2C_RESULT_URL,
      Occasion:            paymentId,
    };

    const { data } = await axios.post(`${MPESA_BASE}/mpesa/b2c/v1/paymentrequest`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const mpesaReceiptId: string = data.ConversationID || data.OriginatorConversationID;
    logger.info({ paymentId, mpesaReceiptId }, "M-Pesa B2C initiated");

    // Mark payment settled in DB
    const settled = await repo.markSettled(paymentId, { mpesaReceiptId });

    // Double-entry ledger: debit escrow, credit merchant
    await ledger.record({
      paymentId,
      type:       "MPESA_SETTLED",
      debitAcct:  "escrow",
      creditAcct: `merchant:${merchant.id}`,
      amount:     payment.amountFiat as string,
      currency:   payment.fiatCurrency as string,
      metadata:   { mpesaReceiptId },
    });

    // Notify merchant via webhook
    await webhookQueue.add("deliver", {
      paymentId,
      event:   "payment.settled",
      payload: { paymentId, mpesaReceiptId, amount: payment.amountFiat, currency: payment.fiatCurrency },
    });

    return settled;
  }

  async getSettlement(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    return payment;
  }
}
