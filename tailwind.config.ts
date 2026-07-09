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
        accent: { DEFAULT: "#f5911e", dark: "#9a5510", light: "#f6a93b" },
        // v2 redesign: government green (docx mock, "Saksham Portal" family)
        gov: {
          DEFAULT: "#0E5A40",
          dark: "#0A452F",
          deep: "#0B3B2A",
          mid: "#187A57",
          ink: "#143726",
          // page canvas (pale gray-green) — white cards sit on top of this to
          // create restrained depth; tint is a step deeper for inner chips.
          canvas: "#F0F5F2",
          tint: "#EDF5F0",
          line: "#D5E4DB",
        },
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
      // Restrained depth for a government design-system feel (GOV.UK / USWDS):
      // soft, low-alpha, green-tinted shadows — never heavy or coloured.
      boxShadow: {
        card: "0 1px 2px 0 rgb(20 55 38 / 0.05), 0 4px 12px -3px rgb(20 55 38 / 0.08)",
        lift: "0 2px 6px -1px rgb(20 55 38 / 0.10), 0 12px 26px -6px rgb(20 55 38 / 0.16)",
        header: "0 1px 0 0 rgb(20 55 38 / 0.06), 0 4px 12px -6px rgb(20 55 38 / 0.14)",
      },
      // Light gradients for the header / nav / footer bands only.
      backgroundImage: {
        "gov-masthead": "linear-gradient(180deg, #FFFFFF 0%, #F4F9F6 100%)",
        "gov-nav": "linear-gradient(180deg, #10634A 0%, #0A452F 100%)",
        "gov-footer": "linear-gradient(180deg, #0B3B2A 0%, #072A1E 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
