"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Webhook, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp,
  Clock, AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Mock data — replace with real API call when webhook delivery list endpoint is available
const mockDeliveries = [
  {
    id: "wh_1",
    event: "payment.confirmed",
    url: "https://example.com/webhooks",
    status: "SUCCESS",
    statusCode: 200,
    attemptCount: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: 142,
    payload: { event: "payment.confirmed", paymentId: "pay_abc123", amount: "100.00" },
  },
  {
    id: "wh_2",
    event: "payment.settled",
    url: "https://example.com/webhooks",
    status: "SUCCESS",
    statusCode: 200,
    attemptCount: 1,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duration: 98,
    payload: { event: "payment.settled", paymentId: "pay_abc123", fiatAmount: "13000", currency: "KES" },
  },
  {
    id: "wh_3",
    event: "payment.confirmed",
    url: "https://example.com/webhooks",
    status: "FAILED",
    statusCode: 500,
    attemptCount: 3,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 5000,
    payload: { event: "payment.confirmed", paymentId: "pay_xyz789" },
  },
  {
    id: "wh_4",
    event: "payment.expired",
    url: "https://example.com/webhooks",
    status: "PENDING",
    statusCode: null,
    attemptCount: 0,
    createdAt: new Date(Date.now() - 30 * 1000).toISOString(),
    duration: null,
    payload: { event: "payment.expired", paymentId: "pay_def456" },
  },
];

function DeliveryRow({ delivery }: { delivery: typeof mockDeliveries[0] }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    SUCCESS: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    FAILED:  { icon: XCircle,     color: "text-red-400",     bg: "bg-red-400/10" },
    PENDING: { icon: Clock,       color: "text-amber-400",   bg: "bg-amber-400/10" },
  }[delivery.status] ?? { icon: AlertCircle, color: "text-muted", bg: "bg-surface" };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface/40 transition-colors text-left"
      >
        <div className={`w-7 h-7 rounded-lg ${statusConfig.bg} flex items-center justify-center shrink-0`}>
          <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">{delivery.event}</span>
            {delivery.statusCode && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color}`}>
                {delivery.statusCode}
              </span>
            )}
          </div>
          <div className="text-muted text-xs truncate">{delivery.url}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-muted text-xs">{formatDate(delivery.createdAt)}</div>
          {delivery.duration && (
            <div className="text-muted text-xs">{delivery.duration}ms</div>
          )}
          {delivery.attemptCount > 1 && (
            <div className="text-amber-400 text-xs">{delivery.attemptCount} attempts</div>
          )}
        </div>
        <div className="text-muted ml-2 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-6 pb-4"
        >
          <div className="bg-surface rounded-xl p-4">
            <div className="text-muted text-xs mb-2 font-medium uppercase tracking-wide">Payload</div>
            <pre className="text-accent text-xs font-mono overflow-auto">
              {JSON.stringify(delivery.payload, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function WebhooksPage() {
  const successCount = mockDeliveries.filter((d) => d.status === "SUCCESS").length;
  const failedCount = mockDeliveries.filter((d) => d.status === "FAILED").length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-subtle text-sm mt-1">Delivery logs for all webhook events</p>
        </div>
        <button className="flex items-center gap-2 text-muted hover:text-white text-sm border border-border bg-card px-3 py-2 rounded-xl transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Deliveries", value: mockDeliveries.length, color: "text-white" },
          { label: "Successful", value: successCount, color: "text-emerald-400" },
          { label: "Failed", value: failedCount, color: "text-red-400" },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4 text-center"
          >
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-muted text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Delivery log */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <Webhook className="w-4 h-4 text-accent" />
          <h2 className="text-white font-semibold text-sm">Delivery Log</h2>
        </div>

        {mockDeliveries.length === 0 ? (
          <div className="p-12 text-center">
            <Webhook className="w-10 h-10 text-border mx-auto mb-3" />
            <div className="text-white text-sm font-medium mb-1">No deliveries yet</div>
            <div className="text-muted text-xs">
              Webhook events will appear here once payments are processed
            </div>
          </div>
        ) : (
          mockDeliveries.map((d) => <DeliveryRow key={d.id} delivery={d} />)
        )}
      </motion.div>

      {/* Info card */}
      <div className="bg-accent/5 border border-accent/15 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div>
            <div className="text-white text-sm font-medium mb-1">Webhook Security</div>
            <p className="text-subtle text-xs leading-relaxed">
              All webhook deliveries are signed with HMAC-SHA256 using your merchant's webhook secret.
              Verify the <code className="text-accent font-mono">X-Webhook-Signature</code> header on each request.
              Failed deliveries are retried up to 3 times with exponential backoff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
