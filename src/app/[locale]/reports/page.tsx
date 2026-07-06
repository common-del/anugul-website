import { notFound } from "next/navigation";
import StubPage from "@/components/StubPage";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  return (
    <StubPage
      locale={locale}
      t={t}
      title={v.reportsTitle}
      intro={v.reportsIntro}
      active="reports"
    />
  );
}
