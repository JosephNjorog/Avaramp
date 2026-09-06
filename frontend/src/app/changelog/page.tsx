import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GradientHero } from "@/components/ui/GradientHero";

export const metadata = { title: "Changelog — AvaRamp" };

type ChangeType = "feature" | "fix" | "improvement";

const TYPE_STYLES: Record<ChangeType, string> = {
  feature:     "bg-indigo-dim text-indigo-DEFAULT border-indigo-border",
  fix:         "bg-amber-dim text-amber-DEFAULT border-amber-DEFAULT/20",
  improvement: "bg-green-dim text-green-DEFAULT border-green-DEFAULT/20",
};

interface Release {
  version: string;
  date: string;
  label?: string;
  changes: { type: ChangeType; text: string }[];
}

const RELEASES: Release[] = [
  {
    version: "v1.5.0",
    date: "September 2026",
    label: "Latest",
    changes: [
      { type: "feature",     text: "Merchant-scoped API keys: generate, list, and revoke keys from Settings for programmatic integration via an x-api-key header." },
      { type: "improvement", text: "Settlement moved onto a single unified payout network across all supported currencies, including FX rate sourcing." },
    ],
  },
  {
    version: "v1.4.0",
    date: "June 2026",
    changes: [
      { type: "feature",     text: "Full M-Pesa support for phone numbers, Till numbers, and Paybill numbers." },
      { type: "improvement", text: "Admin role changes take effect immediately without requiring re-authentication." },
    ],
  },
  {
    version: "v1.3.0",
    date: "May 2026",
    changes: [
      { type: "feature",  text: "Dark mode set as default theme across the entire platform. New Zinc Dark palette with higher-contrast indigo accents." },
      { type: "improvement", text: "Dashboard auth hydration flash fixed — Zustand rehydrates before redirecting to login." },
      { type: "improvement", text: "Merchants page now loads existing merchant on mount via API." },
      { type: "fix",      text: "Demo account seeded with realistic payment history, consent records, and webhook deliveries." },
      { type: "improvement", text: "All hardcoded dark-mode hex values replaced with CSS custom properties for consistent theming." },
    ],
  },
  {
    version: "v1.2.0",
    date: "April 2026",
    changes: [
      { type: "feature",  text: "Webhook delivery system: signed HMAC-SHA256 payloads, automatic retry with exponential backoff, delivery log in dashboard." },
      { type: "feature",  text: "Admin panel: fee tracking, merchant management, volume stats, consent audit log." },
      { type: "feature",  text: "Consent recording: TERMS, PRIVACY, and COOKIES acceptance logged at registration with IP and user-agent." },
      { type: "improvement", text: "Platform fee set to 1.5% (150 bps), deducted from USDC before settlement." },
      { type: "improvement", text: "Settlement webhook: improved event handling reliability and error reporting." },
    ],
  },
  {
    version: "v1.1.0",
    date: "March 2026",
    changes: [
      { type: "feature",  text: "Automated KES, NGN, GHS, TZS, UGX settlements to mobile money accounts." },
      { type: "feature",  text: "Multi-currency support: M-Pesa personal (phone), M-Pesa till, Paybill, Airtel Money, MTN MoMo." },
      { type: "feature",  text: "Merchant dashboard: payment history, 7-day volume chart, settlement analytics." },
      { type: "feature",  text: "Idempotency-Key header support — safe retries for payment creation." },
      { type: "improvement", text: "BullMQ payment worker: deposit watching, settlement queueing, webhook delivery all on separate queues." },
    ],
  },
  {
    version: "v1.0.0",
    date: "February 2026",
    changes: [
      { type: "feature", text: "Initial release: merchant registration, payment link creation with live FX rates." },
      { type: "feature", text: "Customer pay page: QR code (EIP-681 URI), WalletConnect, and manual wallet send modes." },
      { type: "feature", text: "Avalanche C-Chain USDC deposit detection via Glacier API with public RPC fallback." },
      { type: "feature", text: "HD wallet generation: unique deposit address per payment derived from BIP-39 mnemonic." },
      { type: "feature", text: "AES-256-GCM encryption for wallet private keys at rest." },
      { type: "feature", text: "JWT authentication with PBKDF2 password hashing (100k iterations, SHA-512)." },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <GradientHero className="mb-12 pt-4 pb-2 -mt-4">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT animate-pulse" />
              Product updates
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Changelog</h1>
            <p className="text-secondary text-lg">
              Every release, every fix, every improvement — in one place.
            </p>
          </GradientHero>

          <div className="space-y-12">
            {RELEASES.map((release, i) => (
              <div key={release.version} className="flex gap-6">
                {/* Timeline */}
                <div className="hidden sm:flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-indigo-DEFAULT" : "bg-border"}`} />
                  {i < RELEASES.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-bold text-primary font-mono">{release.version}</span>
                    {release.label && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-DEFAULT text-white">
                        {release.label}
                      </span>
                    )}
                    <span className="text-xs text-muted ml-auto">{release.date}</span>
                  </div>

                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <ul className="divide-y divide-border">
                      {release.changes.map((change, j) => (
                        <li key={j} className="flex items-start gap-3 px-4 py-3">
                          <span className={`shrink-0 mt-0.5 text-2xs font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${TYPE_STYLES[change.type]}`}>
                            {change.type}
                          </span>
                          <span className="text-sm text-secondary leading-relaxed">{change.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe note */}
          <div className="mt-12 bg-surface border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-secondary">
              Follow{" "}
              <a href="https://x.com/avaramp" className="text-indigo-DEFAULT hover:underline" target="_blank" rel="noreferrer">@avaramp</a>
              {" "}on X or watch the{" "}
              <a href="https://github.com/JosephNjorog/Avaramp" className="text-indigo-DEFAULT hover:underline" target="_blank" rel="noreferrer">GitHub repo</a>
              {" "}for real-time updates.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
