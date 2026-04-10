import { format, parseISO, isValid } from "date-fns";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date | null | undefined, fmt = "MMM d, yyyy"): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "MMM d, yyyy HH:mm");
}

export function formatCurrency(amount: number | string | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";

  const currencySymbols: Record<string, string> = {
    KES: "KSh",
    NGN: "₦",
    GHS: "GH₵",
    TZS: "TSh",
    UGX: "USh",
    USD: "$",
    USDC: "USDC",
  };

  const symbol = currencySymbols[currency] ?? currency + " ";

  if (currency === "USDC") {
    return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
  }

  return `${symbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsdc(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

export function truncate(str: string | null | undefined, n: number): string {
  if (!str) return "—";
  if (str.length <= n) return str;
  return str.slice(0, n) + "…";
}

export function shortId(id: string | null | undefined): string {
  if (!id) return "—";
  return id.slice(0, 8) + "…";
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map((row) =>
    keys.map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  downloadCsv([header, ...rows].join("\n"), filename);
}
