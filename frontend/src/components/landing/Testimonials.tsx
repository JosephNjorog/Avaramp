"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "International customers pay with USDC from their wallets, and the money hits my M-Pesa before they even leave the shop. No more running to the bank.",
    name: "Sarah W.",
    role: "Retail Shop Owner, Nairobi",
    initial: "S",
  },
  {
    quote:
      "Foreign guests used to cause payment friction. Now they scan a QR code and my M-Pesa gets the settlement instantly. It's changed how we run the front desk.",
    name: "David K.",
    role: "Hotel Manager, Mombasa",
    initial: "D",
  },
  {
    quote:
      "We now settle in stablecoins and pay our overseas suppliers the same day. AvaRamp eliminated the 5-day bank delays that were slowing our restocking cycle.",
    name: "Amina J.",
    role: "Clothing Boutique Founder, Lagos",
    initial: "A",
  },
  {
    quote:
      "Signing up members is as easy as scanning a QR code. Recurring payments are seamless and I don't need to chase anyone for fees anymore.",
    name: "Mike T.",
    role: "Gym Owner, Kampala",
    initial: "M",
  },
  {
    quote:
      "Instant settlement means we can pay our vendors before the show even ends. No more waiting two weeks for ticketing payouts to clear.",
    name: "Sam L.",
    role: "Event Organizer, Accra",
    initial: "S",
  },
  {
    quote:
      "Rent collection is no longer a manual chore. AvaRamp automates the pipeline and the M-Pesa arrives automatically — my tenants love it too.",
    name: "Grace K.",
    role: "Property Manager, Nairobi",
    initial: "G",
  },
];

export default function Testimonials() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">
            Merchant stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Why merchants switch to AvaRamp
          </h2>
          <p className="text-secondary mt-4 max-w-xl mx-auto">
            Real merchants. Real settlements. Real M-Pesa.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map(({ quote, name, role, initial }, i) => (
            <motion.div
              key={name + i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-muted transition-colors"
            >
              {/* Quote mark */}
              <div className="text-4xl font-black text-indigo-DEFAULT/20 leading-none select-none">"</div>
              <p className="text-sm text-secondary leading-relaxed flex-1">{quote}</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #3730a3 100%)" }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{name}</p>
                  <p className="text-xs text-muted">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
