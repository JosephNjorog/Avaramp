"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

const perks = [
  "No setup fees",
  "No blockchain expertise needed",
  "Live M-Pesa settlement",
  "Open source & self-hostable",
];

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative py-28 overflow-hidden" ref={ref}>
      {/* Big glow */}
      <div className="absolute inset-0 bg-hero-glow opacity-60" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="bg-card border border-accent/20 rounded-3xl p-12 md:p-16 shadow-accent relative overflow-hidden"
        >
          {/* Inner glow top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-accent/20 blur-3xl rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/25 text-accent text-xs font-medium mb-6">
              Start collecting payments today
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              The easiest way to accept
              <span className="text-gradient"> crypto in Africa</span>
            </h2>

            <p className="text-subtle text-lg mb-8 max-w-xl mx-auto">
              Get up and running in minutes. No smart contract deployment. No crypto wallet setup for your customers. Just a REST API and M-Pesa.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <Link href="/auth/register">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} className="shadow-accent">
                  Create free account
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg">
                  Read the docs
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-subtle text-sm">
                  <CheckCircle2 className="w-4 h-4 text-accent-2" />
                  {p}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
