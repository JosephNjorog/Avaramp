"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ScanLine, Shield, TrendingUp, Receipt } from "lucide-react";

const INDUSTRIES = [
  "Retail Shops",
  "Hotels & Hospitality",
  "Restaurants",
  "Online Sellers",
  "Freelancers",
  "Event Organizers",
  "Healthcare",
  "Education",
  "Car Dealerships",
  "NGOs & Charities",
  "Service Providers",
  "Remittance",
];

const HOW_CARDS = [
  {
    icon: ScanLine,
    title: "Accept payments",
    description: "Customers pay the way they already do — scan a QR code from any crypto wallet.",
  },
  {
    icon: Shield,
    title: "Value is protected",
    description: "USDC is converted at the locked rate the moment payment confirms. No FX exposure.",
  },
  {
    icon: TrendingUp,
    title: "Use your money",
    description: "Withdraw to M-Pesa instantly, pay suppliers, or track your cash flow in real time.",
  },
  {
    icon: Receipt,
    title: "Track in real time",
    description: "View every transaction. Download reports. Stay on top of every shilling.",
  },
];

export default function Benefits() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);

  return (
    <section ref={ref} className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Industry bubbles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">
            From local to global
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3">
            Designed for every business
          </h2>
          <p className="text-secondary mb-8 max-w-xl mx-auto">
            From shops and restaurants to hotels and NGOs — any business that wants to
            accept global payments and settle in local currency.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5">
            {INDUSTRIES.map((industry, i) => (
              <motion.button
                key={industry}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setActiveIndustry(industry === activeIndustry ? null : industry)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeIndustry === industry
                    ? "bg-indigo-DEFAULT text-white border-indigo-DEFAULT shadow-sm"
                    : "bg-card border-border text-secondary hover:border-indigo-DEFAULT/50 hover:text-primary"
                }`}
              >
                {industry}
              </motion.button>
            ))}
          </div>

          {activeIndustry && (
            <motion.p
              key={activeIndustry}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-indigo-DEFAULT mt-5 font-medium"
            >
              AvaRamp works great for {activeIndustry}. Accept USDC, receive M-Pesa — automatically.
            </motion.p>
          )}
        </motion.div>

        {/* How it works for your business */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {HOW_CARDS.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative bg-card border border-border rounded-2xl p-5 group hover:border-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-dim border border-indigo-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5 text-indigo-DEFAULT" strokeWidth={1.5} />
              </div>
              <div className="absolute top-5 right-5 text-2xl font-black text-border/60 leading-none select-none">
                0{i + 1}
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
