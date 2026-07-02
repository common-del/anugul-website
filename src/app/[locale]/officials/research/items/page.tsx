import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import { getItems } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ItemsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const items = getItems();
  const num = (n: number) => fmtNum(n, locale);

  const byGradeSubject = new Map<string, typeof items>();
  for (const i of items) {
    const key = `${i.grade} · ${i.subject}`;
    if (!byGradeSubject.has(key)) byGradeSubject.set(key, []);
    byGradeSubject.get(key)!.push(i);
  }

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.itemsTitle}
        </h1>
        <p className="mt-1 text-muted">
          {o.itemsIntro.replace("{n}", num(items.length))}
        </p>

        <div className="mt-5 space-y-3">
          {[...byGradeSubject.entries()].map(([group, list]) => (
            <details
              key={group}
              className="rounded-xl border border-brand-line bg-white px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-bold text-brand-ink">
                {group} · {num(list.length)}
              </summary>
              <div className="overflow-x-auto">
                <table className="mt-2 w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted">
                      <th className="py-1 pr-2 font-semibold">Q</th>
                      <th className="py-1 pr-2 font-semibold">LO</th>
                      <th className="py-1 pr-2 font-semibold">Cog</th>
                      <th className="py-1 pr-2 text-right font-semibold">{o.itemsCorrect}</th>
                      <th className="py-1 text-right font-semibold">{o.itemsDiscrimination}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((i) => (
                      <tr key={i.q_no} className="border-t border-brand-line align-top">
                        <td className="py-1.5 pr-2 tabular-nums text-muted">{i.q_no}</td>
                        <td className="py-1.5 pr-2">
                          <span className="font-semibold text-brand-ink">{i.lo}</span>
                          <span className="block max-w-xs text-xs text-muted">{i.desc}</span>
                        </td>
                        <td className="py-1.5 pr-2 text-xs text-muted">
                          {i.cog ?? "—"}
                          <span className="block">{i.gl}</span>
                        </td>
                        <td className="py-1.5 pr-2 text-right font-semibold tabular-nums text-brand-ink">
                          {fmtNum(Math.round(i.correct_pct), locale)}%
                        </td>
                        <td className="py-1.5 text-right tabular-nums text-muted">
                          {i.discrimination != null ? fmtNum(Math.round(i.discrimination), locale) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
