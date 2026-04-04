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
        bg:       "#0c0c0e",
        surface:  "#141416",
        card:     "#1a1a1d",
        border:   "#26262a",
        primary:  "#f2f2f4",
        secondary: "#9898a0",
        muted:    "#5c5c66",
        indigo: {
          DEFAULT: "#7c6ff7",
          dim:     "#7c6ff714",
          border:  "#7c6ff740",
        },
        green:  { DEFAULT: "#3dd68c", dim: "#3dd68c15" },
        amber:  { DEFAULT: "#f5a623", dim: "#f5a62315" },
        red:    { DEFAULT: "#f56060", dim: "#f5606015" },
        blue:   { DEFAULT: "#60a5fa", dim: "#60a5fa15" },
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
        card: "0 0 0 1px #26262a",
        menu: "0 0 0 1px #26262a, 0 8px 24px rgba(0,0,0,0.6)",
        glow: "0 0 32px rgba(124,111,247,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
