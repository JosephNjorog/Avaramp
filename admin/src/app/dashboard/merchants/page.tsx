"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, ToggleLeft, ToggleRight, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { ActiveBadge } from "@/components/Badge";
import { formatDate, formatUsdc } from "@/lib/utils";

export default function MerchantsPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [editFee, setEditFee] = useState<{ id: string; value: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-merchants", page, search],
    queryFn: () => adminApi.merchants({ page, limit: 20, search }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateMerchant(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-merchants"] });
      toast.success("Merchant updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const feeMutation = useMutation({
    mutationFn: ({ id, feeOverrideBps }: { id: string; feeOverrideBps: number | null }) =>
      adminApi.updateMerchant(id, { feeOverrideBps }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-merchants"] });
      toast.success("Fee override saved");
      setEditFee(null);
    },
    onError: () => toast.error("Update failed"),
  });

  type Merchant = {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    feeOverrideBps: number | null;
    paymentCount: number;
    totalVolume: number;
    createdAt: string;
  };

  const merchants: Merchant[] = (data?.data ?? []).filter((m: Merchant) => {
    if (filter === "active") return m.isActive;
    if (filter === "inactive") return !m.isActive;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-admin pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === f
                  ? "bg-indigo-dim text-indigo border border-indigo-border"
                  : "text-secondary border border-border hover:bg-surface"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {["Name", "Email", "Status", "Fee BPS", "Payments", "Volume", "Created", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-3.5 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : merchants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-muted">
                      No merchants found
                    </td>
                  </tr>
                )
              : merchants.map((m) => (
                  <tr key={m.id} className="border-b border-border hover:bg-surface/40">
                    <td className="px-4 py-3 text-primary font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-secondary text-xs">{m.email}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge active={m.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      {editFee?.id === m.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editFee.value}
                            onChange={(e) => setEditFee({ id: m.id, value: e.target.value })}
                            className="input-admin w-20 text-xs py-1 px-2"
                          />
                          <button
                            onClick={() =>
                              feeMutation.mutate({
                                id: m.id,
                                feeOverrideBps: editFee.value === "" ? null : parseInt(editFee.value),
                              })
                            }
                            className="text-green hover:text-green/80"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditFee(null)}
                            className="text-muted hover:text-red"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-secondary tabular-nums">
                            {m.feeOverrideBps ?? 100} bps
                          </span>
                          <button
                            onClick={() =>
                              setEditFee({ id: m.id, value: String(m.feeOverrideBps ?? 100) })
                            }
                            className="text-muted hover:text-indigo"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-secondary tabular-nums">{m.paymentCount}</td>
                    <td className="px-4 py-3 text-secondary tabular-nums text-xs">
                      {formatUsdc(m.totalVolume)}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/merchants/${m.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-indigo hover:bg-indigo-dim transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => toggleMutation.mutate({ id: m.id, isActive: !m.isActive })}
                          className={`p-1.5 rounded-lg transition-colors ${
                            m.isActive
                              ? "text-green hover:text-red hover:bg-red-dim"
                              : "text-muted hover:text-green hover:bg-green-dim"
                          }`}
                          title={m.isActive ? "Deactivate" : "Activate"}
                        >
                          {m.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">{data.total} merchants total</p>
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
