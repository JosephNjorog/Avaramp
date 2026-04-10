import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: { value: number; label?: string };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  accent?: "indigo" | "green" | "amber" | "red" | "blue";
}

const accentClass = {
  indigo: "text-indigo bg-indigo-dim border-indigo-border",
  green:  "text-green  bg-green-dim  border-green/20",
  amber:  "text-amber  bg-amber-dim  border-amber/20",
  red:    "text-red    bg-red-dim    border-red/20",
  blue:   "text-blue   bg-blue-dim   border-blue/20",
};

export default function StatsCard({
  label,
  value,
  subLabel,
  trend,
  icon,
  className,
  loading,
  accent,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-card border border-border rounded-xl p-5", className)}>
        <div className="skeleton h-3 w-24 mb-4" />
        <div className="skeleton h-7 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-secondary uppercase tracking-wider">{label}</span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              accent ? accentClass[accent] : "text-muted bg-surface border-border"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-primary tabular-nums">{value}</p>
        {subLabel && (
          <p className="text-xs text-muted mt-0.5">{subLabel}</p>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trend.value >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-green" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-green" : "text-red"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-xs text-muted">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
