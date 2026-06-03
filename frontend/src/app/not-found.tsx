"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, BookOpen, LayoutDashboard, ArrowRight, Zap } from "lucide-react";

const LINKS = [
  { label: "Go home",        href: "/",          icon: Home },
  { label: "Dashboard",      href: "/dashboard",  icon: LayoutDashboard },
  { label: "Documentation",  href: "/docs",       icon: BookOpen },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 overflow-hidden relative">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-DEFAULT/5 blur-3xl" />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-indigo) 1px, transparent 1px), linear-gradient(90deg, var(--color-indigo) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-DEFAULT flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-primary tracking-tight">AvaRamp</span>
          </Link>
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative mb-6 select-none"
        >
          <span
            className="text-[clamp(100px,22vw,180px)] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, var(--color-indigo) 0%, var(--color-blue) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
          {/* Decorative hash — on-chain flavour */}
          <div className="absolute -top-2 right-0 text-2xs font-mono text-muted opacity-60 leading-none hidden sm:block">
            block: #<span className="text-indigo-DEFAULT">not_found</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3"
        >
          Transaction not found
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="text-secondary text-sm sm:text-base leading-relaxed mb-10 max-w-sm mx-auto"
        >
          This page doesn&apos;t exist on the ledger. The route may have been removed,
          renamed, or never deployed to this block.
        </motion.p>

        {/* Action links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          {LINKS.map(({ label, href, icon: Icon }, i) => (
            <Link
              key={href}
              href={href}
              className={
                i === 0
                  ? "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-DEFAULT text-white text-sm font-medium hover:opacity-90 transition-all"
                  : "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-secondary text-sm font-medium hover:text-primary hover:border-border/80 transition-all"
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {i === 0 && <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          ))}
        </motion.div>

        {/* Status strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="inline-flex items-center gap-2 text-xs text-muted"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT animate-pulse" />
          All AvaRamp systems operational
          <Link href="/status" className="text-indigo-DEFAULT hover:underline ml-1">
            Check status →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
