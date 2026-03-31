import Link from "next/link";
import { Zap, Twitter, Github, Linkedin } from "lucide-react";

const links = {
  Product: [
    { label: "How It Works",   href: "/#how-it-works" },
    { label: "Features",       href: "/#features" },
    { label: "Currencies",     href: "/#currencies" },
    { label: "Pricing",        href: "/#pricing" },
  ],
  Developers: [
    { label: "Documentation",  href: "/docs" },
    { label: "API Reference",  href: "/docs/api" },
    { label: "GitHub",         href: "https://github.com" },
    { label: "Changelog",      href: "/changelog" },
  ],
  Company: [
    { label: "About",          href: "/about" },
    { label: "Blog",           href: "/blog" },
    { label: "Careers",        href: "/careers" },
    { label: "Contact",        href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use",   href: "/terms" },
    { label: "Cookie Policy",  href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-2/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-white font-semibold text-base">
                Ava<span className="text-gradient-purple">Ramp</span>
              </span>
            </Link>
            <p className="text-subtle text-sm leading-relaxed mb-6 max-w-[200px]">
              Crypto-to-fiat settlement for the African economy. Built on Avalanche.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter,  href: "#" },
                { Icon: Github,   href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-subtle hover:text-white hover:border-accent/40 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white text-sm font-semibold mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-subtle hover:text-white text-sm transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} AvaRamp. All rights reserved. Not a bank. Crypto services facilitated through Avalanche C-Chain.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="glow-dot" />
            <span className="text-accent-2 text-xs font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
