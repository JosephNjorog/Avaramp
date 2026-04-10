"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  setAuth: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "avaramp-admin-auth",
    }
  )
);
