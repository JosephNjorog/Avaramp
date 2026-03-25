# ── shared / queue / queues.ts ─────────────────────────────────
cat > backend / src / shared / queue / queues.ts << 'EOF'
import { Queue } from "bullmq";
import Redis from "ioredis";

export const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
});

export const paymentQueue = new Queue("payments", { connection });
export const settlementQueue = new Queue("settlements", { connection });
export const webhookQueue = new Queue("webhooks", { connection });

