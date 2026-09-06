import express from "express";
import cors    from "cors";
import helmet  from "helmet";

import authRoutes       from "./Modules/auth/auth.routes";
import siweRoutes       from "./Modules/auth/siwe.routes";
import userRoutes       from "./Modules/users/user.routes";
import merchantRoutes   from "./Modules/merchants/merchant.routes";
import paymentRoutes    from "./Modules/Payments/Payment.routes";
import settlementRoutes from "./Modules/Settlements/Settlement.routes";
import pretiumRoutes    from "./Modules/Settlements/pretium.routes";
import apiKeyRoutes     from "./Modules/ApiKeys/apiKey.routes";
import consentRoutes    from "./Modules/Consent/consent.routes";
import adminRoutes      from "./Modules/admin/admin.routes";
import { apiLimiter }   from "./shared/Middleware/rateLimit";
import { logger }       from "./shared/Utils/Logger";
import { prisma }       from "./shared/database/prisma";
import { connection }   from "./shared/queue/queues";

const app = express();

// Trust one proxy hop (Render's load balancer) so rate limiters use real client IPs
app.set("trust proxy", 1);

// ── Global middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
// Capture raw body for settlement webhook signature verification
app.use("/pretium/webhook", express.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.json());
app.use(apiLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.get("/health", async (_, res) => {
  const t0 = Date.now();

  type CheckResult = { status: "up" | "down"; latencyMs: number; error?: string };

  const probe = async (fn: () => Promise<void>, timeoutMs = 4000): Promise<CheckResult> => {
    const start = Date.now();
    try {
      await Promise.race([
        fn(),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
      ]);
      return { status: "up", latencyMs: Date.now() - start };
    } catch (e: any) {
      return { status: "down", latencyMs: Date.now() - start, error: e.message };
    }
  };

  const [database, queue, avalanche, settlement] = await Promise.all([
    probe(async () => { await prisma.$queryRaw`SELECT 1`; }),
    probe(async () => { await connection.ping(); }),
    probe(async () => {
      const r = await fetch("https://api.avax.network/ext/health", { signal: AbortSignal.timeout(4000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    }),
    probe(async () => {
      const r = await fetch(process.env.PRETIUM_BASE_URL!, { signal: AbortSignal.timeout(4000) });
      if (r.status >= 500) throw new Error(`HTTP ${r.status}`);
    }),
  ]);

  const checks = { database, queue, avalanche, settlement };
  const allUp  = Object.values(checks).every((c) => c.status === "up");
  const anyDown = Object.values(checks).some((c) => c.status === "down");

  res.status(allUp ? 200 : 503).json({
    status:      allUp ? "ok" : anyDown ? "degraded" : "ok",
    uptime:      Math.floor(process.uptime()),
    service:     "avaramp-backend",
    timestamp:   new Date().toISOString(),
    responseMs:  Date.now() - t0,
    checks,
  });
});

app.use("/auth",        authRoutes);
app.use("/auth/payer",  siweRoutes);
app.use("/users",       userRoutes);
app.use("/merchants",   merchantRoutes);
app.use("/payments",    paymentRoutes);
app.use("/settlements", settlementRoutes);
// Settlement provider webhook (no auth — provider calls this, signature verified inside)
app.use("/pretium",     pretiumRoutes);
app.use("/api-keys",    apiKeyRoutes);
// Consent recording & admin audit
app.use("/consent",     consentRoutes);
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
