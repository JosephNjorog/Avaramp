"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DollarSign, Zap, TrendingUp, Globe } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

const VOLUME = [
  { m: "Nov", vol: 6800, settled: 6100 },
  { m: "Dec", vol: 5400, settled: 5000 },
  { m: "Jan", vol: 9200, settled: 8700 },
  { m: "Feb", vol: 11400, settled: 10800 },
  { m: "Mar", vol: 12480, settled: 11900 },
  { m: "Apr", vol: 2480,  settled: 2200  },
];

const DIST = [
  { name: "KES", value: 52, color: "#7c6ff7" },
  { name: "NGN", value: 28, color: "#60a5fa" },
  { name: "GHS", value: 10, color: "#3dd68c" },
  { name: "TZS", value: 6,  color: "#f5a623" },
  { name: "UGX", value: 4,  color: "#f56060" },
];

const SETTLE_TIMES = [
  { label: "< 1 min",  n: 14 },
  { label: "1–2 min",  n: 38 },
  { label: "2–5 min",  n: 22 },
  { label: "5–15 min", n: 8  },
  { label: "> 15 min", n: 2  },
];

const TT = {
  contentStyle: { background: "#1a1a1d", border: "1px solid #26262a", borderRadius: 10, fontSize: 12 },
  labelStyle: { color: "#9898a0" },
};

export default function AnalyticsPage() {
  return (
    <div className="p-5 md:p-7 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-primary">Analytics</h1>
        <p className="text-sm text-muted mt-0.5">Performance and settlement metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard label="Total volume"   value="$49.5k" sub="6 months"     icon={DollarSign}  trend={{ value: 23, label: "MoM" }} />
        <StatsCard label="Avg settlement" value="1.8 min" sub="median time" icon={Zap}         trend={{ value: 12, label: "faster" }} />
        <StatsCard label="Success rate"   value="97.6%"  sub="of payments"  icon={TrendingUp}  trend={{ value: 2, label: "vs last mo." }} />
        <StatsCard label="Currencies"     value="5"      sub="active"       icon={Globe} />
      </div>

      {/* Volume trend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-medium text-primary mb-0.5">Volume vs settled</p>
        <p className="text-xs text-muted mb-4">Monthly USD equivalent</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={VOLUME} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c6ff7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3dd68c" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3dd68c" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262a" />
            <XAxis dataKey="m"   tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis              tick={{ fill: "#5c5c66", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Area type="monotone" dataKey="vol"     name="Volume"  stroke="#7c6ff7" strokeWidth={1.5} fill="url(#gv)" dot={false} />
            <Area type="monotone" dataKey="settled" name="Settled" stroke="#3dd68c" strokeWidth={1.5} fill="url(#gs)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Currency split */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-medium text-primary mb-0.5">Currency distribution</p>
          <p className="text-xs text-muted mb-4">By settlement volume</p>
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
