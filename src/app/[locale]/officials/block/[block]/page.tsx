import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT, bandFromScore, type BandKey } from "@/lib/bands";
import InputsCard from "@/components/InputsCard";
import {
  getBlock,
  getBlockSlugs,
  getDistrictOfficials,
  type BlockSlice,
} from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getBlockSlugs().map((b) => ({ locale, block: b.slug })),
  );
}
export const dynamicParams = false;

function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    s,
  );
}

const BAND_ORDER: BandKey[] = ["excelling", "developing", "needs", "urgent"];

function heatColor(v: number) {
  if (v >= 50) return { backgroundColor: "#C24E36", color: "#fff" };
  if (v >= 30) return { backgroundColor: "#E5A24F", color: "#12233d" };
  if (v >= 15) return { backgroundColor: "#FCEBE5", color: "#12233d" };
  return { backgroundColor: "#eef2f8", color: "#12233d" };
}

export default function BlockPage({
  params,
}: {
  params: { locale: string; block: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  let b: BlockSlice;
  try {
    b = getBlock(params.block);
  } catch {
    notFound();
  }
  const district = getDistrictOfficials();
  const vb = b.vs_best.overall;
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const num = (n: number) => fmtNum(n, locale);

  const variance: [string, number][] = [
    [o.varBlock, district.variance.block],
    [o.varCluster, district.variance.cluster],
    [o.varSchool, district.variance.school],
    [o.varChild, district.variance.child],
  ];
  const whatifN = Object.keys(b.leverage.whatif).sort((a, z) => +a - +z);
  const cogGrades = Object.keys(b.cognitive).sort();
  const foundGrades = Object.keys(b.foundational).sort();
  const weakLos = foundGrades
    .flatMap((g) => b.foundational[g]?.weak_los ?? [])
    .sort((a, z) => a.pct - z.pct)
    .slice(0, 8);
  const heatSubjects = Array.from(
    new Set(
      Object.values(b.clusters_heatmap).flatMap((row) =>
        Object.keys(row).filter((k) => !k.startsWith("_")),
      ),
    ),
  ).sort();

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <p className="text-sm font-semibold text-accent-dark">{o.blockTitle}</p>
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {b.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {fill(o.rankLine, {
            rank: num(vb.rank),
            n: num(vb.n_blocks),
            best: vb.best_name,
            bestScore: pct(vb.best),
            district: pct(vb.district_avg),
          })}
        </p>

        {/* 1 — at a glance */}
        <section className="mt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { v: pct(b.headline.overall), l: o.overall },
              { v: pct(b.headline.g5), l: o.grade5 },
              { v: pct(b.headline.g8), l: o.grade8 },
              { v: num(b.headline.schools), l: o.schools },
              { v: num(b.headline.students), l: o.students },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-brand-tint p-3">
                <div className="text-xl font-extrabold tabular-nums text-brand-ink">
                  {s.v}
                </div>
                <div className="text-xs text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* inputs juxtaposed with the outcome above */}
        <div className="mt-6">
          <InputsCard data={b.inputs} unitName={b.name} o={o} locale={locale} />
        </div>

        <div className="mt-6 space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:space-y-0">
          <div className="space-y-6">
            {/* 2 — variance */}
            <section className="rounded-2xl border border-brand-line bg-white p-5">
              <h2 className="text-lg font-bold text-brand-ink">{o.varianceTitle}</h2>
              <p className="mt-1 text-sm text-muted">{o.varianceIntro}</p>
              <div className="mt-3 space-y-2">
                {variance.map(([label, v]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-ink">{label}</span>
                      <span className="font-semibold tabular-nums text-brand-ink">
                        {pct(v)}
                      </span>
                    </div>
                    <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-brand-tint">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${v}%`,
                          backgroundColor: v >= 40 ? "#123c7b" : "#8fabd4",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3 — leverage */}
            <section className="rounded-2xl border border-brand-line bg-white p-5">
              <h2 className="text-lg font-bold text-brand-ink">{o.leverageTitle}</h2>
              <p className="mt-1 text-sm text-muted">{o.leverageIntro}</p>
              <p className="mt-2 text-sm font-semibold text-brand-ink">
                {fill(o.halfDeficit, {
                  n: num(b.leverage.schools_for_half_deficit),
                  total: num(b.leverage.n_schools),
                })}
              </p>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="py-1 pr-2 font-semibold">{o.leverageSchool}</th>
                    <th className="py-1 pr-2 text-right font-semibold">{o.leverageScore}</th>
                    <th className="py-1 text-right font-semibold">{o.leverageStudents}</th>
                  </tr>
                </thead>
                <tbody>
                  {b.leverage.top.slice(0, 15).map((s) => (
                    <tr key={s.udise} className="border-t border-brand-line">
                      <td className="py-1.5 pr-2">
                        <Link
                          href={`/${locale}/school/${s.udise}/`}
                          className="text-brand underline-offset-2 hover:underline"
                        >
                          {s.name}
                        </Link>
                        <span className="block text-xs text-muted">{s.cluster}</span>
                      </td>
                      <td
                        className="py-1.5 pr-2 text-right font-semibold tabular-nums"
                        style={{ color: BAND_TEXT[bandFromScore(s.score)] }}
                      >
                        {pct(s.score)}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-muted">
                        {num(s.students)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 rounded-xl bg-brand-tint p-3">
                <p className="text-sm font-bold text-brand-ink">{o.whatifTitle}</p>
                <ul className="mt-1 space-y-1 text-sm text-brand-ink">
                  {whatifN.map((k) => (
                    <li key={k}>
                      {fill(o.whatifLine, {
                        n: num(+k),
                        delta: fmtNum(b.leverage.whatif[k].delta, locale),
                        new: pct(b.leverage.whatif[k].new),
                      })}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-muted">{o.whatifNote}</p>
              </div>
              <p className="mt-2 text-sm text-muted">
                {fill(o.concentrationLine, {
                  pct: num(b.concentration.top20_share),
                  schools: num(b.concentration.top20_schools),
                })}
              </p>
            </section>

            {/* 4 — subjects vs district + drop */}
            <section className="rounded-2xl border border-brand-line bg-white p-5">
              <h2 className="text-lg font-bold text-brand-ink">
                {o.subjectsVsDistrict}
              </h2>
              {Object.entries(b.rel_subject).map(([grade, rows]) => (
                <div key={grade} className="mt-3">
                  <h3 className="text-sm font-bold text-brand-ink">
                    {t.grades[grade as keyof typeof t.grades] ?? grade}
                  </h3>
                  <table className="mt-1 w-full text-sm">
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.subject} className="border-t border-brand-line">
                          <td className="py-1">
                            {t.subjects[r.subject as keyof typeof t.subjects] ?? r.subject}
                          </td>
                          <td className="py-1 text-right tabular-nums">{pct(r.block)}</td>
                          <td className="py-1 pl-2 text-right text-xs tabular-nums text-muted">
                            {o.gap}{" "}
                            <span
                              className="font-semibold"
                              style={{ color: r.gap < 0 ? "#C24E36" : "#2D3A47" }}
                            >
                              {r.gap > 0 ? "+" : ""}
                              {fmtNum(r.gap, locale)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <h3 className="mt-4 text-sm font-bold text-brand-ink">{o.dropTitle}</h3>
              <p className="text-xs text-muted">{o.dropIntro}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.entries(b.drop).map(([subj, v]) => (
                  <span
                    key={subj}
                    className="rounded-full bg-brand-tint px-3 py-1 text-sm tabular-nums"
                    style={{ color: v < -5 ? "#C24E36" : "#12233d" }}
                  >
                    {t.subjects[subj as keyof typeof t.subjects] ?? subj}{" "}
                    {v > 0 ? "+" : ""}
                    {fmtNum(v, locale)}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* 5 — bright spots */}
            <section className="rounded-2xl bg-brand-tint p-5">
              <h2 className="text-lg font-bold text-brand-ink">{o.brightTitle}</h2>
              <p className="mt-1 text-sm text-muted">{o.brightIntro}</p>
              <ul className="mt-3 space-y-2">
                {b.bright_spots.slice(0, 5).map((s) => (
                  <li key={s.udise} className="rounded-xl bg-white px-4 py-3 text-sm">
                    <Link
                      href={`/${locale}/school/${s.udise}/`}
                      className="font-bold text-brand underline-offset-2 hover:underline"
                    >
                      {s.name}
                    </Link>
                    <span className="block text-brand-ink">
                      {fill(o.brightLine, {
                        name: "",
                        score: pct(s.score),
                        cluster: s.cluster,
                        clusterScore: pct(s.cluster_score),
                        students: num(s.students),
                      }).replace(/^ +/, "")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 6 — failing all */}
            <section className="rounded-2xl border border-brand-line bg-white p-5">
              <h2 className="text-lg font-bold text-brand-ink">{o.failingTitle}</h2>
              <ul className="mt-2 space-y-1 text-sm text-brand-ink">
                {Object.entries(b.failing_all).map(([grade, f]) => (
                  <li key={grade}>
                    {fill(o.failingLine, {
                      grade: t.grades[grade as keyof typeof t.grades] ?? grade,
                      n: num(f.n),
                      N: num(f.N),
                      pct: fmtNum(f.pct, locale),
                    })}
                  </li>
                ))}
              </ul>
            </section>

            {/* 7 — bands */}
            <section className="rounded-2xl border border-brand-line bg-white p-5">
              <h2 className="text-lg font-bold text-brand-ink">{o.bandsTitle}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {BAND_ORDER.map((k) =>
                  b.bands.overall.counts[k] ? (
                    <span
                      key={k}
                      className="rounded-full px-3 py-1 text-sm font-bold"
                      style={{
                        backgroundColor: BAND_COLOR[k],
                        color: k === "developing" ? "#12233d" : "#fff",
                      }}
                    >
                      {t.band[k]} · {num(b.bands.overall.counts[k])}
                    </span>
                  ) : null,
                )}
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-brand underline underline-offset-2">
                  {o.bandsShow}
                </summary>
                <ul className="mt-2 max-h-96 divide-y divide-brand-line overflow-y-auto text-sm">
                  {b.bands.overall.schools.map((s) => (
                    <li key={s.udise} className="flex items-center justify-between gap-2 py-1.5">
                      <Link
                        href={`/${locale}/school/${s.udise}/`}
                        className="min-w-0 flex-1 truncate text-brand underline-offset-2 hover:underline"
                      >
                        {s.name}
                      </Link>
                      <span
                        className="shrink-0 font-semibold tabular-nums"
                        style={{ color: BAND_TEXT[s.band] }}
                      >
                        {pct(s.score)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          </div>
        </div>

        {/* cluster league */}
        <section className="mt-6 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.leagueTitle}</h2>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-1 pr-2 font-semibold">{o.leagueCluster}</th>
                  <th className="py-1 pr-2 text-right font-semibold">{o.leagueScore}</th>
                  <th className="py-1 pr-2 text-right font-semibold">{o.leagueStudents}</th>
                  <th className="py-1 pr-2 text-right font-semibold">{o.leagueSchools}</th>
                  <th className="py-1 text-right font-semibold">{o.leagueSpread}</th>
                </tr>
              </thead>
              <tbody>
                {b.cluster_league.rows.map((r) => (
                  <tr key={r.cluster} className="border-t border-brand-line">
                    <td className="py-1.5 pr-2">{r.cluster}</td>
                    <td
                      className="py-1.5 pr-2 text-right font-semibold tabular-nums"
                      style={{ color: BAND_TEXT[bandFromScore(r.score)] }}
                    >
                      {pct(r.score)}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums text-muted">
                      {num(r.students)}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums text-muted">
                      {num(r.schools)}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-muted">
                      {pct(r.worst_school)}–{pct(r.best_school)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* heatmap */}
        <section className="mt-6 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.heatmapTitle}</h2>
          <p className="mt-1 text-sm text-muted">{o.heatmapIntro}</p>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-1 pr-2 font-semibold">{o.leagueCluster}</th>
                  {heatSubjects.map((s) => (
                    <th key={s} className="px-1 py-1 text-center font-semibold">
                      {t.subjects[s as keyof typeof t.subjects] ?? s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(b.clusters_heatmap)
                  .sort((a, z) => (z[1]._overall ?? 0) - (a[1]._overall ?? 0))
                  .map(([cluster, row]) => (
                    <tr key={cluster} className="border-t border-brand-line">
                      <td className="py-1 pr-2">{cluster}</td>
                      {heatSubjects.map((s) => (
                        <td key={s} className="px-0.5 py-0.5 text-center">
                          {row[s] !== undefined ? (
                            <span
                              className="inline-block w-full rounded px-1 py-0.5 tabular-nums"
                              style={heatColor(row[s])}
                            >
                              {fmtNum(Math.round(row[s]), locale)}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* learning detail: cognitive skills, foundational, weak LOs, misconceptions */}
        <div className="mt-6 space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:space-y-0">
          <div className="space-y-6">
            {cogGrades.some((g) => Object.keys(b.cognitive[g]?.by_cog ?? {}).length) && (
              <section className="rounded-2xl border border-brand-line bg-white p-5">
                <h2 className="text-lg font-bold text-brand-ink">{o.cogTitle}</h2>
                <p className="mt-1 text-sm text-muted">{o.cogIntro}</p>
                {cogGrades.map((g) => {
                  const by = b.cognitive[g]?.by_cog ?? {};
                  if (!Object.keys(by).length) return null;
                  return (
                    <div key={g} className="mt-3">
                      <h3 className="text-sm font-bold text-brand-ink">
                        {t.grades[g as keyof typeof t.grades] ?? g}
                      </h3>
                      <div className="mt-2 space-y-2">
                        {Object.entries(by).map(([skill, v]) => (
                          <div key={skill}>
                            <div className="flex justify-between text-sm">
                              <span className="text-brand-ink">{skill}</span>
                              <span className="font-semibold tabular-nums text-brand-ink">{pct(v)}</span>
                            </div>
                            <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-brand-tint">
                              <div className="h-full rounded-full bg-brand" style={{ width: `${v}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {foundGrades.length > 0 && (
              <section className="rounded-2xl border border-brand-line bg-white p-5">
                <h2 className="text-lg font-bold text-brand-ink">{o.foundTitle}</h2>
                {foundGrades.map((g) => {
                  const f = b.foundational[g];
                  if (!f) return null;
                  return (
                    <div key={g} className="mt-3">
                      <h3 className="text-sm font-bold text-brand-ink">
                        {t.grades[g as keyof typeof t.grades] ?? g}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-brand-tint p-3">
                          <div className="text-2xl font-extrabold tabular-nums text-brand-ink">{pct(f.at)}</div>
                          <div className="text-xs text-muted">{o.foundAt}</div>
                        </div>
                        <div className="rounded-xl bg-brand-tint p-3">
                          <div className="text-2xl font-extrabold tabular-nums text-brand-ink">{pct(f.gm1)}</div>
                          <div className="text-xs text-muted">{o.foundGm1}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>

          <div className="space-y-6">
            {weakLos.length > 0 && (
              <section className="rounded-2xl border border-brand-line bg-white p-5">
                <h2 className="text-lg font-bold text-brand-ink">{o.blockWeakLoTitle}</h2>
                <ul className="mt-2 divide-y divide-brand-line text-sm">
                  {weakLos.map((h) => (
                    <li key={h.lo} className="flex items-start justify-between gap-3 py-2">
                      <span className="min-w-0 text-brand-ink">
                        {h.desc}
                        <span className="block text-xs text-muted">
                          {t.subjects[h.subject as keyof typeof t.subjects] ?? h.subject} · {h.lo}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-[#C24E36]">
                        {pct(h.pct)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {b.miscon.length > 0 && (
              <section className="rounded-2xl border border-brand-line bg-white p-5">
                <h2 className="text-lg font-bold text-brand-ink">{o.misconTitle}</h2>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-semibold text-brand underline underline-offset-2">
                    {fill(o.blockMisconShow, { n: num(b.miscon.length) })}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {b.miscon.map((c, i) => (
                      <article key={i} className="rounded-xl bg-brand-tint p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                          {t.grades[c.grade as keyof typeof t.grades] ?? c.grade} ·{" "}
                          {t.subjects[c.subject as keyof typeof t.subjects] ?? c.subject}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-brand-ink">{c.stem}</p>
                        {c.pct != null && (
                          <p className="mt-1 text-sm text-brand-ink">
                            {fill(o.misconChose, {
                              pct: num(c.pct),
                              wrong: c.opts[c.chosen] ?? c.chosen,
                              right: c.opts[c.correct] ?? c.correct,
                            })}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted">{c.text}</p>
                      </article>
                    ))}
                  </div>
                </details>
              </section>
            )}
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
