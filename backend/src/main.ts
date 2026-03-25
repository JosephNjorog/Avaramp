// backend/src/main.ts

import "dotenv/config";
import { app } from "./app";
import { logger } from "./shared/utils/logger";
import { paymentWorker } from "./shared/queue/workers/payment.worker";
import { settlementWorker } from "./shared/queue/workers/settlement.worker";
import { webhookWorker } from "./shared/queue/workers/webhook.worker";
import { BlockchainListenerService } from "./modules/blockchain/listener.service";

async function bootstrap() {
    const PORT = process.env.PORT || 3000;

    // ── Start HTTP server ─────────────────────────────────────
    app.listen(PORT, () => {
        logger.info(`🚀 AvaRamp API running on port ${PORT}`);
    });

    // ── Start queue workers ───────────────────────────────────
    logger.info("⚙️  Starting queue workers...");
    paymentWorker.run();
    settlementWorker.run();
    webhookWorker.run();
    logger.info("✅ Workers running");

    // ── Start blockchain listener ─────────────────────────────
    const listener = new BlockchainListenerService();
    await listener.startEventListener();
    logger.info("🔗 Blockchain listener active");

    // ── Graceful shutdown ─────────────────────────────────────
    process.on("SIGTERM", async () => {
        logger.info("🛑 Shutting down gracefully...");
        await paymentWorker.close();
        await settlementWorker.close();
        await webhookWorker.close();
        process.exit(0);
    });
}

bootstrap().catch((err) => {
    logger.error("💥 Fatal startup error:", err);
    process.exit(1);
});
