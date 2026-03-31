"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign, ArrowUpRight, Clock, CheckCircle,
  Zap, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";
import { paymentsApi } from "@/lib/api";
import { formatCurrency, formatDate, statusColor } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const mockChart = [
  { date: "Mar 23", volume: 1200 },
  { date: "Mar 24", volume: 1850 },
  { date: "Mar 25", volume: 980 },
  { date: "Mar 26", volume: 2400 },
  { date: "Mar 27", volume: 1760 },
  { date: "Mar 28", volume: 3100 },
  { date: "Mar 29", volume: 2780 },
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["payments", "recent"],
    queryFn: () => paymentsApi.list({ limit: 5 }),
    staleTime: 30_000,
  });

  const payments: any[] = data?.data?.data ?? [];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-subtle text-sm mt-1">Your payment activity at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Volume"
          value="$12,480"
          sub="USDC received"
          icon={DollarSign}
          trend={{ value: 18, label: "this week" }}
          accent
          delay={0}
        />
        <StatsCard
          label="Payments"
          value="84"
          sub="all time"
          icon={ArrowUpRight}
          trend={{ value: 7, label: "vs last week" }}
          delay={0.05}
        />
        <StatsCard
          label="Pending"
          value="3"
          sub="awaiting deposit"
          icon={Clock}
          delay={0.1}
        />
        <StatsCard
          label="Settled"
          value="79"
          sub="via M-Pesa"
          icon={CheckCircle}
          trend={{ value: 12, label: "vs last week" }}
          delay={0.15}
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Volume chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold text-sm">Payment Volume</h2>
              <p className="text-muted text-xs mt-0.5">Last 7 days (USD)</p>
            </div>
            <div className="flex items-center gap-1.5 text-accent text-xs font-medium bg-accent/10 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +18%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChart}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c5cff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#111118", border: "1px solid #1e1e2a", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#7c5cff" }}
              />
              <Area type="monotone" dataKey="volume" stroke="#7c5cff" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3"
        >
          <h2 className="text-white font-semibold text-sm mb-1">Quick Actions</h2>
          {[
            { icon: Zap, label: "New payment link", desc: "Generate a USDC payment", href: "/dashboard/payments" },
            { icon: ArrowUpRight, label: "View merchants", desc: "Manage your merchant accounts", href: "/dashboard/merchants" },
            { icon: CheckCircle, label: "Settlements", desc: "Track M-Pesa payouts", href: "/dashboard/payments" },
          ].map(({ icon: Icon, label, desc, href }) => (
            <a key={label} href={href}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface/70 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-medium group-hover:text-accent transition-colors">{label}</div>
                <div className="text-muted text-xs truncate">{desc}</div>
              </div>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Recent payments */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-white font-semibold text-sm">Recent Payments</h2>
          <a href="/dashboard/payments" className="text-accent text-xs hover:text-accent-light transition-colors">
            View all →
          </a>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted text-sm">Loading…</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-muted text-sm mb-1">No payments yet</div>
            <div className="text-xs text-muted/60">Create your first payment to get started</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {p.reference ?? p.id.slice(0, 8)}
                  </div>
                  <div className="text-muted text-xs">{formatDate(p.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-semibold">
                    {formatCurrency(p.amount, "USD")}
                  </div>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
