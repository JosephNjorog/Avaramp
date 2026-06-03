import Link from "next/link";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export const metadata = { title: "Quickstart — AvaRamp Docs" };

const BASE = "https://avarampbackend.onrender.com";

const C = ({ children }: { children: string }) => (
  <code className="text-indigo-DEFAULT bg-indigo-dim px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
);

const Block = ({ code, lang = "bash" }: { code: string; lang?: string }) => (
  <div className="bg-surface border border-border rounded-xl overflow-hidden my-4">
    <div className="px-4 py-1.5 border-b border-border bg-card flex items-center justify-between">
      <span className="text-2xs text-muted font-mono">{lang}</span>
    </div>
    <pre className="px-4 py-4 text-xs font-mono text-secondary leading-relaxed overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

const steps = [
  {
    n: "1",
    title: "Create an account",
    body: (
      <>
        <p className="text-secondary text-sm mb-3">Register with your business email. A merchant profile and webhook secret are created automatically.</p>
        <Block code={`curl -X POST ${BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@business.com",
    "password": "your-secure-password",
    "phone": "+254700000000"
  }'`} />
        <p className="text-secondary text-sm">Save the <C>token</C> in the response — you&apos;ll use it in every subsequent request.</p>
      </>
    ),
  },
  {
    n: "2",
    title: "Configure your payout destination",
    body: (
      <>
        <p className="text-secondary text-sm mb-3">Set where you want to receive settlements — your M-Pesa till, paybill, or phone number.</p>
        <Block code={`curl -X PATCH ${BASE}/merchants/payout \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payoutType": "till",
    "payoutAccount": "174653",
    "payoutCurrency": "KES"
  }'`} />
        <p className="text-xs text-muted mt-2">Supported <C>payoutType</C> values: <C>phone</C>, <C>till</C>, <C>paybill</C></p>
      </>
    ),
  },
  {
    n: "3",
    title: "Create a payment",
    body: (
      <>
        <p className="text-secondary text-sm mb-3">Generate a USDC deposit address for a specific fiat amount. Optionally pass an idempotency key for safe retries.</p>
        <Block code={`curl -X POST ${BASE}/payments \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Idempotency-Key: order-abc-001" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amountFiat": "500",
    "fiatCurrency": "KES",
    "reference": "Order #001"
  }'`} />
        <Block lang="json" code={`{
  "success": true,
  "data": {
    "id": "pay_...",
    "depositAddress": "0x4f3d...8a1c",
    "amountUsdc": "3.85",
    "fiatCurrency": "KES",
    "fiatAmount": "500.00",
    "network": "avalanche-c-chain",
    "expiresAt": "2026-06-04T11:15:00Z"
  }
}`} />
      </>
    ),
  },
  {
    n: "4",
    title: "Share the payment link",
    body: (
      <>
        <p className="text-secondary text-sm mb-3">Send the customer to your AvaRamp payment page. They scan the QR code or use WalletConnect to send USDC from any Avalanche wallet.</p>
        <div className="bg-surface border border-border rounded-xl px-4 py-3 font-mono text-xs text-indigo-DEFAULT break-all">
          https://avaramp.vercel.app/pay/<span className="text-muted">&#123;paymentId&#125;</span>
        </div>
        <p className="text-xs text-muted mt-2">No account required for the customer — they just need a crypto wallet with USDC on Avalanche C-Chain.</p>
      </>
    ),
  },
  {
    n: "5",
    title: "Receive settlement automatically",
    body: (
      <>
        <p className="text-secondary text-sm mb-3">Once the USDC lands on-chain, AvaRamp detects it, triggers settlement, and sends KES to your M-Pesa. Your webhook receives a <C>payment.settled</C> event.</p>
        <Block lang="json" code={`{
  "event": "payment.settled",
  "data": {
    "paymentId": "pay_...",
    "amount": "500.00",
    "currency": "KES",
    "transactionId": "OGR000000"
  },
  "timestamp": "2026-06-04T11:17:33Z"
}`} />
        <div className="flex items-center gap-2 mt-3 text-sm text-green-DEFAULT">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          End-to-end in under 3 minutes
        </div>
      </>
    ),
  },
];

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <header className="fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-bg/90 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-tight">AvaRamp</span>
        </Link>
        <span className="text-border">|</span>
        <Link href="/docs" className="text-sm text-secondary hover:text-primary transition-colors">Docs</Link>
        <span className="text-border">/</span>
        <span className="text-sm text-primary">Quickstart</span>
        <div className="ml-auto">
          <Link href="/auth/register" className="text-sm text-indigo-DEFAULT hover:opacity-80 font-medium flex items-center gap-1">
            Get started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT animate-pulse" />
              5 minutes
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight mb-3">Quickstart</h1>
            <p className="text-secondary leading-relaxed">
              From zero to receiving your first USDC payment settled to M-Pesa — in 5 steps.
              No crypto knowledge required for your customers or your payout account.
            </p>
          </div>

          {/* Prerequisites */}
          <div className="bg-amber-dim border border-amber-DEFAULT/20 rounded-xl px-4 py-3 flex gap-3 mb-8 text-sm text-amber-DEFAULT">
            <span className="shrink-0 font-semibold">Before you start:</span>
            <span>You need an M-Pesa till/paybill or phone number to receive settlements, and a crypto wallet with USDC on Avalanche C-Chain for testing.</span>
          </div>

          {/* Steps */}
          <div className="space-y-10">
            {steps.map(({ n, title, body }) => (
              <div key={n} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-DEFAULT flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {n}
                  </div>
                  {parseInt(n) < steps.length && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <h2 className="text-base font-semibold text-primary mb-3">{title}</h2>
                  {body}
                </div>
              </div>
            ))}
          </div>

          {/* Next steps */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { label: "Full API Reference", href: "/docs" },
              { label: "Webhooks guide",     href: "/docs/webhooks" },
              { label: "SDKs",               href: "/docs/sdks" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:border-muted transition-colors text-sm text-secondary hover:text-primary">
                {label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
