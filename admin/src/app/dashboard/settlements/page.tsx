"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download } from "lucide-react";
import { adminApi } from "@/lib/api";
import { formatDate, formatDateTime, formatUsdc, exportToCsv } from "@/lib/utils";
import StatsCard from "@/components/StatsCard";

type Settlement = {
  id: string;
  merchant?: { name: string };
  phone: string | null;
  amountUsdc: string;
  amountFiat: string;
  fiatCurrency: string;
  mpesaReceiptId: string | null;
  settledAt: string | null;
  fxRate: number | null;
};

export default function SettlementsPage() {
  const [search, setSearch] = useState("");

  const { data: settlements, isLoading } = useQuery({
    queryKey: ["admin-settlements"],
    queryFn: () => adminApi.settlements(),
  });

  const all: Settlement[] = settlements ?? [];

  const filtered = all.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.id.includes(q) ||
      s.merchant?.name?.toLowerCase().includes(q) ||
      (s.phone ?? "").includes(q) ||
      (s.mpesaReceiptId ?? "").toLowerCase().includes(q)
    );
  });

  const totalUsdc = all.reduce((s, p) => s + parseFloat(p.amountUsdc || "0"), 0);
  const fiatByCurrency: Record<string, number> = {};
  for (const p of all) {
    fiatByCurrency[p.fiatCurrency] =
      (fiatByCurrency[p.fiatCurrency] || 0) + parseFloat(p.amountFiat || "0");
  }

  function handleExport() {
    const rows = filtered.map((s) => ({
      id: s.id,
      merchant: s.merchant?.name ?? "",
      phone: s.phone ?? "",
      amountUsdc: s.amountUsdc,
      amountFiat: s.amountFiat,
      fiatCurrency: s.fiatCurrency,
      mpesaReceiptId: s.mpesaReceiptId ?? "",
      settledAt: s.settledAt ?? "",
      fxRate: s.fxRate ?? "",
    }));
    exportToCsv(rows as Record<string, unknown>[], "settlements.csv");
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Settled"
          value={all.length}
          loading={isLoading}
          accent="green"
        />
        <StatsCard
          label="Total USDC Volume"
          value={formatUsdc(totalUsdc)}
          loading={isLoading}
          accent="blue"
        />
        {Object.entries(fiatByCurrency)
          .slice(0, 2)
          .map(([currency, vol]) => (
            <StatsCard
              key={currency}
              label={`${currency} Volume`}
              value={vol.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              loading={isLoading}
            />
          ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by ID, merchant, phone, receipt…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-admin pl-9"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-secondary hover:bg-surface hover:text-primary transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {[
                "Payment ID",
                "Merchant",
                "Phone",
                "USDC Amount",
                "Fiat Amount",
                "Currency",
                "M-Pesa Receipt",
                "Settled At",
              ].map((h) => (
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
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-3.5 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-muted">
                      No settlements found
                    </td>
                  </tr>
                )
              : filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-surface/40">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{s.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-secondary">{s.merchant?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-secondary">{s.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-primary font-medium tabular-nums">
                      {formatUsdc(s.amountUsdc)}
                    </td>
                    <td className="px-4 py-3 text-secondary tabular-nums">{s.amountFiat}</td>
                    <td className="px-4 py-3 text-secondary">{s.fiatCurrency}</td>
                    <td className="px-4 py-3 text-secondary font-mono text-xs">
                      {s.mpesaReceiptId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {formatDateTime(s.settledAt)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
