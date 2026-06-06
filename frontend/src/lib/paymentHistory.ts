const STORAGE_KEY = "avaramp-pay-history";

export interface PaymentHistoryEntry {
  paymentId:    string;
  savedAt:      number;
  amountUsdc:   string;
  fiatAmount:   string;
  fiatCurrency: string;
  status:       string;
  reference?:   string;
}

export function savePaymentToHistory(payment: {
  id:           string;
  amountUsdc:   string;
  fiatAmount:   string;
  fiatCurrency: string;
  status:       string;
  reference?:   string;
}) {
  try {
    const existing: PaymentHistoryEntry[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    if (existing.find((e) => e.paymentId === payment.id)) return;
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
    ].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function loadPaymentHistory(): PaymentHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
