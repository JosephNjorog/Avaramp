"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CreditCard, Search, Banknote } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <CreditCard className="w-7 h-7 text-accent" />,
    title: "Create a payment",
    description:
      "Call POST /payments with the USDC amount and fiat currency. AvaRamp returns a unique Avalanche deposit address, a live FX rate, and a 30-minute expiry window.",
    code: `POST /payments
{
  "merchantId": "uuid",
  "amountUsdc": "10.50",
  "fiatCurrency": "KES"
}`,
  },
  {
    step: "02",
    icon: <Search className="w-7 h-7 text-accent-2" />,
    title: "Customer sends USDC",
    description:
      "The customer transfers USDC to the deposit address on Avalanche C-Chain. AvaRamp's payment worker polls the Glacier API every 30 seconds to detect the deposit.",
    code: `// AvaRamp monitors:
depositAddress: "0xAb12...F9e3"
network: "avalanche"
token: "USDC"
expectedAmount: "10.50"`,
  },
  {
    step: "03",
    icon: <Banknote className="w-7 h-7 text-green-400" />,
    title: "Merchant receives fiat",
    description:
      "On confirmation, AvaRamp converts USDC to fiat at the locked rate and triggers a Safaricom M-Pesa B2C payment to the merchant's till number. Webhook fired instantly.",
    code: `// Webhook payload
{
  "event": "payment.settled",
  "mpesaReceiptId": "QKJ22NY4UX",
  "amount": "1350.00",
  "currency": "KES"
}`,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="relative py-28 overflow-hidden">
      {/* Radial glow center */}
      <div className="absolute inset-0 bg-card-glow opacity-60" />

      <div className="relative max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-4">
            Dead simple integration
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Three steps to your
            <span className="text-gradient"> first settlement</span>
          </h2>
          <p className="text-subtle text-lg max-w-xl mx-auto">
            No blockchain expertise required. One API call and your customers can pay in crypto while you receive fiat.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%_-_16px)] w-full h-px bg-gradient-to-r from-border via-accent/30 to-transparent z-10" />
              )}

              <div className="bg-card border border-border rounded-2xl p-7 h-full group hover:border-accent/30 transition-all duration-400">
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors duration-300">
                    {s.icon}
                  </div>
                  <span className="text-5xl font-black text-border group-hover:text-muted transition-colors duration-300">
                    {s.step}
                  </span>
                </div>

                <h3 className="text-white font-semibold text-xl mb-3">{s.title}</h3>
                <p className="text-subtle text-sm leading-relaxed mb-6">{s.description}</p>

                {/* Code snippet */}
                <div className="bg-background border border-border rounded-xl p-4 font-mono text-xs text-subtle overflow-x-auto">
                  <pre className="leading-relaxed whitespace-pre-wrap">{s.code}</pre>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
