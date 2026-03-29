import "dotenv/config";
import { app }             from "./app";
import { logger }          from "./shared/Utils/Logger";

// Start BullMQ workers (import triggers worker registration)
import "./shared/queue/workers/payment.worker";
import "./shared/queue/workers/settlement.worker";
import "./shared/queue/workers/Webhook.worker";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`AvaRamp running on port ${PORT} [${process.env.NODE_ENV}]`);
});
