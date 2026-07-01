import type { Metadata } from "next";
import "./globals.css";
import { latin, odia } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Angul Schools",
  description: "School report cards for parents in Angul district, Odisha.",
};

// Odia is the default; the per-locale layout corrects <html lang> for English.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="or" className={`${latin.variable} ${odia.variable}`}>
      <body className="bg-brand-tint">{children}</body>
    </html>
  );
}
