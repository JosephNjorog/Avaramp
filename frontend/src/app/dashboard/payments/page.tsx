"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, RefreshCw, ArrowLeftRight } from "lucide-react";
import { paymentsApi } from "@/lib/api";
import { formatDate, truncateAddress } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import CreatePaymentModal from "@/components/dashboard/CreatePaymentModal";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "SETTLED", "EXPIRED", "FAILED"];

export default function PaymentsPage() {
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payments", status],
    queryFn: () => paymentsApi.list(status !== "ALL" ? { status } : {}),
    staleTime: 30_000,
  });

  const payments: any[] = data?.data?.data ?? data?.data ?? [];

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.id?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q) ||
      p.depositAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-5 md:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Payments</h1>
          <p className="text-sm text-muted mt-0.5">All USDC payment requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-8 h-8 rounded-lg bg-card border border-border text-muted hover:text-secondary flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
            New payment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, reference, or address"
            className="input pl-9 h-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 h-8 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                status === s
                  ? "bg-indigo-dim text-indigo-DEFAULT"
                  : "text-muted hover:text-secondary"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_100px_140px_80px] gap-4 px-5 py-2.5 border-b border-border">
          {["Payment", "Amount", "Address", "Status"].map((h) => (
            <span key={h} className="text-2xs font-semibold text-muted uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {isLoading ? (
          <SkeletonTable rows={8} cols={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowLeftRight className="w-8 h-8 text-border mb-3" strokeWidth={1} />
            <p className="text-sm text-secondary mb-1">
              {search || status !== "ALL" ? "No payments match your filters" : "No payments yet"}
            </p>
            {!search && status === "ALL" && (
              <Button size="sm" className="mt-3" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
                Create first payment
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p: any) => (
              <div key={p.id} className="grid grid-cols-[1fr_100px_140px_80px] gap-4 items-center px-5 py-3.5 hover:bg-surface/60 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary truncate">
                    {p.reference || <span className="text-muted">No reference</span>}
                  </p>
                  <p className="text-2xs text-muted font-mono mt-0.5">{p.id?.slice(0, 16)}…</p>
                  <p className="text-2xs text-muted">{formatDate(p.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">{p.amountUsdc} USDC</p>
                  <p className="text-2xs text-muted">{p.fiatAmount} {p.currency}</p>
                </div>
                <div>
                  {p.depositAddress ? (
                    <code className="text-2xs font-mono text-secondary bg-surface px-1.5 py-0.5 rounded">
                      {truncateAddress(p.depositAddress)}
                    </code>
                  ) : <span className="text-2xs text-muted">—</span>}
                </div>
                <Badge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
