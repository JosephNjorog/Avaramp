"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, ExternalLink, X, Send, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

const CHANNELS = [
  {
    icon: Mail,
    title: "General enquiries",
    desc: "Questions about pricing, onboarding, or partnerships.",
    contact: "hello@avaramp.io",
    href: "mailto:hello@avaramp.io",
  },
  {
    icon: MessageSquare,
    title: "Developer support",
    desc: "Integration questions, API issues, webhook debugging.",
    contact: "dev@avaramp.io",
    href: "mailto:dev@avaramp.io",
  },
  {
    icon: ExternalLink,
    title: "GitHub",
    desc: "Bug reports, feature requests, open issues.",
    contact: "github.com/JosephNjorog/Avaramp",
    href: "https://github.com/JosephNjorog/Avaramp",
  },
  {
    icon: X,
    title: "X / Twitter",
    desc: "Product updates, announcements, and community.",
    contact: "@avaramp",
    href: "https://x.com/avaramp",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Opens default mail client with pre-filled content
    const body = encodeURIComponent(`Name: ${form.name}\n\n${form.message}`);
    window.location.href = `mailto:hello@avaramp.io?subject=${encodeURIComponent(form.subject)}&body=${body}`;
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-DEFAULT" />
              Get in touch
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Contact AvaRamp</h1>
            <p className="text-secondary leading-relaxed">
              We&apos;re a small team building fast. Whether you&apos;re a merchant, developer, or investor — we reply within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">

            {/* Contact channels */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-5">Reach us directly</h2>
              {CHANNELS.map(({ icon: Icon, title, desc, contact, href }) => (
                <a
                  key={title}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-dim border border-indigo-border flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-indigo-DEFAULT" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-primary">{title}</p>
                      <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-secondary transition-colors shrink-0" />
                    </div>
                    <p className="text-xs text-secondary mt-0.5 mb-1">{desc}</p>
                    <p className="text-xs text-indigo-DEFAULT font-mono truncate">{contact}</p>
                  </div>
                </a>
              ))}

              {/* Response time */}
              <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 mt-6">
                <div className="w-2 h-2 rounded-full bg-green-DEFAULT animate-pulse shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">We reply within 24 hours</p>
                  <p className="text-xs text-muted mt-0.5">Mon–Fri, 8 AM – 8 PM EAT</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-5">Send a message</h2>

              {sent ? (
                <div className="bg-green-dim border border-green-DEFAULT/20 rounded-2xl p-10 flex flex-col items-center text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-DEFAULT mb-4" />
                  <p className="text-lg font-semibold text-primary mb-2">Message sent</p>
                  <p className="text-sm text-secondary mb-6">Your email client should have opened. We&apos;ll get back to you soon.</p>
                  <Button size="sm" variant="secondary" onClick={() => setSent(false)}>Send another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-primary">Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-primary">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@company.com"
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-primary">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="input"
                    >
                      <option value="">Select a topic</option>
                      <option>Merchant onboarding</option>
                      <option>API integration help</option>
                      <option>Partnership enquiry</option>
                      <option>Pricing question</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-primary">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you're building or what you need help with..."
                      className="input resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full" loading={sending} icon={<Send className="w-3.5 h-3.5" />}>
                    Send message
                  </Button>
                  <p className="text-xs text-muted text-center">
                    This opens your email client. Or write directly to{" "}
                    <a href="mailto:hello@avaramp.io" className="text-indigo-DEFAULT hover:underline">hello@avaramp.io</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
