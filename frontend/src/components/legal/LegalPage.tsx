"use client";

import Link from "next/link";
import { ChevronRight, FileText, Shield, Cookie } from "lucide-react";

interface Section {
  id:    string;
  title: string;
}

interface LegalPageProps {
  title:       string;
  subtitle:    string;
  lastUpdated: string;
  sections:    Section[];
  children:    React.ReactNode;
}

const LEGAL_LINKS = [
  { href: "/terms",   label: "Terms of Service", icon: FileText },
  { href: "/privacy", label: "Privacy Policy",   icon: Shield   },
  { href: "/cookies", label: "Cookie Policy",    icon: Cookie   },
];

export default function LegalPage({ title, subtitle, lastUpdated, sections, children }: LegalPageProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted mb-4">
            <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-secondary">{title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-secondary mb-3">{subtitle}</p>
          <p className="text-xs text-muted">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Other legal docs */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">Legal Documents</p>
                <div className="space-y-1">
                  {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* TOC */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">On This Page</p>
                <div className="space-y-1">
                  {sections.map(({ id, title: t }) => (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className="block w-full text-left px-3 py-1.5 rounded-lg text-xs text-muted hover:text-secondary hover:bg-surface transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-indigo-dim border border-indigo-border rounded-xl p-4">
                <p className="text-xs font-medium text-primary mb-1">Have questions?</p>
                <p className="text-xs text-secondary mb-3">Our legal team is here to help.</p>
                <a
                  href="mailto:legal@avaramp.com"
                  className="text-xs text-indigo-DEFAULT hover:underline"
                >
                  legal@avaramp.com
                </a>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="prose-legal">
              {children}
            </div>

            {/* Footer nav */}
            <div className="mt-14 pt-8 border-t border-border">
              <p className="text-xs text-muted mb-4">Also read our other legal documents:</p>
              <div className="flex flex-wrap gap-3">
                {LEGAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm text-secondary hover:text-primary hover:border-indigo-border transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Section helpers exported for use in pages ── */

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-8">
      <h2 className="text-xl font-bold text-primary mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-4 text-sm text-secondary leading-relaxed">{children}</div>
    </section>
  );
}

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-primary mb-2">{title}</h3>
      <div className="space-y-3 text-sm text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

export function Callout({ type, children }: { type: "warning" | "info" | "critical"; children: React.ReactNode }) {
  const styles = {
    warning:  "bg-amber-dim  border-amber-DEFAULT/30  text-amber-DEFAULT",
    info:     "bg-indigo-dim border-indigo-border     text-indigo-DEFAULT",
    critical: "bg-red-dim    border-red-DEFAULT/30    text-red-DEFAULT",
  }[type];
  return (
    <div className={`border rounded-xl p-4 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside ml-4 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
