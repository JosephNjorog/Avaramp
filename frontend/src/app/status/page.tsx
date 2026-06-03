"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Clock, RefreshCw, Zap, Activity } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceStatus = "up" | "down" | "checking";

interface CheckResult {
  status:    "up" | "down";
  latencyMs: number;
  error?:    string;
}

interface HealthResponse {
  status:     "ok" | "degraded";
  uptime:     number;         // seconds
  service:    string;
  timestamp:  string;
  responseMs: number;
  checks: {
    database:  CheckResult;
    queue:     CheckResult;
    avalanche: CheckResult;
    paystack:  CheckResult;
  };
}

interface ServiceCard {
  key:         string;
  label:       string;
  description: string;
  status:      ServiceStatus;
  latencyMs?:  number;
  error?:      string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 30; // seconds between auto-refreshes

const SERVICE_META: Record<string, { label: string; description: string }> = {
  api:       { label: "API Server",             description: "REST API — payment creation, auth, webhooks" },
  database:  { label: "Database",               description: "Neon PostgreSQL — primary datastore" },
  queue:     { label: "Queue (Redis)",           description: "BullMQ workers — deposit watching, settlement, webhook delivery" },
  avalanche: { label: "Avalanche C-Chain",       description: "On-chain USDC deposit detection via Glacier API" },
  paystack:  { label: "Paystack",                description: "Fiat settlement API — NGN, GHS, TZS, UGX" },
  dashboard: { label: "Dashboard",               description: "Merchant and admin web interface (Vercel)" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  up: {
    label: "Operational",
    icon:  CheckCircle2,
    text:  "text-green-DEFAULT",
    bg:    "bg-green-dim",
    dot:   "bg-green-DEFAULT",
    border:"border-green-DEFAULT/20",
  },
  down: {
    label: "Outage",
    icon:  AlertCircle,
    text:  "text-red-DEFAULT",
    bg:    "bg-red-dim",
    dot:   "bg-red-DEFAULT",
    border:"border-red-DEFAULT/20",
  },
  checking: {
    label: "Checking…",
    icon:  Clock,
    text:  "text-muted",
    bg:    "bg-surface",
    dot:   "bg-muted",
    border:"border-border",
  },
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 200 ? "text-green-DEFAULT" : ms < 800 ? "text-amber-DEFAULT" : "text-red-DEFAULT";
  return <span className={`text-2xs font-mono ${color}`}>{ms}ms</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [services, setServices]   = useState<ServiceCard[]>(
    Object.keys(SERVICE_META).map((key) => ({
      key,
      ...SERVICE_META[key],
      status: "checking",
    }))
  );
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading]       = useState(false);
  const [countdown, setCountdown]   = useState(REFRESH_INTERVAL);
  const [apiLatency, setApiLatency] = useState<number | undefined>();

  const check = useCallback(async () => {
    setLoading(true);
    setServices((s) => s.map((x) => ({ ...x, status: "checking" })));

    const t0 = Date.now();
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const latency = Date.now() - t0;
      setApiLatency(latency);

      if (!res.ok && res.status !== 503) {
        // Backend completely unreachable
        setServices((s) => s.map((x) => ({ ...x, status: "down", error: `HTTP ${res.status}` })));
        setLastChecked(new Date());
        setLoading(false);
        setCountdown(REFRESH_INTERVAL);
        return;
      }

      const data: HealthResponse = await res.json();
      setHealthData(data);

      const c = data.checks ?? {};
      const fallback = (v: CheckResult | undefined): { status: ServiceStatus; latencyMs?: number; error?: string } =>
        v ? { status: v.status, latencyMs: v.latencyMs, error: v.error } : { status: "down", error: "No data" };

      setServices([
        { key: "api",       ...SERVICE_META.api,       status: "up", latencyMs: latency },
        { key: "database",  ...SERVICE_META.database,  ...fallback(c.database)  },
        { key: "queue",     ...SERVICE_META.queue,     ...fallback(c.queue)     },
        { key: "avalanche", ...SERVICE_META.avalanche, ...fallback(c.avalanche) },
        { key: "paystack",  ...SERVICE_META.paystack,  ...fallback(c.paystack)  },
        { key: "dashboard", ...SERVICE_META.dashboard, status: "up", latencyMs: latency },
      ]);
    } catch {
      setApiLatency(undefined);
      setServices((s) =>
        s.map((x) => ({ ...x, status: "down", error: "Could not reach backend" }))
      );
    }

    setLastChecked(new Date());
    setLoading(false);
    setCountdown(REFRESH_INTERVAL);
  }, []);

  // Initial check
  useEffect(() => { check(); }, [check]);

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { check(); return REFRESH_INTERVAL; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [check]);

  // Derived state
  const allUp      = services.every((s) => s.status === "up");
  const anyDown    = services.some((s) => s.status === "down");
  const anyChecking = services.some((s) => s.status === "checking");
  const overall: ServiceStatus = anyChecking ? "checking" : anyDown ? "down" : "up";

  const OVERALL_MESSAGES = {
    up:       { title: "All systems operational",     sub: "AvaRamp is running normally. Payments, settlements, and webhooks are all processing." },
    down:     { title: "Service disruption detected", sub: "One or more services are experiencing issues. Our team is investigating." },
    checking: { title: "Checking system status…",     sub: "Running live checks against all services." },
  };

  const overallCfg     = STATUS_CONFIG[overall];
  const overallMessage = OVERALL_MESSAGES[overall];

  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                  <div className="w-6 h-6 rounded-md bg-indigo-DEFAULT flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </div>
                </Link>
                <span className="text-border">/</span>
                <h1 className="text-lg font-semibold text-primary">System Status</h1>
              </div>
              <p className="text-xs text-muted">
                Live checks run every {REFRESH_INTERVAL}s against real infrastructure endpoints.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {lastChecked && (
                <span className="text-xs text-muted hidden sm:block">
                  Checked {lastChecked.toLocaleTimeString("en-KE", { timeStyle: "short" })}
                  {" · "}
                  <span className="text-indigo-DEFAULT">next in {countdown}s</span>
                </span>
              )}
              <button
                onClick={check}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Overall banner */}
          <div className={`rounded-2xl border p-5 mb-8 flex items-center gap-4 ${overallCfg.bg} ${overallCfg.border}`}>
            <div className={`w-4 h-4 rounded-full shrink-0 ${overallCfg.dot} ${overall === "up" ? "animate-pulse" : ""}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-base font-semibold ${overallCfg.text}`}>{overallMessage.title}</p>
              <p className="text-xs text-secondary mt-0.5">{overallMessage.sub}</p>
            </div>
            {healthData && (
              <div className="text-right shrink-0 hidden sm:block">
                <p className="text-xs text-muted">Uptime</p>
                <p className="text-sm font-semibold text-primary font-mono">{formatUptime(healthData.uptime)}</p>
              </div>
            )}
          </div>

          {/* Service cards */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-secondary" />
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Services</p>
              </div>
              <p className="text-xs text-muted">{services.filter((s) => s.status === "up").length}/{services.length} operational</p>
            </div>

            <ul className="divide-y divide-border">
              {services.map((svc) => {
                const cfg  = STATUS_CONFIG[svc.status];
                const Icon = cfg.icon;
                return (
                  <li key={svc.key} className="flex items-center gap-4 px-5 py-4">
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${svc.status === "up" ? "animate-pulse" : ""}`} />

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary">{svc.label}</p>
                      <p className="text-xs text-muted mt-0.5 truncate">{svc.description}</p>
                      {svc.status === "down" && svc.error && (
                        <p className="text-xs text-red-DEFAULT mt-1 font-mono truncate">{svc.error}</p>
                      )}
                    </div>

                    {/* Latency */}
                    {svc.latencyMs !== undefined && svc.status === "up" && (
                      <LatencyBadge ms={svc.latencyMs} />
                    )}

                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 shrink-0 ${cfg.text}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium hidden sm:block">{cfg.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Response time summary */}
          {healthData && healthData.checks && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "API response",   value: `${apiLatency ?? healthData.responseMs}ms` },
                { label: "DB latency",     value: healthData.checks.database  ? `${healthData.checks.database.latencyMs}ms`  : "—" },
                { label: "Queue latency",  value: healthData.checks.queue     ? `${healthData.checks.queue.latencyMs}ms`     : "—" },
                { label: "Process uptime", value: formatUptime(healthData.uptime) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
                  <p className="text-xs text-muted mb-1">{label}</p>
                  <p className="text-sm font-bold text-primary font-mono">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Incident note */}
          <div className="bg-surface border border-border rounded-xl p-5 text-sm text-secondary leading-relaxed">
            <strong className="text-primary block mb-1">Incidents &amp; maintenance</strong>
            Scheduled maintenance is announced at least 24 hours in advance via{" "}
            <a href="https://x.com/avaramp" className="text-indigo-DEFAULT hover:underline" target="_blank" rel="noreferrer">@avaramp</a>.
            For urgent issues, email{" "}
            <a href="mailto:hello@avaramp.io" className="text-indigo-DEFAULT hover:underline">hello@avaramp.io</a>.
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
