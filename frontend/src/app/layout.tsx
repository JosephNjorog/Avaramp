import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AvaRamp — Crypto to Fiat, Instantly",
    template: "%s | AvaRamp",
  },
  description:
    "Accept USDC on Avalanche. Settle as KES, NGN, GHS, TZS or UGX via M-Pesa. The crypto-to-fiat payment gateway built for Africa.",
  keywords: ["crypto", "fiat", "M-Pesa", "USDC", "Avalanche", "Africa", "payments", "settlement"],
  openGraph: {
    type: "website",
    title: "AvaRamp — Crypto to Fiat, Instantly",
    description: "Accept USDC on Avalanche. Settle as KES, NGN, GHS via M-Pesa.",
    siteName: "AvaRamp",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-white font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111118",
                color: "#fff",
                border: "1px solid #1c1c28",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
