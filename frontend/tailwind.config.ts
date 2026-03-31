import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060608",
        surface:    "#0d0d12",
        card:       "#111118",
        border:     "#1c1c28",
        accent:     "#7c5cff",
        "accent-light": "#a78bfa",
        "accent-2": "#3ecfcf",
        muted:      "#3a3a52",
        subtle:     "#7878a0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(124,92,255,0.30) 0%, transparent 65%)",
        "card-glow":
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,92,255,0.10) 0%, transparent 70%)",
        "teal-glow":
          "radial-gradient(ellipse 80% 60% at 50% 110%, rgba(62,207,207,0.18) 0%, transparent 65%)",
        "grid-pattern":
          "linear-gradient(rgba(124,92,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.05) 1px, transparent 1px)",
        "gradient-purple":
          "linear-gradient(135deg, #7c5cff 0%, #3ecfcf 100%)",
        "gradient-dark":
          "linear-gradient(180deg, #0d0d12 0%, #060608 100%)",
      },
      backgroundSize: {
        grid: "64px 64px",
      },
      animation: {
        "marquee-l":  "marquee-l 35s linear infinite",
        "marquee-r":  "marquee-r 35s linear infinite",
        "float":      "float 7s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite alternate",
        "fade-up":    "fade-up 0.6s ease-out both",
        "scale-in":   "scale-in 0.4s ease-out both",
      },
      keyframes: {
        "marquee-l": {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-r": {
          "0%":   { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-18px)" },
        },
        "glow-pulse": {
          "0%":   { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        card:     "0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5)",
        accent:   "0 0 40px rgba(124,92,255,0.35)",
        "teal":   "0 0 40px rgba(62,207,207,0.25)",
        "glow-sm":"0 0 20px rgba(124,92,255,0.25)",
        "inner-glow": "inset 0 0 30px rgba(124,92,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
