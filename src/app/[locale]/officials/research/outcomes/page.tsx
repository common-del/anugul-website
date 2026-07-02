import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_TEXT, bandFromScore } from "@/lib/bands";
import { getItems } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Item = ReturnType<typeof getItems>[number];
type Lo = {
  lo: string; grade: string; subject: string; desc: string;
  gl: string; cog: string | null; mastery: number; items: Item[];
};

export default function OutcomesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const num = (n: number) => fmtNum(n, locale);

  // Aggregate the item bank into learning outcomes (mastery = mean % correct).
  const byLo = new Map<string, Lo>();
  for (const it of getItems()) {
    const key = `${it.grade}|${it.subject}|${it.lo}`;
    let l = byLo.get(key);
    if (!l) {
      l = { lo: it.lo, grade: it.grade, subject: it.subject, desc: it.desc,
            gl: it.gl, cog: it.cog, mastery: 0, items: [] };
      byLo.set(key, l);
    }
    l.items.push(it);
  }
  for (const l of byLo.values()) {
    l.mastery = l.items.reduce((s, i) => s + i.correct_pct, 0) / l.items.length;
  }

  // Group grade -> subject, LOs weakest-first.
  const grades = new Map<string, Map<string, Lo[]>>();
  for (const l of byLo.values()) {
    if (!grades.has(l.grade)) grades.set(l.grade, new Map());
    const g = grades.get(l.grade)!;
    if (!g.has(l.subject)) g.set(l.subject, []);
    g.get(l.subject)!.push(l);
  }
  const gradeKeys = [...grades.keys()].sort();
  for (const g of grades.values())
    for (const list of g.values()) list.sort((a, z) => a.mastery - z.mastery);

  const gl = (v: string) => (v.toLowerCase().startsWith("at") ? o.glAtGrade : o.glPrior);

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.outcomesTitle}
        </h1>
        <p className="mt-1 text-muted">{o.outcomesIntro}</p>

        <div className="mt-5 space-y-6">
          {gradeKeys.map((grade) => (
            <section key={grade}>
              <h2 className="text-lg font-bold text-brand-ink">
                {t.grades[grade as keyof typeof t.grades] ?? grade}
              </h2>
              <div className="mt-2 space-y-3">
                {[...grades.get(grade)!.entries()]
                  .sort((a, z) => a[0].localeCompare(z[0]))
                  .map(([subject, list]) => (
                    <details key={subject} className="rounded-xl border border-brand-line bg-white px-4 py-3">
                      <summary className="cursor-pointer text-sm font-bold text-brand-ink">
                        {t.subjects[subject as keyof typeof t.subjects] ?? subject} · {num(list.length)}
                      </summary>
                      <ul className="mt-3 space-y-3">
                        {list.map((l) => (
                          <li key={l.lo} className="border-t border-brand-line pt-3 first:border-0 first:pt-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm text-brand-ink">{l.desc}</p>
                                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                                  <span className="font-semibold">{l.lo}</span>
                                  <span className="rounded bg-brand-tint px-1.5 py-0.5">{gl(l.gl)}</span>
                                  {l.cog && <span className="rounded bg-brand-tint px-1.5 py-0.5">{l.cog}</span>}
                                  <span>{num(l.items.length)} {o.outcomesItems}</span>
                                </p>
                              </div>
                              <span
                                className="shrink-0 text-right text-base font-extrabold tabular-nums"
                                style={{ color: BAND_TEXT[bandFromScore(l.mastery)] }}
                              >
                                {pct(l.mastery)}
                              </span>
                            </div>
                            {l.items.length > 1 && (
                              <details className="mt-1.5">
                                <summary className="cursor-pointer text-xs font-semibold text-brand underline underline-offset-2">
                                  {o.outcomesShow}
                                </summary>
                                <ul className="mt-1 space-y-1 text-xs text-muted">
                                  {l.items
                                    .slice()
                                    .sort((a, z) => a.correct_pct - z.correct_pct)
                                    .map((i) => (
                                      <li key={i.q_no} className="flex justify-between gap-2">
                                        <span>Q{num(i.q_no)}</span>
                                        <span className="tabular-nums">{pct(i.correct_pct)}</span>
                                      </li>
                                    ))}
                                </ul>
                              </details>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
