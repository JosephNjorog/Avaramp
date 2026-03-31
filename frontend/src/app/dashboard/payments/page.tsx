"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, DollarSign,
  ArrowUpRight, Clock, XCircle, RefreshCw,
} from "lucide-react";
import { paymentsApi } from "@/lib/api";
import { formatCurrency, formatDate, truncateAddress, statusColor } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CreatePaymentModal from "@/components/dashboard/CreatePaymentModal";

const STATUS_FILTERS = ["ALL", "PENDING", "CONFIRMED", "SETTLED", "EXPIRED", "FAILED"];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payments", statusFilter],
    queryFn: () => paymentsApi.list(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    staleTime: 30_000,
  });

  const payments: any[] = data?.data?.data ?? [];

  const filtered = payments.filter((p) =>
    !search ||
    p.id?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase()) ||
    p.depositAddress?.toLowerCase().includes(search.toLowerCase())
  );

  const statusIcon = (s: string) => {
    switch (s) {
      case "PENDING":   return <Clock className="w-3.5 h-3.5" />;
      case "CONFIRMED": return <ArrowUpRight className="w-3.5 h-3.5" />;
      case "SETTLED":   return <DollarSign className="w-3.5 h-3.5" />;
      case "FAILED":
      case "EXPIRED":   return <XCircle className="w-3.5 h-3.5" />;
      default:          return null;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-subtle text-sm mt-1">Manage and track all your USDC payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-9 h-9 rounded-xl bg-surface border border-border text-muted hover:text-white flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            New payment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, reference, or address…"
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-accent/20 text-accent"
                  : "text-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-border text-muted text-xs font-medium uppercase tracking-wide">
          <span>Payment</span>
          <span>Amount</span>
          <span className="hidden md:block">Address</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted text-sm">Loading payments…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-border mx-auto mb-3" />
            <div className="text-white text-sm font-medium mb-1">No payments found</div>
            <div className="text-muted text-xs mb-4">
              {search || statusFilter !== "ALL" ? "Try adjusting your filters" : "Create your first payment to get started"}
            </div>
            {!search && statusFilter === "ALL" && (
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
                Create payment
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-surface/50 transition-colors">
                <div>
                  <div className="text-white text-sm font-medium">{p.reference || "—"}</div>
                  <div className="text-muted text-xs font-mono">{p.id?.slice(0, 12)}…</div>
                  <div className="text-muted text-xs mt-0.5">{formatDate(p.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-semibold">{p.amountUsdc} USDC</div>
                  <div className="text-muted text-xs">{p.fiatAmount} {p.currency}</div>
                </div>
                <div className="hidden md:block">
                  <div className="text-muted text-xs font-mono bg-surface px-2 py-1 rounded-lg">
                    {p.depositAddress ? truncateAddress(p.depositAddress) : "—"}
                  </div>
                </div>
                <div>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <CreatePaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
      />
    </div>
  );
}
