"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Globe, Zap, Code, BookOpen, BarChart3 } from "lucide-react";

const ITEMS = [
  {
    icon: Globe,
    title: "Africa-first, globally built",
    description:
      "Settlement currencies are KES, NGN, GHS, TZS, and UGX. Mobile money rails that actually work.",
  },
  {
    icon: Shield,
    title: "Non-custodial by design",
    description:
      "We never hold funds. USDC hits your HD wallet address, gets converted, and sent to mobile money — all in one atomic flow.",
  },
  {
    icon: Zap,
    title: "Under 2 minutes, typically",
    description:
      "Avalanche finalizes in seconds. M-Pesa B2C is near-instant. The bottleneck is the Avalanche block, not us.",
  },
  {
    icon: Code,
    title: "One API, no SDK required",
    description:
      "Standard REST. JSON in, JSON out. No vendor lock-in, no proprietary SDK to maintain. Works from any backend language.",
  },
  {
    icon: BookOpen,
    title: "Full audit trail",
    description:
      "Every state change is written to a double-entry ledger. DEBIT and CREDIT entries for every payment, settlement, and refund.",
  },
  {
    icon: BarChart3,
    title: "Real-time webhook events",
    description:
      "payment.pending, payment.confirmed, payment.settled — fire into your own system. Signed with HMAC-SHA256, retried on failure.",
  },
];

export default function Benefits() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">Why AvaRamp</p>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            The primitives you actually need
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {ITEMS.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="bg-card p-5 hover:bg-surface transition-colors"
            >
              <Icon className="w-4 h-4 text-indigo-DEFAULT mb-3" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-primary mb-1.5">{title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
