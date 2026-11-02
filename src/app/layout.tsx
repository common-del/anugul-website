import type { Metadata } from "next";
import "./globals.css";
import { latin, odia } from "@/lib/fonts";
import ConsentBanner from "@/components/ConsentBanner";

const SEO_TITLE = "SAKSHAM — Anugola (Angul) District School Report Cards";
const SEO_DESC =
  "See how government schools in Anugola (Angul) district, Odisha did on the SAKSHAM competency-based assessment — free report cards for every school.";
const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Anugola (Angul) Saksham — Government School Report Cards",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://anugolasaksham.in"),
  title: SEO_TITLE,
  description: SEO_DESC,
  openGraph: {
    type: "website",
    siteName: "SAKSHAM",
    title: SEO_TITLE,
    description: SEO_DESC,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESC,
    images: ["/og-image.png"],
  },
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
