import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach merchant JWT on every request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("avaramp_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Separate axios instance for payer requests (uses payer JWT)
const payerApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

payerApi.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("avaramp_payer_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Surface backend error messages
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message =
      err.response?.data?.error || err.response?.data?.message || err.message;
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; phone?: string; businessName?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  me:             ()           => api.get("/users/me"),
  update:         (data: unknown) => api.patch("/users/me", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/users/me/password", { currentPassword, newPassword }),
  webhooks:    (params?: { limit?: number; offset?: number }) =>
    api.get("/users/me/webhooks", { params }),
};

// ── Merchants ─────────────────────────────────────────────────────────────────
export const merchantsApi = {
  create:        (data: unknown) => api.post("/merchants", data),
  get:           (id: string)    => api.get(`/merchants/${id}`),
  me:            ()              => api.get("/merchants/me"),
  updatePayout:  (data: {
    payoutType?: "phone" | "till" | "paybill";
    payoutAccount?: string;
    payoutAccountRef?: string;
    payoutCurrency?: string;
    mobileNetwork?: string;
  }) => api.patch("/merchants/payout", data),
};

// ── API Keys ──────────────────────────────────────────────────────────────────
export const apiKeysApi = {
  list:   ()               => api.get("/api-keys"),
  create: (name: string)   => api.post("/api-keys", { name }),
  revoke: (id: string)     => api.delete(`/api-keys/${id}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  create: (data: unknown, idempotencyKey?: string) =>
    api.post("/payments", data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    }),
  get:  (id: string)      => api.get(`/payments/${id}`),
  list: (params?: {
    status?:     string;
    merchantId?: string;
    limit?:      number;
    offset?:     number;
  }) => api.get("/payments", { params }),
  analytics: (params?: { merchantId?: string }) =>
    api.get("/payments/analytics", { params }),
};

// ── Consent ───────────────────────────────────────────────────────────────────
export const consentApi = {
  record: (types: string[]) => api.post("/consent", { types }),
};

// ── Settlements ───────────────────────────────────────────────────────────────
export const settlementsApi = {
  settle: (paymentId: string) => api.post("/settlements", { paymentId }),
  get:    (id: string)        => api.get(`/settlements/${id}`),
};

// ── Payer SIWE auth ───────────────────────────────────────────────────────────
export const payerAuthApi = {
  nonce:  (address: string) =>
    payerApi.get("/auth/payer/nonce", { params: { address } }),
  verify: (data: { address: string; message: string; signature: string }) =>
    payerApi.post("/auth/payer/verify", data),
  me:     () =>
    payerApi.get("/auth/payer/me"),
  update: (data: { phone?: string; email?: string }) =>
    payerApi.patch("/auth/payer/me", data),
};
