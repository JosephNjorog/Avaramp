"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

function PaymentFlowMockup() {
  return (
    <div className="relative select-none">
      {/* Center phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.3 }}
        className="w-[260px] mx-auto bg-card border border-border rounded-[32px] p-2.5 shadow-xl"
      >
        {/* Pill notch */}
        <div className="w-16 h-1 bg-border rounded-full mx-auto mb-2" />

        <div className="rounded-[24px] overflow-hidden" style={{ background: "var(--color-bg)" }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-[10px] text-muted font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-sm bg-border" />
              <div className="w-1 h-1 rounded-full bg-green-DEFAULT" />
            </div>
          </div>

          {/* App header */}
          <div className="px-4 pt-1 pb-3 border-b border-border flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--color-indigo)" }}>
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-primary">AvaRamp Pay</span>
          </div>

          {/* M-Pesa notification */}
          <div className="mx-3 mt-3 bg-green-dim border border-green-DEFAULT/25 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-green-DEFAULT/20 flex items-center justify-center text-[10px]">
                💵
              </div>
              <span className="text-[10px] font-bold text-green-DEFAULT tracking-widest uppercase">
                M-Pesa
              </span>
            </div>
            <p className="text-sm font-bold text-primary">+KES 5,000.00</p>
            <p className="text-[10px] text-muted mt-0.5">Payment received via AvaRamp</p>
          </div>

          {/* Settlement progress */}
          <div className="mx-3 mt-2.5 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted">Settlement complete</span>
              <span className="text-[9px] text-green-DEFAULT font-semibold">✓ 2:31</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-DEFAULT rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Balance */}
          <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl bg-card border border-border">
            <p className="text-[10px] text-muted mb-0.5">Total received today</p>
            <p className="text-base font-bold text-primary">KES 47,250.00</p>
          </div>
        </div>
      </motion.div>

      {/* Floating QR card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5 }}
        className="absolute -top-3 -right-2 sm:right-4 bg-card border border-border rounded-2xl p-3 shadow-menu"
      >
        {/* Mini QR pattern */}
        <div className="w-14 h-14 bg-white rounded-lg p-1.5 grid grid-cols-5 gap-0.5 mb-1.5">
          {[1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1].map((v, i) => (
            <div key={i} className={`rounded-[1px] ${v ? "bg-zinc-900" : "bg-white"}`} />
          ))}
        </div>
        <p className="text-[9px] text-muted text-center font-medium">Scan to pay</p>
      </motion.div>

      {/* Floating USDC badge */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, delay: 0.6 }}
        className="absolute -bottom-2 -left-2 sm:left-4 rounded-2xl px-3.5 py-2.5 shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #3730a3 100%)" }}
      >
        <p className="text-[10px] text-indigo-200 mb-0.5">Customer sends</p>
        <p className="text-sm font-bold text-white">38.73 USDC</p>
      </motion.div>

      {/* Avalanche badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.7 }}
        className="absolute bottom-12 -right-6 sm:-right-2 bg-card border border-border rounded-xl px-3 py-2 shadow-menu"
      >
        <div className="text-[10px] font-semibold text-primary">Avalanche C-Chain</div>
        <div className="text-[9px] text-muted">~2s finality</div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative pt-20 sm:pt-28 pb-16 sm:pb-20 overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, var(--color-indigo) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#7c6ff7 1px, transparent 1px), linear-gradient(90deg, #7c6ff7 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT animate-pulse" />
              <span className="text-xs text-indigo-DEFAULT font-medium">Live on Avalanche C-Chain</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-[1.1] tracking-tight text-balance mb-5"
            >
              Accept crypto.{" "}
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(135deg, var(--color-indigo) 0%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Receive M-Pesa.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-lg text-secondary leading-relaxed mb-8 max-w-lg"
            >
              Your customer pays with crypto. You receive local currency to your M-Pesa
              in minutes — automatically, with zero blockchain knowledge required.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" iconRight={<ArrowRight className="w-4 h-4" />} className="w-full sm:w-auto">
                  Start accepting payments
                </Button>
              </Link>
              <Link href="/docs" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Developer API docs
                </Button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
            >
              {[
                "No crypto knowledge needed",
                "Under 3 min settlement",
                "M-Pesa · MTN · Airtel Money",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-DEFAULT shrink-0" />
                  <span className="text-sm text-secondary">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — payment flow visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center py-10"
          >
            <PaymentFlowMockup />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-16 lg:mt-20 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { value: "< 3 min", label: "End-to-end settlement" },
            { value: "5",       label: "African currencies"    },
            { value: "0%",      label: "Setup cost"            },
            { value: "100%",    label: "Automated"             },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-primary tracking-tight">{value}</div>
              <div className="text-sm text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
