"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Wallet, TrendingUp, SendHorizontal, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    icon: <Wallet className="w-6 h-6" />,
    label: "Receive",
    title: "A unique deposit address per payment",
    description:
      "Every payment creates a fresh Avalanche wallet address. No shared wallets, no correlation risk. The customer sends USDC directly on-chain.",
    accent: "#7c5cff",
    tag: "Non-custodial",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    label: "Convert",
    title: "Live FX rates, updated every 5 minutes",
    description:
      "USDC is pegged 1:1 to USD. AvaRamp fetches real-time USD → KES, NGN, GHS, TZS, UGX exchange rates so merchants always receive fair value.",
    accent: "#3ecfcf",
    tag: "Live rates",
  },
  {
    icon: <SendHorizontal className="w-6 h-6" />,
    label: "Settle",
    title: "M-Pesa B2C payout in under 2 minutes",
    description:
      "Once a deposit is confirmed on-chain, AvaRamp automatically triggers a Safaricom Daraja B2C disbursement to the merchant's M-Pesa till number.",
    accent: "#f59e0b",
    tag: "Automatic",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    label: "Track",
    title: "Real-time dashboard with full audit trail",
    description:
      "Every fiat and crypto movement is recorded as a double-entry ledger entry. Full payment lifecycle visible — from PENDING to SETTLED — in real time.",
    accent: "#10b981",
    tag: "Audit-ready",
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-teal-glow opacity-50" />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-2/10 border border-accent-2/20 text-accent-2 text-xs font-medium mb-4">
            One account for every move
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for the full
            <span className="text-gradient"> payment lifecycle</span>
          </h2>
          <p className="text-subtle text-lg max-w-xl mx-auto">
            From on-chain deposit detection to mobile money disbursement — every step automated.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-card border border-border rounded-2xl p-6 overflow-hidden hover:border-accent/30 transition-all duration-500 cursor-pointer"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${f.accent}15 0%, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${f.accent}18`, color: f.accent, border: `1px solid ${f.accent}30` }}
              >
                {f.icon}
              </div>

              {/* Tag */}
              <div className="text-xs font-medium mb-2" style={{ color: f.accent }}>
                {f.tag}
              </div>

              {/* Content */}
              <h3 className="text-white font-semibold text-base mb-3 leading-snug">
                {f.title}
              </h3>
              <p className="text-subtle text-sm leading-relaxed mb-5">
                {f.description}
              </p>

              {/* Hover arrow */}
              <div className="flex items-center gap-1.5 text-sm font-medium transition-all duration-300 group-hover:gap-2.5"
                style={{ color: f.accent }}
              >
                Learn more
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
