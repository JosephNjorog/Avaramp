"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ChevronDown } from "lucide-react";
import { adminApi } from "@/lib/api";
import { PaymentStatusBadge } from "@/components/Badge";
import { formatDate, formatDateTime, formatUsdc, truncate } from "@/lib/utils";

const STATUSES = ["PENDING", "CONFIRMED", "SETTLED", "FAILED", "EXPIRED", "REFUNDED"];
const CURRENCIES = ["KES", "NGN", "GHS", "TZS", "UGX"];

type Payment = {
  id: string;
  merchant?: { name: string };
  amountUsdc: string;
  amountFiat: string;
  fiatCurrency: string;
  phone: string | null;
  status: string;
  reference: string | null;
  depositAddress: string;
  confirmedTxHash: string | null;
  settledAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  mpesaReceiptId: string | null;
  fxRate: number | null;
};

export default function PaymentsPage() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [currency, setCurrency] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", page, search, status, currency],
    queryFn: () =>
      adminApi.payments({
        page,
        limit: 25,
        search: search || undefined,
        status: status || undefined,
        currency: currency || undefined,
      }),
  });

  const payments: Payment[] = data?.data ?? [];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by ID, reference, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-admin pl-9"
          />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input-admin pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={currency}
            onChange={(e) => { setCurrency(e.target.value); setPage(1); }}
            className="input-admin pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Currencies</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
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
              {["ID", "Merchant", "USDC", "Fiat", "Currency", "Phone", "Status", "Created", ""].map(
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
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-3.5 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              : payments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-muted">
                      No payments found
                    </td>
                  </tr>
                )
              : payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border hover:bg-surface/40 cursor-pointer"
                    onClick={() => setSelected(p)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted">{p.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-secondary">{p.merchant?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-primary font-medium tabular-nums">
                      {formatUsdc(p.amountUsdc)}
                    </td>
                    <td className="px-4 py-3 text-secondary tabular-nums">{p.amountFiat}</td>
                    <td className="px-4 py-3 text-secondary">{p.fiatCurrency}</td>
                    <td className="px-4 py-3 text-secondary">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-indigo hover:underline">Detail</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">{data.total} payments total</p>
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

      {/* Payment detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-primary">Payment Detail</h3>
                <p className="text-xs text-muted font-mono mt-0.5">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-primary p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Merchant", value: selected.merchant?.name ?? "—" },
                { label: "Status", value: <PaymentStatusBadge status={selected.status} /> },
                { label: "USDC Amount", value: formatUsdc(selected.amountUsdc) },
                { label: "Fiat Amount", value: `${selected.amountFiat} ${selected.fiatCurrency}` },
                { label: "Phone", value: selected.phone ?? "—" },
                { label: "Reference", value: selected.reference ?? "—" },
                { label: "FX Rate", value: selected.fxRate ? `${selected.fxRate}` : "—" },
                { label: "M-Pesa Receipt", value: selected.mpesaReceiptId ?? "—" },
                { label: "Deposit Address", value: truncate(selected.depositAddress, 20), mono: true },
                { label: "Tx Hash", value: truncate(selected.confirmedTxHash ?? "", 20), mono: true },
                { label: "Created", value: formatDateTime(selected.createdAt) },
                { label: "Confirmed At", value: formatDateTime(selected.confirmedAt) },
                { label: "Settled At", value: formatDateTime(selected.settledAt) },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <p className="text-xs text-muted mb-0.5">{label}</p>
                  {typeof value === "string" ? (
                    <p className={`text-sm text-secondary ${mono ? "font-mono text-xs" : ""}`}>
                      {value}
                    </p>
                  ) : (
                    value
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
