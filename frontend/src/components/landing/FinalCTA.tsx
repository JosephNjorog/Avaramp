"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Code2, Store } from "lucide-react";

export default function FinalCTA() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="py-20 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest mb-3">
            Get started today
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
            Ready to take your business global?
          </h2>
          <p className="text-secondary max-w-xl mx-auto">
            Get paid instantly. Protect your earnings. Move money freely — across Africa and beyond.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Merchant CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl p-8 flex flex-col"
            style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #312e81 100%)" }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-5 relative z-10">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">For merchants</h3>
            <p className="text-indigo-200 text-sm leading-relaxed mb-6 flex-1 relative z-10">
              Start accepting crypto payments today. No blockchain knowledge needed.
              Free to create your account.
            </p>
            <div className="space-y-2 mb-6 relative z-10">
              {["Free to start", "No crypto knowledge needed", "M-Pesa in minutes"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-indigo-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/auth/register"
              className="relative z-10 w-full flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold text-sm py-3.5 rounded-2xl hover:bg-indigo-50 transition-colors"
            >
              Start accepting payments <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Developer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card border border-border rounded-3xl p-8 flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-dim border border-indigo-border flex items-center justify-center mb-5">
              <Code2 className="w-5 h-5 text-indigo-DEFAULT" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">For developers</h3>
            <p className="text-secondary text-sm leading-relaxed mb-6 flex-1">
              Integrate AvaRamp into your app or POS with a simple REST API.
              One call, automatic settlement, signed webhooks.
            </p>
            <div className="space-y-2 mb-6">
              {["Standard REST API", "Signed webhook events", "5-minute integration"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/docs"
              className="w-full flex items-center justify-center gap-2 bg-indigo-dim border border-indigo-border text-indigo-DEFAULT font-bold text-sm py-3.5 rounded-2xl hover:bg-indigo-DEFAULT hover:text-white hover:border-indigo-DEFAULT transition-all"
            >
              View API docs <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center text-xs text-muted mt-8"
        >
          No credit card required · Free tier included · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
