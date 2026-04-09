"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, CheckCircle, Clock, DollarSign, Plus } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";
import CreatePaymentModal from "@/components/dashboard/CreatePaymentModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { paymentsApi } from "@/lib/api";
import { formatDate, truncateAddress } from "@/lib/utils";

export default function OverviewPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsApi.list({ limit: 8 }),
    staleTime: 30_000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn:  () => paymentsApi.analytics(),
    staleTime: 60_000,
  });

  const _raw     = data?.data?.data ?? data?.data;
  const payments: any[] = Array.isArray(_raw) ? _raw : (_raw?.payments ?? []);
  const settled  = payments.filter((p) => p.status === "SETTLED").length;
  const pending  = payments.filter((p) => p.status === "PENDING").length;

  const summary   = analyticsData?.data?.data;
  const chartData = (summary?.dailyVolume ?? []).map((d: { date: string; volume: number }) => ({
    day: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    v:   d.volume,
  }));
  const totalVolume = (summary?.dailyVolume ?? []).reduce(
    (sum: number, d: { volume: number }) => sum + d.volume, 0
  );
  const volumeDisplay = totalVolume > 0 ? `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—";

  return (
    <div className="p-4 md:p-7 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Overview</h1>
          <p className="text-sm text-muted mt-0.5">Payment activity at a glance</p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          New payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard label="Total payments"  value={String(payments.length)} icon={ArrowLeftRight} />
        <StatsCard label="Settled"         value={String(settled)}         icon={CheckCircle}    trend={{ value: 12, label: "vs last week" }} />
        <StatsCard label="Pending"         value={String(pending)}         icon={Clock}          />
        <StatsCard label="7-day volume"     value={volumeDisplay}           icon={DollarSign}     sub="last 7 days" />
      </div>

      {/* Chart + table */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
        {/* Volume chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-primary">Payment volume</p>
            <p className="text-xs text-muted">Last 7 days (USD)</p>
          </div>
          {chartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted text-center px-4">
              No settlement data yet — data will appear here once payments are completed.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c6ff7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262a" />
                <XAxis dataKey="day" tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1d", border: "1px solid #26262a", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#9898a0" }}
                  itemStyle={{ color: "#7c6ff7" }}
                />
                <Area type="monotone" dataKey="v" name="Volume (USDC)" stroke="#7c6ff7" strokeWidth={2} fill="url(#grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-primary">Recent</p>
            <a href="/dashboard/payments" className="text-xs text-indigo-DEFAULT hover:underline">View all</a>
          </div>

          {isLoading ? (
            <SkeletonTable rows={6} cols={3} />
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <ArrowLeftRight className="w-8 h-8 text-border mb-3" strokeWidth={1} />
              <p className="text-sm text-secondary mb-1">No payments yet</p>
              <p className="text-xs text-muted mb-4">Create your first payment to get started</p>
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
                New payment
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.slice(0, 7).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary truncate">
                      {p.reference || truncateAddress(p.id, 8)}
                    </p>
                    <p className="text-2xs text-muted">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-primary">{p.amountUsdc} USDC</p>
                  </div>
                  <Badge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreatePaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}
