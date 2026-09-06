export interface AvaRampConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface CreatePaymentInput {
  amountFiat?: string;
  amountUsdc?: string;
  fiatCurrency: "KES" | "NGN" | "GHS" | "TZS" | "UGX";
  phone?: string;
  reference?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface Payment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "SETTLED" | "REFUNDED" | "EXPIRED" | "FAILED";
  depositAddress: string;
  amountUsdc: string;
  fiatAmount?: string;
  fiatCurrency?: string;
  feeBps?: number | null;
  feeAmount?: string | null;
  phone?: string;
  reference?: string;
  isTest?: boolean;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "AvaRampApiError";
  }
}

async function request<T>(config: AvaRampConfig, method: string, path: string, body?: unknown, params?: Record<string, string | number | undefined>): Promise<T> {
  const base = config.baseUrl ?? "https://avarampbackend.onrender.com";
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(json.error ?? json.message ?? `Request failed with status ${res.status}`, res.status, json.code);
  }
  return (json.data ?? json) as T;
}

export class AvaRamp {
  constructor(private config: AvaRampConfig) {
    if (!config.apiKey) throw new Error("AvaRamp: apiKey is required");
  }

  payments = {
    create: (input: CreatePaymentInput): Promise<Payment> =>
      request<Payment>(this.config, "POST", "/payments", input),

    get: (id: string): Promise<Payment> =>
      request<Payment>(this.config, "GET", `/payments/${id}`),

    list: (params?: { status?: string; limit?: number; offset?: number }): Promise<{ payments: Payment[]; total: number }> =>
      request(this.config, "GET", "/payments", undefined, params),

    analytics: (): Promise<unknown> =>
      request(this.config, "GET", "/payments/analytics"),

    /**
     * Polls a payment until it reaches a terminal state (SETTLED, FAILED, EXPIRED,
     * or REFUNDED) and invokes `onUpdate` once with the final payment. For
     * production use, prefer webhooks (see /docs/webhooks) — this is a
     * convenience for scripts, demos, and quick integrations.
     */
    onSettled: (id: string, onUpdate: (payment: Payment) => void, opts: { intervalMs?: number; timeoutMs?: number } = {}): (() => void) => {
      const intervalMs = opts.intervalMs ?? 3000;
      const timeoutMs = opts.timeoutMs ?? 30 * 60 * 1000;
      const startedAt = Date.now();
      const terminal = new Set(["SETTLED", "FAILED", "EXPIRED", "REFUNDED"]);

      const timer = setInterval(async () => {
        if (Date.now() - startedAt > timeoutMs) {
          clearInterval(timer);
          return;
        }
        try {
          const payment = await request<Payment>(this.config, "GET", `/payments/${id}`);
          if (terminal.has(payment.status)) {
            clearInterval(timer);
            onUpdate(payment);
          }
        } catch {
          // transient errors are swallowed — polling continues until timeout
        }
      }, intervalMs);

      return () => clearInterval(timer);
    },
  };
}

export default AvaRamp;
