import Link from "next/link";
import { ArrowRight, Zap, Globe, Shield, Cpu, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "About — AvaRamp" };

const VALUES = [
  {
    icon: Globe,
    title: "Built for Africa",
    body: "Every design decision starts with the African context — mobile-first money, local currencies, and merchants who shouldn't need a crypto wallet to accept crypto payments.",
  },
  {
    icon: Shield,
    title: "Non-custodial by design",
    body: "Each payment gets a unique HD-wallet deposit address. We never pool customer funds. Every on-chain action is publicly verifiable on Avalanche Snowtrace.",
  },
  {
    icon: Cpu,
    title: "Infrastructure, not an app",
    body: "AvaRamp is a payments API, not a consumer wallet. We are the rails other products build on — the same way Stripe is infrastructure for e-commerce.",
  },
  {
    icon: Users,
    title: "Merchant-first",
    body: "Our merchant doesn't need to understand USDC, gas, or wallets. They enter their M-Pesa till number once and receive local currency automatically.",
  },
];

const TIMELINE = [
  { date: "Jan 2026", title: "Founded", body: "AvaRamp founded with the goal of building the missing crypto-to-mobile-money bridge for Africa." },
  { date: "Feb 2026", title: "First integration", body: "Avalanche Glacier API integrated. On-chain USDC deposit detection live on Fuji testnet." },
  { date: "Mar 2026", title: "Paystack settlement", body: "Automated KES, NGN, GHS, TZS, UGX settlement via Paystack Transfers goes live." },
  { date: "Apr 2026", title: "Daraja added",       body: "Safaricom Daraja API integration added — full M-Pesa support for Till and Paybill numbers." },
  { date: "May 2026", title: "Public beta",        body: "Merchant onboarding opens. First real USDC → KES settlement processed on mainnet." },
  { date: "Now",      title: "Growing",            body: "Expanding currency and rail coverage across East and West Africa. Reach out to join the journey." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT" />
              Our mission
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
              Closing the crypto-to-mobile<br className="hidden sm:block" /> money gap in Africa
            </h1>
            <p className="text-secondary text-lg leading-relaxed">
              40 million crypto holders in Africa. Merchants who need local currency.
              A corridor that should take seconds but takes days.
              AvaRamp fixes that — one payment at a time.
            </p>
          </div>

          {/* What we do */}
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-DEFAULT flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold">What AvaRamp does</h2>
            </div>
            <p className="text-secondary leading-relaxed mb-4">
              AvaRamp is payment infrastructure. A customer anywhere in the world opens a payment link,
              sends USDC on Avalanche C-Chain, and the merchant receives KES on their M-Pesa till — automatically,
              within minutes, without either party managing wallets, exchange accounts, or bank transfers.
            </p>
            <p className="text-secondary leading-relaxed mb-6">
              We abstract the entire complexity of the crypto-to-fiat corridor into three API calls.
              Any developer can integrate us in an afternoon. Any merchant can start accepting global
              crypto payments with zero technical knowledge.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "< 3 min", label: "End-to-end settlement" },
                { value: "5",       label: "African currencies" },
                { value: "1.5%",    label: "Flat platform fee" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{value}</div>
                  <div className="text-xs text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">What we believe</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {VALUES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-6">
                  <div className="w-9 h-9 rounded-lg bg-indigo-dim border border-indigo-border flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-indigo-DEFAULT" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">{title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">Our journey</h2>
            <div className="space-y-0">
              {TIMELINE.map(({ date, title, body }, i) => (
                <div key={date} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${i === TIMELINE.length - 1 ? "bg-indigo-DEFAULT animate-pulse" : "bg-border"}`} />
                    {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
                  </div>
                  <div className={`pb-8 ${i === TIMELINE.length - 1 ? "" : ""}`}>
                    <p className="text-xs text-muted font-mono mb-1">{date}</p>
                    <p className="text-sm font-semibold text-primary mb-1">{title}</p>
                    <p className="text-sm text-secondary leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
            <h2 className="text-xl font-semibold mb-6">The technical stack</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ["Chain",         "Avalanche C-Chain (EVM, USDC native, sub-second finality)"],
                ["On-chain detection", "Glacier API + BullMQ deposit watcher"],
                ["Settlement (KES)", "Safaricom Daraja B2C and B2B APIs"],
                ["Settlement (NGN/GHS/TZS/UGX)", "Paystack Transfer API"],
                ["Backend",       "Node.js, Express, TypeScript, Prisma, Neon PostgreSQL"],
                ["Queue",         "BullMQ on Redis (Render Key-Value)"],
                ["Frontend",      "Next.js 14, Tailwind CSS, Framer Motion"],
                ["Hosting",       "Render (backend) + Vercel (frontend)"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-muted shrink-0 min-w-[160px]">{label}</span>
                  <span className="text-secondary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-indigo-dim border border-indigo-border rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-2">Build with us</h2>
            <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
              Whether you&apos;re a merchant, a developer integrating crypto payments, or an investor
              interested in Africa&apos;s fintech infrastructure — we&apos;d love to talk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-DEFAULT text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-secondary text-sm font-medium hover:text-primary transition-colors">
                Contact us
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
