import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export default function StatsCard({ label, value, sub, icon: Icon, trend }: StatsCardProps) {
  const positive = (trend?.value ?? 0) >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-secondary" strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-xl font-bold text-primary tracking-tight">{value}</div>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      {trend && (
        <div className={cn(
          "mt-2 inline-flex items-center gap-1 text-2xs font-medium",
          positive ? "text-green-DEFAULT" : "text-red-DEFAULT"
        )}>
          {positive ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}
