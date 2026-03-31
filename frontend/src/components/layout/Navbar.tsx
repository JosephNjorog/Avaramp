"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features",     href: "/#features" },
  { label: "Currencies",   href: "/#currencies" },
  { label: "Docs",         href: "/docs" },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/60 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-glow-sm group-hover:shadow-accent transition-all duration-300">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Ava<span className="text-gradient-purple">Ramp</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-subtle hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="shadow-glow-sm">
                    Get started →
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-subtle hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: menuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-border overflow-hidden md:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    className="block text-subtle hover:text-white text-base font-medium py-1 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                      <Button className="w-full">Get started →</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
