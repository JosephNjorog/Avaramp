import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { logger } from "../../Utils/Logger";
import { WebhookService } from "../../../Modules/Webhooks/webhook.service";

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
  logger.error({ jobId: job?.id, paymentId: job?.data?.paymentId, err: err.message }, "Webhook job failed");
});
