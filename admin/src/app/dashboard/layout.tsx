"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/auth";

const pageTitles: Record<string, string> = {
  "/dashboard":             "Overview",
  "/dashboard/merchants":   "Merchants",
  "/dashboard/payments":    "Payments",
  "/dashboard/users":       "Users",
  "/dashboard/financials":  "Financials",
  "/dashboard/analytics":   "Analytics",
  "/dashboard/settlements": "Settlements",
  "/dashboard/webhooks":    "Webhooks",
  "/dashboard/consent":     "Consent Records",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const token    = useAuthStore((s) => s.token);
  const user     = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  // Determine page title
  let title = "Dashboard";
  for (const [path, t] of Object.entries(pageTitles)) {
    if (pathname === path || (path !== "/dashboard" && pathname.startsWith(path))) {
      title = t;
    }
  }
  if (pathname.match(/\/dashboard\/merchants\/.+/)) title = "Merchant Detail";

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-primary">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-dim border border-indigo-border flex items-center justify-center">
              <span className="text-xs font-bold text-indigo">
                {user?.email?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <span className="text-xs text-muted hidden sm:block">{user?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
