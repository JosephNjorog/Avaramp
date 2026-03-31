import { cn, statusColor } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusColor(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
