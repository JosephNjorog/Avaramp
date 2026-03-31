import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("avaramp_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Surface error messages
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
  register: (data: { email: string; password: string; phone?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get("/users/me"),
};

// ── Merchants ─────────────────────────────────────────────────────────────────
export const merchantsApi = {
  create: (data: unknown) => api.post("/merchants", data),
  get:    (id: string)     => api.get(`/merchants/${id}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  create: (data: unknown, idempotencyKey?: string) =>
    api.post("/payments", data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    }),
  get:    (id: string)  => api.get(`/payments/${id}`),
  list:   (params?: unknown) => api.get("/payments", { params }),
};

// ── Settlements ───────────────────────────────────────────────────────────────
export const settlementsApi = {
  settle: (paymentId: string) => api.post("/settlements", { paymentId }),
  get:    (id: string)        => api.get(`/settlements/${id}`),
};
