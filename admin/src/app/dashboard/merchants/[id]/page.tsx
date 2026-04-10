"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, ToggleLeft, ToggleRight, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api";
import { ActiveBadge, PaymentStatusBadge, KycBadge, RoleBadge } from "@/components/Badge";
import { formatDate, formatDateTime, formatUsdc } from "@/lib/utils";
import StatsCard from "@/components/StatsCard";

export default function MerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const qc      = useQueryClient();

  const { data: merchant, isLoading } = useQuery({
    queryKey: ["admin-merchant", id],
    queryFn: () => adminApi.merchant(id),
  });

  const [webhookUrl, setWebhookUrl]         = useState("");
  const [feeOverrideBps, setFeeOverrideBps] = useState("");
  const [formReady, setFormReady]           = useState(false);

  // init form once loaded
  if (merchant && !formReady) {
    setWebhookUrl(merchant.webhookUrl ?? "");
    setFeeOverrideBps(String(merchant.feeOverrideBps ?? ""));
    setFormReady(true);
  }

  const updateMutation = useMutation({
    mutationFn: (data: { isActive?: boolean; feeOverrideBps?: number | null; webhookUrl?: string }) =>
      adminApi.updateMerchant(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-merchant", id] });
      toast.success("Merchant updated");
    },
    onError: () => toast.error("Update failed"),
  });

  function handleSave() {
    updateMutation.mutate({
      webhookUrl: webhookUrl || undefined,
      feeOverrideBps: feeOverrideBps ? parseInt(feeOverrideBps) : null,
    });
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (!merchant) {
    return <p className="text-muted">Merchant not found.</p>;
  }

  const settledPayments = merchant.payments?.filter(
    (p: { status: string }) => p.status === "SETTLED"
  ) ?? [];
  const totalVolume = merchant.totalVolume ?? 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/merchants")}
        className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Merchants
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">{merchant.name}</h2>
          <p className="text-secondary text-sm">{merchant.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <ActiveBadge active={merchant.isActive} />
          <button
            onClick={() =>
              updateMutation.mutate({ isActive: !merchant.isActive })
            }
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              merchant.isActive
                ? "border-red/30 text-red hover:bg-red-dim"
                : "border-green/30 text-green hover:bg-green-dim"
            }`}
          >
            {merchant.isActive ? (
              <>
                <ToggleRight className="w-4 h-4" /> Deactivate
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" /> Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Payments" value={merchant._count?.payments ?? 0} />
        <StatsCard label="Settled" value={settledPayments.length} accent="green" />
        <StatsCard
          label="Pending"
          value={
            (merchant.payments ?? []).filter((p: { status: string }) => p.status === "PENDING")
              .length
          }
          accent="amber"
        />
        <StatsCard label="Total USDC" value={formatUsdc(totalVolume)} accent="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Merchant details */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary">Merchant Details</h3>

          {[
            { label: "Wallet Address", value: merchant.walletAddress, mono: true, copy: true },
            { label: "M-Pesa Till", value: merchant.mpesaTill },
            {
              label: "Webhook Secret",
              value: merchant.webhookSecret
                ? `${merchant.webhookSecret.slice(0, 8)}${"•".repeat(24)}`
                : "—",
              mono: true,
            },
          ].map(({ label, value, mono, copy }) => (
            <div key={label}>
              <p className="text-xs text-muted mb-0.5">{label}</p>
              <div className="flex items-center gap-2">
                <p className={`text-sm text-secondary ${mono ? "font-mono text-xs" : ""} break-all`}>
                  {value}
                </p>
                {copy && value && (
                  <button
                    onClick={() => copyToClipboard(value, label)}
                    className="text-muted hover:text-indigo flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {merchant.user && (
            <div>
              <p className="text-xs text-muted mb-1">Linked User</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-secondary">{merchant.user.email}</span>
                <KycBadge status={merchant.user.kycStatus} />
                <RoleBadge role={merchant.user.role} />
              </div>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-primary">Edit Configuration</h3>

          <div>
            <label className="block text-xs text-muted mb-1.5">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://merchant.example.com/webhook"
              className="input-admin"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Fee Override (BPS)</label>
            <input
              type="number"
              value={feeOverrideBps}
              onChange={(e) => setFeeOverrideBps(e.target.value)}
              placeholder="100 (default = 1%)"
              min={0}
              max={10000}
              className="input-admin"
            />
            <p className="text-xs text-muted mt-1">
              Leave blank to use default (100 bps = 1%). Current: {merchant.feeOverrideBps ?? 100} bps
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo hover:bg-indigo/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">
          Recent Payments{" "}
          <span className="text-muted font-normal">(last 20)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Amount USDC", "Fiat", "Currency", "Phone", "Status", "Created", "Settled At"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {(merchant.payments ?? []).map(
                (p: {
                  id: string;
                  amountUsdc: string;
                  amountFiat: string;
                  fiatCurrency: string;
                  phone: string | null;
                  status: string;
                  createdAt: string;
                  settledAt: string | null;
                }) => (
                  <tr key={p.id} className="border-b border-border hover:bg-surface/40">
                    <td className="px-3 py-3 text-muted font-mono text-xs">
                      {p.id.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-3 text-primary tabular-nums font-medium">
                      {formatUsdc(p.amountUsdc)}
                    </td>
                    <td className="px-3 py-3 text-secondary tabular-nums">{p.amountFiat}</td>
                    <td className="px-3 py-3 text-secondary">{p.fiatCurrency}</td>
                    <td className="px-3 py-3 text-secondary">{p.phone ?? "—"}</td>
                    <td className="px-3 py-3">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-3 text-muted text-xs">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-3 text-muted text-xs">
                      {p.settledAt ? formatDateTime(p.settledAt) : "—"}
                    </td>
                  </tr>
                )
              )}
              {(!merchant.payments || merchant.payments.length === 0) && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted">
                    No payments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
