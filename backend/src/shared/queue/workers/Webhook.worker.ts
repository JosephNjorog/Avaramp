# ── shared / queue / workers / webhook.worker.ts ────────────────
cat > backend / src / shared / queue / workers / webhook.worker.ts << 'EOF'
import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { logger } from "../../utils/logger";
import { WebhookService } from "../../../modules/webhooks/webhook.service";

const service = new WebhookService();

export const webhookWorker = new Worker(
    "webhooks",
    async (job: Job) => {
        const { paymentId, event, payload } = job.data;
        await service.dispatch(paymentId, event, payload);
    },
    {
        connection,
        concurrency: 10,
        limiter: { max: 50, duration: 1000 },
    }
);

webhookWorker.on("failed", (job, err) => {
    logger.error(`Webhook job failed [${job?.id}]: ${err.message}`);
});
