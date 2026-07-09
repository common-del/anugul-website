import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import BlockSwitcher from "@/components/BlockSwitcher";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT, bandFromScore, type BandKey } from "@/lib/bands";
import { getBlock, getBlockSlugs, type BlockSlice } from "@/lib/officialsData";

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

// Government & Orgs block report card (docx mock / hand-drawn spec), green theme.
// Data from the officials block slice; the deep officer analytics stay at
// /officials/block. TODO: per-block PDF + full LOR download (assets pending).
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

  // key insights
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
  // best & weakest learning outcomes (hand-drawn spec) from the block's
  // skills top/bottom lists, flattened across subjects
  const flattenSkills = (m: Record<string, { grade: string; skill: string; pct: number }[]>) =>
    Object.entries(m ?? {}).flatMap(([sub, rows]) =>
      rows.map((r) => ({ ...r, subject: sub })),
    );
  const bestLos = flattenSkills(b.skills?.top).sort((a, z) => z.pct - a.pct);
  const weakLos = flattenSkills(b.skills?.bottom).sort((a, z) => a.pct - z.pct);
  const subjectsCovered = [
    ...new Set(Object.values(b.rel_subject).flatMap((rows) => rows.map((r) => r.subject))),
  ];

  const insights = [
    bestSubj && {
      l: v.bestSubject,
      val: `${subj(bestSubj.subject)} · ${grade(bestSubj.grade)}`,
      n: pct(bestSubj.block),
      good: true,
    },
    bestCluster && { l: v.bestCluster, val: bestCluster.cluster, n: pct(bestCluster.score), good: true },
    worstCluster && { l: v.clusterNeedsSupport, val: worstCluster.cluster, n: pct(worstCluster.score), good: false },
    bestSchool && { l: v.bestSchool, val: bestSchool.name, n: pct(bestSchool.score), good: true },
    worstSchool && { l: v.schoolNeedsSupport, val: worstSchool.name, n: pct(worstSchool.score), good: false },
  ].filter(Boolean) as { l: string; val: string; n: string; good: boolean }[];

  const bandDesc: Record<BandKey, string> = {
    excelling: v.bandDescExcelling,
    developing: v.bandDescDeveloping,
    needs: v.bandDescNeeds,
    urgent: v.bandDescUrgent,
  };
  const maxCluster = clusters.length ? clusters[0].score : 100;

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack role="researcher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gov-mid">{v.blockReport}</p>
          <BlockSwitcher
            locale={locale}
            current={b.name}
            slugs={Object.fromEntries(getBlockSlugs().map((x) => [x.name, x.slug]))}
            labels={{ switchBlock: v.switchBlock, allBlocks: v.districtAllBlocks }}
          />
        </div>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4 border-b-2 border-dashed border-gov-line pb-4">
          <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">{b.name}</h1>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {v.overallBlockScore}
            </div>
            <div className="text-3xl font-extrabold tabular-nums" style={{ color: BAND_TEXT[overallBand] }}>
              {pct(b.headline.overall)}
            </div>
            <div className="text-xs text-muted">
              {fill(v.vsDistrictAvg, { n: pct(b.vs_best.overall.district_avg) })}
            </div>
          </div>
        </div>

        {/* overview */}
        <section className="mt-5 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.blockOverview}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: num(b.headline.schools), l: t.analytics.schoolsAssessed },
              { v: num(b.headline.students), l: t.analytics.studentsAssessed },
              { v: `${grade("Grade 5")} & ${grade("Grade 8")}`, l: v.gradesCovered },
              { v: subjectsCovered.map(subj).join(" · "), l: v.subjectsWord, small: true },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-gov-tint p-3">
                <div
                  className={`font-extrabold leading-tight text-gov-ink ${
                    s.small ? "text-[13px]" : "text-lg"
                  }`}
                >
                  {s.v}
                </div>
                <div className="mt-0.5 text-xs text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* grade-wise scores */}
        <section className="mt-6 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.gradeWiseScores}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { g: "Grade 5", val: b.headline.g5 },
              { g: "Grade 8", val: b.headline.g8 },
            ].map((x) => (
              <div key={x.g} className="rounded-xl bg-gov-tint p-3">
                <div
                  className="text-2xl font-extrabold tabular-nums"
                  style={{ color: BAND_TEXT[bandFromScore(x.val)] }}
                >
                  {pct(x.val)}
                </div>
                <div className="mt-0.5 text-xs text-muted">{grade(x.g)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* key insights */}
        <section className="mt-6 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">
            {fill(v.keyInsights, { block: b.name })}
          </h2>
          <ul className="mt-3 space-y-2">
            {insights.map((ins) => (
              <li
                key={ins.l}
                className="flex items-center justify-between gap-3 rounded-xl bg-gov-tint px-4 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-muted">{ins.l}</span>
                  <span className="block truncate font-bold text-gov-ink">{ins.val}</span>
                </span>
                <span
                  className="shrink-0 text-lg font-extrabold tabular-nums"
                  style={{ color: ins.good ? "#1e6b3a" : "#b3261e" }}
                >
                  {ins.n}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          {/* subjects vs district */}
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.subjectVsDistrictT}</h2>
            {Object.entries(b.rel_subject).map(([g, rows]) => (
              <div key={g} className="mt-3">
                <h3 className="text-sm font-bold text-gov-ink">{grade(g)}</h3>
                <table className="mt-1 w-full text-sm">
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.subject} className="border-t border-gov-line">
                        <td className="py-1.5">{subj(r.subject)}</td>
                        <td className="py-1.5 text-right font-semibold tabular-nums text-gov-ink">
                          {pct(r.block)}
                        </td>
                        <td className="py-1.5 pl-3 text-right text-xs tabular-nums">
                          <span style={{ color: r.gap < 0 ? "#b3261e" : "#1e6b3a" }}>
                            {r.gap > 0 ? "+" : ""}
                            {num(r.gap)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          {/* schools by band */}
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.bandSegregation}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {BAND_ORDER.map((k) =>
                b.bands.overall?.counts[k] ? (
                  <span
                    key={k}
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{ backgroundColor: BAND_COLOR[k], color: k === "needs" ? "#12233d" : "#fff" }}
                  >
                    {t.band[k]} · {num(b.bands.overall.counts[k])}
                  </span>
                ) : null,
              )}
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-gov underline underline-offset-2">
                {v.whatBandsMean}
              </summary>
              <ul className="mt-2 space-y-1.5 text-sm">
                {BAND_ORDER.map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: BAND_COLOR[k] }} />
                    <span className="font-semibold text-gov-ink">{t.band[k]}</span>
                    <span className="text-muted">— {bandDesc[k]}</span>
                  </li>
                ))}
              </ul>
            </details>
          </section>
        </div>

        {/* cluster performance */}
        <section className="mt-6 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.clusterPerformance}</h2>
          <div className="mt-3 space-y-1.5">
            {clusters.map((c) => {
              const cb = bandFromScore(c.score);
              return (
                <div key={c.cluster} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 truncate text-gov-ink sm:w-44">{c.cluster}</span>
                  <span className="h-4 flex-1 overflow-hidden rounded bg-gov-tint">
                    <span
                      className="block h-full rounded"
                      style={{ width: `${(c.score / maxCluster) * 100}%`, backgroundColor: BAND_COLOR[cb] }}
                    />
                  </span>
                  <span
                    className="w-10 shrink-0 text-right font-semibold tabular-nums"
                    style={{ color: BAND_TEXT[cb] }}
                  >
                    {pct(c.score)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* best & weakest learning outcomes */}
        {(bestLos.length > 0 || weakLos.length > 0) && (
          <div className="mt-6 space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
            {bestLos.length > 0 && (
              <section className="gov-card p-5">
                <h2 className="text-lg font-bold text-gov-ink">{v.bestLosT}</h2>
                <ul className="mt-2 divide-y divide-gov-line text-sm">
                  {bestLos.slice(0, 8).map((h, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 py-2">
                      <span className="min-w-0 text-gov-ink">
                        {h.skill}
                        <span className="block text-xs text-muted">
                          {subj(h.subject)} · {grade(h.grade)}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-[#1e6b3a]">
                        {pct(h.pct)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {weakLos.length > 0 && (
              <section className="gov-card p-5">
                <h2 className="text-lg font-bold text-gov-ink">{v.weakestLosT}</h2>
                <ul className="mt-2 divide-y divide-gov-line text-sm">
                  {weakLos.slice(0, 8).map((h, i) => (
                    <li key={i} className="flex items-start justify-between gap-3 py-2">
                      <span className="min-w-0 text-gov-ink">
                        {h.skill}
                        <span className="block text-xs text-muted">
                          {subj(h.subject)} · {grade(h.grade)}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-[#b3261e]">
                        {pct(h.pct)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* downloads + actions */}
        <section className="mt-6 gov-card p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.downloadsT}</h2>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={`/data/downloads/blocks/${b.slug}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gov underline underline-offset-2"
            >
              {v.downloadBlockPdf} ↓
            </a>
            <a
              href="/data/downloads/learning_outcomes_report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gov underline underline-offset-2"
            >
              {v.downloadLorPdf} ↓
            </a>
            <a
              href="/data/downloads/learning_outcomes.csv"
              download
              className="font-semibold text-gov underline underline-offset-2"
            >
              {v.downloadLorCsv} ↓
            </a>
            <Link href={`/${locale}/gov/`} className="font-semibold text-gov underline underline-offset-2">
              {v.otherBlockReports} →
            </Link>
            <a
              href="/data/downloads/block_aggregates.csv"
              download
              className="font-semibold text-gov underline underline-offset-2"
            >
              {v.downloadDataSheet} ↓
            </a>
            <Link
              href={`/${locale}/find/?block=${encodeURIComponent(b.name)}`}
              className="font-semibold text-gov underline underline-offset-2"
            >
              {v.schoolLevelReports} →
            </Link>
          </div>
          <div className="mt-4">
            <WhatsAppShare label={v.shareWhatsApp} text={`${b.name} ${v.blockReport}`} />
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
