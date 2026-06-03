import Link from "next/link";
import { Zap, ArrowRight, Shield, RefreshCw, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Webhooks — AvaRamp Docs" };

const C = ({ children }: { children: string }) => (
  <code className="text-indigo-DEFAULT bg-indigo-dim px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
);

const Block = ({ code, lang = "bash" }: { code: string; lang?: string }) => (
  <div className="bg-surface border border-border rounded-xl overflow-hidden my-4">
    <div className="px-4 py-1.5 border-b border-border bg-card">
      <span className="text-2xs text-muted font-mono">{lang}</span>
    </div>
    <pre className="px-4 py-4 text-xs font-mono text-secondary leading-relaxed overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

export default function WebhooksDocsPage() {
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
        <Link href="/docs" className="text-sm text-secondary hover:text-primary">Docs</Link>
        <span className="text-border">/</span>
        <span className="text-sm text-primary">Webhooks</span>
        <div className="ml-auto">
          <Link href="/auth/register" className="text-sm text-indigo-DEFAULT font-medium flex items-center gap-1">
            Get API key <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">

          {/* Overview */}
          <section>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT animate-pulse" />
              Real-time events
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Webhooks</h1>
            <p className="text-secondary leading-relaxed mb-4">
              AvaRamp sends signed HTTP POST requests to your webhook URL whenever a payment
              changes state. Configure your URL in the merchant settings or via the API.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Shield,      label: "HMAC-SHA256 signed",    desc: "Every delivery is signed — verify before acting" },
                { icon: RefreshCw,   label: "Automatic retry",       desc: "3 retries with exponential backoff on failure" },
                { icon: CheckCircle2,label: "Delivery log",          desc: "Full history in the dashboard Webhooks tab" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-surface border border-border rounded-xl p-4">
                  <Icon className="w-4 h-4 text-indigo-DEFAULT mb-2" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-primary mb-1">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Event types</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs text-muted font-medium">Event</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted font-medium">When it fires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["payment.confirmed", "USDC deposit detected on-chain. Settlement is queued."],
                    ["payment.settled",   "Fiat transfer to merchant M-Pesa/till/paybill completed."],
                    ["payment.failed",    "Settlement failed after all retries, or payment expired."],
                  ].map(([event, desc]) => (
                    <tr key={event}>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{event}</td>
                      <td className="px-4 py-3 text-xs text-secondary">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payload structure */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Payload structure</h2>
            <p className="text-secondary text-sm mb-1">All events share the same envelope:</p>
            <Block lang="json" code={`{
  "event": "payment.settled",
  "data": {
    "paymentId":     "pay_01j...",
    "amount":        "500.00",
    "currency":      "KES",
    "transactionId": "OGR000012345",
    "reference":     "Order #001"
  },
  "timestamp": "2026-06-04T11:17:33Z"
}`} />
          </section>

          {/* Signature verification */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Signature verification</h2>
            <p className="text-secondary text-sm mb-4">
              Every delivery includes an <C>X-AvaRamp-Signature</C> header.
              Compute <C>HMAC-SHA256(rawBody, webhookSecret)</C> and compare with the header value
              (format: <C>sha256=&#123;hex&#125;</C>). Use constant-time comparison to prevent timing attacks.
            </p>

            <h3 className="text-sm font-semibold text-primary mb-2">Node.js / TypeScript</h3>
            <Block lang="typescript" code={`import crypto from "crypto";

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature,  "utf8")
    );
  } catch { return false; }
}

// Express handler
app.post("/webhooks/avaramp", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["x-avaramp-signature"] as string;
  if (!verifySignature(req.body, sig, process.env.AVARAMP_WEBHOOK_SECRET!)) {
    return res.status(401).send("Invalid signature");
  }
  const { event, data } = JSON.parse(req.body.toString());
  if (event === "payment.settled") {
    // mark order as paid in your database
    console.log("Settled:", data.paymentId, data.amount, data.currency);
  }
  res.status(200).send("OK");
});`} />

            <h3 className="text-sm font-semibold text-primary mb-2 mt-6">Python</h3>
            <Block lang="python" code={`import hmac, hashlib

def verify_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)`} />
          </section>

          {/* Retry behaviour */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Retry behaviour</h2>
            <p className="text-secondary text-sm mb-4">
              If your endpoint returns a non-2xx status or times out (10 s), AvaRamp retries
              the delivery automatically:
            </p>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs text-muted font-medium">Attempt</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted font-medium">Delay</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["1 (initial)", "Immediate",  "First attempt after event fires"],
                    ["2",          "30 seconds",  ""],
                    ["3",          "5 minutes",   ""],
                    ["4 (final)",  "30 minutes",  "Marked as failed after this"],
                  ].map(([attempt, delay, note]) => (
                    <tr key={attempt}>
                      <td className="px-4 py-2.5 text-xs text-primary font-mono">{attempt}</td>
                      <td className="px-4 py-2.5 text-xs text-secondary">{delay}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted mt-3">
              Your webhook URL must be publicly reachable via HTTPS. Private/localhost URLs are blocked.
            </p>
          </section>

          {/* Navigation */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            {[
              { label: "Quickstart",    href: "/docs/quickstart" },
              { label: "API Reference", href: "/docs" },
              { label: "SDKs",          href: "/docs/sdks" },
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
