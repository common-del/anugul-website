import type { Config } from "tailwindcss";

// Palette: Slate (primary) + Coral (accent), with civic blue retained for
// brand accents. (Was government green + amber; swapped in the 2026-07-15
// visual-system update.) The `gov` / `accent` token NAMES are kept so the swap
// needs no site-wide class rename: gov = slate, accent = coral.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // civic blue — retained
        brand: {
          DEFAULT: "#123c7b",
          dark: "#0b2a55",
          ink: "#12233d",
          mid: "#1c4e96",
          tint: "#eef2f8",
          line: "#d8e1ef",
        },
        // accent = coral
        accent: { DEFAULT: "#E56A4F", dark: "#C24E36", light: "#E56A4F" },
        // gov = slate (token name kept to avoid a site-wide class rename)
        gov: {
          DEFAULT: "#2D3A47",
          dark: "#1A1F26",
          deep: "#1A1F26",
          mid: "#2D3A47",
          ink: "#1A1F26",
          canvas: "#F3EFEA",
          tint: "#E9ECEE",
          line: "#E4E1DA",
        },
        muted: "#6B7280",
        // Result bands: top / mid-high / mid-low(needs attention) / critical
        band: {
          urgent: "#C24E36",
          needs: "#E5A24F",
          developing: "#2D3A47",
          excelling: "#1A1F26",
        },
      },
      fontFamily: {
        sans: ["var(--font-primary)", "system-ui", "sans-serif"],
      },
      // Restrained depth — soft, low-alpha, slate-tinted shadows.
      boxShadow: {
        card: "0 1px 2px 0 rgb(45 58 71 / 0.05), 0 4px 12px -3px rgb(45 58 71 / 0.08)",
        lift: "0 2px 6px -1px rgb(45 58 71 / 0.10), 0 12px 26px -6px rgb(45 58 71 / 0.16)",
        header: "0 1px 0 0 rgb(45 58 71 / 0.06), 0 4px 12px -6px rgb(45 58 71 / 0.14)",
      },
      // Header stays light; nav + footer become slate.
      backgroundImage: {
        "gov-masthead": "linear-gradient(180deg, #FFFFFF 0%, #F3EFEA 100%)",
        "gov-nav": "linear-gradient(180deg, #2D3A47 0%, #1A1F26 100%)",
        "gov-footer": "linear-gradient(180deg, #24303B 0%, #1A1F26 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
