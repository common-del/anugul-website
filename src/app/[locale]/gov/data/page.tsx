import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, type BandKey } from "@/lib/bands";
import {
  getBlock,
  getBlockSlugs,
  getDistrictOfficials,
  getItems,
  getMisconceptions,
} from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const BAND_ORDER: BandKey[] = ["excelling", "developing", "needs", "urgent"];

// Researcher Data & Analysis (from the SAKSHAM block-report HTMLs): variance,
// children below 50% in every subject, above-cluster bright spots, band
// distribution by block, strongest/weakest LOs, misconceptions — plus the full
// CSV catalogue at every granularity the owner approved.
export default function GovDataPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const o = t.officials;
  const num = (n: number) => fmtNum(n, locale);
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const subj = (s: string) => t.subjects[s as keyof typeof t.subjects] ?? s;
  const grade = (g: string) => t.grades[g as keyof typeof t.grades] ?? g;

  const district = getDistrictOfficials();
  const blocks = getBlockSlugs().map((b) => ({ ...b, data: getBlock(b.slug) }));

  const variance: [string, number][] = [
    [o.varBlock, district.variance.block],
    [o.varCluster, district.variance.cluster],
    [o.varSchool, district.variance.school],
    [o.varChild, district.variance.child],
  ];

  // district-level strongest / weakest items (LO view)
  const items = getItems();
  const topLos = [...items].sort((a, z) => z.correct_pct - a.correct_pct).slice(0, 5);
  const bottomLos = [...items].sort((a, z) => a.correct_pct - z.correct_pct).slice(0, 5);
  const miscons = getMisconceptions().slice(0, 4);

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack role="researcher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.dataTitle}
        </h1>
        <p className="mt-1 text-muted">{v.dataIntro}</p>

        <h2 className="mt-6 text-lg font-bold text-gov-ink">{v.dataViewsT}</h2>

        <div className="mt-3 space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          <div className="space-y-5">
            {/* variance decomposition */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h3 className="text-base font-bold text-gov-ink">{o.varianceTitle}</h3>
              <p className="mt-1 text-sm text-muted">{o.varianceIntro}</p>
              <div className="mt-3 space-y-2">
                {variance.map(([label, val]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gov-ink">{label}</span>
                      <span className="font-semibold tabular-nums text-gov-ink">{pct(val)}</span>
                    </div>
                    <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-gov-tint">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${val}%`, backgroundColor: val >= 40 ? "#0E5A40" : "#8FBCA9" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* children below 50% in every subject, by block */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h3 className="text-base font-bold text-gov-ink">{o.failingTitle}</h3>
              <div className="overflow-x-auto">
                <table className="mt-2 w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted">
                      <th className="py-1 pr-2 font-semibold">{v.blockLabel}</th>
                      <th className="py-1 pr-2 text-right font-semibold">{grade("Grade 5")}</th>
                      <th className="py-1 text-right font-semibold">{grade("Grade 8")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map(({ name, slug, data }) => (
                      <tr key={slug} className="border-t border-gov-line">
                        <td className="py-1.5 pr-2">
                          <Link href={`/${locale}/gov/${slug}/`} className="text-gov underline-offset-2 hover:underline">
                            {name}
                          </Link>
                        </td>
                        {(["Grade 5", "Grade 8"] as const).map((g) => {
                          const f = data.failing_all?.[g];
                          return (
                            <td key={g} className="py-1.5 pr-2 text-right tabular-nums">
                              {f ? (
                                <span style={{ color: f.pct >= 20 ? "#b3261e" : "#12233d" }}>
                                  {pct(f.pct)}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* above-cluster bright spots */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h3 className="text-base font-bold text-gov-ink">{v.aboveClusterT}</h3>
              <p className="mt-1 text-sm text-muted">{v.aboveClusterD}</p>
              <ul className="mt-2 divide-y divide-gov-line text-sm">
                {blocks.map(({ name, slug, data }) => (
                  <li key={slug} className="flex items-center justify-between py-1.5">
                    <Link href={`/${locale}/gov/${slug}/`} className="text-gov underline-offset-2 hover:underline">
                      {name}
                    </Link>
                    <span className="font-semibold tabular-nums text-gov-ink">
                      {num(data.bright_spots.length)} {v.schoolsWord2}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-5">
            {/* band distribution by block */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h3 className="text-base font-bold text-gov-ink">{v.bandsByBlockT}</h3>
              <div className="mt-3 space-y-2.5">
                {blocks.map(({ name, slug, data }) => {
                  const counts = data.bands.overall?.counts ?? {};
                  const total = BAND_ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0) || 1;
                  return (
                    <div key={slug}>
                      <div className="flex justify-between text-sm">
                        <Link href={`/${locale}/gov/${slug}/`} className="text-gov-ink hover:underline">
                          {name}
                        </Link>
                        <span className="text-xs tabular-nums text-muted">{num(total)}</span>
                      </div>
                      <div className="mt-1 flex h-3.5 w-full overflow-hidden rounded" aria-hidden>
                        {BAND_ORDER.map((k) =>
                          counts[k] ? (
                            <span
                              key={k}
                              style={{
                                width: `${((counts[k] ?? 0) / total) * 100}%`,
                                backgroundColor: BAND_COLOR[k],
                              }}
                            />
                          ) : null,
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {BAND_ORDER.map((k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAND_COLOR[k] }} />
                    {t.band[k]}
                  </span>
                ))}
              </div>
            </section>

            {/* strongest / weakest LOs (district) */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h3 className="text-base font-bold text-gov-ink">{v.loTopT}</h3>
              <ul className="mt-2 divide-y divide-gov-line text-sm">
                {topLos.map((i) => (
                  <li key={`${i.grade}-${i.subject}-${i.q_no}`} className="flex items-start justify-between gap-3 py-2">
                    <span className="min-w-0 text-gov-ink">
                      {i.desc}
                      <span className="block text-xs text-muted">{subj(i.subject)} · {grade(i.grade)}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-[#1e6b3a]">{pct(i.correct_pct)}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-4 text-base font-bold text-gov-ink">{v.weakestLosT}</h3>
              <ul className="mt-2 divide-y divide-gov-line text-sm">
                {bottomLos.map((i) => (
                  <li key={`${i.grade}-${i.subject}-${i.q_no}`} className="flex items-start justify-between gap-3 py-2">
                    <span className="min-w-0 text-gov-ink">
                      {i.desc}
                      <span className="block text-xs text-muted">{subj(i.subject)} · {grade(i.grade)}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-[#b3261e]">{pct(i.correct_pct)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* misconceptions (sample) */}
        <section className="mt-6 rounded-2xl border border-gov-line bg-white p-5">
          <h2 className="text-lg font-bold text-gov-ink">{o.misconTitle}</h2>
          <p className="mt-1 text-sm text-muted">{v.misconIntroData}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {miscons.map((c, i) => (
              <article key={i} className="rounded-xl bg-gov-tint p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gov-mid">
                  {grade(c.grade)} · {subj(c.subject)}
                </p>
                <p className="mt-1 text-sm font-semibold text-gov-ink">{c.stem}</p>
                <p className="mt-1 text-xs text-muted">{c.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* download catalogue */}
        <section className="mt-6 rounded-2xl border border-gov-line bg-white p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.dlCatalogT}</h2>
          <p className="mt-1 text-sm text-muted">{v.dlCatalogIntro}</p>
          <ul className="mt-3 divide-y divide-gov-line">
            {v.dataFiles.map((f) => (
              <li key={f.file} className="flex items-center justify-between gap-4 py-2.5">
                <span className="min-w-0">
                  <span className="block font-semibold text-gov-ink">{f.label}</span>
                  <span className="block text-xs text-muted">{f.desc}</span>
                </span>
                <a
                  href={`/data/downloads/${f.file}`}
                  download
                  className="shrink-0 rounded-lg border-2 border-gov px-3 py-1.5 text-sm font-bold text-gov"
                >
                  CSV ↓
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link
              href={`/${locale}/officials/research/`}
              className="text-sm font-semibold text-gov underline underline-offset-2"
            >
              {v.dlOpenBlue} →
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
