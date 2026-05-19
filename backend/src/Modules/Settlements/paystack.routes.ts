import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

const router = Router();

function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

/**
 * Paystack webhook endpoint.
 * Handles transfer.success / transfer.failed / transfer.reversed
 * (Paystack calls this after initiating a fiat transfer to the merchant).
 */
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

    logger.info({ event, transferCode: data?.transfer_code }, "Paystack webhook received");

    if (!data?.transfer_code) return;

    const transferCode: string = data.transfer_code;

    if (event === "transfer.success") {
      await prisma.payment.updateMany({
        where: { mpesaReceiptId: transferCode },
        data:  { status: "SETTLED", settledAt: new Date() },
      });
      logger.info({ transferCode }, "Paystack transfer confirmed SETTLED");

    } else if (event === "transfer.failed" || event === "transfer.reversed") {
      await prisma.payment.updateMany({
        where: { mpesaReceiptId: transferCode },
        data:  { status: "FAILED" },
      });
      logger.warn({ transferCode, event }, "Paystack transfer failed/reversed");
    }
  } catch (err: any) {
    logger.error({ err: err.message }, "Error handling Paystack webhook");
  }
});

export default router;
