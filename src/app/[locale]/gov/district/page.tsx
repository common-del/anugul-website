import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import BlockSwitcher from "@/components/BlockSwitcher";
import Gauge from "@/components/Gauge";
import DistrictMapBands, { mapBandColor } from "@/components/DistrictMapBands";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { getBlockSlugs } from "@/lib/officialsData";
import districtData from "@/data/district.json";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type District = {
  name: string;
  districtAverage: number;
  schoolsAssessed: number;
  studentsAssessed: number;
  bestBlock: string;
  subjectMeans: Record<string, Record<string, number>>;
  blocks: { name: string; average: number; schools: number; students: number; g5: number; g8: number }[];
};
const district = districtData as unknown as District;

function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (a, [k, val]) => a.replaceAll(`{${k}}`, String(val)),
    s,
  );
}

// Bar colours: dark → light slate by rank (highest block darkest).
function barColor(rank: number, of: number) {
  const t = of > 1 ? rank / (of - 1) : 0; // 0 = darkest
  const from = [26, 31, 38]; // slate-700 #1A1F26
  const to = [148, 158, 170]; // light slate
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// District Report (mock-up Screen 5.1) — replaces the old Data & Analysis
// page (/gov/data redirects here). No year-over-year lines, no "data as on"
// date, no verified tick: there is no prior SAKSHAM cycle to compare against
// (owner decision 2026-07-09) — grade gauges compare vs the district average.
export default function DistrictReportPage({
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
  const subj = (s: string) => t.subjects[s as keyof typeof t.subjects] ?? s;
  const grade = (g: string) => t.grades[g as keyof typeof t.grades] ?? g;

  const slugs = Object.fromEntries(getBlockSlugs().map((b) => [b.name, b.slug]));
  const scores = Object.fromEntries(district.blocks.map((b) => [b.name, b.average]));
  const sorted = [...district.blocks].sort((a, z) => z.average - a.average);
  const maxAvg = sorted[0]?.average ?? 100;

  // District grade means: mean of the per-grade subject means (same definition
  // the block headline g5/g8 figures use).
  const gradeMean = (g: string) => {
    const m = district.subjectMeans[g] ?? {};
    const vals = Object.values(m);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  const g5 = gradeMean("Grade 5");
  const g8 = gradeMean("Grade 8");

  // Key insights — computed from the data, never hardcoded.
  const flat = Object.entries(district.subjectMeans).flatMap(([g, m]) =>
    Object.entries(m).map(([s, val]) => ({ grade: g, subject: s, val })),
  );
  const best = flat.length ? flat.reduce((a, z) => (z.val > a.val ? z : a)) : null;
  const worst = flat.length ? flat.reduce((a, z) => (z.val < a.val ? z : a)) : null;

  const stats = [
    {
      l: v.districtAverage,
      val: pct(district.districtAverage),
      cap: "",
      icon: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8L12 2z",
    },
    {
      l: t.analytics.schoolsAssessed,
      val: num(district.schoolsAssessed),
      cap: "",
      icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
    },
    {
      l: t.analytics.studentsAssessed,
      val: num(district.studentsAssessed),
      cap: v.loTag3,
      icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21v-1a6 6 0 0112 0v1M20 21v-1a6 6 0 00-3-5.2",
    },
    {
      l: v.blockLabel,
      val: num(district.blocks.length),
      cap: "",
      icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    },
    {
      l: v.topBlock,
      val: district.bestBlock,
      cap: pct(scores[district.bestBlock] ?? 0),
      icon: "M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3",
    },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" role="researcher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* top row: title | block switcher (centre) | WhatsApp (right) —
            identical arrangement to the block report */}
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr,auto,1fr]">
          <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
            {fill(v.distTitle, { name: district.name })}
          </h1>
          <div className="sm:justify-self-center">
            <BlockSwitcher
              locale={locale}
              current=""
              slugs={slugs}
              labels={{ switchBlock: v.switchBlock, allBlocks: v.districtAllBlocks }}
            />
          </div>
          <div className="sm:justify-self-end">
            <WhatsAppShare
              label={v.shareWhatsApp}
              text={fill(v.distTitle, { name: district.name })}
            />
          </div>
        </div>

        {/* five summary cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.l} className="gov-card p-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={s.icon} />
              </svg>
              <div className="mt-2 text-xs font-semibold text-muted">{s.l}</div>
              <div className="mt-0.5 truncate text-xl font-extrabold leading-tight text-gov-ink">
                {s.val}
              </div>
              {s.cap && <div className="mt-0.5 text-xs text-muted">{s.cap}</div>}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {/* district at a glance — map coloured by band */}
          <section className="gov-card flex flex-col p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.glanceT}</h2>
            <div className="mt-3">
              <DistrictMapBands
                locale={locale}
                scores={scores}
                slugs={slugs}
                hint={v.clickBlockHint}
              />
            </div>
          </section>

          {/* performance by blocks */}
          <section className="gov-card flex flex-col p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.perfBlocksT}</h2>
            <div className="mt-3 flex flex-1 flex-col justify-between gap-2">
              {sorted.map((b, i) => (
                <Link
                  key={b.name}
                  href={`/${locale}/gov/${slugs[b.name]}/`}
                  className="flex items-center gap-2 text-sm hover:opacity-90"
                >
                  <span className="w-24 shrink-0 truncate font-semibold text-gov-ink">
                    {b.name}
                  </span>
                  <span className="h-5 flex-1 overflow-hidden rounded bg-gov-tint">
                    <span
                      className="block h-full rounded"
                      style={{
                        width: `${(b.average / maxAvg) * 100}%`,
                        backgroundColor: barColor(i, sorted.length),
                      }}
                    />
                  </span>
                  <span className="w-11 shrink-0 text-right font-bold tabular-nums text-gov-ink">
                    {pct(b.average)}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/gov/`}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-gov px-4 text-sm font-bold text-gov transition hover:bg-gov-tint"
            >
              {v.viewAllBlocks} <span aria-hidden>→</span>
            </Link>
          </section>

          {/* grade-wise performance + key insights: two separate cards stacked
              in the third column, together filling the row height */}
          <div className="flex flex-col gap-6">
            <section className="gov-card p-5">
              <h2 className="text-lg font-bold text-gov-ink">{v.gradewiseT}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Gauge
                  value={g5}
                  display={pct(g5)}
                  label={grade("Grade 5")}
                  caption={fill(v.distAvgCaption, { n: pct(district.districtAverage) })}
                  color={mapBandColor(g5)}
                />
                <Gauge
                  value={g8}
                  display={pct(g8)}
                  label={grade("Grade 8")}
                  caption={fill(v.distAvgCaption, { n: pct(district.districtAverage) })}
                  color={mapBandColor(g8)}
                />
              </div>
            </section>

            {/* key insights — first two computed; the rest placeholders that
                fill the card so the column aligns with the rest of the row */}
            <section className="gov-card flex flex-1 flex-col p-5">
              <h2 className="text-lg font-bold text-gov-ink">{v.keyInsightsPlain}</h2>
              <ul className="mt-3 flex flex-1 flex-col justify-between gap-2.5 text-sm">
                {best && (
                  <li className="flex items-start gap-2.5 rounded-xl bg-gov-tint px-3 py-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
                      <path d="M23 6l-9.5 9.5-5-5L1 18" />
                      <path d="M17 6h6v6" />
                    </svg>
                    <span>
                      <span className="block text-xs font-semibold text-muted">{v.insightBestSubjectL}</span>
                      <span className="font-bold text-gov-ink">
                        {subj(best.subject)} · {grade(best.grade)} · {pct(best.val)}
                      </span>
                    </span>
                  </li>
                )}
                {worst && (
                  <li className="flex items-start gap-2.5 rounded-xl bg-gov-tint px-3 py-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C24E36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
                      <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                    </svg>
                    <span>
                      <span className="block text-xs font-semibold text-muted">{v.insightNeedsAttentionL}</span>
                      <span className="font-bold text-gov-ink">
                        {subj(worst.subject)} · {grade(worst.grade)} · {pct(worst.val)}
                      </span>
                    </span>
                  </li>
                )}
                {/* placeholder insight rows — dummy copy for the mockup, to be
                    replaced with real (i18n'd) computed insights later */}
                <li className="flex items-start gap-2.5 rounded-xl bg-gov-tint px-3 py-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                  <span>
                    <span className="block font-bold italic text-gov-ink">Third insight</span>
                    <span className="mt-0.5 block text-xs italic text-muted">To be added later</span>
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* downloads */}
        <section className="mt-6 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.downloadsT}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 min-[1200px]:grid-cols-5 min-[1200px]:gap-2.5">
            {[
              { t: v.dlDistPdfT, d: v.dlDistPdfD, href: "/data/downloads/district_report.pdf", excel: false },
              { t: v.dlDistXlsxT, d: v.dlDistXlsxD, href: "/data/downloads/district_report.xlsx", excel: true },
              { t: v.dlDistCsvT, d: v.dlDistCsvD, href: "/data/downloads/schools_overall.csv", excel: false },
              { t: v.dlLoCsvT, d: v.dlLoCsvD, href: "/data/downloads/learning_outcomes.csv", excel: false },
              { t: v.dlMisPdfT, d: v.dlMisPdfD, href: "/data/downloads/misconceptions_report.pdf", excel: false },
            ].map((c) => (
              <div key={c.t} className="flex flex-col rounded-xl border border-gov-line bg-white p-4 shadow-sm min-[1200px]:p-3">
                <div className="text-sm font-extrabold leading-snug text-gov-ink min-[1200px]:text-[13px]">{c.t}</div>
                <p className="mt-1 line-clamp-2 flex-1 text-xs text-muted">{c.d}</p>
                <a
                  href={c.href}
                  download
                  className={`mt-3 flex min-h-[42px] items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
                    c.excel
                      ? "bg-[#217346] text-white shadow-sm hover:shadow-lift"
                      : "border-2 border-gov text-gov hover:bg-gov-tint"
                  }`}
                >
                  {v.dlBtn} ↓
                </a>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted">{v.govDisclaimer}</p>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
