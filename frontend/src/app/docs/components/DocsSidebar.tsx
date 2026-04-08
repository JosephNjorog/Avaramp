"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { id: "overview",        label: "Overview" },
      { id: "authentication",  label: "Authentication" },
      { id: "quickstart",      label: "Quickstart" },
      { id: "environments",    label: "Environments" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { id: "payments-flow",   label: "Payment flow" },
      { id: "webhooks-guide",  label: "Webhooks" },
      { id: "idempotency",     label: "Idempotency" },
      { id: "errors",          label: "Errors & codes" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "auth-register",   label: "POST /auth/register" },
      { id: "auth-login",      label: "POST /auth/login" },
      { id: "payments-create", label: "POST /payments" },
      { id: "payments-get",    label: "GET /payments/:id" },
      { id: "payments-list",   label: "GET /payments" },
      { id: "payments-analytics", label: "GET /payments/analytics" },
      { id: "merchants-create", label: "POST /merchants" },
      { id: "merchants-get",   label: "GET /merchants/:id" },
      { id: "settlements",     label: "POST /settlements" },
      { id: "users-me",        label: "GET /users/me" },
      { id: "users-update",    label: "PATCH /users/me" },
      { id: "webhooks-list",   label: "GET /users/me/webhooks" },
    ],
  },
  {
    title: "Integration Guides",
    items: [
      { id: "guide-nodejs",    label: "Node.js" },
      { id: "guide-python",    label: "Python" },
      { id: "guide-php",       label: "PHP" },
      { id: "guide-webhook-verify", label: "Verify webhooks" },
    ],
  },
  {
    title: "On-Chain",
    items: [
      { id: "contracts-overview",  label: "Smart contracts" },
      { id: "contracts-deposit",   label: "USDC deposit flow" },
      { id: "contracts-treasury",  label: "Treasury & fees" },
    ],
  },
];

export default function DocsSidebar() {
  const [active, setActive] = useState("overview");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const sections = document.querySelectorAll("[data-section]");
      let current = "overview";
      sections.forEach((el) => {
        if (el.getBoundingClientRect().top <= 120) {
          current = el.getAttribute("data-section") ?? current;
        }
      });
      setActive(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  const NavContent = () => (
    <nav className="space-y-6">
      {SECTIONS.map((sec) => (
        <div key={sec.title}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted px-2 mb-1.5">
            {sec.title}
          </p>
          <ul className="space-y-0.5">
            {sec.items.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-sm rounded-md transition-all duration-150",
                    active === id
                      ? "text-indigo-DEFAULT bg-indigo-dim font-medium"
                      : "text-secondary hover:text-primary hover:bg-surface"
                  )}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-60 border-r border-border bg-bg overflow-y-auto pt-14 pb-8 z-30">
        <div className="px-4 pt-6">
          <NavContent />
        </div>
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-11 h-11 rounded-full bg-indigo-DEFAULT text-white flex items-center justify-center shadow-lg"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-full bg-bg border-r border-border h-full overflow-y-auto pt-6 px-4 pb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-indigo-DEFAULT flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm text-primary">AvaRamp Docs</span>
            </div>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
