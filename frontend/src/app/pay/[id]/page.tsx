"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Clock, CheckCircle2, Loader2,
  XCircle, RefreshCw, Zap, AlertCircle, ArrowRight, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { paymentsApi } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentStatus = "PENDING" | "CONFIRMED" | "SETTLED" | "FAILED" | "REFUNDED";

interface Payment {
  id:               string;
  status:           PaymentStatus;
  depositAddress:   string;
  amountUsdc:       string;
  fiatAmount:       string;
  fiatCurrency:     string;
  phone?:           string;
  reference?:       string;
  expiresAt?:       string;
  createdAt:        string;
  updatedAt:        string;
  authorizationUrl?: string;
  paystackRef?:     string;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, {
  label:    string;
  sublabel: string;
  color:    string;
  bg:       string;
  border:   string;
  icon:     React.ReactNode;
  pulse:    boolean;
}> = {
  PENDING: {
    label:    "Awaiting payment",
    sublabel: "Click below to pay securely via Paystack",
    color:    "text-amber-400",
    bg:       "bg-amber-500/10",
    border:   "border-amber-500/20",
    icon:     <Clock className="w-5 h-5" />,
    pulse:    true,
  },
  CONFIRMED: {
    label:    "Payment received — processing payout",
    sublabel: "Your mobile money payment is being prepared",
    color:    "text-blue-400",
    bg:       "bg-blue-500/10",
    border:   "border-blue-500/20",
    icon:     <Loader2 className="w-5 h-5 animate-spin" />,
    pulse:    false,
  },
  SETTLED: {
    label:    "Payment complete",
    sublabel: "Mobile money has been sent to the merchant",
    color:    "text-green-400",
    bg:       "bg-green-500/10",
    border:   "border-green-500/20",
    icon:     <CheckCircle2 className="w-5 h-5" />,
    pulse:    false,
  },
  FAILED: {
    label:    "Payment failed",
    sublabel: "Something went wrong. Contact the merchant for a refund.",
    color:    "text-red-400",
    bg:       "bg-red-500/10",
    border:   "border-red-500/20",
    icon:     <XCircle className="w-5 h-5" />,
    pulse:    false,
  },
  REFUNDED: {
    label:    "Payment refunded",
    sublabel: "Your payment has been returned.",
    color:    "text-secondary",
    bg:       "bg-surface",
    border:   "border-border",
    icon:     <RefreshCw className="w-5 h-5" />,
    pulse:    false,
  },
};

// ── Countdown ─────────────────────────────────────────────────────────────────

function useCountdown(expiresAt?: string) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining === null) return null;
  const m = Math.floor(remaining / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return { expired: remaining === 0, display: `${m}:${String(s).padStart(2, "0")}` };
}

// ── Steps timeline ────────────────────────────────────────────────────────────

const STEPS: { status: PaymentStatus; label: string }[] = [
  { status: "PENDING",   label: "Pay" },
  { status: "CONFIRMED", label: "Processing" },
  { status: "SETTLED",   label: "Settled" },
];

const STEP_ORDER: Record<PaymentStatus, number> = {
  PENDING:   0,
  CONFIRMED: 1,
  SETTLED:   2,
  FAILED:    1,
  REFUNDED:  1,
};

function StepTimeline({ status }: { status: PaymentStatus }) {
  const current = STEP_ORDER[status];
  const failed  = status === "FAILED" || status === "REFUNDED";

  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current && !failed;
        const isFail = i === current && failed;

        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done   ? "bg-green-500 text-white" : ""}
                ${active ? "bg-indigo-DEFAULT text-white ring-4 ring-indigo-DEFAULT/20" : ""}
                ${isFail ? "bg-red-500 text-white" : ""}
                ${!done && !active && !isFail ? "bg-surface border border-border text-muted" : ""}
              `}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-[10px] text-muted whitespace-nowrap">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-2 mb-5 transition-all ${done ? "bg-green-500/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-secondary">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-DEFAULT" />
          <span className="text-sm">Loading payment…</span>
        </div>
      </div>
    }>
      <PayPageContent />
    </Suspense>
  );
}

function PayPageContent() {
  const { id }          = useParams<{ id: string }>();
  const searchParams    = useSearchParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const countdown             = useCountdown(payment?.expiresAt);

  const fetchPayment = useCallback(async () => {
    try {
      const res  = await paymentsApi.get(id);
      const data = res.data?.data ?? res.data;
      setPayment(data);
      setError(null);
      return data.status as PaymentStatus;
    } catch (err: any) {
      setError(err.message || "Payment not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const TERMINAL = new Set<PaymentStatus>(["SETTLED", "FAILED", "REFUNDED"]);
    let interval: ReturnType<typeof setInterval>;

    fetchPayment().then((status) => {
      if (status && !TERMINAL.has(status)) {
        interval = setInterval(async () => {
          const s = await fetchPayment();
          if (s && TERMINAL.has(s)) clearInterval(interval);
        }, 3_000);
      }
    });

    return () => clearInterval(interval);
  }, [fetchPayment]);

  // ── Dev-mode skip: auto-confirm when Paystack redirects back with ?skip=1 ───
  useEffect(() => {
    const skip = searchParams?.get("skip");
    if (skip !== "1" || !id) return;
    // Hit the dev-confirm endpoint — only works when PAYSTACK_SKIP_SETTLEMENT=true
    fetch(`/api/payments/${id}/dev-confirm`, { method: "POST" }).catch(() => {});
  }, [searchParams, id]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-secondary">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-DEFAULT" />
          <span className="text-sm">Loading payment…</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !payment) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-lg font-semibold text-primary mb-2">Payment not found</h1>
          <p className="text-sm text-secondary">{error || "This payment link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const cfg      = STATUS_CONFIG[payment.status];
  const isPending = payment.status === "PENDING";
  const isSettled = payment.status === "SETTLED";
  const isFailed  = payment.status === "FAILED" || payment.status === "REFUNDED";

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Top bar */}
      <header className="border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-tight">AvaRamp</span>
        </div>
        {payment.reference && (
          <span className="text-xs text-muted font-mono">{payment.reference}</span>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md space-y-4">

          {/* Status card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={payment.status}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${cfg.bg} ${cfg.border}`}
            >
              <span className={cfg.color}>{cfg.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                <p className="text-xs text-secondary mt-0.5">{cfg.sublabel}</p>
              </div>
              {cfg.pulse && (
                <span className="ml-auto mt-0.5 relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress timeline */}
          {!isFailed && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <StepTimeline status={payment.status} />
            </div>
          )}

          {/* Paystack checkout — only while pending */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Amount summary */}
              <div className="px-5 pt-6 pb-4 border-b border-border">
                <p className="text-xs text-muted mb-1">Amount to pay</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary tracking-tight">
                    {parseFloat(payment.fiatAmount).toLocaleString()}
                  </span>
                  <span className="text-sm text-secondary font-medium">{payment.fiatCurrency}</span>
                  {countdown && !countdown.expired && (
                    <span className={`ml-auto text-xs font-mono font-medium flex items-center gap-1 ${
                      parseInt(countdown.display) < 5 ? "text-red-400" : "text-secondary"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {countdown.display}
                    </span>
                  )}
                  {countdown?.expired && (
                    <span className="ml-auto text-xs text-red-400 font-medium">Expired</span>
                  )}
                </div>
              </div>

              {/* Pay button */}
              <div className="px-5 py-5 space-y-3">
                {payment.authorizationUrl ? (
                  <a
                    href={payment.authorizationUrl}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-DEFAULT hover:bg-indigo-600 text-white text-sm font-semibold transition-all"
                  >
                    Pay {parseFloat(payment.fiatAmount).toLocaleString()} {payment.fiatCurrency} with Paystack
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing checkout…
                  </div>
                )}

                <p className="text-center text-[11px] text-muted">
                  Secured by Paystack · Pay with card, mobile money, or bank transfer
                </p>
              </div>
            </motion.div>
          )}

          {/* CONFIRMED — processing state */}
          {payment.status === "CONFIRMED" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-blue-500/20 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
              </div>
              <h2 className="text-base font-semibold text-primary mb-1">
                Payment confirmed
              </h2>
              <p className="text-sm text-secondary mb-4">
                Initiating {payment.fiatCurrency === "KES" ? "M-Pesa" : "mobile money"} payout to the merchant
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Usually completes in 1–3 minutes
              </div>
            </motion.div>
          )}

          {/* SETTLED */}
          {isSettled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="bg-card border border-green-500/20 rounded-2xl p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>
              <h2 className="text-lg font-bold text-primary mb-2">Payment complete</h2>
              <p className="text-sm text-secondary mb-6">
                <span className="text-green-400 font-semibold">
                  {parseFloat(payment.fiatAmount).toLocaleString()} {payment.fiatCurrency}
                </span>{" "}
                has been settled to the merchant
              </p>

              <div className="grid grid-cols-2 gap-2 text-left mb-4">
                {[
                  { label: "Amount paid",  value: `${parseFloat(payment.fiatAmount).toLocaleString()} ${payment.fiatCurrency}` },
                  { label: "Method",       value: "Paystack" },
                  { label: "Currency",     value: payment.fiatCurrency },
                  { label: "Reference",    value: payment.reference || payment.id.slice(0, 12) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface rounded-xl p-3">
                    <p className="text-[10px] text-muted mb-0.5">{label}</p>
                    <p className="text-xs font-medium text-primary">{value}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted">Thank you for your payment</p>
            </motion.div>
          )}

          {/* FAILED / REFUNDED */}
          {isFailed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-red-500/20 rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                {payment.status === "REFUNDED"
                  ? <RefreshCw className="w-7 h-7 text-secondary" />
                  : <XCircle className="w-7 h-7 text-red-400" />}
              </div>
              <h2 className="text-base font-semibold text-primary mb-2">
                {payment.status === "REFUNDED" ? "Payment refunded" : "Payment failed"}
              </h2>
              <p className="text-sm text-secondary">
                {payment.status === "REFUNDED"
                  ? "Your payment has been returned."
                  : "The payment could not be completed. Contact the merchant for assistance."}
              </p>
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-center text-[11px] text-muted px-4">
            Powered by{" "}
            <span className="text-indigo-DEFAULT font-medium">AvaRamp</span>
            {" · "}
            Payments via Paystack
            {" · "}
            <a href="/docs" className="hover:text-secondary transition-colors">Docs</a>
          </p>

        </div>
      </main>
    </div>
  );
}
