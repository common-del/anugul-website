import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GovBlockPicker from "@/components/GovBlockPicker";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { getBlockSlugs } from "@/lib/officialsData";
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

// Government & Orgs entry (docx mock): Select Block / District.
export default function GovPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const num = (n: number) => fmtNum(n, locale);
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const slugs = Object.fromEntries(getBlockSlugs().map((b) => [b.name, b.slug]));

  const stats = [
    { v: pct(district.districtAverage), l: v.districtAverage },
    { v: num(district.schoolsAssessed), l: t.analytics.schoolsAssessed },
    { v: num(district.studentsAssessed), l: t.analytics.studentsAssessed },
    { v: district.bestBlock, l: v.topBlock },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack role="researcher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">{v.govTitle}</h1>
        <p className="mt-1 text-muted">{v.govIntro}</p>

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

        <section className="mt-6">
          <GovBlockPicker
            locale={locale}
            slugs={slugs}
            labels={{ allBlocks: v.districtAllBlocks, hint: v.clickBlockHint }}
          />
        </section>

        {/* researcher data hub */}
        <Link
          href={`/${locale}/gov/data/`}
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border-2 border-gov bg-white p-5 hover:bg-gov-tint"
        >
          <span>
            <span className="block text-lg font-extrabold text-gov-ink">{v.dataHubT}</span>
            <span className="mt-0.5 block text-sm text-muted">{v.dataHubD}</span>
          </span>
          <span aria-hidden className="text-xl text-gov">→</span>
        </Link>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
