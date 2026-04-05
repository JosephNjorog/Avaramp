"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Webhook, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { usersApi } from "@/lib/api";
import { SkeletonTable } from "@/components/ui/Skeleton";

type Delivery = {
  id: string;
  event: string;
  status: string;
  error?: string | null;
  sentAt: string;
  payment?: { id: string; merchantId: string; fiatCurrency: string };
};

const STATUS_MAP = {
  delivered: { icon: CheckCircle, text: "text-green-DEFAULT",  bg: "bg-green-dim",  label: "Delivered" },
  failed:    { icon: XCircle,     text: "text-red-DEFAULT",    bg: "bg-red-dim",    label: "Failed"    },
  pending:   { icon: Clock,       text: "text-amber-DEFAULT",  bg: "bg-amber-dim",  label: "Pending"   },
};

function DeliveryRow({ d }: { d: Delivery }) {
  const [open, setOpen] = useState(false);
  const key = d.status as keyof typeof STATUS_MAP;
  const s   = STATUS_MAP[key] ?? STATUS_MAP.pending;
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">{d.event}</span>
            <span className={cn("text-2xs px-1.5 py-0.5 rounded font-medium", s.bg, s.text)}>
              {s.label}
            </span>
          </div>
          <p className="text-2xs text-muted mt-0.5">{formatDate(d.sentAt)}</p>
        </div>
        <div className="text-right shrink-0 mr-2">
          {d.payment && (
            <p className="text-2xs text-muted font-mono">{d.payment.id.slice(0, 8)}…</p>
          )}
        </div>
        <div className="text-muted shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-2">
          {d.error && (
            <div className="bg-red-dim border border-red-DEFAULT/20 rounded-lg px-3 py-2 text-xs text-red-DEFAULT">
              Error: {d.error}
            </div>
          )}
          <div className="bg-surface border border-border rounded-lg p-3">
            <p className="text-2xs text-muted uppercase tracking-wider mb-2 font-semibold">Delivery details</p>
            <pre className="text-xs font-mono text-indigo-DEFAULT leading-relaxed overflow-x-auto">
              {JSON.stringify({ id: d.id, event: d.event, status: d.status, sentAt: d.sentAt, paymentId: d.payment?.id }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WebhooksPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["webhooks"],
    queryFn:  () => usersApi.webhooks({ limit: 100 }),
    staleTime: 30_000,
  });

  const deliveries: Delivery[] = data?.data?.data?.deliveries ?? [];
  const total     = data?.data?.data?.total ?? 0;
  const success   = deliveries.filter((d) => d.status === "delivered").length;
  const failed    = deliveries.filter((d) => d.status === "failed").length;

  return (
    <div className="p-5 md:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Webhooks</h1>
          <p className="text-sm text-muted mt-0.5">Delivery log for all event notifications</p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-8 h-8 rounded-lg bg-card border border-border text-muted hover:text-secondary flex items-center justify-center transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",      value: total,   color: "text-primary"       },
          { label: "Delivered",  value: success, color: "text-green-DEFAULT" },
          { label: "Failed",     value: failed,  color: "text-red-DEFAULT"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={cn("text-2xl font-bold tracking-tight", color)}>{value}</div>
            <div className="text-xs text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-secondary" strokeWidth={1.5} />
            <span className="text-sm font-medium text-primary">Delivery log</span>
          </div>
          {total > 0 && <span className="text-xs text-muted">{total} total</span>}
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Webhook className="w-8 h-8 text-border mb-3" strokeWidth={1} />
            <p className="text-sm text-secondary mb-1">No deliveries yet</p>
            <p className="text-xs text-muted">Webhook events appear here once payments are processed</p>
          </div>
        ) : (
          deliveries.map((d) => <DeliveryRow key={d.id} d={d} />)
        )}
      </div>

      {/* Docs */}
      <div className="bg-card border border-border rounded-xl p-4 text-xs text-secondary leading-relaxed">
        <strong className="text-primary block mb-1">Signature verification</strong>
        Every delivery includes an <code className="text-indigo-DEFAULT font-mono">X-AvaRamp-Signature</code> header.
        Verify it server-side: <code className="text-indigo-DEFAULT font-mono">HMAC-SHA256(rawBody, webhookSecret)</code>.
        Compare with the header value (format: <code className="text-indigo-DEFAULT font-mono">sha256=…</code>).
        Failed deliveries are retried up to 3 times with exponential backoff.
      </div>
    </div>
  );
}
