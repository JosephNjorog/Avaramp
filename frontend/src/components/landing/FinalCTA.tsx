"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="py-20 border-t border-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-4xl font-bold text-primary tracking-tight mb-4">
            Ready to ship?
          </h2>
          <p className="text-secondary mb-8">
            Create your account, generate an API key, and make your first test payment in under
            5 minutes. No credit card, no KYC.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register">
              <Button size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                Create free account
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="secondary">
                Read the docs
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted mt-6">
            No credit card required &nbsp;·&nbsp; Free tier includes 100 payments/month
          </p>
        </motion.div>
      </div>
    </section>
  );
}
