import axios from "axios";

const http = axios.create({ baseURL: "/api" });

// Attach auth token from localStorage on every request
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("avaramp-admin-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore
    }
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    http.post("/auth/login", { email, password }).then((r) => r.data),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminApi = {
  // Stats
  stats: () =>
    http.get("/admin/stats").then((r) => r.data.data),

  // Merchants
  merchants: (params?: { page?: number; limit?: number; search?: string }) =>
    http.get("/admin/merchants", { params }).then((r) => r.data),
  merchant: (id: string) =>
    http.get(`/admin/merchants/${id}`).then((r) => r.data.data),
  updateMerchant: (id: string, data: { isActive?: boolean; feeOverrideBps?: number | null; webhookUrl?: string }) =>
    http.patch(`/admin/merchants/${id}`, data).then((r) => r.data.data),

  // Payments
  payments: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    merchantId?: string;
    currency?: string;
    search?: string;
  }) => http.get("/admin/payments", { params }).then((r) => r.data),
  payment: (id: string) =>
    http.get(`/admin/payments/${id}`).then((r) => r.data.data),

  // Users
  users: (params?: { page?: number; limit?: number; search?: string }) =>
    http.get("/admin/users", { params }).then((r) => r.data),
  updateKyc: (id: string, kycStatus: string) =>
    http.patch(`/admin/users/${id}/kyc`, { kycStatus }).then((r) => r.data.data),
  makeAdmin: (id: string) =>
    http.patch(`/admin/users/${id}/make-admin`, {}).then((r) => r.data.data),

  // Financials
  financials: () =>
    http.get("/admin/financials").then((r) => r.data.data),

  // Settlements
  settlements: () =>
    http.get("/admin/settlements").then((r) => r.data.data),

  // Webhooks
  webhooks: (params?: { page?: number; limit?: number }) =>
    http.get("/admin/webhooks", { params }).then((r) => r.data),
  retryWebhook: (id: string) =>
    http.post(`/admin/webhooks/${id}/retry`, {}).then((r) => r.data.data),

  // Consent
  consent: (params?: { page?: number; limit?: number; search?: string }) =>
    http.get("/admin/consent", { params }).then((r) => r.data),
  exportConsent: () =>
    http.get("/admin/consent/export", { responseType: "text" }).then((r) => r.data as string),
};
