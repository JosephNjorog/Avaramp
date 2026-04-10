"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Percent,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminApi } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import { PaymentStatusBadge } from "@/components/Badge";
import { formatUsdc, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  SETTLED:   "#3dd68c",
  CONFIRMED: "#60a5fa",
  PENDING:   "#f5a623",
  FAILED:    "#f56060",
  EXPIRED:   "#606075",
  REFUNDED:  "#7c6ff7",
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
    refetchInterval: 30_000,
  });

  const { data: financials, isLoading: finLoading } = useQuery({
    queryKey: ["admin-financials"],
    queryFn: () => adminApi.financials(),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments-recent"],
    queryFn: () => adminApi.payments({ page: 1, limit: 10 }),
  });

  const loading = statsLoading || finLoading;

  // Build pie data from paymentsByStatus
  const pieData = stats?.paymentsByStatus
    ? Object.entries(stats.paymentsByStatus).map(([status, count]) => ({
        name: status,
        value: count as number,
      }))
    : [];

  const revenueByDay = financials?.revenueByDay ?? [];

  const avgSettlementRate =
    stats && stats.totalPayments > 0
      ? (((stats.paymentsByStatus?.SETTLED ?? 0) / stats.totalPayments) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Row 1 — 6 stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          label="Total Merchants"
          value={stats?.totalMerchants ?? 0}
          subLabel={`+${stats?.newMerchantsThisMonth ?? 0} this month`}
          icon={<Building2 className="w-4 h-4" />}
          loading={loading}
          accent="indigo"
        />
        <StatsCard
          label="Active Merchants"
          value={stats?.activeMerchants ?? 0}
          subLabel={`${stats?.inactiveMerchants ?? 0} inactive`}
          icon={<Building2 className="w-4 h-4" />}
          loading={loading}
          accent="green"
        />
        <StatsCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          subLabel={`+${stats?.newUsersThisMonth ?? 0} this month`}
          icon={<Users className="w-4 h-4" />}
          loading={loading}
        />
        <StatsCard
          label="Total Payments"
          value={stats?.totalPayments ?? 0}
          icon={<CreditCard className="w-4 h-4" />}
          loading={loading}
        />
        <StatsCard
          label="Settled"
          value={stats?.paymentsByStatus?.SETTLED ?? 0}
          icon={<CheckCircle className="w-4 h-4" />}
          loading={loading}
          accent="green"
        />
        <StatsCard
          label="Pending"
          value={stats?.paymentsByStatus?.PENDING ?? 0}
          icon={<Clock className="w-4 h-4" />}
          loading={loading}
          accent="amber"
        />
      </div>

      {/* Row 2 — 3 stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Total USDC Volume"
          value={formatUsdc(stats?.totalUsdcVolume)}
          icon={<DollarSign className="w-4 h-4" />}
          loading={loading}
          accent="blue"
        />
        <StatsCard
          label="Estimated Fee Revenue"
          value={`$${(stats?.estimatedFeeRevenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subLabel="1% platform fee on settled USDC"
          icon={<TrendingUp className="w-4 h-4" />}
          loading={loading}
          accent="indigo"
        />
        <StatsCard
          label="Settlement Rate"
          value={`${avgSettlementRate}%`}
          subLabel="% of payments settled"
          icon={<Percent className="w-4 h-4" />}
          loading={loading}
          accent="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue by day */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Revenue (Last 30 Days)</h3>
          {finLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : revenueByDay.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueByDay} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c6ff7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7c6ff7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3dd68c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3dd68c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#606075" }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: "#606075" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111118",
                    border: "1px solid #1e1e2a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="usdcVolume"
                  name="USDC Volume"
                  stroke="#7c6ff7"
                  fill="url(#volumeGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="estimatedFee"
                  name="Est. Fee"
                  stroke="#3dd68c"
                  fill="url(#feeGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment status donut */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Payments by Status</h3>
          {statsLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted text-sm">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? "#606075"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111118",
                    border: "1px solid #1e1e2a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(val) => <span style={{ color: "#a0a0b4" }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Recent Payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Merchant", "Amount USDC", "Fiat", "Currency", "Status", "Created"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paymentsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="skeleton h-3 rounded w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (paymentsData?.data ?? []).map(
                    (p: {
                      id: string;
                      merchant?: { name: string };
                      amountUsdc: string;
                      amountFiat: string;
                      fiatCurrency: string;
                      status: string;
                      createdAt: string;
                    }) => (
                      <tr key={p.id} className="border-b border-border hover:bg-surface/40">
                        <td className="px-3 py-3 text-muted font-mono text-xs">
                          {p.id.slice(0, 8)}…
                        </td>
                        <td className="px-3 py-3 text-secondary">{p.merchant?.name ?? "—"}</td>
                        <td className="px-3 py-3 text-primary font-medium tabular-nums">
                          {formatUsdc(p.amountUsdc)}
                        </td>
                        <td className="px-3 py-3 text-secondary tabular-nums">{p.amountFiat}</td>
                        <td className="px-3 py-3 text-secondary">{p.fiatCurrency}</td>
                        <td className="px-3 py-3">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                        <td className="px-3 py-3 text-muted text-xs">
                          {formatDate(p.createdAt)}
                        </td>
                      </tr>
                    )
                  )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
