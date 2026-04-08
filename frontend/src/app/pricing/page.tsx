"use client";

import Link from "next/link";
import { CheckCircle2, Zap, ArrowRight, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { flag: "🇰🇪", code: "KES", name: "Kenya", via: "M-Pesa Daraja B2C" },
  { flag: "🇳🇬", code: "NGN", name: "Nigeria", via: "MTN MoMo" },
  { flag: "🇬🇭", code: "GHS", name: "Ghana", via: "MTN MoMo" },
  { flag: "🇹🇿", code: "TZS", name: "Tanzania", via: "Airtel Money" },
  { flag: "🇺🇬", code: "UGX", name: "Uganda", via: "MTN / Airtel" },
];

interface PlanProps {
  name: string;
  badge?: string;
  fee: string;
  subFee?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

function PlanCard({ name, badge, fee, subFee, description, features, cta, href, highlighted }: PlanProps) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl border p-6 sm:p-8",
      highlighted
        ? "bg-indigo-DEFAULT/10 border-indigo-border shadow-[0_0_40px_-12px] shadow-indigo-DEFAULT/30"
        : "bg-card border-border"
    )}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-DEFAULT text-white">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm font-medium text-secondary mb-1">{name}</p>
        <div className="flex items-end gap-1 mb-1">
          <span className="text-4xl font-bold text-primary tracking-tight">{fee}</span>
          {subFee && <span className="text-secondary text-sm mb-1.5">{subFee}</span>}
        </div>
        <p className="text-sm text-secondary">{description}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className={cn("w-4 h-4 shrink-0 mt-0.5", highlighted ? "text-indigo-DEFAULT" : "text-green-400")} />
            <span className="text-secondary">{f}</span>
          </li>
        ))}
      </ul>

      <Link href={href}>
        <Button variant={highlighted ? "primary" : "secondary"} className="w-full">
          {cta} {highlighted && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Pay only when{" "}
              <span className="text-indigo-DEFAULT">you get paid</span>
            </h1>
            <p className="text-secondary text-lg leading-relaxed">
              No monthly fees. No setup costs. No hidden charges.
              A single percentage fee on every successful settlement — nothing else.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            <PlanCard
              name="Starter"
              fee="1.5%"
              subFee="per settlement"
              description="Perfect for new businesses accepting their first cross-border payments."
              features={[
                "Up to 200 payments / month",
                "M-Pesa (KES) settlements",
                "Real-time webhooks",
                "USDC on Avalanche C-Chain",
                "Dashboard + analytics",
                "Email support",
              ]}
              cta="Get started free"
              href="/auth/register"
            />

            <PlanCard
              name="Growth"
              badge="Most popular"
              fee="1.2%"
              subFee="per settlement"
              description="For growing teams with higher volume and multi-currency needs."
              features={[
                "Up to 2,000 payments / month",
                "All 5 currencies (KES, NGN, GHS, TZS, UGX)",
                "Priority M-Pesa settlements",
                "Webhook retry with delivery log",
                "Idempotency-Key support",
                "Dedicated Slack channel",
              ]}
              cta="Start free trial"
              href="/auth/register"
              highlighted
            />

            <PlanCard
              name="Enterprise"
              fee="Custom"
              description="For platforms and marketplaces that need volume pricing and SLAs."
              features={[
                "Unlimited payments",
                "Custom fee negotiated (as low as 0.8%)",
                "Dedicated settlement account",
                "White-label API",
                "On-chain contract customisation",
                "99.9% uptime SLA + 24/7 support",
              ]}
              cta="Talk to us"
              href="mailto:enterprise@avaramp.com"
            />
          </div>

          {/* How the fee works */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-semibold mb-2">How the fee works</h2>
            <p className="text-secondary text-sm mb-6 max-w-xl">
              The fee is deducted from the USDC amount before it is converted and settled to
              mobile money. The customer always knows exactly what they are sending.
            </p>

            <div className="bg-surface border border-border rounded-xl p-5 font-mono text-sm max-w-lg">
              <div className="flex justify-between mb-2">
                <span className="text-secondary">Customer sends</span>
                <span className="text-primary">19.23 USDC</span>
              </div>
              <div className="flex justify-between mb-2 text-red-400">
                <span>AvaRamp fee (1.5%)</span>
                <span>− 0.29 USDC</span>
              </div>
              <div className="border-t border-border my-2" />
              <div className="flex justify-between font-semibold">
                <span className="text-secondary">Merchant receives</span>
                <span className="text-green-400">2,462.50 KES</span>
              </div>
              <p className="text-xs text-muted mt-3">
                FX rate locked at payment creation. Settlement completes in under 3 minutes.
              </p>
            </div>
          </div>

          {/* Supported currencies */}
          <div className="mb-16">
            <h2 className="text-xl font-semibold mb-2">Supported currencies & rails</h2>
            <p className="text-secondary text-sm mb-6">
              One API. Five African markets. Each settlement goes directly to the customer's
              mobile money wallet with no intermediary bank account required.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CURRENCIES.map(({ flag, code, name, via }) => (
                <div key={code} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                  <span className="text-3xl">{flag}</span>
                  <div>
                    <p className="text-sm font-semibold text-primary">{name} — {code}</p>
                    <p className="text-xs text-secondary mt-0.5">{via}</p>
                  </div>
                  <span className="ml-auto text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                    Live
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 bg-surface border border-dashed border-border rounded-xl p-4">
                <span className="text-3xl opacity-40">🌍</span>
                <div>
                  <p className="text-sm font-semibold text-secondary">More coming</p>
                  <p className="text-xs text-muted mt-0.5">ZMW, RWF, ETB, XOF</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-xl font-semibold mb-6">Pricing FAQ</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Are there any monthly or setup fees?",
                  a: "None. You pay nothing until a payment settles. The percentage fee only applies to successful transactions.",
                },
                {
                  q: "What is the FX rate used for conversion?",
                  a: "We use the mid-market rate from Frankfurter (ECB data) locked at payment creation time. The rate the customer sees is the rate used — no FX spread markup.",
                },
                {
                  q: "How fast does money reach the recipient?",
                  a: "Avalanche C-Chain finalises in ~2 seconds. M-Pesa B2C payouts complete within 1–3 minutes of USDC confirmation. End-to-end is typically under 5 minutes.",
                },
                {
                  q: "What happens if a settlement fails?",
                  a: "The settlement worker retries automatically. If it fails after all retries, the USDC is refunded on-chain to the depositor and you receive a payment.failed webhook. You are not charged the fee on failed payments.",
                },
                {
                  q: "Do I need a crypto wallet or bank account?",
                  a: "No. You only need a mobile money account. AvaRamp handles the USDC custody and conversion. Your customers send crypto; you receive local currency.",
                },
                {
                  q: "Is my float balance insured?",
                  a: "USDC held in the PaymentGateway contract is non-custodial — we cannot move it except to settle or refund. All on-chain actions are verifiable on Snowtrace.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="border border-border rounded-xl p-5 bg-card">
                  <p className="text-sm font-semibold text-primary mb-2">{q}</p>
                  <p className="text-sm text-secondary leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center border border-indigo-border bg-indigo-dim rounded-2xl p-8 sm:p-12">
            <div className="w-12 h-12 rounded-2xl bg-indigo-DEFAULT flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start accepting payments today</h2>
            <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
              Create your account in 60 seconds. No contracts, no approval process.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/register">
                <Button size="lg">
                  Create free account <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="mailto:enterprise@avaramp.com">
                <Button size="lg" variant="secondary">
                  <MessageSquare className="w-4 h-4 mr-2" /> Talk to sales
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
