import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CompareView from "@/components/CompareView";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ComparePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return (
    <PhoneFrame>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="px-5 py-6">
        <h1 className="text-2xl font-extrabold text-brand-ink">
          {t.compare.title}
        </h1>
        <div className="mt-2">
          <CompareView
            locale={locale}
            c={t.compare}
            bandLabels={t.band}
            gradeLabels={t.grades}
            subjectLabels={t.subjects}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PhoneFrame>
  );
}
