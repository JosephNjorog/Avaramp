import express from "express";
import cors    from "cors";
import helmet  from "helmet";

import authRoutes       from "./Modules/auth/auth.routes";
import userRoutes       from "./Modules/users/user.routes";
import merchantRoutes   from "./Modules/merchants/merchant.routes";
import paymentRoutes    from "./Modules/Payments/Payment.routes";
import settlementRoutes from "./Modules/Settlements/Settlement.routes";
import { apiLimiter }   from "./shared/Middleware/rateLimit";
import { logger }       from "./shared/Utils/Logger";

const app = express();

// ── Global middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "avaramp-backend", timestamp: new Date().toISOString() });
});

app.use("/auth",        authRoutes);
app.use("/users",       userRoutes);
app.use("/merchants",   merchantRoutes);
app.use("/payments",    paymentRoutes);
app.use("/settlements", settlementRoutes);

// ── Global error handler ────────────────────────────────────────────────────
app.use((err: any, req: any, res: any, _next: any) => {
  logger.error({ err: err.message, code: err.code, path: req.path }, "Request error");
  res.status(err.statusCode || 500).json({
    success: false,
    error:   err.message || "Internal server error",
    code:    err.code,
  });
});

export { app };
