/**
 * Daraja callback routes — Safaricom posts results here asynchronously
 *
 * Mount in app.ts:
 *   import darajaRouter from "./Modules/Settlements/daraja.routes";
 *   app.use("/daraja", darajaRouter);
 *
 * These endpoints must be publicly reachable (no auth — Safaricom calls them).
 * Registered as DARAJA_B2C_RESULT_URL / DARAJA_B2B_RESULT_URL / DARAJA_TIMEOUT_URL in env.
 */
import { Router, Request, Response } from "express";
import { PrismaClient }               from "@prisma/client";
import { logger }                     from "../../shared/Utils/Logger";
import { ledger }                     from "../../shared/database/ledger";
import { webhookQueue }               from "../../shared/queue/queues";

const router = Router();
const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

function getParam(params: Array<{ Key: string; Value: unknown }>, key: string): string {
  return String(params.find((p) => p.Key === key)?.Value ?? "");
}

async function markSettledByConversation(conversationId: string, transactionId: string) {
  const payment = await prisma.payment.findFirst({
    where: { mpesaReceiptId: conversationId },
    include: { merchant: true },
  });

  if (!payment) {
    logger.warn({ conversationId }, "Daraja callback: payment not found by conversationId");
    return;
  }

  if (payment.status === "SETTLED") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data:  { status: "SETTLED", settledAt: new Date(), mpesaReceiptId: transactionId },
  });

  await ledger.record({
    paymentId:  payment.id,
    type:       "DARAJA_SETTLED",
    debitAcct:  "escrow",
    creditAcct: `merchant:${payment.merchantId}`,
    amount:     payment.amountFiat as string,
    currency:   payment.fiatCurrency,
    metadata:   { transactionId, conversationId },
  });

  await webhookQueue.add("deliver", {
    paymentId: payment.id,
    event:     "payment.settled",
    payload:   {
      paymentId:      payment.id,
      transactionId,
      amount:         payment.amountFiat,
      currency:       payment.fiatCurrency,
    },
  });

  logger.info({ paymentId: payment.id, transactionId }, "Daraja: payment settled");
}

async function markFailedByConversation(conversationId: string, resultCode: string, resultDesc: string) {
  const payment = await prisma.payment.findFirst({
    where: { mpesaReceiptId: conversationId },
  });

  if (!payment) {
    logger.warn({ conversationId }, "Daraja timeout: payment not found");
    return;
  }

  if (["SETTLED", "FAILED", "REFUNDED"].includes(payment.status)) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data:  { status: "FAILED" },
  });

  await webhookQueue.add("deliver", {
    paymentId: payment.id,
    event:     "payment.failed",
    payload:   { paymentId: payment.id, reason: resultDesc, resultCode },
  });

  logger.warn({ paymentId: payment.id, resultCode, resultDesc }, "Daraja: payment failed");
}

// ── B2C result callback ───────────────────────────────────────────────────────
router.post("/b2c/result", async (req: Request, res: Response) => {
  try {
    const result = req.body?.Result;
    if (!result) return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });

    const conversationId = result.OriginatorConversationID as string;
    const resultCode     = String(result.ResultCode);
    const resultDesc     = String(result.ResultDesc);

    logger.info({ conversationId, resultCode }, "Daraja B2C result received");

    if (resultCode === "0") {
      const params      = (result.ResultParameters?.ResultParameter ?? []) as Array<{ Key: string; Value: unknown }>;
      const transactionId = getParam(params, "TransactionID") || conversationId;
      await markSettledByConversation(conversationId, transactionId);
    } else {
      await markFailedByConversation(conversationId, resultCode, resultDesc);
    }

    return res.status(200).json({ ResultCode: "0", ResultDesc: "Success" });
  } catch (err) {
    logger.error(err, "Daraja B2C result handler error");
    return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });
  }
});

// ── B2B result callback ───────────────────────────────────────────────────────
router.post("/b2b/result", async (req: Request, res: Response) => {
  try {
    const result = req.body?.Result;
    if (!result) return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });

    const conversationId = result.OriginatorConversationID as string;
    const resultCode     = String(result.ResultCode);
    const resultDesc     = String(result.ResultDesc);

    logger.info({ conversationId, resultCode }, "Daraja B2B result received");

    if (resultCode === "0") {
      const params        = (result.ResultParameters?.ResultParameter ?? []) as Array<{ Key: string; Value: unknown }>;
      const transactionId = getParam(params, "TransactionID") || conversationId;
      await markSettledByConversation(conversationId, transactionId);
    } else {
      await markFailedByConversation(conversationId, resultCode, resultDesc);
    }

    return res.status(200).json({ ResultCode: "0", ResultDesc: "Success" });
  } catch (err) {
    logger.error(err, "Daraja B2B result handler error");
    return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });
  }
});

// ── Timeout callback (both B2C and B2B) ──────────────────────────────────────
router.post("/timeout", async (req: Request, res: Response) => {
  try {
    const result = req.body?.Result;
    if (!result) return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });

    const conversationId = result.OriginatorConversationID as string;
    logger.warn({ conversationId }, "Daraja timeout received — marking payment failed");
    await markFailedByConversation(conversationId, "408", "Daraja request timed out");

    return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });
  } catch (err) {
    logger.error(err, "Daraja timeout handler error");
    return res.status(200).json({ ResultCode: "0", ResultDesc: "Accepted" });
  }
});

export default router;
