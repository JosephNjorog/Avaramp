import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import SplashScreen from "@/components/SplashScreen";
import PwaRegister from "@/components/PwaRegister";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0c0c0e" },
    { media: "(prefers-color-scheme: light)", color: "#f8f8fb" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default:  "AvaRamp — Crypto to Fiat, Instantly",
    template: "%s | AvaRamp",
  },
  description:
    "Accept USDC on Avalanche. Settle as KES, NGN, GHS, TZS or UGX via M-Pesa. The crypto-to-fiat payment gateway built for Africa.",
  keywords: ["crypto", "fiat", "M-Pesa", "USDC", "Avalanche", "Africa", "payments", "settlement"],

  // PWA
  manifest: "/manifest.json",
  appleWebApp: {
    capable:           true,
    statusBarStyle:    "black-translucent",
    title:             "AvaRamp",
    startupImage:      "/icons/icon-512.svg",
  },

  // Icons
  icons: {
    icon:             [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple:            "/icons/icon-192.svg",
    shortcut:         "/icons/icon-192.svg",
  },

  // Open Graph
  openGraph: {
    type:        "website",
    title:       "AvaRamp — Crypto to Fiat, Instantly",
    description: "Accept USDC on Avalanche. Settle as KES, NGN, GHS via M-Pesa.",
    siteName:    "AvaRamp",
  },
  twitter: { card: "summary_large_image" },

  // Mobile
  formatDetection: { telephone: false },
  applicationName: "AvaRamp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        {/* Prevent flash of wrong theme — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = JSON.parse(localStorage.getItem('avaramp-theme') || '{}');
                if (t.state && t.state.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
        {/* iOS full-screen safe area */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="bg-bg text-primary font-sans antialiased overflow-x-hidden transition-colors duration-200">
        <Providers>
          <SplashScreen />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-card !text-primary !border !border-border !shadow-menu",
              style: {},
            }}
          />
        </Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
