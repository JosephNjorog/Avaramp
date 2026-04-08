import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Class-based dark mode — we toggle "dark" on <html>
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // All semantic tokens map to CSS variables so they flip with the theme
        bg:       "var(--color-bg)",
        surface:  "var(--color-surface)",
        card:     "var(--color-card)",
        border:   "var(--color-border)",
        primary:  "var(--color-primary)",
        secondary: "var(--color-secondary)",
        muted:    "var(--color-muted)",
        indigo: {
          DEFAULT: "var(--color-indigo)",
          dim:     "var(--color-indigo-dim)",
          border:  "var(--color-indigo-border)",
        },
        green:  { DEFAULT: "var(--color-green)",  dim: "var(--color-green-dim)"  },
        amber:  { DEFAULT: "var(--color-amber)",  dim: "var(--color-amber-dim)"  },
        red:    { DEFAULT: "var(--color-red)",    dim: "var(--color-red-dim)"    },
        blue:   { DEFAULT: "var(--color-blue)",   dim: "var(--color-blue-dim)"   },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", "0.875rem"],
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-600px 0" },
          "100%": { backgroundPosition: "600px 0" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up":  "fade-up 0.4s ease-out both",
        "fade-in":  "fade-in 0.3s ease-out both",
        shimmer:    "shimmer 1.8s linear infinite",
        marquee:    "marquee 30s linear infinite",
      },
      boxShadow: {
        card: "0 0 0 1px var(--color-border)",
        menu: "0 0 0 1px var(--color-border), 0 8px 24px var(--shadow-menu)",
        glow: "0 0 32px rgba(124,111,247,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
