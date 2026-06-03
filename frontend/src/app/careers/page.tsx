import Link from "next/link";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Careers — AvaRamp" };

const ROLES = [
  {
    title:    "Senior Backend Engineer",
    type:     "Full-time",
    location: "Remote (Africa-based)",
    team:     "Engineering",
    desc:     "Build and scale the settlement engine, queue workers, and blockchain integration. Node.js, TypeScript, Prisma, BullMQ. Strong understanding of financial systems required.",
  },
  {
    title:    "Business Development Manager — East Africa",
    type:     "Full-time",
    location: "Nairobi, Kenya",
    team:     "Growth",
    desc:     "Own merchant acquisition across Kenya, Tanzania, and Uganda. You understand the M-Pesa ecosystem, speak to merchants in their language, and close deals.",
  },
  {
    title:    "Compliance & Regulatory Analyst",
    type:     "Part-time / Contract",
    location: "Remote",
    team:     "Legal",
    desc:     "Navigate VASP registration requirements across Kenya, Nigeria, and Ghana. Understand CBK, SEC Nigeria, and Bank of Ghana frameworks. Prior fintech compliance experience required.",
  },
  {
    title:    "Frontend Engineer",
    type:     "Full-time",
    location: "Remote",
    team:     "Engineering",
    desc:     "Build the merchant dashboard, customer pay page, and developer docs. Next.js, TypeScript, Tailwind CSS. Eye for detail and a love of clean dark UIs.",
  },
];

const TEAM_STYLE: Record<string, string> = {
  Engineering: "bg-indigo-dim text-indigo-DEFAULT border-indigo-border",
  Growth:      "bg-green-dim text-green-DEFAULT border-green-DEFAULT/20",
  Legal:       "bg-amber-dim text-amber-DEFAULT border-amber-DEFAULT/20",
};

const PERKS = [
  { title: "Remote-first",       desc: "Work from anywhere. We value output over office presence." },
  { title: "Equity",             desc: "Meaningful equity for early team members building the rails." },
  { title: "Learning budget",    desc: "KES 100K / year for courses, conferences, and books." },
  { title: "Async culture",      desc: "No unnecessary meetings. We write, we ship, we iterate." },
  { title: "Real impact",        desc: "Every line of code moves real money for real people in Africa." },
  { title: "Africa focus",       desc: "We're building for Africa, by people who understand Africa." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT animate-pulse" />
              We&apos;re hiring
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
              Build the future of<br className="hidden sm:block" /> African payments
            </h1>
            <p className="text-secondary text-lg leading-relaxed">
              AvaRamp is a small, focused team. We move fast, ship real products,
              and genuinely believe we are building infrastructure that matters.
              If that excites you, read on.
            </p>
          </div>

          {/* Open roles */}
          <div className="mb-16">
            <h2 className="text-xl font-semibold mb-6">Open roles</h2>
            <div className="space-y-4">
              {ROLES.map((role) => (
                <div key={role.title} className="bg-card border border-border rounded-xl p-6 hover:border-muted transition-colors group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base font-semibold text-primary group-hover:text-indigo-DEFAULT transition-colors">
                          {role.title}
                        </h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${TEAM_STYLE[role.team] ?? "bg-surface text-muted border-border"}`}>
                          {role.team}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{role.type}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-indigo-DEFAULT transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Perks */}
          <div className="mb-16">
            <h2 className="text-xl font-semibold mb-6">Why AvaRamp</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PERKS.map(({ title, desc }) => (
                <div key={title} className="bg-surface border border-border rounded-xl p-5">
                  <p className="text-sm font-semibold text-primary mb-1">{title}</p>
                  <p className="text-xs text-secondary leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-indigo-dim border border-indigo-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Don&apos;t see your role?</h2>
            <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
              We occasionally hire outside posted roles for exceptional people.
              Send your CV and a note on what you&apos;d build.
            </p>
            <Link
              href="mailto:careers@avaramp.io"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-DEFAULT text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Send a speculative application <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs text-muted mt-4">careers@avaramp.io</p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
