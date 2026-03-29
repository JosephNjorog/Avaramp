import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { logger } from "../../Utils/Logger";
import { SettlementService } from "../../../Modules/Settlements/settlement.service";

const service = new SettlementService();

export const settlementWorker = new Worker(
  "settlements",
  async (job: Job) => {
    if (job.name !== "settle-payment") {
      logger.warn(`Unknown settlement job: ${job.name}`);
      return;
    }
    await service.settle(job.data.paymentId);
  },
  {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  }
);

settlementWorker.on("failed", (job, err) => {
  logger.error({ paymentId: job?.data?.paymentId, err: err.message }, "Settlement job failed");
});
