import type { Metadata } from "next";
import "./globals.css";
import { latin, odia } from "@/lib/fonts";
import ConsentBanner from "@/components/ConsentBanner";

export const metadata: Metadata = {
  title: "SAKSHAM — Anugola (Angul) District School Report Cards",
  description:
    "See how government schools in Anugola (Angul) district, Odisha did on the SAKSHAM competency-based assessment — free report cards for every school.",
};

// Odia is the default; the per-locale layout corrects <html lang> for English.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="or" className={`${latin.variable} ${odia.variable}`}>
      <body className="bg-gov-canvas">
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
