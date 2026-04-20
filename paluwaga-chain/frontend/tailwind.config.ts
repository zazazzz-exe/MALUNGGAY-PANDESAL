import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Syne'", "sans-serif"],
        body: ["'Outfit'", "sans-serif"],
        headline: ["'Syne'", "sans-serif"],
        label: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      colors: {
        background: "#0D1F3C",
        "secondary-dark": "#0A1628",
        primary: "#00C6FF",
        secondary: "#6C3FC7",
        tertiary: "#F5A623",
        success: "#27AE60",
        error: "#E74C3C",
        white: "#FFFFFF",
        "light-gray": "#F4F7FB",
        "on-surface": "#FFFFFF",
        "on-surface-variant": "rgba(255,255,255,0.72)",
        "surface-container": "rgba(255,255,255,0.06)",
        "surface-container-high": "rgba(255,255,255,0.12)",
        "surface-container-low": "rgba(255,255,255,0.04)",
        "surface-container-highest": "rgba(255,255,255,0.2)",
        "outline-variant": "rgba(255,255,255,0.16)",
        "on-primary": "#0D1F3C",
        "on-primary-container": "#0D1F3C",
        "on-tertiary": "#3F2200",
        palm: {
          50: "#f5faf6",
          100: "#e6f4e7",
          500: "#2d7f50",
          700: "#1f5f3a",
          900: "#0f2f21"
        },
        mango: {
          300: "#ffd98e",
          500: "#f5a524",
          700: "#b86a09"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(0, 198, 255, 0.35)",
        card: "0 18px 40px rgba(10, 22, 40, 0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
