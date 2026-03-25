# ── shared / queue / workers / payment.worker.ts ────────────────
cat > backend / src / shared / queue / workers / payment.worker.ts << 'EOF'
import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { prisma } from "../../database/prisma";
import { logger } from "../../utils/logger";
import { settlementQueue } from "../queues";

export const paymentWorker = new Worker(
    "payments",
    async (job: Job) => {
        switch (job.name) {
            case "watch-deposit": {
                const { paymentId } = job.data;
                const payment = await prisma.payment.findUnique({
                    where: { id: paymentId },
                });
                if (!payment) throw new Error(`Payment not found: ${paymentId}`);
                if (payment.status === "CONFIRMED") {
                    await settlementQueue.add("settle-payment", { paymentId });
                    return { confirmed: true };
                }
                if (new Date() > payment.expiresAt) {
                    await prisma.payment.update({
                        where: { id: paymentId },
                        data: { status: "EXPIRED" },
                    });
                    return { expired: true };
                }
                throw new Error("Awaiting deposit");
            }
            default:
                logger.warn(`Unknown payment job: ${job.name}`);
        }
    },
    { connection, concurrency: 20 }
);

paymentWorker.on("failed", (job, err) => {
    logger.error(`Payment job failed [${job?.id}]: ${err.message}`);
});

