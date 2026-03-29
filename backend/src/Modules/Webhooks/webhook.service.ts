import crypto from "crypto";
import axios from "axios";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

export class WebhookService {
  /**
   * Signs payload with HMAC-SHA256 using the merchant's webhookSecret,
   * then POSTs to the merchant's webhookUrl.
   * Records the attempt in WebhookDelivery regardless of success/failure.
   */
  async dispatch(paymentId: string, event: string, payload: object): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { merchant: true },
    });
    if (!payment || !payment.merchant.webhookUrl) return;

    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const signature = crypto
      .createHmac("sha256", payment.merchant.webhookSecret)
      .update(body)
      .digest("hex");

    let status = "delivered";
    let error: string | undefined;

    try {
      await axios.post(payment.merchant.webhookUrl, body, {
        headers: {
          "Content-Type": "application/json",
          "X-AvaRamp-Signature": `sha256=${signature}`,
        },
        timeout: 10_000,
      });
      logger.info({ paymentId, event }, "Webhook delivered");
    } catch (err: any) {
      status = "failed";
      error = err.message;
      logger.warn({ paymentId, event, err: err.message }, "Webhook delivery failed");
    }

    await prisma.webhookDelivery.create({
      data: { paymentId, event, status, error, sentAt: new Date() },
    });
  }
}

export const webhookService = new WebhookService();
