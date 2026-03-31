"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const currencies = [
  { code: "KES", name: "Kenyan Shilling",   flag: "🇰🇪", color: "#3ecfcf" },
  { code: "NGN", name: "Nigerian Naira",    flag: "🇳🇬", color: "#7c5cff" },
  { code: "GHS", name: "Ghanaian Cedi",     flag: "🇬🇭", color: "#f59e0b" },
  { code: "TZS", name: "Tanzanian Shilling",flag: "🇹🇿", color: "#10b981" },
  { code: "UGX", name: "Ugandan Shilling",  flag: "🇺🇬", color: "#a78bfa" },
  { code: "USDC","name": "USD Coin",        flag: "💎", color: "#3b82f6" },
  { code: "AVAX", name: "Avalanche",        flag: "⛰️", color: "#e84142" },
];

const double = [...currencies, ...currencies];

export default function CurrencyMarquee() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="currencies" className="relative py-20 overflow-hidden" ref={ref}>
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* Label */}
        <div className="text-center mb-10">
          <p className="text-subtle text-sm font-medium tracking-widest uppercase">
            Supported settlement currencies
          </p>
        </div>

        {/* Row 1 — left */}
        <div className="relative mask-fade-x overflow-hidden mb-5">
          <div className="flex gap-4 animate-marquee-l" style={{ width: "max-content" }}>
            {double.map((c, i) => (
              <CurrencyPill key={i} {...c} />
            ))}
          </div>
        </div>

        {/* Row 2 — right */}
        <div className="relative mask-fade-x overflow-hidden">
          <div className="flex gap-4 animate-marquee-r" style={{ width: "max-content" }}>
            {[...double].reverse().map((c, i) => (
              <CurrencyPill key={i} {...c} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CurrencyPill({
  code, name, flag, color,
}: { code: string; name: string; flag: string; color: string }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border whitespace-nowrap hover:border-opacity-60 transition-colors duration-200 group"
      style={{ borderColor: `${color}30` }}
    >
      <span className="text-xl">{flag}</span>
      <div>
        <div className="text-white text-sm font-semibold leading-none">{code}</div>
        <div className="text-subtle text-xs mt-0.5">{name}</div>
      </div>
      <div
        className="w-1.5 h-1.5 rounded-full ml-1"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}
