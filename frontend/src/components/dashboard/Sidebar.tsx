"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CreditCard, Store, Settings,
  LogOut, Zap, BarChart3, Webhook,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",   href: "/dashboard" },
  { icon: CreditCard,      label: "Payments",   href: "/dashboard/payments" },
  { icon: Store,           label: "Merchants",  href: "/dashboard/merchants" },
  { icon: BarChart3,       label: "Analytics",  href: "/dashboard/analytics" },
  { icon: Webhook,         label: "Webhooks",   href: "/dashboard/webhooks" },
  { icon: Settings,        label: "Settings",   href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-surface border-r border-border min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-white font-semibold text-sm">
            Ava<span className="text-gradient-purple">Ramp</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-accent/15 text-accent border border-accent/20"
                    : "text-subtle hover:text-white hover:bg-card"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">{user?.email}</div>
            <div className="text-muted text-xs">{user?.kycStatus ?? "PENDING"}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-subtle hover:text-red-400 hover:bg-red-400/5 text-sm font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
