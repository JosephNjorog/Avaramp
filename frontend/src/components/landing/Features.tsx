"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, BarChart3, Globe, Phone } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant settlement",
    description: "If your customer has paid, the money is already yours. M-Pesa arrives in minutes — not days.",
  },
  {
    icon: BarChart3,
    title: "Clear payment records",
    description: "See and verify every transaction in one place. Export reports for accounting in seconds.",
  },
  {
    icon: Globe,
    title: "Accept from anywhere",
    description: "Your customer can be anywhere in the world. They pay with crypto, you receive local currency.",
  },
  {
    icon: Phone,
    title: "Works with M-Pesa",
    description: "No new bank accounts needed. Money goes straight to your M-Pesa, MTN Money, or Airtel Money.",
  },
];

export default function Features() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">
            Why businesses choose AvaRamp
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Built for African merchants
          </h2>
          <p className="text-secondary mt-4 max-w-xl mx-auto">
            Accept crypto payments from customers worldwide and receive local currency
            to your mobile money — automatically.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:border-muted transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-dim border border-indigo-border flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5 text-indigo-DEFAULT" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-primary mb-2">{title}</h3>
              <p className="text-sm text-secondary leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
