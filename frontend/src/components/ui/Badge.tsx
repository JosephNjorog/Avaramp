import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  PENDING:   { label: "Pending",   class: "text-amber-DEFAULT bg-amber-dim border-amber-DEFAULT/20" },
  CONFIRMED: { label: "Confirmed", class: "text-blue-DEFAULT bg-blue-dim border-blue-DEFAULT/20" },
  SETTLED:   { label: "Settled",   class: "text-green-DEFAULT bg-green-dim border-green-DEFAULT/20" },
  EXPIRED:   { label: "Expired",   class: "text-secondary bg-surface border-border" },
  FAILED:    { label: "Failed",    class: "text-red-DEFAULT bg-red-dim border-red-DEFAULT/20" },
  REFUNDED:  { label: "Refunded",  class: "text-secondary bg-surface border-border" },
};

export default function Badge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_MAP[status] ?? { label: status, class: "text-secondary bg-surface border-border" };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-medium border",
      config.class,
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
