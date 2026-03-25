import express          from "express";
import cors             from "cors";
import helmet           from "helmet";
import { apiLimiter }   from "./shared/middleware/rateLimit";
import paymentRoutes    from "./modules/payments/payment.routes";
import settlementRoutes from "./modules/settlement/settlement.routes";
import merchantRoutes   from "./modules/merchants/merchant.routes";
import userRoutes       from "./modules/users/user.routes";
import { logger }       from "./shared/utils/logger";
import { AppError }     from "./shared/utils/errors";
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);
// ── Routes ─────────────────────────────────────────────────
app.use("/api/v1/payments",    paymentRoutes);
app.use("/api/v1/settlements", settlementRoutes);
app.use("/api/v1/merchants",   merchantRoutes);
app.use("/api/v1/users",       userRoutes);
// ── Health Check ───────────────────────────────────────────
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ── Error Handler ──────────────────────────────────────────
app.use((err: any, req: any, res: any, next: any) => {
  const status  = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal server error";
  logger.error({ err, path: req.path }, message);
  res.status(status).json({ success: false, error: message, code: err.code });
});
export { app };
