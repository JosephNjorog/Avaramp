"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  Users,
  BarChart3,
  TrendingUp,
  Webhook,
  ShieldCheck,
  LogOut,
  DollarSign,
  CheckSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Payments",    href: "/dashboard/payments",    icon: <CreditCard className="w-4 h-4" /> },
      { label: "Settlements", href: "/dashboard/settlements", icon: <CheckSquare className="w-4 h-4" /> },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Merchants", href: "/dashboard/merchants", icon: <Building2 className="w-4 h-4" /> },
      { label: "Users",     href: "/dashboard/users",     icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Financials", href: "/dashboard/financials", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Analytics",  href: "/dashboard/analytics",  icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Webhooks",        href: "/dashboard/webhooks", icon: <Webhook className="w-4 h-4" /> },
      { label: "Consent Records", href: "/dashboard/consent",  icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function handleLogout() {
    logout();
    toast.success("Logged out");
    router.push("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      {open !== undefined && (
        <div
          className={cn(
            "fixed inset-0 z-20 bg-black/60 lg:hidden transition-opacity",
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-60 z-30 flex flex-col bg-card border-r border-border",
          "transition-transform duration-200",
          open !== undefined
            ? open
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
            : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-dim border border-indigo-border flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-indigo" />
            </div>
            <div>
              <span className="text-sm font-bold text-primary">AvaRamp</span>
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-dim text-indigo text-2xs rounded font-semibold">
                ADMIN
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-muted hover:text-primary p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-2 mb-1.5 text-2xs font-semibold text-muted uppercase tracking-widest">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100",
                        isActive(item.href)
                          ? "bg-indigo-dim text-indigo font-medium"
                          : "text-secondary hover:bg-surface hover:text-primary"
                      )}
                    >
                      <span
                        className={cn(
                          isActive(item.href) ? "text-indigo" : "text-muted"
                        )}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: user info + logout */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-dim border border-indigo-border flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo">
                {user?.email?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary truncate">{user?.email}</p>
              <p className="text-2xs text-muted">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red hover:bg-red-dim transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
