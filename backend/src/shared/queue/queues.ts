// backend/src/shared/queue/queues.ts

import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null, // Required for BullMQ
});

export const paymentQueue = new Queue("payments", { connection });
export const settlementQueue = new Queue("settlements", { connection });
export const webhookQueue = new Queue("webhooks", { connection });
export const listenerQueue = new Queue("listeners", { connection });
