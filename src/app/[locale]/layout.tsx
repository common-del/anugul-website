import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, htmlLang, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import SetLang from "@/components/SetLang";
import DemoSync from "@/components/DemoSync";
import TruncationTitles from "@/components/TruncationTitles";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return {
    metadataBase: new URL("https://anugolasaksham.in"),
    title: {
      default: t.site.seoTitle,
      template: `%s · ${t.site.name}`,
    },
    description: t.site.description,
    alternates: {
      languages: { or: "/od/", en: "/en/", "x-default": "/od/" },
    },
    openGraph: {
      type: "website",
      siteName: t.site.name,
      locale: params.locale === "od" ? "or_IN" : "en_IN",
      title: t.site.seoTitle,
      description: t.site.description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Anugola (Angul) Saksham — Government School Report Cards",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.site.seoTitle,
      description: t.site.description,
      images: ["/og-image.png"],
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  return (
    <>
      <SetLang lang={htmlLang[params.locale as Locale]} />
      <DemoSync />
      <TruncationTitles />
      {children}
    </>
  );
}
