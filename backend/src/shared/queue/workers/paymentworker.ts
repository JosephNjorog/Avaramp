// backend/src/shared/queue/workers/payment.worker.ts

import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { logger } from "../../utils/logger";

const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
});

export const paymentWorker = new Worker(
    "payments",
    async (job: Job) => {

        switch (job.name) {

            case "watch-deposit": {
                const { paymentId, depositAddress, expectedAmount } = job.data;
                const balance = await avalancheClient.getUSDCBalance(depositAddress);

                if (balance >= BigInt(expectedAmount)) {
                    logger.info(`✅ Deposit confirmed for ${paymentId}`);
                    // Forward to settlement queue
                    await settlementQueue.add("settle-payment", { paymentId });
                    return { confirmed: true };
                }

                // Not yet received — throw to trigger retry
                throw new Error(`Awaiting deposit: ${paymentId}`);
            }

            case "expire-payment": {
                const { paymentId } = job.data;
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: { status: "EXPIRED" },
                });
                logger.info(`⏰ Payment expired: ${paymentId}`);
                break;
            }
        }
    },
    {
        connection,
        concurrency: 20,
        limiter: {
            max: 100,
            duration: 1000, // 100 jobs/sec max
        },
    }
);

paymentWorker.on("failed", (job, err) => {
    logger.error(`❌ Payment job failed: ${job?.id} — ${err.message}`);
});
