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
import { DollarSign, TrendingUp, Percent, CreditCard } from "lucide-react";
import { adminApi } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import { formatUsdc } from "@/lib/utils";

const CURRENCY_COLORS: Record<string, string> = {
  KES: "#7c6ff7",
  NGN: "#3dd68c",
  GHS: "#60a5fa",
  TZS: "#f5a623",
  UGX: "#f56060",
};

export default function FinancialsPage() {
  const { data: fin, isLoading } = useQuery({
    queryKey: ["admin-financials"],
    queryFn: () => adminApi.financials(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(),
  });

  const revenueByDay = fin?.revenueByDay ?? [];
  const feeByMerchant = fin?.feeByMerchant ?? [];
  const topMerchants = fin?.topMerchants ?? [];
  const currencyBreakdown = fin?.currencyBreakdown ?? [];

  // Month-to-date fee (last 30 days from revenueByDay)
  const feeThisMonth = revenueByDay
    .slice(-30)
    .reduce((s: number, d: { estimatedFee: number }) => s + d.estimatedFee, 0);

  const totalPayments = stats?.totalPayments ?? 0;
  const settledPayments = stats?.paymentsByStatus?.SETTLED ?? 0;
  const avgFeePerTx =
    settledPayments > 0 ? (fin?.estimatedFeeRevenue ?? 0) / settledPayments : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total USDC Settled"
          value={formatUsdc(fin?.totalUsdcVolume)}
          icon={<DollarSign className="w-4 h-4" />}
          loading={isLoading}
          accent="blue"
        />
        <StatsCard
          label="Total Fee Revenue"
          value={`$${(fin?.estimatedFeeRevenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subLabel="Estimated at 1% of settled USDC"
          icon={<TrendingUp className="w-4 h-4" />}
          loading={isLoading}
          accent="indigo"
        />
        <StatsCard
          label="Fee Revenue (30d)"
          value={`$${feeThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Percent className="w-4 h-4" />}
          loading={isLoading}
          accent="green"
        />
        <StatsCard
          label="Avg Fee / Transaction"
          value={`$${avgFeePerTx.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
          subLabel={`${settledPayments} settled payments`}
          icon={<CreditCard className="w-4 h-4" />}
          loading={isLoading || statsLoading}
        />
      </div>

      {/* Revenue over time chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-1">Revenue Over Time (30 Days)</h3>
        <p className="text-xs text-muted mb-4">Daily USDC volume and estimated fee revenue</p>
        {isLoading ? (
          <div className="skeleton h-56 rounded-lg" />
        ) : revenueByDay.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-muted text-sm">
            No settled payments yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByDay} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c6ff7" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7c6ff7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feeGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3dd68c" stopOpacity={0.35} />
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
                fill="url(#volGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="estimatedFee"
                name="Est. Fee ($)"
                stroke="#3dd68c"
                fill="url(#feeGrad2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Currency breakdown pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Currency Breakdown (Fiat Volume)</h3>
          {isLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : currencyBreakdown.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={currencyBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
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

        {/* Top merchants by volume — horizontal bar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Top Merchants by Volume</h3>
          {isLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : topMerchants.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                layout="vertical"
                data={topMerchants.slice(0, 5)}
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#606075" }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="merchantName"
                  tick={{ fontSize: 10, fill: "#a0a0b4" }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111118",
                    border: "1px solid #1e1e2a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" name="USDC Volume" fill="#7c6ff7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fee by merchant table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-1">Fee Revenue by Merchant</h3>
        <p className="text-xs text-muted mb-4">
          Platform earns 1% (100 bps) of each settled USDC transaction. Merchants with custom fee
          overrides are shown with their specific BPS.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Merchant", "Payments", "USDC Volume", "Fee BPS", "Est. Fee Earned", "Currencies"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-3.5 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : feeByMerchant.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted">
                        No settled payments yet
                      </td>
                    </tr>
                  )
                : feeByMerchant.map(
                    (m: {
                      merchantId: string;
                      merchantName: string;
                      volume: number;
                      feeBps: number;
                      fee: number;
                      currencies: string[];
                    }) => (
                      <tr key={m.merchantId} className="border-b border-border hover:bg-surface/40">
                        <td className="px-4 py-3 text-primary font-medium">{m.merchantName}</td>
                        <td className="px-4 py-3 text-secondary tabular-nums">
                          {m.currencies.length}
                        </td>
                        <td className="px-4 py-3 text-secondary tabular-nums">
                          {formatUsdc(m.volume)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${m.feeBps !== 100 ? "text-amber" : "text-muted"}`}
                          >
                            {m.feeBps} bps{m.feeBps !== 100 ? " (custom)" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-green font-medium tabular-nums">
                          ${m.fee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-secondary text-xs">
                          {m.currencies.join(", ") || "—"}
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
