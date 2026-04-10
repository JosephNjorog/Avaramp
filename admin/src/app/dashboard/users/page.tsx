"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { KycBadge, RoleBadge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  phone: string | null;
  kycStatus: string;
  role: string;
  createdAt: string;
  merchant?: { id: string; name: string; isActive: boolean } | null;
  _count?: { payments: number };
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [confirmAdmin, setConfirmAdmin] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => adminApi.users({ page, limit: 25, search }),
  });

  const kycMutation = useMutation({
    mutationFn: ({ id, kycStatus }: { id: string; kycStatus: string }) =>
      adminApi.updateKyc(id, kycStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("KYC status updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const adminMutation = useMutation({
    mutationFn: (id: string) => adminApi.makeAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User promoted to Admin");
      setConfirmAdmin(null);
    },
    onError: () => toast.error("Promotion failed"),
  });

  const users: User[] = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Toolbar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by email or phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-admin pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {["Email", "Phone", "KYC Status", "Role", "Merchant", "Payments", "Joined", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-3.5 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-muted">
                      No users found
                    </td>
                  </tr>
                )
              : users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-surface/40">
                    <td className="px-4 py-3 text-primary text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-secondary text-xs">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <KycBadge status={u.kycStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-secondary text-xs">
                      {u.merchant?.name ?? <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-secondary tabular-nums">
                      {u._count?.payments ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* KYC dropdown */}
                        <div className="relative">
                          <select
                            value={u.kycStatus}
                            onChange={(e) =>
                              kycMutation.mutate({ id: u.id, kycStatus: e.target.value })
                            }
                            className="appearance-none text-xs bg-surface border border-border rounded-lg px-2 py-1.5 pr-6 text-secondary focus:outline-none focus:border-indigo-border cursor-pointer"
                          >
                            {["PENDING", "VERIFIED", "REJECTED"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
                        </div>

                        {/* Make admin button */}
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => setConfirmAdmin(u)}
                            title="Make Admin"
                            className="p-1.5 rounded-lg text-muted hover:text-indigo hover:bg-indigo-dim transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}
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
          <p className="text-xs text-muted">{data.total} users total</p>
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

      {/* Make Admin confirmation modal */}
      {confirmAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-dim border border-amber/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary">Promote to Admin?</h3>
                <p className="text-xs text-muted">This action grants full admin access</p>
              </div>
            </div>
            <p className="text-sm text-secondary mb-5">
              Are you sure you want to make{" "}
              <span className="text-primary font-medium">{confirmAdmin.email}</span> an administrator?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAdmin(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-secondary hover:bg-surface text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => adminMutation.mutate(confirmAdmin.id)}
                disabled={adminMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-amber hover:bg-amber/90 text-black text-sm font-medium disabled:opacity-60"
              >
                {adminMutation.isPending ? "Promoting…" : "Make Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
