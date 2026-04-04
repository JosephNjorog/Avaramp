"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Webhook } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DELIVERIES = [
  {
    id: "wh_01",
    event: "payment.settled",
    statusCode: 200,
    status: "SUCCESS",
    attempts: 1,
    duration: 138,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    payload: { event: "payment.settled", paymentId: "pay_abc123", fiatAmount: "5000", currency: "KES", mpesaReceipt: "NLJ7RT61SV" },
  },
  {
    id: "wh_02",
    event: "payment.confirmed",
    statusCode: 200,
    status: "SUCCESS",
    attempts: 1,
    duration: 92,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    payload: { event: "payment.confirmed", paymentId: "pay_abc123", amountUsdc: "3.82", confirmedAt: new Date().toISOString() },
  },
  {
    id: "wh_03",
    event: "payment.confirmed",
    statusCode: 500,
    status: "FAILED",
    attempts: 3,
    duration: 5000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    payload: { event: "payment.confirmed", paymentId: "pay_xyz789" },
  },
  {
    id: "wh_04",
    event: "payment.expired",
    statusCode: null,
    status: "PENDING",
    attempts: 0,
    duration: null,
    createdAt: new Date(Date.now() - 45 * 1000).toISOString(),
    payload: { event: "payment.expired", paymentId: "pay_def456" },
  },
];

type Delivery = typeof DELIVERIES[0];

const STATUS = {
  SUCCESS: { icon: CheckCircle, text: "text-green-DEFAULT",  bg: "bg-green-dim" },
  FAILED:  { icon: XCircle,     text: "text-red-DEFAULT",    bg: "bg-red-dim"   },
  PENDING: { icon: Clock,       text: "text-amber-DEFAULT",  bg: "bg-amber-dim" },
};

function DeliveryRow({ d }: { d: Delivery }) {
  const [open, setOpen] = useState(false);
  const s = STATUS[d.status as keyof typeof STATUS] ?? STATUS.PENDING;
  const Icon = s.icon;

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface/50 transition-colors text-left"
      >
        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", s.bg)}>
          <Icon className={cn("w-3.5 h-3.5", s.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-primary">{d.event}</span>
          {d.statusCode && (
            <span className={cn("ml-2 text-2xs px-1.5 py-0.5 rounded", s.bg, s.text)}>
              {d.statusCode}
            </span>
          )}
          <p className="text-2xs text-muted mt-0.5 truncate">{formatDate(d.createdAt)}</p>
        </div>
        <div className="text-right shrink-0 mr-2">
          {d.duration && <p className="text-2xs text-muted">{d.duration}ms</p>}
          {d.attempts > 1 && <p className="text-2xs text-amber-DEFAULT">{d.attempts} attempts</p>}
        </div>
        <div className="text-muted shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <div className="bg-surface border border-border rounded-lg p-3">
            <p className="text-2xs text-muted uppercase tracking-wider mb-2 font-semibold">Payload</p>
            <pre className="text-xs font-mono text-indigo-DEFAULT leading-relaxed overflow-x-auto">
              {JSON.stringify(d.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WebhooksPage() {
  const success = DELIVERIES.filter((d) => d.status === "SUCCESS").length;
  const failed  = DELIVERIES.filter((d) => d.status === "FAILED").length;

  return (
    <div className="p-5 md:p-7 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-primary">Webhooks</h1>
        <p className="text-sm text-muted mt-0.5">Delivery log for all event notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",      value: DELIVERIES.length, color: "text-primary"       },
          { label: "Successful", value: success,            color: "text-green-DEFAULT" },
          { label: "Failed",     value: failed,             color: "text-red-DEFAULT"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={cn("text-2xl font-bold tracking-tight", color)}>{value}</div>
            <div className="text-xs text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <Webhook className="w-4 h-4 text-secondary" strokeWidth={1.5} />
          <span className="text-sm font-medium text-primary">Delivery log</span>
        </div>
        {DELIVERIES.map((d) => <DeliveryRow key={d.id} d={d} />)}
      </div>

      {/* Info */}
      <div className="bg-card border border-border rounded-xl p-4 text-xs text-secondary leading-relaxed">
        <strong className="text-primary block mb-1">Signature verification</strong>
        Verify <code className="text-indigo-DEFAULT font-mono">X-Webhook-Signature</code> on every request:
        compute <code className="text-indigo-DEFAULT font-mono">HMAC-SHA256(rawBody, webhookSecret)</code> and compare.
        Failed deliveries are retried up to 3 times with exponential backoff.
      </div>
    </div>
  );
}
