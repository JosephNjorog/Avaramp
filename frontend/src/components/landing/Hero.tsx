"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import Button from "@/components/ui/Button";

const stats = [
  { value: "5",      label: "Fiat currencies" },
  { value: "< 2min", label: "Avg settlement" },
  { value: "100%",   label: "USDC-native" },
  { value: "43114",  label: "Avalanche C-Chain" },
];

const floatingCards = [
  {
    icon: <Zap className="w-4 h-4 text-accent" />,
    title: "Payment confirmed",
    sub: "USDC received · Avalanche",
    amount: "+$124.50",
    color: "text-green-400",
    delay: 0,
  },
  {
    icon: <Globe className="w-4 h-4 text-accent-2" />,
    title: "Settled via M-Pesa",
    sub: "KES · Merchant payout",
    amount: "KES 16,240",
    color: "text-accent-2",
    delay: 0.2,
  },
  {
    icon: <Shield className="w-4 h-4 text-purple-400" />,
    title: "Ledger verified",
    sub: "Double-entry · Balanced",
    amount: "✓ Audit",
    color: "text-purple-400",
    delay: 0.4,
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Live on Avalanche C-Chain
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              Receive{" "}
              <span className="text-gradient">crypto.</span>
              <br />
              Settle as{" "}
              <span className="text-gradient-teal">fiat.</span>
              <br />
              <span className="text-white/60">Instantly.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-subtle text-lg leading-relaxed mb-8 max-w-lg"
            >
              AvaRamp lets merchants accept USDC payments on Avalanche and receive
              local fiat — KES, NGN, GHS, TZS, UGX — directly via M-Pesa. No banks.
              No friction. No custody risk.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mb-12"
            >
              <Link href="/auth/register">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} className="shadow-accent">
                  Start accepting payments
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg">
                  See how it works
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center sm:text-left">
                  <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
                  <div className="text-subtle text-xs">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — floating UI cards */}
          <div className="hidden lg:flex flex-col gap-4 relative">
            <div className="absolute -inset-20 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + card.delay }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card backdrop-blur-sm animate-float"
                style={{ animationDelay: `${i * 1.5}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">{card.title}</div>
                  <div className="text-subtle text-xs">{card.sub}</div>
                </div>
                <div className={`text-sm font-bold ${card.color} whitespace-nowrap`}>
                  {card.amount}
                </div>
              </motion.div>
            ))}

            {/* Live transaction viz */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="bg-card border border-border rounded-2xl p-5 mt-2 shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm font-semibold">Payment flow</span>
                <span className="text-xs text-accent-2 font-medium flex items-center gap-1.5">
                  <span className="glow-dot" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-3">
                {["USDC", "→", "Avalanche", "→", "Glacier", "→", "M-Pesa", "→", "KES"].map((s, i) => (
                  <span
                    key={i}
                    className={i % 2 === 0
                      ? "px-2.5 py-1 bg-surface rounded-lg text-white text-xs font-mono"
                      : "text-muted text-xs"
                    }
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-accent-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                  />
                </div>
                <span className="text-accent-2 text-xs font-medium">~90s</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
