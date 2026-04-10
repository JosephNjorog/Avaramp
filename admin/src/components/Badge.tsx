import { cn } from "@/lib/utils";

type Variant = "green" | "red" | "amber" | "blue" | "indigo" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClass: Record<Variant, string> = {
  green:  "badge-green",
  red:    "badge-red",
  amber:  "badge-amber",
  blue:   "badge-blue",
  indigo: "badge-indigo",
  muted:  "badge-muted",
};

export function Badge({ children, variant = "muted", className }: BadgeProps) {
  return (
    <span className={cn("badge", variantClass[variant], className)}>
      {children}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    SETTLED:   "green",
    CONFIRMED: "blue",
    PENDING:   "amber",
    REFUNDED:  "indigo",
    EXPIRED:   "muted",
    FAILED:    "red",
  };
  return <Badge variant={map[status] ?? "muted"}>{status}</Badge>;
}

export function KycBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    VERIFIED: "green",
    PENDING:  "amber",
    REJECTED: "red",
  };
  return <Badge variant={map[status] ?? "muted"}>{status}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant={role === "ADMIN" ? "indigo" : "muted"}>
      {role}
    </Badge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</Badge>;
}

export function WebhookStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    SUCCESS: "green",
    FAILED:  "red",
    RETRY:   "amber",
    PENDING: "muted",
  };
  return <Badge variant={map[status] ?? "muted"}>{status}</Badge>;
}
