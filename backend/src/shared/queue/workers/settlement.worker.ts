
# ── shared / queue / workers / settlement.worker.ts ─────────────
cat > backend / src / shared / queue / workers / settlement.worker.ts << 'EOF'
import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { logger } from "../../utils/logger";
import { SettlementService } from "../../../modules/settlement/settlement.service";

const service = new SettlementService();

export const settlementWorker = new Worker(
    "settlements",
    async (job: Job) => {
        switch (job.name) {
            case "settle-payment":
                await service.settle(job.data.paymentId);
                break;
            default:
                logger.warn(`Unknown settlement job: ${job.name}`);
        }
    },
    {
        connection,
        concurrency: 5,
        limiter: { max: 10, duration: 1000 },
    }
);

settlementWorker.on("failed", (job, err) => {
    logger.error(`Settlement job failed [${job?.data?.paymentId}]: ${err.message}`);
});

