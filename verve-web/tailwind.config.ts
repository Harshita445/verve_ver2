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
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
