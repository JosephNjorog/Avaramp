import { Router, Request, Response } from "express";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

const router = Router();

/**
 * M-Pesa B2C Result callback
 * Safaricom POSTs here when the B2C transfer completes (success or failure).
 */
router.post("/b2c/result", async (req: Request, res: Response) => {
  try {
    const result = req.body?.Result;
    if (!result) {
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      return;
    }

    const { ResultCode, ResultDesc, ConversationID, OriginatorConversationID, ReferenceData } = result;

    logger.info({ ResultCode, ConversationID }, "M-Pesa B2C result received");

    // Find payment by conversationId stored as mpesaReceiptId
    const paymentId = ReferenceData?.ReferenceItem?.Value ?? OriginatorConversationID;

    if (ResultCode === 0) {
      // Success — extract receipt number from ResultParameters
      const params: any[] = result.ResultParameters?.ResultParameter ?? [];
      const receiptParam  = params.find((p: any) => p.Key === "TransactionReceipt");
      const mpesaReceiptId = receiptParam?.Value ?? ConversationID;

      await prisma.payment.updateMany({
        where: { mpesaReceiptId: { in: [ConversationID, OriginatorConversationID] } },
        data:  { status: "SETTLED", settledAt: new Date(), mpesaReceiptId },
      });

      logger.info({ paymentId, mpesaReceiptId }, "M-Pesa B2C settled successfully");
    } else {
      // Failed
      logger.warn({ ResultCode, ResultDesc, paymentId }, "M-Pesa B2C failed");
      await prisma.payment.updateMany({
        where: { mpesaReceiptId: { in: [ConversationID, OriginatorConversationID] } },
        data:  { status: "FAILED" },
      });
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    logger.error({ err }, "Error handling M-Pesa B2C result");
    res.json({ ResultCode: 0, ResultDesc: "Accepted" }); // Always ACK to Safaricom
  }
});

/**
 * M-Pesa B2C Timeout callback
 * Safaricom POSTs here when the B2C request times out.
 */
router.post("/b2c/timeout", async (req: Request, res: Response) => {
  logger.warn({ body: req.body }, "M-Pesa B2C timeout received");
  // The payment stays CONFIRMED — the settlement worker will retry
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default router;
