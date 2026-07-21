import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#140A0A",
        surface: "#1C1010",
        card: "#261515",
        elevated: "#311A1A",
        border: "#4A2A2A",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E6C866",
          hover: "#F0D57A",
        },
        burgundy: {
          DEFAULT: "#6E1E2A",
          light: "#8A2A38",
          dark: "#4A131C",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#D1D1D1",
          muted: "#A1A1AA",
          subtle: "#7C7C84",
        },
        success: "#34D399",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.28)",
        glow: "0 0 30px rgba(212, 175, 55, 0.15)",
      },
      maxWidth: {
        content: "1280px",
      },
      spacing: {
        section: "140px",
        "section-tablet": "100px",
        "section-mobile": "72px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 400ms easeInOut",
        slideUp: "slideUp 600ms easeInOut",
      },
    },
  },
  plugins: [],
};

export default config;
