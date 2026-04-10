"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { WebhookStatusBadge } from "@/components/Badge";
import { formatDateTime, truncate } from "@/lib/utils";
import StatsCard from "@/components/StatsCard";

type WebhookDelivery = {
  id: string;
  event: string;
  status: string;
  error: string | null;
  sentAt: string;
  payment?: {
    id: string;
    merchant?: { name: string };
  };
};

export default function WebhooksPage() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-webhooks", page],
    queryFn: () => adminApi.webhooks({ page, limit: 25 }),
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => adminApi.retryWebhook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-webhooks"] });
      toast.success("Webhook queued for retry");
    },
    onError: () => toast.error("Retry failed"),
  });

  const all: WebhookDelivery[] = data?.data ?? [];

  const filtered = all.filter((w) =>
    statusFilter ? w.status === statusFilter : true
  );

  const successCount = all.filter((w) => w.status === "SUCCESS").length;
  const failedCount  = all.filter((w) => w.status === "FAILED").length;
  const successRate  =
    all.length > 0 ? ((successCount / all.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Webhooks"
          value={data?.total ?? 0}
          loading={isLoading}
        />
        <StatsCard
          label="Success"
          value={successCount}
          loading={isLoading}
          accent="green"
        />
        <StatsCard
          label="Failed"
          value={failedCount}
          loading={isLoading}
          accent="red"
        />
        <StatsCard
          label="Success Rate"
          value={`${successRate}%`}
          loading={isLoading}
          accent={parseFloat(successRate) >= 90 ? "green" : "amber"}
        />
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-admin pr-8 appearance-none cursor-pointer max-w-40"
          >
            <option value="">All Statuses</option>
            {["SUCCESS", "FAILED", "RETRY", "PENDING"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {["Payment ID", "Merchant", "Event", "Status", "Error", "Sent At", "Action"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-3.5 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-muted">
                      No webhook deliveries found
                    </td>
                  </tr>
                )
              : filtered.map((w) => (
                  <tr key={w.id} className="border-b border-border hover:bg-surface/40">
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {w.payment?.id?.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {w.payment?.merchant?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs font-mono">{w.event}</td>
                    <td className="px-4 py-3">
                      <WebhookStatusBadge status={w.status} />
                    </td>
                    <td className="px-4 py-3 text-red text-xs" title={w.error ?? ""}>
                      {truncate(w.error ?? "", 40)}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDateTime(w.sentAt)}</td>
                    <td className="px-4 py-3">
                      {(w.status === "FAILED" || w.status === "RETRY") && (
                        <button
                          onClick={() => retryMutation.mutate(w.id)}
                          disabled={retryMutation.isPending}
                          title="Retry"
                          className="p-1.5 rounded-lg text-muted hover:text-indigo hover:bg-indigo-dim transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">{data.total} total webhooks</p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-secondary hover:bg-surface disabled:opacity-30"
            >
              Prev
            </button>
            <span className="text-xs text-secondary px-2 flex items-center">
              {page} / {data.totalPages}
            </span>
            <button
              disabled={page === data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-secondary hover:bg-surface disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
