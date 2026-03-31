"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Globe, Lock, RefreshCw, Webhook, BookOpen, Code2,
} from "lucide-react";

const benefits = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Africa-first by design",
    description:
      "Built for KES, NGN, GHS, TZS and UGX from day one. M-Pesa is a first-class settlement rail, not an afterthought.",
    accent: "#3ecfcf",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Zero custody risk",
    description:
      "Each payment gets its own fresh wallet. Private keys are AES-256-GCM encrypted at rest. AvaRamp never holds your funds.",
    accent: "#7c5cff",
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Live FX rates",
    description:
      "Exchange rates refresh every 5 minutes from open data sources. The rate is locked at payment creation — no slippage surprises.",
    accent: "#f59e0b",
  },
  {
    icon: <Webhook className="w-6 h-6" />,
    title: "HMAC-signed webhooks",
    description:
      "Receive payment.confirmed, payment.settled, and payment.failed events instantly. Every delivery is signed and logged.",
    accent: "#10b981",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Double-entry audit ledger",
    description:
      "Every fiat and USDC movement creates two ledger entries — DEBIT and CREDIT — so your books always balance.",
    accent: "#a78bfa",
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: "Developer-first API",
    description:
      "RESTful JSON API with idempotency keys, Zod-validated schemas, and rate limiting. Self-hostable and open source.",
    accent: "#fb923c",
  },
];

export default function Benefits() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="benefits" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow opacity-40" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for merchants who
            <span className="text-gradient"> refuse to wait</span>
          </h2>
          <p className="text-subtle text-lg max-w-xl mx-auto">
            Every feature was designed around the real constraints of running a business in Africa.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group bg-card border border-border rounded-2xl p-7 hover:border-opacity-50 transition-all duration-400 relative overflow-hidden"
              style={{ "--b-accent": b.accent } as React.CSSProperties}
            >
              {/* Bottom glow on hover */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
                style={{ background: b.accent }}
              />

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${b.accent}15`, color: b.accent, border: `1px solid ${b.accent}25` }}
              >
                {b.icon}
              </div>

              <h3 className="text-white font-semibold text-base mb-2.5">{b.title}</h3>
              <p className="text-subtle text-sm leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
