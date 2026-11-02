import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CompareView from "@/components/CompareView";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { pageMeta } from "@/lib/seo";

// A client-side tool driven by ?a=&b= query parameters, not linked from the
// site; the bare page has no content of its own to index.
export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta(
    locale,
    "compare/",
    `${t.compare.title} | ${t.site.name}`,
    t.compare.intro,
    { index: false },
  );
}

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
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
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
    </PageShell>
  );
}
