import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — AvaRamp",
  description:
    "Complete documentation for the AvaRamp API. Accept USDC on Avalanche and settle directly to M-Pesa, MTN, Airtel, and other mobile money wallets.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
