import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import BlockSwitcher from "@/components/BlockSwitcher";
import Gauge from "@/components/Gauge";
import { mapBandColor } from "@/components/DistrictMapBands";
import SubjectsVsDistrict, { type SubjectRow } from "@/components/SubjectsVsDistrict";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT, bandFromScore, type BandKey } from "@/lib/bands";
import { getBlock, getBlockSlugs, blockReportUrl, type BlockSlice } from "@/lib/officialsData";
import districtData from "@/data/district.json";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getBlockSlugs().map((b) => ({ locale, block: b.slug })),
  );
}
export const dynamicParams = false;

const BAND_ORDER: BandKey[] = ["excelling", "developing", "needs", "urgent"];


function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (a, [k, val]) => a.replaceAll(`{${k}}`, String(val)),
    s,
  );
}

type District = {
  schoolsAssessed: number;
  subjectMeans: Record<string, Record<string, number>>;
};
const district = districtData as unknown as District;

// Block Report Card — full rebuild to the mock-up (Screen 5.2). No
// year-over-year lines or "data as on" date (no prior cycle exists); grade
// gauges compare vs the district's per-grade means. The on-page learning-
// outcome breakdown was replaced by a download card, per the mock.
export default function GovBlockPage({
  params,
}: {
  params: { locale: string; block: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  let b: BlockSlice;
  try {
    b = getBlock(params.block);
  } catch {
    notFound();
  }
  const num = (n: number) => fmtNum(n, locale);
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const subj = (s: string) => t.subjects[s as keyof typeof t.subjects] ?? s;
  const grade = (g: string) => t.grades[g as keyof typeof t.grades] ?? g;

  const overallBand = bandFromScore(b.headline.overall);
  const distAvg = b.vs_best.overall.district_avg;

  // district per-grade means (same definition as the block headline figures)
  const gradeMean = (g: string) => {
    const m = district.subjectMeans[g] ?? {};
    const vals = Object.values(m);
    return vals.length ? vals.reduce((a, z) => a + z, 0) / vals.length : 0;
  };

  // ---- six key insights (computed) ----
  const allSubj = Object.entries(b.rel_subject).flatMap(([g, rows]) =>
    rows.map((r) => ({ ...r, grade: g })),
  );
  const bestSubj = allSubj.length
    ? allSubj.reduce((a, z) => (z.block > a.block ? z : a))
    : null;
  const clusters = [...b.cluster_league.rows].sort((a, z) => z.score - a.score);
  const bestCluster = clusters[0] ?? null;
  const worstCluster = clusters[clusters.length - 1] ?? null;
  const schoolsAsc = b.bands.overall?.schools ?? [];
  const bestSchool = schoolsAsc[schoolsAsc.length - 1] ?? null;
  const worstSchool = schoolsAsc[0] ?? null;
  const insights = [
    bestSubj && {
      l: v.bestSubject,
      val: `${subj(bestSubj.subject)} · ${grade(bestSubj.grade)}`,
      n: pct(bestSubj.block),
      good: true,
    },
    bestCluster && { l: v.bestCluster, val: bestCluster.cluster, n: pct(bestCluster.score), good: true },
    worstCluster && { l: v.clusterNeedsSupport, val: worstCluster.cluster, n: pct(worstCluster.score), good: false },
    // Scale convention: school-level numbers show /10, never % (admin units
    // — cluster/block/district — stay %).
    bestSchool && {
      l: v.bestSchool,
      val: bestSchool.name,
      n: `${num(Math.round(bestSchool.score / 10))}/${num(10)}`,
      good: true,
    },
    worstSchool && {
      l: v.schoolNeedsSupport,
      val: worstSchool.name,
      n: `${num(Math.round(worstSchool.score / 10))}/${num(10)}`,
      good: false,
    },
    {
      l: v.vsDistrictShortL,
      val: fill(v.vsDistrictShortV, { block: pct(b.headline.overall), district: pct(distAvg) }),
      n: `${b.headline.overall >= distAvg ? "+" : ""}${num(Math.round((b.headline.overall - distAvg) * 10) / 10)}`,
      good: b.headline.overall >= distAvg,
    },
  ].filter(Boolean) as { l: string; val: string; n: string; good: boolean }[];

  // ---- subjects vs district (toggle table data, pre-localised) ----
  const gradesTable: Record<string, SubjectRow[]> = {};
  for (const [g, rows] of Object.entries(b.rel_subject)) {
    gradesTable[grade(g)] = rows.map((r) => ({
      subject: subj(r.subject),
      block: r.block,
      district: r.district,
      blockD: pct(r.block),
      districtD: pct(r.district),
      diffD: `${r.gap > 0 ? "+" : ""}${num(r.gap)}`,
      diff: r.gap,
    }));
  }

  // ---- schools by band ----
  const counts = b.bands.overall?.counts ?? {};
  const totalSchools = BAND_ORDER.reduce((a, k) => a + (counts[k] ?? 0), 0);
  const bandDesc: Record<BandKey, string> = {
    excelling: v.bandDescExcelling,
    developing: v.bandDescDeveloping,
    needs: v.bandDescNeeds,
    urgent: v.bandDescUrgent,
  };

  const maxCluster = clusters.length ? clusters[0].score : 100;
  const subjectsCovered = [
    ...new Set(Object.values(b.rel_subject).flatMap((rows) => rows.map((r) => r.subject))),
  ];
  const slugs = Object.fromEntries(getBlockSlugs().map((x) => [x.name, x.slug]));

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" role="researcher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* ===== top row: title | block switcher (centre) | WhatsApp (right)
               — same arrangement as the district report ===== */}
        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr,auto,1fr]">
          <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
            {v.blockReportCardT}
          </h1>
          <div className="sm:justify-self-center">
            <BlockSwitcher
              locale={locale}
              current={b.name}
              slugs={slugs}
              labels={{ switchBlock: v.switchBlock, allBlocks: v.districtAllBlocks }}
            />
          </div>
          <div className="sm:justify-self-end">
            <WhatsAppShare label={v.shareWhatsApp} text={`${b.name} ${v.blockReportCardT}`} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {/* card 1 — dominant */}
          <div className="gov-card flex items-center gap-5 p-6">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#2D3A47" aria-hidden className="shrink-0">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                {v.overallBlockScore} · {b.name}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl font-extrabold tabular-nums" style={{ color: BAND_TEXT[overallBand] }}>
                  {pct(b.headline.overall)}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: BAND_COLOR[overallBand],
                    color: overallBand === "developing" ? "#12233d" : "#fff",
                  }}
                >
                  {t.band[overallBand]}
                </span>
              </div>
              <div className="mt-1 text-sm text-muted">
                {fill(v.vsDistrictAvg, { n: pct(distAvg) })}
              </div>
            </div>
          </div>
          {/* cards 2-4 — uniform */}
          <div className="grid grid-cols-3 gap-3">
            <div className="gov-card p-4">
              <div className="text-lg font-extrabold leading-tight text-gov-ink">
                {num(b.headline.schools)}
              </div>
              <div className="mt-0.5 text-xs text-muted">{t.analytics.schoolsAssessed}</div>
              <div className="mt-1 text-[11px] text-muted">
                {fill(v.ofDistrictSchools, { n: num(district.schoolsAssessed) })}
              </div>
            </div>
            <div className="gov-card p-4">
              <div className="text-lg font-extrabold leading-tight text-gov-ink">
                {num(b.headline.students)}
              </div>
              <div className="mt-0.5 text-xs text-muted">{t.analytics.studentsAssessed}</div>
              <div className="mt-1 text-[11px] text-muted">{v.loTag3}</div>
            </div>
            <div className="gov-card p-4">
              <div className="text-[13px] font-extrabold leading-snug text-gov-ink">
                {subjectsCovered.map(subj).join(" · ")}
              </div>
              <div className="mt-0.5 text-xs text-muted">{v.subjectsWord}</div>
            </div>
          </div>
        </div>

        {/* ===== key insights (6 cards, sentiment-tinted) ===== */}
        <section className="mt-6 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">
            {fill(v.keyInsights, { block: b.name })}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((ins) => (
              <div
                key={ins.l}
                className="rounded-xl p-3.5"
                style={{ backgroundColor: ins.good ? "#E9ECEE" : "#FCEBE5" }}
              >
                <div className="flex items-start gap-2.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ins.good ? "#2D3A47" : "#C24E36"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
                    {ins.good ? (
                      <>
                        <path d="M23 6l-9.5 9.5-5-5L1 18" />
                        <path d="M17 6h6v6" />
                      </>
                    ) : (
                      <>
                        <path d="M23 18l-9.5-9.5-5 5L1 6" />
                        <path d="M17 18h6v-6" />
                      </>
                    )}
                  </svg>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-muted">{ins.l}</div>
                    <div className="truncate text-sm font-bold text-gov-ink">{ins.val}</div>
                    <div className="mt-0.5 text-lg font-extrabold tabular-nums" style={{ color: ins.good ? "#2D3A47" : "#C24E36" }}>
                      {ins.n}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== grade-wise scores | schools by band ===== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.gradeWiseScores}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  ["Grade 5", b.headline.g5],
                  ["Grade 8", b.headline.g8],
                ] as [string, number][]
              ).map(([g, val]) => (
                <Gauge
                  key={g}
                  value={val}
                  display={pct(val)}
                  label={grade(g)}
                  caption={fill(v.distAvgCaption, { n: pct(gradeMean(g)) })}
                  color={mapBandColor(val)}
                />
              ))}
            </div>
          </section>

          <section className="gov-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-gov-ink">{v.bandSegregation}</h2>
              <details>
                <summary className="cursor-pointer list-none text-sm font-semibold text-gov underline underline-offset-2 [&::-webkit-details-marker]:hidden">
                  {v.whatBandsMean}
                </summary>
                <ul className="mt-2 space-y-1.5 rounded-xl bg-gov-tint p-3 text-sm">
                  {BAND_ORDER.map((k) => (
                    <li key={k} className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: BAND_COLOR[k] }} />
                      <span className="font-semibold text-gov-ink">{t.band[k]}</span>
                      <span className="text-muted">— {bandDesc[k]}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
            {/* stacked bar of all schools across the four bands */}
            {totalSchools > 0 && (
              <div className="mt-4 flex h-6 overflow-hidden rounded-lg" aria-hidden>
                {BAND_ORDER.map((k) =>
                  counts[k] ? (
                    <span
                      key={k}
                      style={{
                        width: `${((counts[k] ?? 0) / totalSchools) * 100}%`,
                        backgroundColor: BAND_COLOR[k],
                      }}
                    />
                  ) : null,
                )}
              </div>
            )}
            {/* band cards */}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {BAND_ORDER.map((k) => (
                <div
                  key={k}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: `${BAND_COLOR[k]}1F` }}
                >
                  <div className="text-xl font-extrabold tabular-nums" style={{ color: BAND_TEXT[k] }}>
                    {num(counts[k] ?? 0)}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-gov-ink">
                    {t.band[k]} · {v.schoolsWord}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ===== subjects vs district | cluster performance ===== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.subjectVsDistrictT}</h2>
            <div className="mt-3">
              <SubjectsVsDistrict
                grades={gradesTable}
                cols={{
                  subject: v.colSubject,
                  block: v.colBlock,
                  district: v.colDistrict,
                  diff: v.colDiff,
                }}
              />
            </div>
          </section>

          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.clusterPerformance}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded" style={{ backgroundColor: "#2D3A47" }} />
                {v.legendNormal}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded" style={{ backgroundColor: "#C24E36" }} />
                {v.legendUnder}
              </span>
            </div>
            <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {clusters.map((c) => {
                const under = c.score < 50;
                return (
                  <div key={c.cluster} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0 truncate text-gov-ink sm:w-40">{c.cluster}</span>
                    <span className="h-4 flex-1 overflow-hidden rounded bg-gov-tint">
                      <span
                        className="block h-full rounded"
                        style={{
                          width: `${(c.score / maxCluster) * 100}%`,
                          backgroundColor: under ? "#C24E36" : "#2D3A47",
                        }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-gov-ink">
                      {pct(c.score)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ===== learning outcome report card — coral-highlighted key download ===== */}
        <section className="mt-6 rounded-2xl border border-accent/50 bg-accent/10 p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#E56A4F" aria-hidden className="shrink-0">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gov-ink">{v.loCardT}</h2>
          </div>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-gov-ink">
                {fill(v.loCardTitle, { block: b.name })}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[v.loTag1, v.loTag2, v.loTag3].map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gov-dark shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <a
                href="/data/downloads/learning_outcomes_report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center rounded-xl bg-gov px-4 text-sm font-bold text-white shadow-sm transition hover:shadow-lift"
              >
                {v.dlPdfShort} ↓
              </a>
              <a
                href="/data/downloads/learning_outcomes_by_block.csv"
                download
                className="flex min-h-[44px] items-center rounded-xl border-2 border-gov px-4 text-sm font-bold text-gov transition hover:bg-gov-tint"
              >
                {v.dlCsvShort} ↓
              </a>
            </div>
          </div>
        </section>

        {/* ===== block overview | downloads & share ===== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.blockOverview}</h2>
            {/* No map here (owner, 2026-07-10) — just the eight block links,
                alphabetical, two columns of four. */}
            <ul className="mt-3 grid grid-cols-2 gap-2.5">
              {getBlockSlugs()
                .slice()
                .sort((a, z) => a.name.localeCompare(z.name))
                .map((x) => (
                  <li key={x.slug}>
                    <Link
                      href={`/${locale}/gov/${x.slug}/`}
                      aria-current={x.slug === b.slug ? "page" : undefined}
                      className={`flex min-h-[48px] items-center justify-between gap-2 rounded-xl px-4 text-sm font-bold ring-1 shadow-sm transition ${
                        x.slug === b.slug
                          ? "bg-gov text-white ring-gov"
                          : "bg-white text-gov-dark ring-gov-line hover:bg-gov-tint"
                      }`}
                    >
                      <span className="truncate">{x.name}</span>
                      <span aria-hidden className={x.slug === b.slug ? "text-white/80" : "text-gov"}>→</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>

          {/* WhatsApp moved to the top row (owner, 2026-07-10) — panel is
              downloads-only now */}
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.downloadsT}</h2>
            <div className="mt-3 space-y-2.5">
              <a
                href={blockReportUrl(b.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-gov-line bg-white p-4 shadow-sm transition hover:bg-gov-tint"
              >
                <span>
                  <span className="block text-sm font-bold text-gov-ink">{v.dlPdfRowT}</span>
                  <span className="mt-0.5 block text-xs text-muted">{v.dlPdfRowD}</span>
                </span>
                <span aria-hidden className="text-gov">↗</span>
              </a>
              <a
                href="/data/downloads/block_aggregates.csv"
                download
                className="flex items-center justify-between gap-3 rounded-xl border border-gov-line bg-white p-4 shadow-sm transition hover:bg-gov-tint"
              >
                <span>
                  <span className="block text-sm font-bold text-gov-ink">{v.dlCsvRowT}</span>
                  <span className="mt-0.5 block text-xs text-muted">{v.dlCsvRowD}</span>
                </span>
                <span aria-hidden className="text-gov">↓</span>
              </a>
            </div>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-muted">{v.govDisclaimer}</p>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
