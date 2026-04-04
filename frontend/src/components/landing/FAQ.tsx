"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What currencies does AvaRamp support?",
    a: "We currently support KES (Kenya Shilling), NGN (Nigerian Naira), GHS (Ghanaian Cedi), TZS (Tanzanian Shilling), and UGX (Ugandan Shilling). Settlement goes directly to M-Pesa, MTN Money, and Airtel Money depending on the country.",
  },
  {
    q: "How long does settlement take?",
    a: "Typically under 2 minutes. Avalanche C-Chain finalizes in ~2 seconds. Once confirmed on-chain, we immediately trigger the M-Pesa B2C transfer via Daraja. The M-Pesa push notification arrives within seconds of the blockchain confirmation.",
  },
  {
    q: "Do I need to KYC to start?",
    a: "No KYC is required to create an account, generate your first API key, and test with small amounts on mainnet. For higher volume merchants, we'll reach out for a brief onboarding. This keeps the developer experience frictionless.",
  },
  {
    q: "What happens if the USDC doesn't arrive?",
    a: "Payments have a configurable expiry window (default 30 minutes). If no deposit is detected within that window, the payment transitions to EXPIRED and we fire a payment.expired webhook. The deposit address is monitored until expiry.",
  },
  {
    q: "How do I verify webhook signatures?",
    a: "Every webhook POST includes an X-Webhook-Signature header. It's an HMAC-SHA256 of the raw request body using your merchant's webhook secret. Verify it in two lines: compute HMAC with your secret and compare with the header value.",
  },
  {
    q: "Is AvaRamp non-custodial?",
    a: "Yes. Each payment generates a unique HD wallet address derived from your mnemonic. Private keys are AES-256-GCM encrypted before storage. We initiate the M-Pesa transfer and the USDC moves in one flow — we never hold funds on your behalf.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-20 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold text-primary tracking-tight mb-3">
            Common questions
          </h2>
          <p className="text-secondary">
            Anything else?{" "}
            <a href="mailto:hello@avaramp.io" className="text-indigo-DEFAULT hover:underline">
              Email us
            </a>
          </p>
        </motion.div>

        <div className="divide-y divide-border">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={q}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-4 text-left group"
                >
                  <span className={`text-sm font-medium transition-colors ${isOpen ? "text-indigo-DEFAULT" : "text-primary group-hover:text-primary/90"}`}>
                    {q}
                  </span>
                  <span className="shrink-0 mt-0.5 text-muted">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-secondary leading-relaxed pb-4">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
