"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { formatUsdc } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  SETTLED:   "#3dd68c",
  CONFIRMED: "#60a5fa",
  PENDING:   "#f5a623",
  FAILED:    "#f56060",
  EXPIRED:   "#606075",
  REFUNDED:  "#7c6ff7",
};

const CURRENCY_COLORS: Record<string, string> = {
  KES: "#7c6ff7",
  NGN: "#3dd68c",
  GHS: "#60a5fa",
  TZS: "#f5a623",
  UGX: "#f56060",
};

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
  });

  const { data: fin, isLoading: finLoading } = useQuery({
    queryKey: ["admin-financials"],
    queryFn: () => adminApi.financials(),
  });

  const loading = statsLoading || finLoading;

  const revenueByDay = fin?.revenueByDay ?? [];
  const last7Days = revenueByDay.slice(-7);
  const currencyBreakdown = fin?.currencyBreakdown ?? [];

  const totalPayments = stats?.totalPayments ?? 0;
  const settledCount  = stats?.paymentsByStatus?.SETTLED ?? 0;
  const failedCount   = stats?.paymentsByStatus?.FAILED ?? 0;
  const pendingCount  = stats?.paymentsByStatus?.PENDING ?? 0;
  const confirmedCount = stats?.paymentsByStatus?.CONFIRMED ?? 0;

  const successRate = totalPayments > 0 ? ((settledCount / totalPayments) * 100).toFixed(1) : "0.0";
  const failureRate = totalPayments > 0 ? ((failedCount  / totalPayments) * 100).toFixed(1) : "0.0";

  const avgTxSize =
    settledCount > 0 ? (fin?.totalUsdcVolume ?? 0) / settledCount : 0;

  // Funnel data
  const funnelData = [
    { stage: "Created",   count: totalPayments },
    { stage: "Detected",  count: (confirmedCount + settledCount) },
    { stage: "Settled",   count: settledCount },
  ];

  // Pie data from status map
  const pieData = stats?.paymentsByStatus
    ? Object.entries(stats.paymentsByStatus).map(([status, count]) => ({
        name: status,
        value: count as number,
      }))
    : [];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Success Rate"
          value={`${successRate}%`}
          subLabel="Payments settled"
          loading={loading}
          accent="green"
        />
        <StatsCard
          label="Failure Rate"
          value={`${failureRate}%`}
          subLabel="Payments failed"
          loading={loading}
          accent="red"
        />
        <StatsCard
          label="Avg Transaction Size"
          value={formatUsdc(avgTxSize)}
          subLabel="Per settled payment"
          loading={loading}
          accent="blue"
        />
        <StatsCard
          label="Total Volume (30d)"
          value={formatUsdc(
            last7Days.reduce(
              (s: number, d: { usdcVolume: number }) => s + d.usdcVolume,
              0
            ) * (30 / 7)
          )}
          subLabel="Estimated from 7d avg"
          loading={loading}
        />
      </div>

      {/* 7-day and 30-day charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">7-Day Volume</h3>
          {loading ? (
            <div className="skeleton h-44" />
          ) : last7Days.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={last7Days} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="vol7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="usdcVolume"
                  name="USDC Volume"
                  stroke="#60a5fa"
                  fill="url(#vol7)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">30-Day Volume</h3>
          {loading ? (
            <div className="skeleton h-44" />
          ) : revenueByDay.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueByDay} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="vol30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c6ff7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7c6ff7" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="usdcVolume"
                  name="USDC Volume"
                  stroke="#7c6ff7"
                  fill="url(#vol30)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Funnel + Currency distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment funnel */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Payment Status Funnel</h3>
          {loading ? (
            <div className="skeleton h-44" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={funnelData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#a0a0b4" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#606075" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#111118",
                      border: "1px solid #1e1e2a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#7c6ff7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {funnelData.map((f, i) => {
                  const pct =
                    i === 0
                      ? 100
                      : funnelData[0].count > 0
                      ? ((f.count / funnelData[0].count) * 100).toFixed(1)
                      : 0;
                  return (
                    <div key={f.stage} className="flex items-center justify-between text-xs">
                      <span className="text-secondary">{f.stage}</span>
                      <span className="text-muted tabular-nums">
                        {f.count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Currency distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Currency Distribution</h3>
          {loading ? (
            <div className="skeleton h-44" />
          ) : currencyBreakdown.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={currencyBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="volume"
                  nameKey="currency"
                >
                  {currencyBreakdown.map(
                    (entry: { currency: string }, i: number) => (
                      <Cell
                        key={i}
                        fill={CURRENCY_COLORS[entry.currency] ?? "#606075"}
                      />
                    )
                  )}
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

      {/* Payment status breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-4">Payment Status Breakdown</h3>
        {statsLoading ? (
          <div className="skeleton h-44" />
        ) : pieData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-muted text-sm">No payments yet</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="bg-surface border border-border rounded-xl p-4 text-center"
              >
                <div
                  className="w-2 h-2 rounded-full mx-auto mb-2"
                  style={{ background: STATUS_COLORS[item.name] ?? "#606075" }}
                />
                <p className="text-lg font-bold text-primary tabular-nums">{item.value}</p>
                <p className="text-xs text-muted">{item.name}</p>
                <p className="text-xs text-secondary mt-0.5">
                  {totalPayments > 0 ? ((item.value / totalPayments) * 100).toFixed(1) : 0}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
