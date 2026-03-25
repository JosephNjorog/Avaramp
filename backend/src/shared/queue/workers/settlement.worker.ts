// backend/src/shared/queue/workers/settlement.worker.ts

import { Worker, Job } from "bullmq";
import { SettlementService } from "../../../modules/settlement/settlement.service";

const settlement = new SettlementService();

export const settlementWorker = new Worker(
    "settlements",
    async (job: Job) => {

        switch (job.name) {
            case "settle-payment": {
                await settlement.settle(job.data.paymentId);
                break;
            }
            case "retry-failed-settlement": {
                await settlement.retryFailed(job.data.paymentId);
                break;
            }
        }
    },
    {
        connection,
        concurrency: 5,       // M-Pesa has rate limits
        limiter: {
            max: 10,
            duration: 1000,
        },
    }
);

settlementWorker.on("failed", async (job, err) => {
    logger.error(`❌ Settlement failed: ${job?.data?.paymentId} — ${err.message}`);

    // Alert after all retries exhausted
    if (job?.attemptsMade === job?.opts?.attempts) {
        await alertService.critical(
            `Settlement permanently failed for ${job?.data?.paymentId}`
        );
    }
});
