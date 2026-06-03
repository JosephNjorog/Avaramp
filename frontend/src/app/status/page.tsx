"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Clock, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Status = "operational" | "degraded" | "outage" | "checking";

interface ServiceStatus {
  name:        string;
  description: string;
  status:      Status;
}

const INITIAL: ServiceStatus[] = [
  { name: "API",                description: "REST API — payment creation, auth, merchants", status: "checking" },
  { name: "Deposit Detection",  description: "Avalanche Glacier on-chain watcher",           status: "checking" },
  { name: "Settlement",         description: "M-Pesa (Daraja) and Paystack fiat transfers",  status: "checking" },
  { name: "Webhook Delivery",   description: "BullMQ event dispatch to merchant endpoints",  status: "checking" },
  { name: "Dashboard",          description: "Merchant and admin web interface",             status: "checking" },
  { name: "Database",           description: "Neon PostgreSQL (primary datastore)",          status: "checking" },
];

const STATUS_DISPLAY: Record<Status, { label: string; icon: typeof CheckCircle2; color: string; dot: string }> = {
  operational: { label: "Operational",    icon: CheckCircle2,  color: "text-green-DEFAULT", dot: "bg-green-DEFAULT" },
  degraded:    { label: "Degraded",       icon: AlertCircle,   color: "text-amber-DEFAULT", dot: "bg-amber-DEFAULT" },
  outage:      { label: "Outage",         icon: AlertCircle,   color: "text-red-DEFAULT",   dot: "bg-red-DEFAULT"   },
  checking:    { label: "Checking…",      icon: Clock,         color: "text-muted",         dot: "bg-muted"         },
};

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(INITIAL);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    setServices((s) => s.map((x) => ({ ...x, status: "checking" })));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/health`, { cache: "no-store" });
      const ok = res.ok;
      setServices((s) =>
        s.map((svc) => ({
          ...svc,
          status: ok ? "operational" : svc.name === "API" ? "outage" : "degraded",
        }))
      );
    } catch {
      setServices((s) =>
        s.map((svc) => ({
          ...svc,
          status: svc.name === "API" ? "outage" : "degraded",
        }))
      );
    }
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => { check(); }, []);

  const allOperational = services.every((s) => s.status === "operational");
  const anyOutage      = services.some((s) => s.status === "outage");

  const overall = services[0]?.status === "checking"
    ? "checking"
    : anyOutage
    ? "outage"
    : allOperational
    ? "operational"
    : "degraded";

  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-indigo-DEFAULT flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </div>
                </Link>
                <span className="text-muted">/</span>
                <h1 className="text-lg font-semibold text-primary">System Status</h1>
              </div>
              {lastChecked && (
                <p className="text-xs text-muted mt-1">
                  Last checked {lastChecked.toLocaleTimeString("en-KE", { timeStyle: "short" })}
                </p>
              )}
            </div>
            <button
              onClick={check}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-secondary hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Overall status banner */}
          <div className={`rounded-2xl border p-6 mb-8 flex items-center gap-4 ${
            overall === "operational" ? "bg-green-dim border-green-DEFAULT/20" :
            overall === "outage"      ? "bg-red-dim border-red-DEFAULT/20" :
            overall === "degraded"    ? "bg-amber-dim border-amber-DEFAULT/20" :
            "bg-surface border-border"
          }`}>
            <div className={`w-4 h-4 rounded-full shrink-0 ${
              overall === "operational" ? "bg-green-DEFAULT animate-pulse" :
              overall === "outage"      ? "bg-red-DEFAULT" :
              overall === "degraded"    ? "bg-amber-DEFAULT" :
              "bg-muted animate-pulse"
            }`} />
            <div>
              <p className={`text-base font-semibold ${
                overall === "operational" ? "text-green-DEFAULT" :
                overall === "outage"      ? "text-red-DEFAULT" :
                overall === "degraded"    ? "text-amber-DEFAULT" :
                "text-muted"
              }`}>
                {overall === "operational" ? "All systems operational" :
                 overall === "outage"      ? "Service disruption detected" :
                 overall === "degraded"    ? "Some systems degraded" :
                 "Checking system status…"}
              </p>
              <p className="text-xs text-secondary mt-0.5">
                {overall === "operational"
                  ? "AvaRamp is running normally. Payments, settlements, and webhooks are all processing."
                  : "Our team is investigating. Check back shortly or follow @avaramp on X."}
              </p>
            </div>
          </div>

          {/* Service list */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Services</p>
            </div>
            <ul className="divide-y divide-border">
              {services.map((svc) => {
                const s = STATUS_DISPLAY[svc.status];
                const Icon = s.icon;
                return (
                  <li key={svc.name} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary">{svc.name}</p>
                      <p className="text-xs text-muted mt-0.5">{svc.description}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 shrink-0 ${s.color}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{s.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Uptime note */}
          <div className="bg-surface border border-border rounded-xl p-5 text-sm text-secondary leading-relaxed">
            <strong className="text-primary block mb-1">Uptime commitment</strong>
            AvaRamp targets 99.9% API availability. Scheduled maintenance is announced at least 24 hours in advance via{" "}
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
