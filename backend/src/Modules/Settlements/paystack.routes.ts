import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../shared/database/prisma";
import { settlementQueue } from "../../shared/queue/queues";
import { logger } from "../../shared/Utils/Logger";

const router = Router();

function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

router.post("/webhook", async (req: Request, res: Response) => {
  // ACK immediately — Paystack retries if we don't respond within 5 s
  res.sendStatus(200);

  try {
    const signature = req.headers["x-paystack-signature"] as string;

    if (process.env.PAYSTACK_SECRET_KEY && signature) {
      const rawBody: Buffer = (req as any).rawBody ?? Buffer.from(JSON.stringify(req.body));
      if (!verifyPaystackSignature(rawBody, signature)) {
        logger.warn("Paystack webhook signature mismatch — ignoring");
        return;
      }
    }

    const event = req.body?.event as string;
    const data  = req.body?.data;

    logger.info({ event }, "Paystack webhook received");

    // ── charge.success — customer has paid; confirm payment and enqueue settlement
    if (event === "charge.success") {
      const reference: string = data?.reference;
      if (!reference) return;

      const payment = await prisma.payment.findUnique({
        where: { paystackRef: reference },
      });

      if (!payment) {
        logger.warn({ reference }, "charge.success: no payment found for reference");
        return;
      }

      if (payment.status !== "PENDING") {
        logger.info({ reference, status: payment.status }, "charge.success: payment not PENDING, skipping");
        return;
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data:  { status: "CONFIRMED", confirmedAt: new Date() },
      });

      logger.info({ paymentId: payment.id, reference }, "Payment CONFIRMED via charge.success");

      // Enqueue settlement job — settles fiat to merchant via Paystack transfer
      await settlementQueue.add("settle-payment", { paymentId: payment.id });
      logger.info({ paymentId: payment.id }, "Settlement job enqueued");
      return;
    }

    // ── transfer.success — Paystack transfer to merchant completed
    if (event === "transfer.success") {
      const transferCode: string = data?.transfer_code;
      if (!transferCode) return;
      await prisma.payment.updateMany({
        where: { mpesaReceiptId: transferCode },
        data:  { status: "SETTLED", settledAt: new Date() },
      });
      logger.info({ transferCode }, "Paystack transfer SETTLED");
      return;
    }

    // ── transfer.failed / transfer.reversed
    if (event === "transfer.failed" || event === "transfer.reversed") {
      const transferCode: string = data?.transfer_code;
      if (!transferCode) return;
      await prisma.payment.updateMany({
        where: { mpesaReceiptId: transferCode },
        data:  { status: "FAILED" },
      });
      logger.warn({ transferCode, event }, "Paystack transfer failed/reversed");
      return;
    }

  } catch (err: any) {
    logger.error({ err: err.message }, "Error handling Paystack webhook");
  }
});

export default router;
