import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SchoolDirectory, { type DirRow } from "@/components/SchoolDirectory";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import type { BandKey } from "@/lib/bands";
import { getSchools } from "@/lib/schools";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type School = {
  udise: string; name: string; block: string; cluster: string;
  overall: { score: number; band: string }; assessedStudents: number;
};

export default function SchoolsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;

  const rows: DirRow[] = Object.values(getSchools() as Record<string, School>)
    .map((s) => ({
      udise: s.udise,
      name: s.name,
      block: s.block,
      cluster: s.cluster,
      score: s.overall.score,
      band: s.overall.band as BandKey,
      students: s.assessedStudents,
    }))
    .sort((a, z) => z.score - a.score);

  const blocks = [...new Set(rows.map((r) => r.block))].sort();

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.dirTitle}
        </h1>
        <SchoolDirectory
          rows={rows}
          blocks={blocks}
          bandLabels={t.band}
          o={o}
          locale={locale}
        />
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
