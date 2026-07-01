import type { Config } from "tailwindcss";

// Palette derived from the client's indicative design (civic blue + amber).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#123c7b",
          dark: "#0b2a55",
          ink: "#12233d",
          mid: "#1c4e96",
          tint: "#eef2f8",
          line: "#d8e1ef",
        },
        accent: { DEFAULT: "#f5911e", dark: "#c56e12", light: "#f6a93b" },
        muted: "#566579",
        // Result bands: low = warm/attention, high = brand blue. Always shown
        // with the band word + number, so colour is never the only signal.
        band: {
          urgent: "#b3261e",
          needs: "#e07b1a",
          developing: "#2f74c0",
          excelling: "#123c7b",
        },
      },
      fontFamily: {
        sans: ["var(--font-primary)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
