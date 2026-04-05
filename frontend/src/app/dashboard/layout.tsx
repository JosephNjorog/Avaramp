"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import { useAuthStore } from "@/store/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router           = useRouter();
  const token            = useAuthStore((s) => s.token);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/auth/login");
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-12 bg-bg border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm text-primary">AvaRamp</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-muted hover:text-primary p-1 rounded-lg hover:bg-surface transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              <MobileSidebar onClose={() => setDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 overflow-auto pt-12 md:pt-0">
        {children}
      </main>
    </div>
  );
}
