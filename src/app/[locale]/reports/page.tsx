import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GovBlockPicker from "@/components/GovBlockPicker";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_TEXT, bandFromScore } from "@/lib/bands";
import { getBlock, getBlockSlugs } from "@/lib/officialsData";
import districtData from "@/data/district.json";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type District = {
  districtAverage: number;
  schoolsAssessed: number;
  studentsAssessed: number;
  bestBlock: string;
};
const district = districtData as unknown as District;

// Reports landing (title-bar item + home "Explore Reports"): district at a
// glance, the clickable block map, and the eight block report cards with scores.
export default function ReportsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const num = (n: number) => fmtNum(n, locale);
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const slugs = Object.fromEntries(getBlockSlugs().map((b) => [b.name, b.slug]));

  const blocks = getBlockSlugs().map((b) => {
    const d = getBlock(b.slug);
    return { name: b.name, slug: b.slug, score: d.headline.overall };
  });

  const stats = [
    { v: pct(district.districtAverage), l: v.districtAverage },
    { v: num(district.schoolsAssessed), l: t.analytics.schoolsAssessed },
    { v: num(district.studentsAssessed), l: t.analytics.studentsAssessed },
    { v: district.bestBlock, l: v.topBlock },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.reportsTitle}
        </h1>
        <p className="mt-1 text-muted">{v.reportsIntro}</p>

        {/* Angul district at a glance */}
        <section className="mt-5 rounded-2xl border border-gov-line bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gov-mid">
            {v.districtOverview}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="rounded-xl bg-gov-tint p-3">
                <div className="text-xl font-extrabold leading-tight text-gov-ink">{s.v}</div>
                <div className="mt-0.5 text-xs text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* clickable block map + buttons */}
        <section className="mt-6">
          <GovBlockPicker
            locale={locale}
            slugs={slugs}
            labels={{ allBlocks: v.districtAllBlocks, hint: v.clickBlockHint }}
          />
        </section>

        {/* block report cards with scores */}
        <h2 className="mt-7 text-lg font-bold text-gov-ink">{v.reportsBlocksT}</h2>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {blocks.map((b) => {
            const band = bandFromScore(b.score);
            return (
              <li key={b.slug}>
                <Link
                  href={`/${locale}/gov/${b.slug}/`}
                  className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-gov-line bg-white px-4 hover:bg-gov-tint"
                >
                  <span className="font-bold text-gov-ink">{b.name}</span>
                  <span className="flex items-center gap-2">
                    <span
                      className="font-extrabold tabular-nums"
                      style={{ color: BAND_TEXT[band] }}
                    >
                      {pct(b.score)}
                    </span>
                    <span aria-hidden className="text-gov">→</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
