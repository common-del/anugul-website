import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrintButton from "@/components/PrintButton";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT } from "@/lib/bands";
import InputsCard from "@/components/InputsCard";
import { getCluster, getClusterIndex, type ClusterSlice } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getClusterIndex().map((c) => ({ locale, cluster: c.slug })),
  );
}
export const dynamicParams = false;

function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    s,
  );
}

export default function ClusterPage({
  params,
}: {
  params: { locale: string; cluster: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  let c: ClusterSlice;
  try {
    c = getCluster(params.cluster);
  } catch {
    notFound();
  }
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const num = (n: number) => fmtNum(n, locale);
  const worstSubjectLabel = c.worstSubject
    ? (t.subjects[c.worstSubject as keyof typeof t.subjects] ?? c.worstSubject)
    : null;

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <p className="text-sm font-semibold text-accent-dark">{o.clusterTitle}</p>
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {c.cluster}
        </h1>
        <p className="mt-1 text-sm text-muted">
          <Link
            href={`/${locale}/officials/block/${c.blockSlug}/`}
            className="text-brand underline-offset-2 hover:underline"
          >
            {c.block}
          </Link>{" "}
          · {fill(o.clusterRankLine, { rank: num(c.rank), of: num(c.of), block: c.block })}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { v: pct(c.score), l: o.leagueScore },
            { v: pct(c.blockScore), l: c.block },
            { v: num(c.students), l: o.leagueStudents },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-brand-tint p-3">
              <div className="text-xl font-extrabold tabular-nums text-brand-ink">
                {s.v}
              </div>
              <div className="truncate text-xs text-muted">{s.l}</div>
            </div>
          ))}
        </div>

        {/* inputs juxtaposed with the score above */}
        <div className="mt-6">
          <InputsCard data={c.inputs} unitName={c.cluster} o={o} locale={locale} />
        </div>

        {/* schools with bands */}
        <section className="mt-6 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.bandsTitle}</h2>
          <ul className="mt-2 divide-y divide-brand-line text-sm">
            {c.schools.map((s) => (
              <li key={s.udise} className="flex items-center justify-between gap-2 py-2">
                <Link
                  href={`/${locale}/school/${s.udise}/`}
                  className="min-w-0 flex-1 text-brand underline-offset-2 hover:underline"
                >
                  {s.name}
                </Link>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: BAND_COLOR[s.band],
                    color: s.band === "needs" ? "#12233d" : "#fff",
                  }}
                >
                  {t.band[s.band]}
                </span>
                <span
                  className="w-12 shrink-0 text-right font-semibold tabular-nums"
                  style={{ color: BAND_TEXT[s.band] }}
                >
                  {pct(s.score)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* recognition */}
        {(c.recognition.length > 0 || c.brightSpots.length > 0) && (
          <section className="mt-6 rounded-2xl bg-brand-tint p-5">
            <h2 className="text-lg font-bold text-brand-ink">{o.recognitionTitle}</h2>
            <ul className="mt-2 space-y-2 text-sm text-brand-ink">
              {c.recognition.map((r, i) => (
                <li key={i} className="rounded-xl bg-white px-4 py-3">
                  {fill(o.recognitionLine, {
                    desc: r.desc,
                    grade: t.grades[r.grade as keyof typeof t.grades] ?? r.grade,
                    subject: t.subjects[r.subject as keyof typeof t.subjects] ?? r.subject,
                    observed: fmtNum(Math.round(r.observed), locale),
                    district: fmtNum(Math.round(r.district), locale),
                    n: num(r.n),
                  })}
                </li>
              ))}
              {c.brightSpots.map((s, i) => (
                <li key={`b${i}`} className="rounded-xl bg-white px-4 py-3">
                  {fill(o.brightLine, {
                    name: s.name,
                    score: pct(s.score),
                    cluster: c.cluster,
                    clusterScore: pct(s.cluster_score),
                    students: num(s.students),
                  })}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">{o.smallN}</p>
          </section>
        )}

        {/* three questions */}
        <section className="mt-6 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.questionsTitle}</h2>
          <ul className="mt-2 space-y-2 text-sm text-brand-ink">
            <li className="rounded-xl bg-brand-tint px-4 py-3">“{o.q1}”</li>
            {worstSubjectLabel && (
              <li className="rounded-xl bg-brand-tint px-4 py-3">
                “{fill(o.q2, { subject: worstSubjectLabel })}”
              </li>
            )}
            <li className="rounded-xl bg-brand-tint px-4 py-3">“{o.q3}”</li>
          </ul>
        </section>

        <div className="no-print mt-5">
          <PrintButton label={o.printPage} />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
