import Link from "next/link";
import { Zap, ArrowRight, Package, Clock } from "lucide-react";

export const metadata = { title: "SDKs — AvaRamp Docs" };

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

export default function SdksPage() {
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
        <span className="text-sm text-primary">SDKs</span>
        <div className="ml-auto">
          <Link href="/auth/register" className="text-sm text-indigo-DEFAULT font-medium flex items-center gap-1">
            Get API key <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">

          <section>
            <h1 className="text-3xl font-bold tracking-tight mb-3">SDKs &amp; Libraries</h1>
            <p className="text-secondary leading-relaxed">
              Official and community-maintained libraries for integrating AvaRamp into your stack.
              The REST API is simple enough that no SDK is required — but these save time.
            </p>
          </section>

          {/* Official SDK */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Official SDK</h2>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-dim border border-indigo-border flex items-center justify-center">
                  <Package className="w-4 h-4 text-indigo-DEFAULT" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">@avaramp/sdk</p>
                  <p className="text-xs text-muted">JavaScript / TypeScript — Node.js and browser</p>
                </div>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-dim text-green-DEFAULT border border-green-DEFAULT/20 font-medium">
                  Available
                </span>
              </div>

              <Block code="npm install @avaramp/sdk" />

              <h3 className="text-sm font-semibold text-primary mb-2">Quick example</h3>
              <Block lang="typescript" code={`import { AvaRamp } from "@avaramp/sdk";

const client = new AvaRamp({
  baseUrl:   "https://avarampbackend.onrender.com",
  authToken: process.env.AVARAMP_TOKEN!,
});

// Create a payment
const payment = await client.payments.create({
  amountFiat:   "500",
  fiatCurrency: "KES",
  reference:    "Order #001",
});

console.log(payment.depositAddress); // 0x4f3d...8a1c
console.log(payment.amountUsdc);     // "3.85"

// Share: https://avaramp.vercel.app/pay/{payment.id}

// Listen for settlement
client.payments.onSettled(payment.id, (data) => {
  console.log("Settled:", data.transactionId);
});`} />
            </div>
          </section>

          {/* Coming soon */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Coming soon</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { lang: "Python",       pkg: "avaramp-python",    note: "Q3 2026" },
                { lang: "PHP",          pkg: "avaramp/avaramp-php", note: "Q3 2026" },
                { lang: "Go",           pkg: "github.com/avaramp/go-sdk", note: "Q4 2026" },
                { lang: "Ruby",         pkg: "avaramp-ruby",      note: "Q4 2026" },
              ].map(({ lang, pkg, note }) => (
                <div key={lang} className="bg-surface border border-dashed border-border rounded-xl p-5 flex items-center gap-4">
                  <Clock className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-secondary">{lang}</p>
                    <p className="text-xs text-muted font-mono">{pkg}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted">{note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Raw API */}
          <section>
            <h2 className="text-xl font-semibold mb-3">No SDK? Use the REST API directly</h2>
            <p className="text-secondary text-sm mb-4">
              The AvaRamp API is plain JSON over HTTPS. Any language with an HTTP client works.
              All you need is your JWT token from <C>POST /auth/login</C>.
            </p>
            <Block lang="python" code={`import requests

BASE = "https://avarampbackend.onrender.com"
TOKEN = "your-jwt-token"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# Create payment
resp = requests.post(f"{BASE}/payments", json={
    "amountFiat":   "500",
    "fiatCurrency": "KES",
    "reference":    "Order #001",
}, headers=HEADERS)

payment = resp.json()["data"]
print(payment["depositAddress"])  # 0x4f3d...8a1c`} />
          </section>

          {/* Navigation */}
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            {[
              { label: "Quickstart",    href: "/docs/quickstart" },
              { label: "API Reference", href: "/docs" },
              { label: "Webhooks",      href: "/docs/webhooks" },
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
