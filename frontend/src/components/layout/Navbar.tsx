"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features",    label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing",     label: "Pricing" },
  { href: "/docs",        label: "Docs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-40 transition-all duration-300",
      scrolled
        ? "bg-bg/80 backdrop-blur-xl border-b border-border"
        : "bg-transparent"
    )}>
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm text-primary tracking-tight">AvaRamp</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-surface transition-all duration-150"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {token ? (
            <Link href="/dashboard">
              <Button size="sm" variant="secondary">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <Button size="sm" variant="ghost">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-surface transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-bg/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 text-sm text-secondary hover:text-primary rounded-lg hover:bg-surface transition-all"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border flex flex-col gap-2">
                {token ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full" size="sm" variant="secondary">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      <Button className="w-full" size="sm" variant="secondary">Sign in</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)}>
                      <Button className="w-full" size="sm">Get started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
