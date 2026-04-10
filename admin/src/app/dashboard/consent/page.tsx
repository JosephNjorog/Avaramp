"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { downloadCsv, formatDateTime, truncate } from "@/lib/utils";
import StatsCard from "@/components/StatsCard";

const POLICY_TYPES = ["TERMS", "PRIVACY", "COOKIES"];

type ConsentRecord = {
  id: string;
  policyType: string;
  version: string;
  acceptedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  user: { email: string };
};

export default function ConsentPage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [policyFilter, setPolicyFilter] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-consent", page, search],
    queryFn: () => adminApi.consent({ page, limit: 25, search }),
  });

  const records: ConsentRecord[] = data?.data ?? [];

  // Count by policy type (from the current page)
  const countByPolicy: Record<string, number> = {};
  for (const r of records) {
    countByPolicy[r.policyType] = (countByPolicy[r.policyType] || 0) + 1;
  }

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await adminApi.exportConsent();
      downloadCsv(csv, "consent-records.csv");
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  const filtered = policyFilter
    ? records.filter((r) => r.policyType === policyFilter)
    : records;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Stats by policy type */}
      <div className="grid grid-cols-3 gap-4">
        {POLICY_TYPES.map((pt) => (
          <StatsCard
            key={pt}
            label={pt}
            value={data?.total ? `${countByPolicy[pt] ?? 0} (page)` : "—"}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by user email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-admin pl-9"
          />
        </div>

        <div className="relative">
          <select
            value={policyFilter}
            onChange={(e) => setPolicyFilter(e.target.value)}
            className="input-admin pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            {POLICY_TYPES.map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-secondary hover:bg-surface hover:text-primary transition-colors text-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {["User Email", "Policy Type", "Version", "Accepted At", "IP Address", "User Agent"].map(
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-3.5 rounded w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-muted">
                      No consent records found
                    </td>
                  </tr>
                )
              : filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-surface/40">
                    <td className="px-4 py-3 text-secondary text-xs">{r.user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge text-xs ${
                          r.policyType === "TERMS"
                            ? "badge-indigo"
                            : r.policyType === "PRIVACY"
                            ? "badge-blue"
                            : "badge-amber"
                        }`}
                      >
                        {r.policyType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary font-mono text-xs">{r.version}</td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {formatDateTime(r.acceptedAt)}
                    </td>
                    <td className="px-4 py-3 text-secondary font-mono text-xs">
                      {r.ipAddress ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-muted text-xs"
                      title={r.userAgent ?? ""}
                    >
                      {truncate(r.userAgent ?? "", 40)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">{data.total} consent records total</p>
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
