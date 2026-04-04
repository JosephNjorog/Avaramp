"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, Store,
  BarChart2, Webhook, Settings, LogOut, Zap,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Overview"  },
  { href: "/dashboard/payments",   icon: ArrowLeftRight,  label: "Payments"  },
  { href: "/dashboard/merchants",  icon: Store,           label: "Merchants" },
  { href: "/dashboard/analytics",  icon: BarChart2,       label: "Analytics" },
  { href: "/dashboard/webhooks",   icon: Webhook,         label: "Webhooks"  },
  { href: "/dashboard/settings",   icon: Settings,        label: "Settings"  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-bg h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-sm text-primary">AvaRamp</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                active
                  ? "bg-indigo-dim text-indigo-DEFAULT font-medium"
                  : "text-secondary hover:text-primary hover:bg-surface"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-indigo-dim border border-indigo-border flex items-center justify-center shrink-0">
            <span className="text-2xs font-semibold text-indigo-DEFAULT">
              {user?.email?.[0].toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary truncate">{user?.email}</p>
            <p className="text-2xs text-muted">{user?.kycStatus ?? "PENDING"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-secondary hover:text-red-DEFAULT hover:bg-red-dim transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
