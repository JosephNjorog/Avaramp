"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Create a payment",
    description:
      "Call POST /payments with your merchant ID, the fiat amount, and the customer's phone number. We return a unique Avalanche deposit address and the USDC equivalent at the current rate.",
    code: `const payment = await fetch('/v1/payments', {
  method: 'POST',
  body: JSON.stringify({
    merchantId: 'mer_01234',
    amount: '5000',
    currency: 'KES',
    phone: '+254712345678',
  }),
}).then(r => r.json());

// → { depositAddress, amountUsdc, expiresAt }`,
  },
  {
    n: "02",
    title: "Customer sends USDC",
    description:
      "Share the deposit address with your customer. AvaRamp monitors the address on Avalanche C-Chain via the Glacier API. The moment USDC arrives and confirms, we fire the payment.confirmed webhook.",
    code: `// Webhook payload
{
  "event": "payment.confirmed",
  "paymentId": "pay_abc123",
  "amountUsdc": "3.82",
  "depositAddress": "0x4f3d...8a1c",
  "confirmedAt": "2024-01-15T10:42:11Z"
}`,
  },
  {
    n: "03",
    title: "Auto-settle via M-Pesa",
    description:
      "We convert at the locked rate and initiate an M-Pesa B2C transfer via Daraja. The full amount lands in the customer's mobile wallet. We fire payment.settled when complete.",
    code: `// Final webhook
{
  "event": "payment.settled",
  "paymentId": "pay_abc123",
  "fiatAmount": "5000.00",
  "currency": "KES",
  "mpesaReceipt": "NLJ7RT61SV",
  "settledAt": "2024-01-15T10:43:48Z"
}`,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">Integration</p>
          <h2 className="text-3xl font-bold text-primary tracking-tight mb-4">
            Three steps, fully automated
          </h2>
          <p className="text-secondary max-w-xl">
            The entire flow — from USDC deposit to M-Pesa disbursement — happens without any manual
            intervention. Every step fires a webhook so your app always knows what&apos;s happening.
          </p>
        </motion.div>

        <div className="space-y-6">
          {STEPS.map(({ n, title, description, code }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="grid md:grid-cols-[240px_1fr] gap-5 bg-card border border-border rounded-xl p-5 hover:border-[#36363c] transition-colors"
            >
              {/* Left */}
              <div>
                <span className="text-3xl font-bold text-border">{n}</span>
                <h3 className="text-sm font-semibold text-primary mt-3 mb-2">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{description}</p>
              </div>

              {/* Right — code */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                </div>
                <pre className="px-4 py-4 text-xs font-mono text-secondary leading-relaxed overflow-x-auto">
                  <code>{code}</code>
                </pre>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
