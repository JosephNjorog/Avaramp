import crypto from "crypto";
import axios from "axios";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

// RFC-1918 + loopback + link-local — block SSRF to internal services
const PRIVATE_IP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.|::1$|localhost$)/i;

export function validateWebhookUrl(url: string): void {
  let parsed: URL;
  try { parsed = new URL(url); } catch {
    throw new Error(`Invalid webhook URL: ${url}`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Webhook URL must use http or https, got: ${parsed.protocol}`);
  }
  if (PRIVATE_IP.test(parsed.hostname)) {
    throw new Error(`Webhook URL must not point to a private or loopback address`);
  }
}

export class WebhookService {
  async dispatch(paymentId: string, event: string, payload: object): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { merchant: true },
    });
    if (!payment || !payment.merchant.webhookUrl) return;

    // SSRF guard — silently skip delivery to private/internal URLs
    try {
      validateWebhookUrl(payment.merchant.webhookUrl);
    } catch (err: any) {
      logger.warn({ paymentId, webhookUrl: payment.merchant.webhookUrl, err: err.message }, "Webhook skipped: invalid URL");
      return;
    }

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
        maxRedirects: 0, // prevent redirect-based SSRF
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
