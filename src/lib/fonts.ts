import { Open_Sans, Noto_Sans_Oriya } from "next/font/google";

// Self-hosted at build (next/font downloads once, serves from our origin — no
// runtime Google Fonts call). Latin for English, Oriya for Odia.
export const latin = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
});

export const odia = Noto_Sans_Oriya({
  subsets: ["oriya"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-odia",
});
