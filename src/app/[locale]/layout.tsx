import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, htmlLang, isLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import SetLang from "@/components/SetLang";

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
    metadataBase: new URL("https://anugul-website.vercel.app"),
    title: t.site.name,
    description: t.site.description,
    alternates: {
      languages: { or: "/od/", en: "/en/", "x-default": "/od/" },
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
      {children}
    </>
  );
}
