import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtPercent } from "@/lib/format";
import { BAND_TEXT, bandFromScore } from "@/lib/bands";
import { getBlock, getBlockSlugs } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Reports landing (title-bar item + home "Explore Reports"): the school
// report-card finder, the district overview, and the eight block report cards.
export default function ReportsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  const blocks = getBlockSlugs().map((b) => {
    const d = getBlock(b.slug);
    return { name: b.name, slug: b.slug, score: d.headline.overall };
  });

  const bigCards = [
    {
      href: `/${locale}/find/`,
      title: v.reportsFindT,
      desc: v.reportsFindDesc,
    },
    {
      href: `/${locale}/gov/`,
      title: v.reportsDistrictT,
      desc: v.reportsDistrictDesc,
    },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.reportsTitle}
        </h1>
        <p className="mt-1 text-muted">{v.reportsIntro}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {bigCards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border border-gov-line bg-white p-5 hover:bg-gov-tint"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-lg font-extrabold text-gov-ink">{c.title}</span>
                <span aria-hidden className="text-gov">→</span>
              </span>
              <span className="mt-1 block text-sm text-muted">{c.desc}</span>
            </Link>
          ))}
        </div>

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
                      {fmtPercent(Math.round(b.score), locale)}
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
