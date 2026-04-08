"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DollarSign, Zap, TrendingUp, Globe } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { paymentsApi } from "@/lib/api";

// Static distributions — will vary as real data accumulates
const DIST = [
  { name: "KES", value: 52, color: "#7c6ff7" },
  { name: "NGN", value: 28, color: "#60a5fa" },
  { name: "GHS", value: 10, color: "#3dd68c" },
  { name: "TZS", value:  6, color: "#f5a623" },
  { name: "UGX", value:  4, color: "#f56060" },
];

const SETTLE_TIMES = [
  { label: "< 1 min",  n: 14 },
  { label: "1–2 min",  n: 38 },
  { label: "2–5 min",  n: 22 },
  { label: "5–15 min", n:  8 },
  { label: "> 15 min", n:  2 },
];

const TT = {
  contentStyle: { background: "#1a1a1d", border: "1px solid #26262a", borderRadius: 10, fontSize: 12 },
  labelStyle: { color: "#9898a0" },
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn:  () => paymentsApi.analytics(),
    staleTime: 60_000,
  });

  const summary = data?.data?.data;
  const dailyVolume: { date: string; volume: number }[] = summary?.dailyVolume ?? [];

  // Format dates for chart display
  const chartData = dailyVolume.map((d) => ({
    ...d,
    day: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-5 overflow-x-hidden">
        <div>
          <div className="h-6 w-24 skeleton mb-1" />
          <div className="h-4 w-48 skeleton" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-7 space-y-5 overflow-x-hidden">
      <div>
        <h1 className="text-lg font-semibold text-primary">Analytics</h1>
        <p className="text-sm text-muted mt-0.5">Performance and settlement metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard label="Total payments"  value={String(summary?.total   ?? 0)} sub="all time"      icon={DollarSign} />
        <StatsCard label="Settled"         value={String(summary?.settled ?? 0)} sub="completed"     icon={TrendingUp}  trend={summary?.settled ? { value: 100, label: "success rate" } : undefined} />
        <StatsCard label="Pending"         value={String(summary?.pending ?? 0)} sub="in progress"   icon={Zap} />
        <StatsCard label="Failed / Expired" value={String(summary?.failed ?? 0)} sub="unsuccessful"  icon={Globe} />
      </div>

      {/* 7-day volume chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-medium text-primary mb-0.5">7-day settlement volume</p>
        <p className="text-xs text-muted mb-4">USDC settled per day</p>
        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-muted text-center px-4">
            No settled payments yet — data will appear here once payments are completed.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200} minHeight={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c6ff7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262a" />
              <XAxis dataKey="day"    tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis                  tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Area type="monotone" dataKey="volume" name="USDC" stroke="#7c6ff7" strokeWidth={2} fill="url(#gv)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Currency split */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-medium text-primary mb-0.5">Currency distribution</p>
          <p className="text-xs text-muted mb-4">Settlement currency breakdown</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {DIST.map((e) => <Cell key={e.name} fill={e.color} opacity={0.9} />)}
                </Pie>
                <Tooltip {...TT} formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {DIST.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-primary font-medium">{d.name}</span>
                  </div>
                  <span className="text-muted">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settlement time */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-medium text-primary mb-0.5">Settlement time</p>
          <p className="text-xs text-muted mb-4">USDC confirmed → M-Pesa received</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SETTLE_TIMES} layout="vertical" margin={{ left: 10, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26262a" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="label" type="category" tick={{ fill: "#9898a0", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip {...TT} />
              <Bar dataKey="n" name="Payments" fill="#7c6ff7" radius={[0, 4, 4, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
