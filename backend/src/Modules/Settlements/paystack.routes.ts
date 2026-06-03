import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

const router = Router();

function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false; // length mismatch
  }
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
    // Signature is mandatory — reject any request missing the header
    const signature = req.headers["x-paystack-signature"] as string;
    if (!signature) {
      logger.warn("Paystack webhook: missing x-paystack-signature header — rejecting");
      return;
    }
    const rawBody: Buffer = (req as any).rawBody;
    if (!rawBody) {
      logger.warn("Paystack webhook: rawBody not captured — rejecting");
      return;
    }
    if (!verifyPaystackSignature(rawBody, signature)) {
      logger.warn("Paystack webhook: signature mismatch — rejecting");
      return;
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
