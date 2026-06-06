"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, Clock, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/wallet",          icon: Home,      label: "Home"    },
  { href: "/wallet/scan",     icon: ScanLine,  label: "Scan"    },
  { href: "/wallet/history",  icon: Clock,     label: "History" },
  { href: "/wallet/settings", icon: Settings2, label: "Settings"},
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          const isCenter = href === "/wallet/scan";

          if (isCenter) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center -mt-6"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                    active
                      ? "bg-indigo-DEFAULT shadow-indigo-DEFAULT/40 scale-105"
                      : "bg-indigo-DEFAULT hover:opacity-90"
                  )}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className={cn("text-[10px] mt-1.5 font-medium", active ? "text-indigo-DEFAULT" : "text-muted")}>
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[56px]",
                active ? "text-indigo-DEFAULT" : "text-muted hover:text-secondary"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-all", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
