import express from "express";
import cors    from "cors";
import helmet  from "helmet";

import authRoutes       from "./Modules/auth/auth.routes";
import userRoutes       from "./Modules/users/user.routes";
import merchantRoutes   from "./Modules/merchants/merchant.routes";
import paymentRoutes    from "./Modules/Payments/Payment.routes";
import settlementRoutes from "./Modules/Settlements/Settlement.routes";
import paystackRoutes   from "./Modules/Settlements/paystack.routes";
import consentRoutes    from "./Modules/Consent/consent.routes";
import adminRoutes      from "./Modules/admin/admin.routes";
import { apiLimiter }   from "./shared/Middleware/rateLimit";
import { logger }       from "./shared/Utils/Logger";

const app = express();

// ── Global middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
// Capture raw body for Paystack webhook signature verification
app.use("/paystack/webhook", express.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf; },
}));
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
// Paystack webhook (no auth — Paystack calls this, signature verified inside)
app.use("/paystack",    paystackRoutes);
// Consent recording & admin audit
app.use("/consent",     consentRoutes);
app.use("/api",         consentRoutes);
// Admin dashboard routes
app.use("/admin",       adminRoutes);

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
