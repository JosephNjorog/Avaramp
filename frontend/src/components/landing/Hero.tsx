"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, ScanLine, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";
import { AnimatedGroup } from "@/components/ui/AnimatedGroup";
import { GradientHero } from "@/components/ui/GradientHero";
import { Iphone15Pro } from "@/components/ui/Iphone15Pro";

function PaymentFlowScreen() {
  return (
    <div className="w-full h-full" style={{ background: "var(--color-bg)" }}>
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mx-3 mt-3 bg-green-dim border border-green-DEFAULT/25 rounded-2xl p-3"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-green-DEFAULT/20 flex items-center justify-center text-[10px]">💵</div>
          <span className="text-[10px] font-bold text-green-DEFAULT tracking-widest uppercase">M-Pesa</span>
        </div>
        <p className="text-sm font-bold text-primary">+KES 5,000.00</p>
        <p className="text-[10px] text-muted mt-0.5">Payment received via AvaRamp</p>
      </motion.div>

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
            transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Balance */}
      <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl bg-card border border-border">
        <p className="text-[10px] text-muted mb-0.5">Total received today</p>
        <p className="text-base font-bold text-primary">KES 47,250.00</p>
      </div>

      {/* Floating QR card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.3 }}
        className="mx-3 flex items-center gap-2.5 bg-card border border-border rounded-xl p-2.5"
      >
        <div className="w-10 h-10 bg-white rounded-md p-1 grid grid-cols-5 gap-0.5 shrink-0">
          {[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1].map((v, i) => (
            <div key={i} className={`rounded-[1px] ${v ? "bg-zinc-900" : "bg-white"}`} />
          ))}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-primary">Scan to pay</p>
          <p className="text-[9px] text-muted">38.73 USDC · Avalanche</p>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardPanel() {
  const rows = [
    { ref: "Order #1284", amount: "KES 12,000.00", status: "Settled" },
    { ref: "Order #1283", amount: "NGN 50,000.00", status: "Settled" },
    { ref: "Order #1282", amount: "KES 3,500.00", status: "Confirmed" },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-surface">
        <span className="w-2 h-2 rounded-full bg-red-DEFAULT/60" />
        <span className="w-2 h-2 rounded-full bg-amber-DEFAULT/60" />
        <span className="w-2 h-2 rounded-full bg-green-DEFAULT/60" />
        <span className="ml-3 text-[10px] text-muted">dashboard.avaramp.io</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Volume (7d)", value: "1,842 USDC", icon: TrendingUp },
            { label: "Payments", value: "312" },
            { label: "Fee earned", value: "55.3 USDC" },
          ].map((s) => (
            <div key={s.label} className="bg-surface border border-border rounded-lg p-2.5">
              <p className="text-[9px] text-muted mb-1">{s.label}</p>
              <p className="text-xs sm:text-sm font-bold text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.ref} className="flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2">
              <span className="text-[10px] text-secondary">{r.ref}</span>
              <span className="text-[10px] font-medium text-primary">{r.amount}</span>
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                  r.status === "Settled" ? "bg-green-dim text-green-DEFAULT" : "bg-amber-dim text-amber-DEFAULT"
                }`}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <GradientHero strong className="pt-20 sm:pt-28 pb-16 sm:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <AnimatedGroup
          preset="blur-slide"
          className="flex flex-col items-center"
          variants={{
            container: { visible: { transition: { staggerChildren: 0.12 } } },
            item: {
              hidden: { opacity: 0, filter: "blur(8px)", y: 16 },
              visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { type: "spring", bounce: 0.2, duration: 0.9 } },
            },
          }}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT animate-pulse" />
            <span className="text-xs text-indigo-DEFAULT font-medium">Live on Avalanche C-Chain</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-[1.1] tracking-tight text-balance mb-5">
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
          </h1>

          <p className="text-lg text-secondary leading-relaxed mb-8 max-w-lg mx-auto">
            Your customer pays with crypto. You receive local currency to your M-Pesa
            in minutes — automatically, with zero blockchain knowledge required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
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
          </div>

          <div className="flex items-center gap-3 mb-8 w-full max-w-md">
            <div className="flex-1 h-px bg-border" />
            <Link
              href="/wallet"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border hover:bg-indigo-DEFAULT hover:text-white transition-all whitespace-nowrap"
            >
              <ScanLine className="w-4 h-4" />
              Paying a merchant? Open AvaRamp Pay
            </Link>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
            {["No crypto knowledge needed", "Under 3 min settlement", "M-Pesa · MTN · Airtel Money"].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-DEFAULT shrink-0" />
                <span className="text-sm text-secondary">{text}</span>
              </div>
            ))}
          </div>
        </AnimatedGroup>

        {/* Device composition */}
        <div className="relative w-full mx-auto mt-8 sm:mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-xl mx-auto"
          >
            <DashboardPanel />
          </motion.div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[150px] sm:w-[190px] md:w-[220px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <Iphone15Pro className="drop-shadow-2xl">
                <PaymentFlowScreen />
              </Iphone15Pro>
            </motion.div>
          </div>

          {/* Fade to page background at the bottom of the composition */}
          <div className="absolute -bottom-4 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent pointer-events-none" />
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative mt-10 sm:mt-14 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { value: "< 3 min", label: "End-to-end settlement" },
            { value: "5", label: "African currencies" },
            { value: "0%", label: "Setup cost" },
            { value: "100%", label: "Automated" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-primary tracking-tight">{value}</div>
              <div className="text-sm text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </GradientHero>
  );
}
