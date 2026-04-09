"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Download, Search, RefreshCw, CheckCircle2, FileText, Cookie } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface ConsentRecord {
  id:         string;
  policyType: "TERMS" | "PRIVACY" | "COOKIES";
  version:    string;
  acceptedAt: string;
  ipAddress:  string | null;
  userAgent:  string | null;
  user:       { email: string; phone: string | null };
}

const POLICY_LABELS: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  TERMS:   { label: "Terms of Service", icon: FileText,  color: "text-indigo-DEFAULT bg-indigo-dim border-indigo-border" },
  PRIVACY: { label: "Privacy Policy",   icon: Shield,    color: "text-blue-DEFAULT  bg-blue-dim   border-blue-DEFAULT/20" },
  COOKIES: { label: "Cookie Policy",    icon: Cookie,    color: "text-green-DEFAULT bg-green-dim  border-green-DEFAULT/20" },
};

async function fetchConsents(page: number, search: string, policyType: string) {
  const params = new URLSearchParams({
    page:  String(page),
    limit: "50",
    ...(search     && { search }),
    ...(policyType && { policyType }),
  });
  const res = await api.get(`/admin/consents?${params}`);
  return res.data as { records: ConsentRecord[]; total: number; page: number; limit: number };
}

export default function CompliancePage() {
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [policyType, setPolicyType] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["consents", page, search, policyType],
    queryFn:  () => fetchConsents(page, search, policyType),
  });

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  const handleExport = () => {
    const token = useAuthStore.getState().token;
    const url   = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/consents/export`;
    const a     = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Compliance &amp; Consent Audit</h1>
          <p className="text-sm text-secondary mt-1">
            Track and export legal agreement acceptances from all registered users.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-secondary hover:text-primary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-DEFAULT text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(["TERMS", "PRIVACY", "COOKIES"] as const).map((type) => {
          const config = POLICY_LABELS[type];
          const Icon   = config.icon;
          const count  = (data?.records ?? []).filter((r) => r.policyType === type).length;
          return (
            <div key={type} className={`p-4 rounded-xl border ${config.color} bg-opacity-10`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{data?.total ?? "—"}</p>
              <p className="text-xs opacity-70 mt-0.5">total acceptances</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email or phone..."
            className="input pl-9"
          />
        </div>
        <select
          value={policyType}
          onChange={(e) => { setPolicyType(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">All Policies</option>
          <option value="TERMS">Terms of Service</option>
          <option value="PRIVACY">Privacy Policy</option>
          <option value="COOKIES">Cookie Policy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Policy</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Version</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">Accepted At</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-muted text-xs uppercase tracking-wide hidden xl:table-cell">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-surface rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-secondary">
                    <Shield className="w-8 h-8 text-muted mx-auto mb-3" />
                    <p>No consent records found.</p>
                  </td>
                </tr>
              ) : (
                data?.records.map((record) => {
                  const config = POLICY_LABELS[record.policyType];
                  const Icon   = config.icon;
                  return (
                    <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-primary font-medium">{record.user.email}</p>
                        {record.user.phone && (
                          <p className="text-xs text-muted">{record.user.phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary font-mono text-xs">{record.version}</td>
                      <td className="px-4 py-3 text-secondary whitespace-nowrap">
                        {new Date(record.acceptedAt).toLocaleString("en-KE", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-secondary font-mono text-xs">
                        {record.ipAddress || <span className="text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3 text-muted text-xs hidden xl:table-cell max-w-[200px] truncate" title={record.userAgent ?? undefined}>
                        {record.userAgent || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted">
              Page {page} of {totalPages} · {data?.total.toLocaleString()} total records
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legal note */}
      <div className="flex gap-3 p-4 bg-indigo-dim border border-indigo-border rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-indigo-DEFAULT shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Compliance Record Keeping</p>
          <p className="text-xs text-secondary">
            These records are retained for 7 years per the Kenya Data Protection Act, 2019 requirements.
            Each record captures the exact timestamp, IP address, browser, and policy version the user accepted.
            This constitutes valid proof of informed consent. Export CSV for external audit or legal proceedings.
          </p>
        </div>
      </div>
    </div>
  );
}
