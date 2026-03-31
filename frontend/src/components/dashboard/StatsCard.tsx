"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: boolean;
  delay?: number;
}

export default function StatsCard({
  label, value, sub, icon: Icon, trend, accent, delay = 0,
}: StatsCardProps) {
  const positive = (trend?.value ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "bg-card border border-border rounded-2xl p-5 relative overflow-hidden",
        accent && "border-accent/20"
      )}
    >
      {accent && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-4">
        <p className="text-subtle text-xs font-medium uppercase tracking-wide">{label}</p>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          accent ? "bg-accent/20 text-accent" : "bg-surface text-subtle"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {sub && <p className="text-muted text-xs">{sub}</p>}
      {trend && (
        <div className={cn(
          "mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
          positive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
        )}>
          {positive ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </motion.div>
  );
}
