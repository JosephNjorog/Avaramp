import { Queue } from "bullmq";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

// Render KV and Upstash use rediss:// (TLS). ioredis needs tls:{} for these.
const isTls = redisUrl?.startsWith("rediss://");

export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
});

connection.on("error", (err) => {
  // Log but don't crash — workers will retry connections
  console.error("[Redis] connection error:", err.message);
});

export const paymentQueue    = new Queue("payments",    { connection });
export const settlementQueue = new Queue("settlements", { connection });
export const webhookQueue    = new Queue("webhooks",    { connection });
