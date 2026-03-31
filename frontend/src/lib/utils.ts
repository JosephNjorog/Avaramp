import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function truncateAddress(address: string, chars = 6) {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    CONFIRMED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    SETTLED:   "text-green-400 bg-green-400/10 border-green-400/20",
    EXPIRED:   "text-gray-400 bg-gray-400/10 border-gray-400/20",
    FAILED:    "text-red-400 bg-red-400/10 border-red-400/20",
    REFUNDED:  "text-orange-400 bg-orange-400/10 border-orange-400/20",
  };
  return map[status] ?? "text-gray-400 bg-gray-400/10";
}
