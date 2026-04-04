"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Copy, Check } from "lucide-react";
import Button from "@/components/ui/Button";

const API_SNIPPET = `curl -X POST https://api.avaramp.io/v1/payments \\
  -H "Authorization: Bearer avr_live_..." \\
  -d '{
    "merchantId": "mer_01234",
    "amount": "500",
    "currency": "KES",
    "phone": "+254712345678"
  }'`;

const RESPONSE_SNIPPET = `{
  "depositAddress": "0x4f3d...8a1c",
  "amountUsdc": "3.82",
  "fiatAmount": "500.00",
  "currency": "KES",
  "expiresAt": "2024-01-15T10:45:00Z"
}`;

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(API_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#7c6ff7 1px, transparent 1px), linear-gradient(90deg, #7c6ff7 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 items-center">
          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT" />
              <span className="text-xs text-indigo-DEFAULT font-medium">Now live on Avalanche C-Chain</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-4xl sm:text-5xl font-bold text-primary leading-[1.1] tracking-tight text-balance mb-4"
            >
              Accept USDC.{" "}
              <span className="gradient-brand">Pay out in minutes.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-base text-secondary leading-relaxed mb-8 max-w-lg"
            >
              AvaRamp converts USDC on Avalanche to M-Pesa, MTN Money, and Airtel Money
              automatically. One API call, five African currencies, zero custody risk.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Link href="/auth/register">
                <Button size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
                  Start building free
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="secondary">View API docs</Button>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
            >
              {[
                "No KYC to get started",
                "Live FX rates, no markup",
                "< 2 min average settlement",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-DEFAULT shrink-0" />
                  <span className="text-xs text-secondary">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — code window */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-menu">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-DEFAULT/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-DEFAULT/40" />
                  <div className="w-3 h-3 rounded-full bg-green-DEFAULT/40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-muted font-mono">POST /v1/payments</span>
                  <button
                    onClick={handleCopy}
                    className="text-muted hover:text-secondary transition-colors p-0.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-DEFAULT" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Request */}
              <div className="px-4 py-4 border-b border-border">
                <p className="text-2xs text-muted uppercase tracking-wider mb-2 font-medium">Request</p>
                <pre className="text-xs font-mono text-secondary leading-relaxed overflow-x-auto">
                  <code>{API_SNIPPET}</code>
                </pre>
              </div>

              {/* Response */}
              <div className="px-4 py-4">
                <p className="text-2xs text-muted uppercase tracking-wider mb-2 font-medium">Response 200</p>
                <pre className="text-xs font-mono leading-relaxed overflow-x-auto">
                  <code>
                    {RESPONSE_SNIPPET.split("\n").map((line, i) => {
                      const isKey = line.includes(":");
                      const [key, val] = isKey ? line.split(":") : [line, ""];
                      return (
                        <span key={i} className="block">
                          {isKey ? (
                            <>
                              <span className="text-secondary">{key}:</span>
                              <span className="text-green-DEFAULT">{val}</span>
                            </>
                          ) : (
                            <span className="text-muted">{line}</span>
                          )}
                        </span>
                      );
                    })}
                  </code>
                </pre>
              </div>

              {/* Status bar */}
              <div className="px-4 py-2.5 border-t border-border bg-surface flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT animate-pulse" />
                  <span className="text-2xs text-green-DEFAULT font-medium">Deposit address created</span>
                </div>
                <span className="text-2xs text-muted ml-auto">Settlement in ~90s</span>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl px-4 py-3 shadow-menu">
              <div className="text-xs font-semibold text-primary">$2.4M+</div>
              <div className="text-2xs text-muted">settled this month</div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-20 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {[
            { value: "$2.4M+",  label: "Total settled"         },
            { value: "< 2 min", label: "Average settlement"    },
            { value: "5",       label: "African currencies"    },
            { value: "99.7%",   label: "Success rate"          },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-primary tracking-tight">{value}</div>
              <div className="text-sm text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
