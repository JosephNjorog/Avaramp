import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

const router = Router();

/**
 * Verify Paystack webhook signature.
 * Paystack signs the raw body with HMAC-SHA512 using your secret key.
 */
function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

/**
 * Paystack webhook endpoint.
 * Paystack POSTs here for transfer.success, transfer.failed, transfer.reversed.
 */
router.post("/webhook", async (req: Request, res: Response) => {
  // Always ACK immediately so Paystack doesn't retry
  res.sendStatus(200);

  try {
    const signature = req.headers["x-paystack-signature"] as string;

    // Verify signature if secret is configured
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

    // We store transferCode in mpesaReceiptId column for now
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
