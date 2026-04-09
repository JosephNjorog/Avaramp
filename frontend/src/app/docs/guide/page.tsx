"use client";

import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Zap, User, CreditCard,
  Wallet, RefreshCw, Bell, ShieldCheck, Globe,
} from "lucide-react";

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-DEFAULT">
          {n}
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="pb-8 min-w-0">
        <p className="font-semibold text-primary mb-1">{title}</p>
        <div className="text-sm text-secondary leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function StepLast({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        </div>
      </div>
      <div className="pb-2 min-w-0">
        <p className="font-semibold text-primary mb-1">{title}</p>
        <div className="text-sm text-secondary leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-indigo-DEFAULT" />
        </div>
        <p className="font-semibold text-sm text-primary">{title}</p>
      </div>
      <div className="text-sm text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-surface border border-border px-1.5 py-0.5 rounded text-amber-400">
      {children}
    </code>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/docs" className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
            <Zap className="w-4 h-4 text-indigo-DEFAULT" />
            <span className="font-semibold">AvaRamp</span>
            <span className="text-muted">/</span>
            <span>How It Works</span>
          </Link>
          <Link
            href="/auth/register"
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-DEFAULT text-white hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-DEFAULT bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
            <Zap className="w-3 h-3" />
            Complete flow guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
            From onboarding to settlement
          </h1>
          <p className="text-lg text-secondary leading-relaxed max-w-2xl">
            AvaRamp lets merchants accept <strong className="text-primary">USDC on Avalanche</strong> and
            receive funds as local fiat currency (KES, NGN, GHS, TZS, UGX) via mobile money — typically
            within minutes.
          </p>
        </div>

        {/* At-a-glance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          <Card icon={User} title="Merchant">
            Registers, creates a Merchant profile, generates payment links or API calls.
          </Card>
          <Card icon={Wallet} title="Customer">
            Opens the payment link, connects their Avalanche wallet, sends USDC.
          </Card>
          <Card icon={CreditCard} title="Settlement">
            AvaRamp detects the on-chain deposit and pushes fiat via M-Pesa / MTN / Airtel Money.
          </Card>
        </div>

        {/* ── Part 1: Merchant Onboarding ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-DEFAULT" />
            </div>
            <h2 className="text-xl font-bold text-primary">Part 1 — Merchant Onboarding</h2>
          </div>

          <Step n={1} title="Create an account">
            <p>
              Visit{" "}
              <Link href="/auth/register" className="text-indigo-DEFAULT hover:underline">
                /auth/register
              </Link>{" "}
              and fill in your name, email, and password. You must accept the Terms of Service,
              Privacy Policy, and Cookie Policy — these are required for compliance and cannot be
              skipped.
            </p>
            <p>
              On success you receive a <Mono>JWT access token</Mono> stored in{" "}
              <Mono>localStorage</Mono> and used in all subsequent API requests via the{" "}
              <Mono>Authorization: Bearer &lt;token&gt;</Mono> header.
            </p>
          </Step>

          <Step n={2} title="Create your Merchant profile">
            <p>
              After login, go to <strong>Settings → Business</strong> (or call{" "}
              <Mono>POST /merchants</Mono> via the API). Supply:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-secondary">
              <li>
                <strong className="text-primary">businessName</strong> — displayed on payment pages
              </li>
              <li>
                <strong className="text-primary">settlementCurrency</strong> — KES, NGN, GHS, TZS, or UGX
              </li>
              <li>
                <strong className="text-primary">settlementPhone</strong> — M-Pesa / MTN / Airtel mobile money number
              </li>
              <li>
                <strong className="text-primary">webhookUrl</strong> — optional HTTPS endpoint for payment event callbacks
              </li>
            </ul>
            <p>
              The API returns a <Mono>merchantId</Mono> (UUID). This is your permanent business
              identifier — keep it safe. It is <em>not</em> the same as your user ID.
            </p>
            <div className="bg-amber-500/8 border border-amber-500/20 text-amber-300 rounded-lg px-4 py-3 text-sm mt-2">
              <strong>merchantId vs userId</strong> — your <Mono>userId</Mono> identifies your
              login account. Your <Mono>merchantId</Mono> identifies your business and is what
              customers' payments are linked to. One user can own one merchant profile.
            </div>
          </Step>

          <Step n={3} title="Configure your webhook (optional but recommended)">
            <p>
              Set a public HTTPS URL under Settings. AvaRamp will POST a signed JSON payload to
              this URL whenever a payment status changes (PENDING → DETECTED → SETTLED or FAILED).
            </p>
            <p>
              Verify the signature by comparing the <Mono>X-AvaRamp-Signature</Mono> header against{" "}
              <Mono>HMAC-SHA256(secret, rawBody)</Mono>. Your webhook secret is shown in Settings.
            </p>
          </Step>

          <StepLast n={4} title="Generate an API key (programmatic integration)">
            <p>
              For server-side integrations, use the{" "}
              <Mono>POST /auth/login</Mono> response token as a bearer token. Future versions will
              support dedicated API key management.
            </p>
          </StepLast>
        </section>

        <div className="border-t border-border mb-14" />

        {/* ── Part 2: Creating a Payment ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-primary">Part 2 — Creating a Payment</h2>
          </div>

          <Step n={1} title="Create a payment request">
            <p>
              Either from the dashboard (<strong>New payment</strong> button) or via the API:
            </p>
            <div className="bg-surface border border-border rounded-lg p-3 font-mono text-xs overflow-x-auto mt-2">
              <span className="text-green-400">POST</span>{" "}
              <span className="text-primary">/payments</span>
              {"\n"}
              <span className="text-muted">
                {"{\n"}
                {"  "}
                <span className="text-amber-400">&quot;amountUsdc&quot;</span>: 50.00,{"\n"}
                {"  "}
                <span className="text-amber-400">&quot;fiatCurrency&quot;</span>: &quot;KES&quot;,{"\n"}
                {"  "}
                <span className="text-amber-400">&quot;phone&quot;</span>: &quot;+254712345678&quot;,{"\n"}
                {"  "}
                <span className="text-amber-400">&quot;reference&quot;</span>: &quot;ORDER-001&quot;{"\n"}
                {"}"}
              </span>
            </div>
            <p className="mt-2">
              The response includes a <Mono>paymentId</Mono>, a <Mono>depositAddress</Mono> (Avalanche
              C-Chain wallet), and a <Mono>paymentUrl</Mono> you can send to your customer.
            </p>
          </Step>

          <Step n={2} title="Share the payment link">
            <p>
              Send the <Mono>paymentUrl</Mono> to your customer via WhatsApp, email, SMS, or embed
              it in your checkout flow. The link is unique per payment and expires after the
              configured timeout (default 24 hours).
            </p>
          </Step>

          <StepLast n={3} title="Payment link stays PENDING">
            <p>
              The payment sits in <Mono>PENDING</Mono> status until the customer sends the exact
              USDC amount to the deposit address. The dashboard and webhooks will update in real time.
            </p>
          </StepLast>
        </section>

        <div className="border-t border-border mb-14" />

        {/* ── Part 3: Customer Payment ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-primary">Part 3 — Customer Payment</h2>
          </div>

          <Step n={1} title="Customer opens the payment link">
            <p>
              The payment page shows the USDC amount due, the destination address, and a QR code.
              The customer can pay in two ways:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong className="text-primary">Connect wallet</strong> — MetaMask, Core, Rainbow
                or any WalletConnect-compatible wallet on Avalanche C-Chain
              </li>
              <li>
                <strong className="text-primary">Manual transfer</strong> — copy the deposit address
                and send USDC from any exchange or wallet
              </li>
            </ul>
          </Step>

          <Step n={2} title="Customer sends USDC on Avalanche C-Chain">
            <p>
              The customer sends <strong>exactly</strong> the required USDC amount (
              <Mono>0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E</Mono> is USDC on Avalanche mainnet)
              to the merchant's unique deposit address.
            </p>
            <div className="bg-blue-500/8 border border-blue-500/20 text-blue-300 rounded-lg px-4 py-3 text-sm">
              The deposit address is a dedicated wallet generated for this specific payment — not
              the merchant's personal wallet. This allows exact amount matching.
            </div>
          </Step>

          <StepLast n={3} title="On-chain confirmation">
            <p>
              AvaRamp's blockchain listener monitors the deposit address. Once the transaction
              receives sufficient confirmations (typically 1–3 blocks, ~3–9 seconds on Avalanche),
              the payment moves to <Mono>DETECTED</Mono> status and settlement begins automatically.
            </p>
          </StepLast>
        </section>

        <div className="border-t border-border mb-14" />

        {/* ── Part 4: Settlement ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-primary">Part 4 — Fiat Settlement</h2>
          </div>

          <Step n={1} title="USDC → fiat conversion">
            <p>
              Once USDC is confirmed on-chain, AvaRamp converts the USDC amount to the merchant's
              chosen fiat currency (KES, NGN, GHS, TZS, or UGX) at the current market rate, minus
              a small platform fee.
            </p>
          </Step>

          <Step n={2} title="Mobile money disbursement">
            <p>
              The converted fiat is pushed to the merchant's registered mobile money number:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-primary">Kenya (KES)</strong> — M-Pesa (Safaricom B2C API)</li>
              <li><strong className="text-primary">Nigeria (NGN)</strong> — MTN Mobile Money</li>
              <li><strong className="text-primary">Ghana (GHS)</strong> — MTN MoMo / Airtel Money</li>
              <li><strong className="text-primary">Tanzania (TZS)</strong> — M-Pesa TZ / Airtel</li>
              <li><strong className="text-primary">Uganda (UGX)</strong> — MTN MoMo / Airtel Money</li>
            </ul>
          </Step>

          <Step n={3} title="Payment marked SETTLED">
            <p>
              On successful mobile money push, the payment status updates to <Mono>SETTLED</Mono>.
              The dashboard reflects this instantly. If the mobile money push fails, AvaRamp retries
              automatically (up to 3 times) before marking the payment <Mono>FAILED</Mono>.
            </p>
          </Step>

          <StepLast n={4} title="Webhook fired + ledger updated">
            <p>
              A <Mono>payment.settled</Mono> webhook event is delivered to your configured URL.
              The payment appears in the merchant's ledger with the USDC amount, fiat equivalent,
              exchange rate, fees, and timestamp.
            </p>
          </StepLast>
        </section>

        <div className="border-t border-border mb-14" />

        {/* ── Part 5: Webhooks & Events ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-primary">Part 5 — Webhooks & Events</h2>
          </div>

          <p className="text-secondary mb-6">
            AvaRamp fires a signed HTTP POST to your webhook URL at each payment lifecycle stage.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border mb-6">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-surface border-b border-border text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Event</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Trigger</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["payment.created",  "Payment request created by merchant", "PENDING"],
                  ["payment.detected", "USDC confirmed on Avalanche",         "DETECTED"],
                  ["payment.settled",  "Fiat successfully sent via mobile money", "SETTLED"],
                  ["payment.failed",   "Settlement failed after all retries", "FAILED"],
                  ["payment.expired",  "Payment not funded before timeout",   "EXPIRED"],
                ].map(([event, trigger, status]) => (
                  <tr key={event} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-DEFAULT">{event}</td>
                    <td className="px-4 py-3 text-secondary">{trigger}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-surface border border-border px-1.5 py-0.5 rounded text-amber-400">
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-secondary">
            Verify every webhook by checking the{" "}
            <Mono>X-AvaRamp-Signature</Mono> header:{" "}
            <Mono>HMAC-SHA256(webhookSecret, rawRequestBody)</Mono>. Reject requests where the
            signature does not match.
          </p>
        </section>

        <div className="border-t border-border mb-14" />

        {/* ── Part 6: Security & Compliance ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-primary">Part 6 — Security & Compliance</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "JWT Authentication",
                body: "All API requests require a bearer token obtained at login. Tokens expire and must be refreshed.",
              },
              {
                title: "Encrypted secrets",
                body: "Sensitive fields (API keys, webhook secrets) are AES-256-GCM encrypted at rest in the database.",
              },
              {
                title: "On-chain auditability",
                body: "Every USDC transfer is permanently recorded on Avalanche C-Chain. Anyone can verify transactions using SnowTrace.",
              },
              {
                title: "Kenya DPA 2019 / POCAMLA",
                body: "AvaRamp is designed to comply with Kenyan data protection law and anti-money laundering regulations. Consent records are stored with IP and timestamp.",
              },
              {
                title: "Dedicated deposit addresses",
                body: "Each payment gets a unique deposit wallet — your main merchant wallet is never exposed to customers.",
              },
              {
                title: "Webhook signature verification",
                body: "All outbound webhooks are HMAC-SHA256 signed. You must verify the signature before processing any event.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-primary mb-1">{title}</p>
                <p className="text-sm text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border mb-14" />

        {/* ── Summary flow diagram ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Globe className="w-4 h-4 text-indigo-DEFAULT" />
            </div>
            <h2 className="text-xl font-bold text-primary">Full flow at a glance</h2>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 min-w-[540px]">
              {[
                { label: "Merchant", sub: "registers + creates\nmerchant profile", color: "bg-indigo-500/15 border-indigo-500/30 text-indigo-DEFAULT" },
                null,
                { label: "Payment created", sub: "POST /payments\nreturns paymentUrl", color: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
                null,
                { label: "Customer pays", sub: "sends USDC on\nAvalanche C-Chain", color: "bg-purple-500/15 border-purple-500/30 text-purple-400" },
                null,
                { label: "On-chain detected", sub: "1–3 block confirmations\n~3–9 seconds", color: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
                null,
                { label: "Fiat settled", sub: "KES/NGN/GHS/TZS/UGX\nvia mobile money", color: "bg-green-500/15 border-green-500/30 text-green-400" },
              ].map((item, i) =>
                item === null ? (
                  <ArrowRight key={i} className="w-5 h-5 text-muted shrink-0 mx-2 hidden sm:block" />
                ) : (
                  <div
                    key={i}
                    className={`border rounded-xl px-3 py-2.5 text-center shrink-0 ${item.color}`}
                    style={{ minWidth: 110 }}
                  >
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5 whitespace-pre-line">{item.sub}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl font-bold text-primary mb-2">Ready to get started?</h3>
          <p className="text-secondary mb-5 text-sm">
            Create your merchant account and accept your first USDC payment in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-DEFAULT text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Create merchant account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-secondary hover:text-primary hover:border-indigo-DEFAULT/50 transition-all"
            >
              API reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
