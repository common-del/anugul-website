import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrintButton from "@/components/PrintButton";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import { getMisconceptions } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    s,
  );
}

export default function MisconceptionsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const cards = getMisconceptions();
  const num = (n: number) => fmtNum(n, locale);

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.misconTitle}
        </h1>
        <p className="mt-1 text-muted">{o.misconIntro}</p>

        <div className="mt-5 space-y-4">
          {cards.map((c, i) => {
            const worstPct = Math.max(...Object.values(c.byBlock ?? {}));
            return (
              <article
                key={i}
                className="rounded-2xl border border-brand-line bg-white p-5"
                style={{ breakInside: "avoid" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                  {t.grades[c.grade as keyof typeof t.grades] ?? c.grade} ·{" "}
                  {t.subjects[c.subject as keyof typeof t.subjects] ?? c.subject}
                </p>
                <p className="mt-2 font-semibold text-brand-ink">{c.stem}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {Object.entries(c.opts).map(([k, v]) => (
                    <li
                      key={k}
                      className={`rounded-lg px-3 py-1.5 ${
                        k === c.correct
                          ? "bg-[#e7f2e9] font-semibold text-[#1e6b3a]"
                          : k === c.chosen
                            ? "bg-[#fbeaea] text-[#b3261e]"
                            : "bg-brand-tint text-brand-ink"
                      }`}
                    >
                      {k}. {v}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm font-semibold text-brand-ink">
                  {fill(o.misconChose, {
                    pct: num(worstPct),
                    wrong: c.opts[c.chosen] ?? c.chosen,
                    right: c.opts[c.correct] ?? c.correct,
                  })}
                </p>
                <p className="mt-1 text-sm text-muted">{c.text}</p>
                {c.byBlock && Object.keys(c.byBlock).length > 1 && (
                  <p className="mt-2 text-xs text-muted">
                    {o.misconByBlock}:{" "}
                    {Object.entries(c.byBlock)
                      .sort((a, z) => z[1] - a[1])
                      .map(([b, p]) => `${b} ${num(p)}%`)
                      .join(" · ")}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <div className="no-print mt-5">
          <PrintButton label={o.printPage} />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
