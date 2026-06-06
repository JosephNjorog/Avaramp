"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ScanLine, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { paymentsApi } from "@/lib/api";

interface HistoryEntry {
  paymentId:   string;
  savedAt:     number;
  amountUsdc:  string;
  fiatAmount:  string;
  fiatCurrency: string;
  status:      string;
  reference?:  string;
}

const STORAGE_KEY = "avaramp-pay-history";

export function savePaymentToHistory(payment: {
  id: string;
  amountUsdc: string;
  fiatAmount: string;
  fiatCurrency: string;
  status: string;
  reference?: string;
}) {
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const already = existing.find((e) => e.paymentId === payment.id);
    if (already) return;
    const updated = [
      {
        paymentId:    payment.id,
        savedAt:      Date.now(),
        amountUsdc:   payment.amountUsdc,
        fiatAmount:   payment.fiatAmount,
        fiatCurrency: payment.fiatCurrency,
        status:       payment.status,
        reference:    payment.reference,
      },
      ...existing,
    ].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

function StatusIcon({ status }: { status: string }) {
  if (status === "SETTLED")   return <CheckCircle2 className="w-4 h-4 text-green-DEFAULT" />;
  if (status === "FAILED")    return <XCircle className="w-4 h-4 text-red-DEFAULT" />;
  if (status === "REFUNDED")  return <XCircle className="w-4 h-4 text-secondary" />;
  return <Loader2 className="w-4 h-4 text-amber-DEFAULT animate-spin" />;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      setEntries(stored);
    } catch {
      setEntries([]);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-DEFAULT" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-dim flex items-center justify-center">
          <Clock className="w-4.5 h-4.5 text-indigo-DEFAULT" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary">Payment History</h1>
          <p className="text-xs text-muted">{entries.length} payment{entries.length !== 1 ? "s" : ""} recorded</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-primary mb-1">No payments yet</p>
          <p className="text-xs text-muted mb-6 max-w-xs">
            Payments you make will show up here after you scan a merchant&apos;s QR code.
          </p>
          <Link
            href="/wallet/scan"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-semibold"
            style={{ background: "var(--color-indigo)" }}
          >
            <ScanLine className="w-4 h-4" />
            Scan to pay
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.paymentId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/pay/${entry.paymentId}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-indigo-DEFAULT/30 transition-all active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                  <StatusIcon status={entry.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {entry.reference || entry.paymentId.slice(0, 12) + "…"}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(entry.savedAt).toLocaleDateString("en", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{entry.fiatAmount} {entry.fiatCurrency}</p>
                  <p className="text-xs text-muted">{parseFloat(entry.amountUsdc).toFixed(4)} USDC</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
