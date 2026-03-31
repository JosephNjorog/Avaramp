"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Zap, Globe } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

const volumeData = [
  { month: "Oct", volume: 4200, settlements: 3800 },
  { month: "Nov", volume: 6800, settlements: 6100 },
  { month: "Dec", volume: 5400, settlements: 5000 },
  { month: "Jan", volume: 9200, settlements: 8700 },
  { month: "Feb", volume: 11400, settlements: 10800 },
  { month: "Mar", volume: 12480, settlements: 11900 },
];

const fxData = [
  { time: "09:00", KES: 130.2, NGN: 1580 },
  { time: "11:00", KES: 130.5, NGN: 1582 },
  { time: "13:00", KES: 131.0, NGN: 1585 },
  { time: "15:00", KES: 130.8, NGN: 1583 },
  { time: "17:00", KES: 131.2, NGN: 1587 },
  { time: "19:00", KES: 131.5, NGN: 1590 },
];

const currencyDist = [
  { name: "KES", value: 52, color: "#7c5cff" },
  { name: "NGN", value: 28, color: "#3ecfcf" },
  { name: "GHS", value: 10, color: "#f59e0b" },
  { name: "TZS", value: 6,  color: "#ec4899" },
  { name: "UGX", value: 4,  color: "#10b981" },
];

const settlementTimes = [
  { range: "< 1 min", count: 14 },
  { range: "1-2 min", count: 38 },
  { range: "2-5 min", count: 22 },
  { range: "5-15 min", count: 8 },
  { range: "> 15 min", count: 2 },
];

const tooltipStyle = {
  contentStyle: { background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "#e2e8f0" },
};

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-subtle text-sm mt-1">Payment performance and settlement metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Volume" value="$49.5k" sub="last 6 months" icon={DollarSign} trend={{ value: 23, label: "MoM" }} accent delay={0} />
        <StatsCard label="Avg Settlement" value="1.8 min" sub="median time" icon={Zap} trend={{ value: 12, label: "faster" }} delay={0.05} />
        <StatsCard label="Success Rate" value="97.6%" sub="of payments" icon={TrendingUp} trend={{ value: 2.1, label: "vs last month" }} delay={0.1} />
        <StatsCard label="Currencies" value="5" sub="KES, NGN, GHS…" icon={Globe} delay={0.15} />
      </div>

      {/* Volume trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="mb-5">
          <h2 className="text-white font-semibold text-sm">Payment Volume vs Settlements</h2>
          <p className="text-muted text-xs mt-0.5">Monthly USDC received and M-Pesa settled (USD)</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={volumeData}>
            <defs>
              <linearGradient id="gVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c5cff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c5cff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3ecfcf" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3ecfcf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
            <Area type="monotone" dataKey="volume" name="Volume" stroke="#7c5cff" strokeWidth={2} fill="url(#gVol)" />
            <Area type="monotone" dataKey="settlements" name="Settled" stroke="#3ecfcf" strokeWidth={2} fill="url(#gSet)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FX rates */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
        >
          <div className="mb-5">
            <h2 className="text-white font-semibold text-sm">Live FX Rates (USD base)</h2>
            <p className="text-muted text-xs mt-0.5">Today's KES and NGN rates via Frankfurter API</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
              <Bar yAxisId="left" dataKey="KES" name="KES/USD" fill="#7c5cff" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Currency distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="mb-4">
            <h2 className="text-white font-semibold text-sm">Currency Split</h2>
            <p className="text-muted text-xs mt-0.5">Settlement currency distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={currencyDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {currencyDist.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {currencyDist.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-white">{c.name}</span>
                </div>
                <span className="text-muted">{c.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Settlement times */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="mb-5">
          <h2 className="text-white font-semibold text-sm">Settlement Time Distribution</h2>
          <p className="text-muted text-xs mt-0.5">Time from USDC confirmation to M-Pesa disbursement</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={settlementTimes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="range" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" name="Payments" fill="#3ecfcf" radius={[0, 4, 4, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
