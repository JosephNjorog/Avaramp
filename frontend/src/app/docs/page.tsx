"use client";

import Link from "next/link";
import { Zap, ExternalLink, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import DocsSidebar from "./components/DocsSidebar";
import CodeBlock from "./components/CodeBlock";
import EndpointBadge from "./components/EndpointBadge";

// ── Small helpers ─────────────────────────────────────────────────────────────

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} data-section={id} className={`scroll-mt-20 ${className}`}>
      {children}
    </section>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-primary tracking-tight mb-3">{children}</h1>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-primary mt-10 mb-3">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-primary mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-secondary leading-relaxed mb-4">{children}</p>;
}

function Callout({ type = "info", children }: { type?: "info" | "warning" | "success"; children: React.ReactNode }) {
  const styles = {
    info:    "bg-blue-500/8 border-blue-500/20 text-blue-300",
    warning: "bg-amber-500/8 border-amber-500/20 text-amber-300",
    success: "bg-green-500/8 border-green-500/20 text-green-300",
  };
  const Icon = type === "success" ? CheckCircle2 : type === "warning" ? AlertCircle : Info;
  return (
    <div className={`flex gap-3 border rounded-lg px-4 py-3 mb-4 text-sm ${styles[type]}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function ParamRow({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 pr-4 font-mono text-xs align-top">
        <span className="text-primary">{name}</span>
        {required && <span className="ml-1.5 text-[10px] text-red-400 font-sans">required</span>}
      </td>
      <td className="py-2.5 pr-4 align-top">
        <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{type}</span>
      </td>
      <td className="py-2.5 text-sm text-secondary align-top">{desc}</td>
    </tr>
  );
}

function ParamTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg overflow-x-auto mb-6">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="text-left py-2 px-4 text-xs text-muted font-medium">Parameter</th>
            <th className="text-left py-2 px-4 text-xs text-muted font-medium">Type</th>
            <th className="text-left py-2 px-4 text-xs text-muted font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border px-4">
          <tr><td colSpan={3} className="px-4">{children}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function ParamTableRows({ rows }: { rows: { name: string; type: string; required?: boolean; desc: string }[] }) {
  return (
    <div className="border border-border rounded-lg overflow-x-auto mb-6">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="text-left py-2 px-4 text-xs text-muted font-medium">Parameter</th>
            <th className="text-left py-2 px-4 text-xs text-muted font-medium">Type</th>
            <th className="text-left py-2 px-4 text-xs text-muted font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border last:border-0">
              <td className="py-2.5 px-4 font-mono text-xs align-top">
                <span className="text-primary">{r.name}</span>
                {r.required && <span className="ml-1.5 text-[10px] text-red-400 font-sans">required</span>}
              </td>
              <td className="py-2.5 px-4 align-top">
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{r.type}</span>
              </td>
              <td className="py-2.5 px-4 text-sm text-secondary align-top">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const BASE = "https://api.avaramp.com/v1";

  return (
    <div className="min-h-screen bg-bg text-primary">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-bg/90 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm tracking-tight">AvaRamp</span>
        </Link>
        <span className="text-border">|</span>
        <span className="text-sm text-secondary">API Reference</span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/auth/register" className="text-sm text-indigo-DEFAULT hover:text-indigo-dim transition-colors font-medium flex items-center gap-1">
            Get API key <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/dashboard" className="text-sm text-secondary hover:text-primary transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <DocsSidebar />

      {/* Main content */}
      <main className="lg:pl-60 pt-14 overflow-x-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-16">

          {/* ── Overview ── */}
          <Section id="overview">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT animate-pulse" />
              v1 — Live
            </div>
            <H1>AvaRamp API Reference</H1>
            <P>
              AvaRamp is a crypto-to-fiat payment gateway that lets your business accept USDC on
              Avalanche C-Chain and settle directly to mobile money accounts — M-Pesa (KES), MTN
              Mobile Money (NGN/GHS/UGX), and Airtel Money (TZS/UGX) — within minutes, with no
              bank account required.
            </P>
            <P>
              The REST API follows standard HTTP conventions. All request and response bodies use
              JSON. Errors return machine-readable codes alongside human-readable messages.
            </P>

            <div className="grid sm:grid-cols-3 gap-3 my-6">
              {[
                { label: "Base URL",       value: BASE },
                { label: "Auth",           value: "Bearer JWT" },
                { label: "Content-Type",   value: "application/json" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface border border-border rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">{label}</p>
                  <p className="font-mono text-xs text-primary break-all">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "USDC on Avalanche", desc: "Fast finality, ~$0.01 gas per transaction" },
                { title: "M-Pesa & MTN", desc: "Direct B2C payouts to 500M+ mobile wallets" },
                { title: "Real-time webhooks", desc: "HMAC-signed events for every state change" },
                { title: "Idempotent by design", desc: "Safe retries with Idempotency-Key header" },
              ].map(({ title, desc }) => (
                <div key={title} className="border border-border rounded-lg p-4 bg-surface">
                  <p className="text-sm font-medium text-primary mb-1">{title}</p>
                  <p className="text-xs text-secondary">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Authentication ── */}
          <Section id="authentication">
            <H2>Authentication</H2>
            <P>
              All API requests require a <code className="text-indigo-DEFAULT bg-indigo-dim px-1.5 py-0.5 rounded text-xs font-mono">Bearer</code> JWT token
              in the <code className="text-indigo-DEFAULT bg-indigo-dim px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code> header.
              Obtain your token by registering an account and calling <code className="text-xs font-mono text-secondary">POST /auth/login</code>.
            </P>
            <CodeBlock
              language="bash"
              code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            />
            <Callout type="warning">
              Tokens expire after <strong>7 days</strong>. Re-authenticate by calling{" "}
              <code className="text-xs font-mono">POST /auth/login</code> and storing the new token.
              Never expose your token in client-side code or public repositories.
            </Callout>
          </Section>

          {/* ── Quickstart ── */}
          <Section id="quickstart">
            <H2>Quickstart — your first payment in 5 minutes</H2>
            <P>Follow these steps to go from zero to receiving your first USDC payment that settles to M-Pesa.</P>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-DEFAULT flex items-center justify-center text-white text-xs font-bold">1</div>
                <div className="flex-1">
                  <H3>Create an account</H3>
                  <CodeBlock
                    code={`curl -X POST ${BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@business.com",
    "password": "super-secret-password",
    "phone": "+254700000000"
  }'`}
                  />
                  <CodeBlock
                    language="json"
                    filename="Response 201"
                    code={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_01hx...",
    "email": "you@business.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-DEFAULT flex items-center justify-center text-white text-xs font-bold">2</div>
                <div className="flex-1">
                  <H3>Register your business as a merchant</H3>
                  <CodeBlock
                    code={`curl -X POST ${BASE}/merchants \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Ltd",
    "phone": "+254700000000",
    "webhookUrl": "https://yoursite.com/webhooks/avaramp"
  }'`}
                  />
                  <CodeBlock
                    language="json"
                    filename="Response 201"
                    code={`{
  "id": "mer_01hx...",
  "name": "Acme Ltd",
  "webhookUrl": "https://yoursite.com/webhooks/avaramp",
  "webhookSecret": "whsec_a1b2c3d4e5f6...",
  "walletAddress": "0xabc123...",
  "createdAt": "2024-01-15T10:35:00Z"
}`}
                  />
                  <Callout type="success">
                    Save the <strong>webhookSecret</strong> — you need it to verify incoming webhook signatures.
                    It is only shown once.
                  </Callout>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-DEFAULT flex items-center justify-center text-white text-xs font-bold">3</div>
                <div className="flex-1">
                  <H3>Create a payment request</H3>
                  <CodeBlock
                    code={`curl -X POST ${BASE}/payments \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order_12345" \\
  -d '{
    "merchantId": "mer_01hx...",
    "amount": "50.00",
    "currency": "KES",
    "phone": "+254712345678",
    "reference": "Order #1234"
  }'`}
                  />
                  <CodeBlock
                    language="json"
                    filename="Response 201"
                    code={`{
  "id": "pay_01hx...",
  "status": "PENDING",
  "depositAddress": "0x1a2b3c4d...",
  "amountUsdc": "0.383",
  "fiatAmount": "50.00",
  "fiatCurrency": "KES",
  "expiresAt": "2024-01-15T11:05:00Z",
  "createdAt": "2024-01-15T10:40:00Z"
}`}
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-DEFAULT flex items-center justify-center text-white text-xs font-bold">4</div>
                <div className="flex-1">
                  <H3>Customer sends USDC</H3>
                  <P>
                    Show the customer the <code className="text-xs font-mono text-secondary">depositAddress</code> and{" "}
                    <code className="text-xs font-mono text-secondary">amountUsdc</code>. AvaRamp monitors the Avalanche
                    chain in real time. When the deposit is confirmed, the payment moves to{" "}
                    <code className="text-xs font-mono text-green-400">CONFIRMED</code>.
                  </P>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-DEFAULT flex items-center justify-center text-white text-xs font-bold">5</div>
                <div className="flex-1">
                  <H3>M-Pesa payout fires automatically</H3>
                  <P>
                    AvaRamp's settlement engine converts USDC to the fiat amount at the locked exchange rate
                    and issues a Daraja B2C payout to the customer's phone number. You receive a webhook
                    when the status changes to <code className="text-xs font-mono text-green-400">SETTLED</code>.
                  </P>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Environments ── */}
          <Section id="environments">
            <H2>Environments</H2>
            <ParamTableRows rows={[
              { name: "Production",  type: "https://api.avaramp.com/v1",     desc: "Live traffic. Real USDC, real M-Pesa payouts." },
              { name: "Sandbox",     type: "https://sandbox.avaramp.com/v1", desc: "Safe testing. Fake USDC, simulated M-Pesa callbacks." },
            ]} />
            <Callout type="info">
              In sandbox mode, deposits are auto-confirmed after 10 seconds. Use any Fuji testnet USDC to test
              the full flow without spending real money.
            </Callout>
          </Section>

          {/* ── Payment flow ── */}
          <Section id="payments-flow">
            <H2>Payment flow</H2>
            <P>Every payment moves through these states:</P>
            <div className="flex flex-wrap gap-2 items-center mb-6 font-mono text-xs">
              {["PENDING", "→", "CONFIRMED", "→", "SETTLED"].map((s, i) => (
                <span key={i} className={s === "→" ? "text-muted" : "px-2 py-1 rounded border " + (
                  s === "PENDING"   ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                  s === "CONFIRMED" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
                  "border-green-500/30 bg-green-500/10 text-green-400"
                )}>{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 items-center mb-4 font-mono text-xs">
              <span className="text-muted text-sm">Also possible:</span>
              {["REFUNDED", "FAILED"].map((s) => (
                <span key={s} className="px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-400">{s}</span>
              ))}
            </div>

            <ParamTableRows rows={[
              { name: "PENDING",   type: "status", desc: "Payment created, awaiting USDC deposit on-chain." },
              { name: "CONFIRMED", type: "status", desc: "USDC deposit detected and confirmed (≥1 block). Settlement queued." },
              { name: "SETTLED",   type: "status", desc: "Fiat payout delivered to customer's mobile money wallet." },
              { name: "REFUNDED",  type: "status", desc: "USDC returned to depositor. No fiat was sent." },
              { name: "FAILED",    type: "status", desc: "Settlement failed after retries. Contact support." },
            ]} />
          </Section>

          {/* ── Webhooks guide ── */}
          <Section id="webhooks-guide">
            <H2>Webhooks</H2>
            <P>
              AvaRamp sends a signed HTTP POST to your <code className="text-xs font-mono text-secondary">webhookUrl</code> whenever
              a payment changes state. Always verify the signature before processing.
            </P>

            <H3>Webhook payload</H3>
            <CodeBlock
              language="json"
              filename="POST → your-webhook-url"
              code={`{
  "event": "payment.settled",
  "data": {
    "id": "pay_01hx...",
    "status": "SETTLED",
    "amountUsdc": "0.383",
    "fiatAmount": "50.00",
    "fiatCurrency": "KES",
    "phone": "+254712345678",
    "reference": "Order #1234",
    "settledAt": "2024-01-15T10:55:00Z"
  },
  "timestamp": "2024-01-15T10:55:01Z"
}`}
            />

            <H3>Event types</H3>
            <ParamTableRows rows={[
              { name: "payment.created",   type: "event", desc: "Payment record created. Awaiting USDC deposit." },
              { name: "payment.confirmed", type: "event", desc: "USDC received on-chain. Settlement starting." },
              { name: "payment.settled",   type: "event", desc: "Fiat delivered. Transaction complete." },
              { name: "payment.refunded",  type: "event", desc: "USDC refunded to depositor." },
              { name: "payment.failed",    type: "event", desc: "Could not complete settlement after retries." },
            ]} />

            <H3>Signature verification</H3>
            <P>
              Every webhook includes an <code className="text-xs font-mono text-secondary">X-AvaRamp-Signature</code> header
              containing an HMAC-SHA256 hash of the raw request body signed with your{" "}
              <code className="text-xs font-mono text-secondary">webhookSecret</code>.
            </P>
            <CodeBlock
              filename="Signature header"
              code={`X-AvaRamp-Signature: sha256=a1b2c3d4e5f6...`}
            />
          </Section>

          {/* ── Idempotency ── */}
          <Section id="idempotency">
            <H2>Idempotency</H2>
            <P>
              All mutating requests (<code className="text-xs font-mono text-secondary">POST</code>) accept an{" "}
              <code className="text-xs font-mono text-secondary">Idempotency-Key</code> header. If you send the same
              key twice within 24 hours, the second request returns the cached response from the first — no
              duplicate payment is created.
            </P>
            <CodeBlock
              code={`curl -X POST ${BASE}/payments \\
  -H "Idempotency-Key: your-unique-key-per-order" \\
  ...`}
            />
            <Callout type="info">
              Use your internal order ID as the idempotency key. This makes network retries completely safe.
            </Callout>
          </Section>

          {/* ── Errors ── */}
          <Section id="errors">
            <H2>Errors & status codes</H2>
            <P>
              AvaRamp uses standard HTTP status codes. Error bodies always include a machine-readable{" "}
              <code className="text-xs font-mono text-secondary">code</code> and a human-readable{" "}
              <code className="text-xs font-mono text-secondary">message</code>.
            </P>
            <CodeBlock
              language="json"
              filename="Error response"
              code={`{
  "error": "VALIDATION_ERROR",
  "message": "amount must be a positive number",
  "status": 400
}`}
            />
            <ParamTableRows rows={[
              { name: "200 OK",                  type: "HTTP", desc: "Request succeeded." },
              { name: "201 Created",             type: "HTTP", desc: "Resource created (payments, merchants)." },
              { name: "400 Bad Request",         type: "HTTP", desc: "Validation error. Check the message field." },
              { name: "401 Unauthorized",        type: "HTTP", desc: "Missing or invalid Bearer token." },
              { name: "404 Not Found",           type: "HTTP", desc: "Resource does not exist." },
              { name: "409 Conflict",            type: "HTTP", desc: "Duplicate resource (email already registered)." },
              { name: "422 Unprocessable",       type: "HTTP", desc: "Business logic error (e.g. merchant inactive)." },
              { name: "429 Too Many Requests",   type: "HTTP", desc: "Rate limit exceeded. Default: 100 req/min." },
              { name: "500 Internal Server Error", type: "HTTP", desc: "Something went wrong on our side. Retry with backoff." },
            ]} />
          </Section>

          {/* ─────────────── API Reference ─────────────── */}
          <div className="border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">API Reference</p>
            <h2 className="text-2xl font-bold text-primary">Endpoints</h2>
          </div>

          {/* POST /auth/register */}
          <Section id="auth-register">
            <H2>Register</H2>
            <EndpointBadge method="POST" path="/auth/register" />
            <P>Create a new AvaRamp account. Returns a JWT token valid for 7 days.</P>
            <H3>Request body</H3>
            <ParamTableRows rows={[
              { name: "email",    type: "string", required: true,  desc: "Unique email address for the account." },
              { name: "password", type: "string", required: true,  desc: "Minimum 8 characters." },
              { name: "phone",    type: "string", required: false, desc: "International format e.g. +254712345678." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl -X POST ${BASE}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "merchant@example.com",
    "password": "strongpassword123",
    "phone": "+254712345678"
  }'` },
              { label: "Node.js", code:
`const res = await fetch('${BASE}/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'merchant@example.com',
    password: 'strongpassword123',
    phone: '+254712345678',
  }),
});
const { token, user } = await res.json();` },
              { label: "Python", code:
`import requests

res = requests.post('${BASE}/auth/register', json={
    'email': 'merchant@example.com',
    'password': 'strongpassword123',
    'phone': '+254712345678',
})
data = res.json()
token = data['token']` },
            ]} />
            <CodeBlock language="json" filename="Response 201" code={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_01hx...",
    "email": "merchant@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`} />
          </Section>

          {/* POST /auth/login */}
          <Section id="auth-login">
            <H2>Login</H2>
            <EndpointBadge method="POST" path="/auth/login" />
            <P>Authenticate with email and password. Returns a fresh JWT token.</P>
            <H3>Request body</H3>
            <ParamTableRows rows={[
              { name: "email",    type: "string", required: true, desc: "Registered email address." },
              { name: "password", type: "string", required: true, desc: "Account password." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl -X POST ${BASE}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"merchant@example.com","password":"strongpassword123"}'` },
              { label: "Node.js", code:
`const res = await fetch('${BASE}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'merchant@example.com', password: 'strongpassword123' }),
});
const { token } = await res.json();
// Store token for subsequent requests` },
            ]} />
            <CodeBlock language="json" filename="Response 200" code={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "usr_01hx...", "email": "merchant@example.com" }
}`} />
          </Section>

          {/* POST /payments */}
          <Section id="payments-create">
            <H2>Create a payment</H2>
            <EndpointBadge method="POST" path="/payments" />
            <P>
              Create a new USDC payment request. Returns a deposit address for the payer
              and the USDC amount at the current exchange rate.
            </P>
            <Callout type="info">
              Include an <strong>Idempotency-Key</strong> header (your internal order ID) to safely retry
              on network failures without creating duplicate payments.
            </Callout>
            <H3>Request body</H3>
            <ParamTableRows rows={[
              { name: "merchantId", type: "string",  required: true,  desc: "Your merchant ID from POST /merchants." },
              { name: "amount",     type: "string",  required: true,  desc: "Fiat amount as a decimal string e.g. \"50.00\"." },
              { name: "currency",   type: "string",  required: true,  desc: "Fiat currency: KES, NGN, GHS, TZS, or UGX." },
              { name: "phone",      type: "string",  required: true,  desc: "Recipient's mobile money number in international format." },
              { name: "reference",  type: "string",  required: false, desc: "Your internal reference e.g. \"Order #1234\"." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl -X POST ${BASE}/payments \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order_12345" \\
  -d '{
    "merchantId": "mer_01hx...",
    "amount": "2500.00",
    "currency": "KES",
    "phone": "+254712345678",
    "reference": "Order #1234"
  }'` },
              { label: "Node.js", code:
`const res = await fetch('${BASE}/payments', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json',
    'Idempotency-Key': 'order_12345',
  },
  body: JSON.stringify({
    merchantId: 'mer_01hx...',
    amount: '2500.00',
    currency: 'KES',
    phone: '+254712345678',
    reference: 'Order #1234',
  }),
});
const payment = await res.json();
console.log(payment.depositAddress); // show to customer` },
              { label: "Python", code:
`import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json',
    'Idempotency-Key': 'order_12345',
}
payload = {
    'merchantId': 'mer_01hx...',
    'amount': '2500.00',
    'currency': 'KES',
    'phone': '+254712345678',
    'reference': 'Order #1234',
}
payment = requests.post('${BASE}/payments', json=payload, headers=headers).json()
deposit_address = payment['depositAddress']` },
              { label: "PHP", code:
`$ch = curl_init('${BASE}/payments');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => json_encode([
    'merchantId' => 'mer_01hx...',
    'amount'     => '2500.00',
    'currency'   => 'KES',
    'phone'      => '+254712345678',
    'reference'  => 'Order #1234',
  ]),
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Idempotency-Key: order_12345',
  ],
]);
$payment = json_decode(curl_exec($ch), true);
$depositAddress = $payment['depositAddress'];` },
            ]} />
            <CodeBlock language="json" filename="Response 201" code={`{
  "id": "pay_01hx...",
  "status": "PENDING",
  "depositAddress": "0x1a2b3c4d5e6f...",
  "amountUsdc": "19.23",
  "fiatAmount": "2500.00",
  "fiatCurrency": "KES",
  "phone": "+254712345678",
  "reference": "Order #1234",
  "expiresAt": "2024-01-15T11:10:00Z",
  "createdAt": "2024-01-15T10:40:00Z"
}`} />
          </Section>

          {/* GET /payments/:id */}
          <Section id="payments-get">
            <H2>Get a payment</H2>
            <EndpointBadge method="GET" path="/payments/:id" />
            <P>Retrieve a single payment by its ID. Use this to poll status if you're not using webhooks.</P>
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl ${BASE}/payments/pay_01hx... \\
  -H "Authorization: Bearer YOUR_TOKEN"` },
              { label: "Node.js", code:
`const res = await fetch(\`${BASE}/payments/\${paymentId}\`, {
  headers: { 'Authorization': \`Bearer \${token}\` },
});
const payment = await res.json();` },
            ]} />
            <CodeBlock language="json" filename="Response 200" code={`{
  "id": "pay_01hx...",
  "status": "SETTLED",
  "amountUsdc": "19.23",
  "fiatAmount": "2500.00",
  "fiatCurrency": "KES",
  "phone": "+254712345678",
  "reference": "Order #1234",
  "createdAt": "2024-01-15T10:40:00Z",
  "updatedAt": "2024-01-15T10:55:00Z"
}`} />
          </Section>

          {/* GET /payments */}
          <Section id="payments-list">
            <H2>List payments</H2>
            <EndpointBadge method="GET" path="/payments" />
            <P>Returns a paginated list of all payments for the authenticated merchant.</P>
            <H3>Query parameters</H3>
            <ParamTableRows rows={[
              { name: "status",     type: "string",  desc: "Filter by status: PENDING, CONFIRMED, SETTLED, REFUNDED, FAILED." },
              { name: "merchantId", type: "string",  desc: "Filter by a specific merchant ID." },
              { name: "limit",      type: "integer", desc: "Number of results per page. Default: 20, max: 100." },
              { name: "offset",     type: "integer", desc: "Pagination offset. Default: 0." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl "${BASE}/payments?status=SETTLED&limit=20&offset=0" \\
  -H "Authorization: Bearer YOUR_TOKEN"` },
              { label: "Node.js", code:
`const params = new URLSearchParams({ status: 'SETTLED', limit: '20', offset: '0' });
const res = await fetch(\`${BASE}/payments?\${params}\`, {
  headers: { 'Authorization': \`Bearer \${token}\` },
});
const { data, total } = await res.json();` },
            ]} />
            <CodeBlock language="json" filename="Response 200" code={`{
  "data": [
    {
      "id": "pay_01hx...",
      "status": "SETTLED",
      "amountUsdc": "19.23",
      "fiatAmount": "2500.00",
      "fiatCurrency": "KES",
      "createdAt": "2024-01-15T10:40:00Z"
    }
  ],
  "total": 142,
  "limit": 20,
  "offset": 0
}`} />
          </Section>

          {/* GET /payments/analytics */}
          <Section id="payments-analytics">
            <H2>Payment analytics</H2>
            <EndpointBadge method="GET" path="/payments/analytics" />
            <P>Returns aggregate statistics and 7-day daily USDC volume for your account.</P>
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl ${BASE}/payments/analytics \\
  -H "Authorization: Bearer YOUR_TOKEN"` },
            ]} />
            <CodeBlock language="json" filename="Response 200" code={`{
  "total":   142,
  "settled":  98,
  "pending":  31,
  "failed":   13,
  "dailyVolume": [
    { "date": "2024-01-09", "amountUsdc": "1243.50" },
    { "date": "2024-01-10", "amountUsdc": "980.00" },
    { "date": "2024-01-11", "amountUsdc": "2100.75" },
    { "date": "2024-01-12", "amountUsdc": "1875.00" },
    { "date": "2024-01-13", "amountUsdc": "3200.25" },
    { "date": "2024-01-14", "amountUsdc": "2650.50" },
    { "date": "2024-01-15", "amountUsdc": "1890.00" }
  ]
}`} />
          </Section>

          {/* POST /merchants */}
          <Section id="merchants-create">
            <H2>Create a merchant</H2>
            <EndpointBadge method="POST" path="/merchants" />
            <P>Register your business as a merchant to start creating payments.</P>
            <H3>Request body</H3>
            <ParamTableRows rows={[
              { name: "name",       type: "string", required: true,  desc: "Business / trading name." },
              { name: "phone",      type: "string", required: false, desc: "Business phone number." },
              { name: "webhookUrl", type: "string", required: false, desc: "HTTPS URL where AvaRamp will send payment events." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl -X POST ${BASE}/merchants \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Electronics",
    "phone": "+254712345678",
    "webhookUrl": "https://acme.co/webhooks/avaramp"
  }'` },
              { label: "Node.js", code:
`const res = await fetch('${BASE}/merchants', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Acme Electronics',
    phone: '+254712345678',
    webhookUrl: 'https://acme.co/webhooks/avaramp',
  }),
});
const merchant = await res.json();
// Store merchant.id and merchant.webhookSecret safely` },
            ]} />
            <CodeBlock language="json" filename="Response 201" code={`{
  "id": "mer_01hx...",
  "name": "Acme Electronics",
  "phone": "+254712345678",
  "webhookUrl": "https://acme.co/webhooks/avaramp",
  "webhookSecret": "whsec_a1b2c3d4e5f6...",
  "walletAddress": "0xabc123...",
  "createdAt": "2024-01-15T10:35:00Z"
}`} />
          </Section>

          {/* GET /merchants/:id */}
          <Section id="merchants-get">
            <H2>Get a merchant</H2>
            <EndpointBadge method="GET" path="/merchants/:id" />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl ${BASE}/merchants/mer_01hx... \\
  -H "Authorization: Bearer YOUR_TOKEN"` },
            ]} />
          </Section>

          {/* POST /settlements */}
          <Section id="settlements">
            <H2>Trigger settlement</H2>
            <EndpointBadge method="POST" path="/settlements" />
            <P>
              Manually trigger a fiat settlement for a confirmed payment. Normally called automatically
              by AvaRamp's settlement worker — use this endpoint to re-trigger failed settlements.
            </P>
            <ParamTableRows rows={[
              { name: "paymentId", type: "string", required: true, desc: "ID of a CONFIRMED payment to settle." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl -X POST ${BASE}/settlements \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"paymentId":"pay_01hx..."}'` },
            ]} />
          </Section>

          {/* GET /users/me */}
          <Section id="users-me">
            <H2>Get current user</H2>
            <EndpointBadge method="GET" path="/users/me" />
            <P>Returns the profile of the authenticated user.</P>
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl ${BASE}/users/me \\
  -H "Authorization: Bearer YOUR_TOKEN"` },
            ]} />
            <CodeBlock language="json" filename="Response 200" code={`{
  "id": "usr_01hx...",
  "email": "merchant@example.com",
  "phone": "+254712345678",
  "createdAt": "2024-01-15T10:30:00Z"
}`} />
          </Section>

          {/* PATCH /users/me */}
          <Section id="users-update">
            <H2>Update profile</H2>
            <EndpointBadge method="PATCH" path="/users/me" />
            <ParamTableRows rows={[
              { name: "email", type: "string", desc: "New email address. Must be unique." },
              { name: "phone", type: "string", desc: "New phone number in international format." },
            ]} />
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl -X PATCH ${BASE}/users/me \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"+254799000000"}'` },
            ]} />
          </Section>

          {/* GET /users/me/webhooks */}
          <Section id="webhooks-list">
            <H2>Webhook delivery log</H2>
            <EndpointBadge method="GET" path="/users/me/webhooks" />
            <P>Returns a log of all webhook delivery attempts for the authenticated account.</P>
            <CodeBlock tabs={[
              { label: "cURL", code:
`curl "${BASE}/users/me/webhooks?limit=20&offset=0" \\
  -H "Authorization: Bearer YOUR_TOKEN"` },
            ]} />
            <CodeBlock language="json" filename="Response 200" code={`{
  "data": [
    {
      "id": "wdl_01hx...",
      "event": "payment.settled",
      "status": "delivered",
      "statusCode": 200,
      "attemptedAt": "2024-01-15T10:55:01Z"
    },
    {
      "id": "wdl_01hy...",
      "event": "payment.created",
      "status": "failed",
      "statusCode": 503,
      "attemptedAt": "2024-01-15T10:41:00Z"
    }
  ]
}`} />
          </Section>

          {/* ─────────────── Integration guides ─────────────── */}
          <div className="border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Integration Guides</p>
            <h2 className="text-2xl font-bold text-primary">Code examples</h2>
          </div>

          {/* Node.js */}
          <Section id="guide-nodejs">
            <H2>Node.js integration</H2>
            <P>Full end-to-end example: register, create a merchant, and accept your first payment.</P>
            <CodeBlock
              language="javascript"
              filename="avaramp.js"
              code={`const BASE = 'https://api.avaramp.com/v1';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

// 1. Authenticate
const { token } = await request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'you@business.com', password: 'secret' }),
});

const auth = { Authorization: \`Bearer \${token}\` };

// 2. Create merchant (once, store the ID)
const merchant = await request('/merchants', {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    name: 'My Business',
    webhookUrl: 'https://mysite.com/webhooks/avaramp',
  }),
});
console.log('Merchant ID:', merchant.id);
console.log('Webhook secret:', merchant.webhookSecret); // store this!

// 3. Create payment for a customer order
const payment = await request('/payments', {
  method: 'POST',
  headers: { ...auth, 'Idempotency-Key': 'order_789' },
  body: JSON.stringify({
    merchantId: merchant.id,
    amount: '1500.00',
    currency: 'KES',
    phone: '+254712345678',
    reference: 'Order #789',
  }),
});

console.log('Ask customer to send', payment.amountUsdc, 'USDC to:');
console.log(payment.depositAddress);`}
            />
          </Section>

          {/* Python */}
          <Section id="guide-python">
            <H2>Python integration</H2>
            <CodeBlock
              language="python"
              filename="avaramp.py"
              code={`import requests

BASE = 'https://api.avaramp.com/v1'

def avaramp(path, *, method='GET', token=None, **kwargs):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    res = getattr(requests, method.lower())(BASE + path, headers=headers, **kwargs)
    res.raise_for_status()
    return res.json()

# 1. Login
auth = avaramp('/auth/login', method='POST',
               json={'email': 'you@business.com', 'password': 'secret'})
token = auth['token']

# 2. Create merchant
merchant = avaramp('/merchants', method='POST', token=token, json={
    'name': 'My Business',
    'webhookUrl': 'https://mysite.com/webhooks/avaramp',
})
print('Merchant ID:', merchant['id'])

# 3. Create payment
payment = avaramp('/payments', method='POST', token=token,
    headers={'Idempotency-Key': 'order_789'},
    json={
        'merchantId': merchant['id'],
        'amount': '1500.00',
        'currency': 'KES',
        'phone': '+254712345678',
    })

print(f"Ask customer to send {payment['amountUsdc']} USDC to:")
print(payment['depositAddress'])`}
            />
          </Section>

          {/* PHP */}
          <Section id="guide-php">
            <H2>PHP integration</H2>
            <CodeBlock
              language="php"
              filename="avaramp.php"
              code={`<?php

define('AVARAMP_BASE', 'https://api.avaramp.com/v1');

function avaramp(string $path, string $method = 'GET', array $body = [], string $token = '', array $extraHeaders = []): array {
    $headers = ['Content-Type: application/json'];
    if ($token) $headers[] = "Authorization: Bearer $token";
    foreach ($extraHeaders as $h) $headers[] = $h;

    $ch = curl_init(AVARAMP_BASE . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
    ]);
    if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));

    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res;
}

// 1. Login
$auth  = avaramp('/auth/login', 'POST', ['email' => 'you@business.com', 'password' => 'secret']);
$token = $auth['token'];

// 2. Create merchant
$merchant = avaramp('/merchants', 'POST', [
    'name'       => 'My Business',
    'webhookUrl' => 'https://mysite.com/webhooks/avaramp',
], $token);

// 3. Create payment
$payment = avaramp('/payments', 'POST', [
    'merchantId' => $merchant['id'],
    'amount'     => '1500.00',
    'currency'   => 'KES',
    'phone'      => '+254712345678',
], $token, ['Idempotency-Key: order_789']);

echo "Ask customer to send {$payment['amountUsdc']} USDC to:\n";
echo $payment['depositAddress'] . "\n";`}
            />
          </Section>

          {/* Verify webhooks */}
          <Section id="guide-webhook-verify">
            <H2>Verify webhooks</H2>
            <P>
              Always verify the <code className="text-xs font-mono text-secondary">X-AvaRamp-Signature</code> header
              before processing any webhook to prevent spoofed requests.
            </P>
            <CodeBlock tabs={[
              { label: "Node.js", code:
`import crypto from 'crypto';
import express from 'express';

const app = express();

// IMPORTANT: Use raw body, not parsed JSON
app.post('/webhooks/avaramp', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-avaramp-signature'];
  const secret    = process.env.AVARAMP_WEBHOOK_SECRET;

  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);

  switch (event.event) {
    case 'payment.settled':
      console.log('Payment settled:', event.data.id);
      // fulfil order here
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.data.id);
      // notify customer here
      break;
  }

  res.sendStatus(200); // always ACK quickly
});` },
              { label: "Python", code:
`import hmac
import hashlib
from flask import Flask, request, abort

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_a1b2c3d4e5f6...'

@app.route('/webhooks/avaramp', methods=['POST'])
def handle_webhook():
    sig      = request.headers.get('X-AvaRamp-Signature', '')
    body     = request.get_data()  # raw bytes
    expected = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig, expected):
        abort(401, 'Invalid signature')

    event = request.json
    if event['event'] == 'payment.settled':
        print('Order fulfilled:', event['data']['reference'])

    return '', 200` },
              { label: "PHP", code:
`<?php

$secret    = getenv('AVARAMP_WEBHOOK_SECRET');
$body      = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_AVARAMP_SIGNATURE'] ?? '';

$expected = 'sha256=' . hash_hmac('sha256', $body, $secret);

if (!hash_equals($expected, $signature)) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = json_decode($body, true);

if ($event['event'] === 'payment.settled') {
    // Mark order as paid in your database
    fulfil_order($event['data']['reference']);
}

http_response_code(200);` },
            ]} />
          </Section>

          {/* ─────────────── On-Chain ─────────────── */}
          <div className="border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">On-Chain</p>
            <h2 className="text-2xl font-bold text-primary">Smart Contracts</h2>
          </div>

          <Section id="contracts-overview">
            <H2>Contract overview</H2>
            <P>
              AvaRamp operates two audited contracts on Avalanche C-Chain. You do not need to interact
              with them directly — the REST API handles everything. This section is for developers who
              want to verify on-chain state or build custom integrations.
            </P>
            <ParamTableRows rows={[
              { name: "PaymentGateway",    type: "core",      desc: "Accepts USDC deposits, enforces fee split, releases funds after M-Pesa confirmation." },
              { name: "MerchantRegistry",  type: "core",      desc: "On-chain whitelist of approved merchants with per-merchant fee overrides." },
            ]} />
            <Callout type="info">
              Contract addresses are published on Snowtrace after mainnet deployment.
              Fuji testnet addresses are available in the dashboard under Settings.
            </Callout>
          </Section>

          <Section id="contracts-deposit">
            <H2>USDC deposit flow</H2>
            <P>For advanced integrations, you can call <code className="text-xs font-mono text-secondary">deposit()</code> directly on the PaymentGateway contract.</P>
            <CodeBlock
              language="javascript"
              filename="direct-deposit.js"
              code={`import { ethers } from 'ethers';

// USDC contract on Avalanche (6 decimals)
const USDC_ADDRESS    = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
const GATEWAY_ADDRESS = '0x...'; // from AvaRamp dashboard

const GATEWAY_ABI = [
  'function deposit(bytes32 paymentId, address merchant, uint256 amount) external',
];
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
];

const provider = new ethers.BrowserProvider(window.ethereum);
const signer   = await provider.getSigner();

const usdc    = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
const gateway = new ethers.Contract(GATEWAY_ADDRESS, GATEWAY_ABI, signer);

const amount    = ethers.parseUnits('19.23', 6); // USDC has 6 decimals
const paymentId = ethers.encodeBytes32String('pay_01hx...');

// Step 1: approve gateway to spend USDC
await usdc.approve(GATEWAY_ADDRESS, amount);

// Step 2: deposit
await gateway.deposit(paymentId, merchantWalletAddress, amount);`}
            />
          </Section>

          <Section id="contracts-treasury">
            <H2>Protocol fees & treasury</H2>
            <P>
              AvaRamp charges a protocol fee on every deposit (default 1.5%). The fee accumulates
              in the <code className="text-xs font-mono text-secondary">accruedFees</code> state variable
              and can be withdrawn to the treasury address by calling{" "}
              <code className="text-xs font-mono text-secondary">withdrawTreasury()</code>.
              This keeps all fee revenue transparent and verifiable on-chain.
            </P>
            <CodeBlock
              language="javascript"
              filename="check-fees.js"
              code={`const GATEWAY_ABI = [
  'function accruedFees() external view returns (uint256)',
  'function protocolFeeBps() external view returns (uint256)',
];

const gateway    = new ethers.Contract(GATEWAY_ADDRESS, GATEWAY_ABI, provider);
const accrued    = await gateway.accruedFees();
const feeBps     = await gateway.protocolFeeBps();

console.log('Accrued fees:', ethers.formatUnits(accrued, 6), 'USDC');
console.log('Current fee:', Number(feeBps) / 100, '%');`}
            />
          </Section>

          {/* Footer */}
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-secondary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-DEFAULT flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-primary font-medium">AvaRamp</span>
              <span className="text-border">—</span>
              <span>Crypto to fiat, instantly</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/register" className="text-indigo-DEFAULT hover:text-indigo-dim transition-colors font-medium">
                Get started free
              </Link>
              <Link href="mailto:support@avaramp.com" className="hover:text-primary transition-colors flex items-center gap-1">
                Support <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
