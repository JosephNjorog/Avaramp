import { SettlementRepository } from "./Settlemet.repository";
import { ledger } from "../../shared/database/ledger";
import { webhookQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";
import { logger } from "../../shared/Utils/Logger";
import { pretiumService } from "./pretium.service";

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
    const amountFiat = parseFloat(payment.amountFiat as string);

    // ── Skip mode: mark settled without calling the settlement provider (for testing / staging) ──
    if (process.env.PRETIUM_SKIP_SETTLEMENT === "true") {
      logger.warn({ paymentId }, "PRETIUM_SKIP_SETTLEMENT=true — marking settled without a real payout call");
      const fakeReference = `SKIP_${Date.now()}`;
      const settled = await repo.markSettled(paymentId, { settlementReference: fakeReference });
      await ledger.record({
        paymentId,
        type: "SETTLEMENT_COMPLETED",
        debitAcct: "escrow",
        creditAcct: `merchant:${merchant.id}`,
        amount: payment.amountFiat as string,
        currency,
        metadata: { reference: fakeReference, skipped: true },
      });
      await webhookQueue.add("deliver", {
        paymentId,
        event: "payment.settled",
        payload: { paymentId, reference: fakeReference, amount: payment.amountFiat, currency },
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
      amountFiat,
      payoutType,
      payoutAccount,
      payoutAccountRef: payoutRef,
      mobileNetwork: merchant.mobileNetwork,
      depositPk: payment.depositPk,
    });

    logger.info({ paymentId, reference, payoutType, payoutAccount }, "Settlement payout initiated");

    // Mark payment as SETTLED in DB (settlement webhook will confirm/reconcile)
    const settled = await repo.markSettled(paymentId, { settlementReference: reference });

    await ledger.record({
      paymentId,
      type: "SETTLEMENT_INITIATED",
      debitAcct: "escrow",
      creditAcct: `merchant:${merchant.id}`,
      amount: payment.amountFiat as string,
      currency,
      metadata: { reference, payoutType, payoutAccount },
    });

    await webhookQueue.add("deliver", {
      paymentId,
      event: "payment.settled",
      payload: { paymentId, reference, amount: payment.amountFiat, currency },
    });

    return settled;
  }

  async getSettlement(paymentId: string) {
    const payment = await repo.findByPaymentId(paymentId);
    if (!payment) throw new NotFoundError("Payment");
    return payment;
  }
}
