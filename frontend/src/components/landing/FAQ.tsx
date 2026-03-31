"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is AvaRamp custodial?",
    a: "No. AvaRamp generates a fresh wallet per payment and stores the encrypted private key only long enough to monitor for deposits. Once the payment is confirmed and settled, the key serves no further purpose. AvaRamp never pools or holds merchant funds.",
  },
  {
    q: "Which blockchains and tokens are supported?",
    a: "Currently AvaRamp supports USDC on the Avalanche C-Chain (chainId 43114). The USDC contract address is 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6C. Support for additional tokens and chains is planned.",
  },
  {
    q: "How quickly do merchants receive their fiat?",
    a: "On average under 2 minutes. Avalanche C-Chain has sub-second finality and the Glacier API detects confirmations quickly. The M-Pesa B2C disbursement typically completes in 30–90 seconds after that.",
  },
  {
    q: "What fiat currencies and settlement rails are supported?",
    a: "AvaRamp supports KES (Kenya), NGN (Nigeria), GHS (Ghana), TZS (Tanzania), and UGX (Uganda). Settlement is via M-Pesa B2C to the merchant's registered till number. Additional rails (Airtel, bank transfer) are on the roadmap.",
  },
  {
    q: "How are exchange rates determined?",
    a: "AvaRamp fetches live USD-to-fiat exchange rates from Frankfurter (an open ECB data feed) every 5 minutes. The rate is locked at payment creation time and displayed to the merchant so there are no surprises at settlement.",
  },
  {
    q: "Do I need to write smart contracts to integrate?",
    a: "No. The AvaRamp REST API handles all on-chain interaction. You POST to /payments, receive a deposit address, show it to your customer, and wait for the payment.settled webhook. No blockchain knowledge required.",
  },
  {
    q: "What happens if a payment expires?",
    a: "Payments have a 30-minute expiry window. If no deposit is detected within that time, the payment is marked EXPIRED. If a deposit arrives after expiry, AvaRamp will still detect it and can trigger a manual settlement or refund.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-28 overflow-hidden" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently asked
            <span className="text-gradient"> questions</span>
          </h2>
          <p className="text-subtle text-lg">
            Everything you need to know about AvaRamp.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
                open === i ? "border-accent/30" : "border-border hover:border-muted"
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-white font-medium text-base">{faq.q}</span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors duration-200 ${
                    open === i
                      ? "bg-accent/15 border-accent/30 text-accent"
                      : "bg-surface border-border text-subtle group-hover:border-muted"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-subtle text-sm leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
