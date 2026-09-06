import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Blog — AvaRamp" };

const POSTS = [
  {
    slug:     "why-avalanche-for-africa",
    date:     "June 4, 2026",
    tag:      "Product",
    title:    "Why We Built on Avalanche — Not Ethereum or Solana",
    excerpt:  "Sub-second finality, $0.01 gas fees, and native USDC. Here is exactly why Avalanche C-Chain is the right foundation for a crypto-to-mobile-money corridor in Africa.",
    readTime: "6 min read",
  },
  {
    slug:     "building-our-settlement-network",
    date:     "May 28, 2026",
    tag:      "Engineering",
    title:    "Till, Paybill, or Phone: Building a Settlement Network That Handles All Three",
    excerpt:  "M-Pesa Till and Paybill transfers behave nothing like a personal phone payout under the hood. Here is what we learned building one settlement engine that handles all of it reliably.",
    readTime: "8 min read",
  },
  {
    slug:     "hd-wallet-deposit-address",
    date:     "May 15, 2026",
    tag:      "Engineering",
    title:    "One Mnemonic, Millions of Deposit Addresses — How BIP-44 HD Wallets Work",
    excerpt:  "Each AvaRamp payment gets a unique on-chain deposit address with no shared keys. This post explains the cryptographic mechanics behind our HD wallet architecture.",
    readTime: "10 min read",
  },
  {
    slug:     "crypto-mpesa-corridor",
    date:     "April 30, 2026",
    tag:      "Market",
    title:    "The Crypto-to-M-Pesa Corridor Is Broken. Here Is How We Fix It.",
    excerpt:  "A crypto holder in London wants to pay a business in Nairobi. Today that takes 3 days, 5 steps, and 6–9% in fees. We collapse it to 3 minutes and 1.5%.",
    readTime: "5 min read",
  },
  {
    slug:     "security-audit-findings",
    date:     "June 1, 2026",
    tag:      "Security",
    title:    "What We Found in Our Security Audit — and How We Fixed It",
    excerpt:  "15 vulnerabilities. 3 critical. Here is a transparent walkthrough of every finding from our recent backend security audit and the patches we shipped.",
    readTime: "12 min read",
  },
];

const TAG_STYLES: Record<string, string> = {
  Product:     "bg-indigo-dim text-indigo-DEFAULT border-indigo-border",
  Engineering: "bg-blue-dim text-blue-DEFAULT border-blue-DEFAULT/20",
  Market:      "bg-green-dim text-green-DEFAULT border-green-DEFAULT/20",
  Security:    "bg-red-dim text-red-DEFAULT border-red-DEFAULT/20",
};

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-DEFAULT bg-indigo-dim border border-indigo-border rounded-full px-3 py-1 mb-5">
              <BookOpen className="w-3 h-3" />
              Engineering & product writing
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Blog</h1>
            <p className="text-secondary text-lg">
              Deep dives into the technology, decisions, and market context behind AvaRamp.
            </p>
          </div>

          {/* Featured post */}
          <div className="bg-card border border-border rounded-2xl p-7 mb-8 group hover:border-muted transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${TAG_STYLES[featured.tag]}`}>
                {featured.tag}
              </span>
              <span className="text-xs text-muted">{featured.date}</span>
              <span className="text-xs text-muted ml-auto">{featured.readTime}</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-3 leading-snug group-hover:text-indigo-DEFAULT transition-colors">
              {featured.title}
            </h2>
            <p className="text-secondary text-sm leading-relaxed mb-5">{featured.excerpt}</p>
            <div className="flex items-center gap-1.5 text-xs text-indigo-DEFAULT font-medium">
              Read article <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Post grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {rest.map((post) => (
              <div
                key={post.slug}
                className="bg-card border border-border rounded-xl p-5 group hover:border-muted transition-colors flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${TAG_STYLES[post.tag] ?? "bg-surface text-muted border-border"}`}>
                    {post.tag}
                  </span>
                  <span className="text-xs text-muted ml-auto">{post.readTime}</span>
                </div>
                <h3 className="text-sm font-semibold text-primary mb-2 leading-snug group-hover:text-indigo-DEFAULT transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-xs text-secondary leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">{post.date}</span>
                  <div className="flex items-center gap-1 text-xs text-indigo-DEFAULT font-medium">
                    Read <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon note */}
          <div className="mt-10 bg-surface border border-dashed border-border rounded-xl p-6 text-center">
            <p className="text-sm text-secondary">
              Full article pages coming soon.
              Follow <a href="https://x.com/avaramp" className="text-indigo-DEFAULT hover:underline" target="_blank" rel="noreferrer">@avaramp</a> for new posts.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
