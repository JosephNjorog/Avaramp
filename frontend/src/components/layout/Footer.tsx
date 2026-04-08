import Link from "next/link";
import { Zap } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Features",    href: "#features" },
    { label: "Pricing",     href: "#pricing" },
    { label: "Changelog",   href: "/changelog" },
    { label: "Status",      href: "/status" },
  ],
  Developers: [
    { label: "API Reference", href: "/docs/api" },
    { label: "Quickstart",    href: "/docs/quickstart" },
    { label: "SDKs",          href: "/docs/sdks" },
    { label: "Webhooks",      href: "/docs/webhooks" },
  ],
  Company: [
    { label: "About",   href: "/about" },
    { label: "Blog",    href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms",   href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Top: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm text-primary">AvaRamp</span>
            </Link>
            <p className="text-xs text-muted leading-relaxed max-w-[160px]">
              Crypto-to-fiat payments for Africa. USDC → M-Pesa in minutes.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-semibold text-secondary mb-3 uppercase tracking-wider">{title}</p>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-muted hover:text-secondary transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} AvaRamp. Built for Africa&apos;s builders.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://github.com/JosephNjorog/Avaramp" target="_blank" rel="noreferrer"
               className="text-xs text-muted hover:text-secondary transition-colors">GitHub</a>
            <a href="https://x.com/avaramp" target="_blank" rel="noreferrer"
               className="text-xs text-muted hover:text-secondary transition-colors">X / Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
