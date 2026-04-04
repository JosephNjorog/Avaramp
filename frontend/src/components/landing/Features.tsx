"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Wallet, RefreshCw, Phone, Webhook } from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "HD wallet per payment",
    description:
      "Every payment gets a fresh Avalanche C-Chain address derived from your HD wallet. Private keys are AES-256-GCM encrypted at rest. No shared addresses, no replay risk.",
    tags: ["EIP-55", "USDC", "Avalanche"],
  },
  {
    icon: RefreshCw,
    title: "Live FX, zero markup",
    description:
      "Rates are pulled from the Frankfurter API every 5 minutes. What you see is what gets settled — we don't add a spread on top of the mid-market rate.",
    tags: ["KES", "NGN", "GHS", "TZS", "UGX"],
  },
  {
    icon: Phone,
    title: "Automatic M-Pesa settlement",
    description:
      "Once USDC is confirmed on-chain, we trigger M-Pesa B2C via Daraja automatically. Your customer gets notified via push. No manual intervention.",
    tags: ["Daraja API", "B2C", "< 2 min"],
  },
  {
    icon: Webhook,
    title: "Signed webhook events",
    description:
      "Every state change fires a webhook with an HMAC-SHA256 signature. Verify it server-side in two lines. Retry logic built in — up to 3 attempts with backoff.",
    tags: ["HMAC-SHA256", "Retry", "Idempotent"],
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">Infrastructure</p>
          <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
            Built for production from day one
          </h2>
          <p className="text-secondary max-w-xl">
            No hacks, no workarounds. AvaRamp is designed around the primitives that financial
            infrastructure actually needs.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, tags }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl p-5 group hover:border-[#36363c] transition-colors duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-dim border border-indigo-border flex items-center justify-center mb-4 group-hover:bg-indigo-dim/80 transition-colors">
                <Icon className="w-4 h-4 text-indigo-DEFAULT" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-2">{title}</h3>
              <p className="text-sm text-secondary leading-relaxed mb-4">{description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="text-2xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
