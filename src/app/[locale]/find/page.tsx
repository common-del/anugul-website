import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SchoolFinder from "@/components/SchoolFinder";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function FindPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return (
    <PhoneFrame>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="px-5 py-6">
        <h1 className="text-2xl font-extrabold text-brand-ink">{t.find.title}</h1>
        <p className="mt-1 text-muted">{t.find.intro}</p>
        <div className="mt-4">
          <SchoolFinder
            locale={locale}
            labels={{
              searchPlaceholder: t.find.searchPlaceholder,
              browseTitle: t.find.browseTitle,
              changeBlock: t.find.changeBlock,
              noResults: t.find.noResults,
            }}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PhoneFrame>
  );
}
