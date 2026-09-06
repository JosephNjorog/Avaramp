/**
 * Settlement provider webhook — confirms a fiat payout has completed or failed.
 * Mounted unauthenticated (the provider calls this directly); protected by
 * HMAC signature verification + a replay guard (only CONFIRMED payments move).
 */
import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../shared/database/prisma";
import { webhookQueue } from "../../shared/queue/queues";
import { logger } from "../../shared/Utils/Logger";

const router = Router();

function verifySignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.PRETIUM_WEBHOOK_SECRET;
  if (!secret) return true; // signature verification not configured — accept (dev/staging)
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

router.post("/webhook", async (req: Request, res: Response) => {
  // ACK immediately — the provider retries if we don't respond promptly
  res.sendStatus(200);

  try {
    const signature = req.headers["x-pretium-signature"] as string | undefined;
    const rawBody: Buffer = (req as any).rawBody;
    if (process.env.PRETIUM_WEBHOOK_SECRET) {
      if (!signature || !rawBody || !verifySignature(rawBody, signature)) {
        logger.warn("Settlement webhook: signature missing or invalid — rejecting");
        return;
      }
    }

    const event: string = req.body?.event ?? req.body?.status;
    const data = req.body?.data ?? req.body;
    const reference: string | undefined = data?.reference;
    const providerRef: string | undefined = data?.transaction_code ?? data?.reference;

    if (!reference) return;

    logger.info({ event, reference, providerRef }, "Settlement webhook received");

    const payment = await prisma.payment.findFirst({
      where: {
        id: reference,
        // Only settle payments still in CONFIRMED state — prevents replay attacks
        status: "CONFIRMED",
      },
    });

    if (!payment) {
      logger.warn({ reference }, "Settlement webhook: payment not found in CONFIRMED state — ignoring");
      return;
    }

    const succeeded = event === "COMPLETE" || event === "COMPLETED" || event === "SUCCESS";

    if (succeeded) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SETTLED", settledAt: new Date(), settlementReference: providerRef },
      });

      // Net amount already credited to the merchant at settlement-initiation
      // (settlement.service.ts records SETTLEMENT_INITIATED + PROTOCOL_FEE there);
      // this just confirms the transfer cleared, so no further ledger entry here.

      await webhookQueue.add("deliver", {
        paymentId: payment.id,
        event: "payment.settled",
        payload: {
          paymentId: payment.id,
          reference: providerRef,
          amount: payment.feeAmount
            ? (parseFloat(payment.amountFiat as string) - parseFloat(payment.feeAmount)).toFixed(2)
            : payment.amountFiat,
          feeBps: payment.feeBps,
          feeAmount: payment.feeAmount,
          currency: payment.fiatCurrency,
        },
      });
    } else {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      await webhookQueue.add("deliver", {
        paymentId: payment.id,
        event: "payment.failed",
        payload: { paymentId: payment.id, reason: data?.message ?? "Settlement failed" },
      });
    }
  } catch (err: any) {
    logger.error({ err: err.message }, "Error handling settlement webhook");
  }
});

export default router;
