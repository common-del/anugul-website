import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { getDistrictOfficials } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ResearchPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const d = getDistrictOfficials();
  const pct = (n: number) => fmtPercent(Math.round(n), locale);
  const cog = d.cognitive["Grade 5"]?.by_cog ?? {};
  const found = d.foundational["Grade 5"];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.researchTitle}
        </h1>

        <section className="mt-5 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.cogTitle}</h2>
          <p className="mt-1 text-sm text-muted">{o.cogIntro}</p>
          <div className="mt-3 space-y-2">
            {Object.entries(cog).map(([skill, v]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-ink">{skill}</span>
                  <span className="font-semibold tabular-nums text-brand-ink">
                    {pct(v as number)}
                  </span>
                </div>
                <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-brand-tint">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {found && (
          <section className="mt-5 rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="text-lg font-bold text-brand-ink">{o.foundTitle}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-tint p-3">
                <div className="text-2xl font-extrabold tabular-nums text-brand-ink">
                  {pct(found.at)}
                </div>
                <div className="text-xs text-muted">{o.foundAt}</div>
              </div>
              <div className="rounded-xl bg-brand-tint p-3">
                <div className="text-2xl font-extrabold tabular-nums text-brand-ink">
                  {pct(found.gm1)}
                </div>
                <div className="text-xs text-muted">{o.foundGm1}</div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.hardTitle}</h2>
          <p className="mt-1 text-xs text-muted">{o.hardNote}</p>
          <ul className="mt-2 divide-y divide-brand-line text-sm">
            {d.hard_los.map(
              (h: { lo: string; subject: string; pct: number; items: number; desc: string }) => (
                <li key={h.lo} className="flex items-start justify-between gap-3 py-2">
                  <span className="min-w-0 text-brand-ink">
                    {h.desc}
                    <span className="block text-xs text-muted">
                      {t.subjects[h.subject as keyof typeof t.subjects] ?? h.subject} ·{" "}
                      {fmtNum(h.items, locale)} item{h.items > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-[#b3261e]">
                    {pct(h.pct)}
                  </span>
                </li>
              ),
            )}
          </ul>
        </section>

        <Link
          href={`/${locale}/officials/research/items/`}
          className="mt-5 flex min-h-[52px] items-center justify-between rounded-xl border border-brand-line bg-white px-4 font-semibold text-brand-ink"
        >
          {o.itemsTitle} <span aria-hidden>→</span>
        </Link>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
