import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16233F",
          light: "#2B3B5E",
          soft: "#4C5A7C",
        },
        paper: {
          DEFAULT: "#F8F3E7",
          dark: "#EFE7D4",
        },
        line: "#D9CEB3",
        sun: {
          DEFAULT: "#F5B93E",
          dark: "#E29F1D",
        },
        coral: {
          DEFAULT: "#FF6F59",
          dark: "#E1543F",
        },
        pine: {
          DEFAULT: "#2F6F4F",
          light: "#3F8863",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
      },
      backgroundImage: {
        "grid-paper":
          "linear-gradient(#D9CEB3 1px, transparent 1px), linear-gradient(90deg, #D9CEB3 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      boxShadow: {
        stamp: "0 6px 0 0 rgba(22,35,63,0.9)",
        ticket: "0 18px 40px -14px rgba(22,35,63,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
