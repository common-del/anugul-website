import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import Stars from "@/components/Stars";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import { BAND_TEXT, type BandKey } from "@/lib/bands";
import schoolsData from "@/data/schools.json";

type School = {
  udise: string; name: string; block: string; cluster: string;
  overall: { score: number; band: BandKey };
  byGrade: Record<string, Record<string, number>>;
  assessedStudents: number | null;
};
const schools = schoolsData as unknown as Record<string, School>;
const score10 = (pct: number) => Math.round(pct / 10);

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(schools).map((udise) => ({ locale, udise })),
  );
}
export const dynamicParams = false;

// Discreet Principal / School Head view (docx mock): /10 card with our-school
// vs block-top ladders + the 3 principal actions. Reached from the officials
// area, not the public header selector. TODO: principal-specific PDF (uses the
// parent card PDF for now).
export default function PrincipalPage({
  params,
}: {
  params: { locale: string; udise: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const s = schools[params.udise];
  if (!s) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const num = (n: number) => fmtNum(n, locale);
  const grades = Object.keys(s.byGrade).sort();

  // block top per grade/subject = highest school score in the same block
  const blockPeers = Object.values(schools).filter((x) => x.block === s.block);
  const blockTop = (g: string, subj: string) => {
    let m = 0;
    for (const p of blockPeers) {
      const val = p.byGrade[g]?.[subj];
      if (val != null && val > m) m = val;
    }
    return score10(m);
  };

  const actions = [
    { n: 1, title: v.pa1Title, text: v.pa1Text },
    { n: 2, title: v.pa2Title, text: v.pa2Text },
    { n: 3, title: v.pa3Title, text: v.pa3Text },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack role="none" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <section className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-dashed border-gov-line pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">
              {v.youAre}{" "}
              <span className="rounded-full bg-gov px-2.5 py-0.5 text-[11px] font-bold text-white">
                {v.principalRole}
              </span>
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-gov-ink">{s.name}</h1>
            <p className="mt-1 text-sm text-muted">
              UDISE: {s.udise} · {s.block} · {s.cluster}
            </p>
          </div>
          <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full bg-gov">
            <div className="text-center leading-none">
              <span className="block text-[26px] font-extrabold text-white">
                {num(score10(s.overall.score))}
              </span>
              <span className="mt-1 block text-[11px] text-white/75">/{num(10)}</span>
            </div>
          </div>
        </section>

        {/* our school vs block top, per subject */}
        <section className="mt-5 rounded-2xl border border-gov-line bg-white p-5">
          <h2 className="text-lg font-bold text-gov-ink">{v.subjectsTitle}</h2>
          <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Stars score={1} max={1} size={13} /> {v.ourSchool}
            </span>
            <span className="flex items-center gap-1.5">
              <Stars score={1} max={1} size={13} tone="accent" /> {v.blockTop}
            </span>
          </div>
          {grades.map((g) => (
            <div key={g} className="mt-4">
              {grades.length > 1 && (
                <h3 className="text-sm font-bold text-gov-ink">
                  {t.grades[g as keyof typeof t.grades] ?? g}
                </h3>
              )}
              <div className="mt-2 space-y-3">
                {Object.entries(s.byGrade[g]).map(([subj, pct]) => {
                  const mine = score10(pct);
                  const top = blockTop(g, subj);
                  return (
                    <div key={subj}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gov-ink">
                          {t.subjects[subj as keyof typeof t.subjects] ?? subj}
                        </span>
                        <span className="tabular-nums">
                          <span className="font-bold text-gov-ink">{num(mine)}</span>
                          <span className="text-muted"> / {num(top)} {v.blockTop.toLowerCase()}</span>
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-20 shrink-0 text-xs text-muted">{v.ourSchool}</span>
                          <Stars score={mine} size={15} label={`${v.ourSchool} ${num(mine)}/${num(10)}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-20 shrink-0 text-xs text-muted">{v.blockTop}</span>
                          <Stars score={top} size={15} tone="accent" label={`${v.blockTop} ${num(top)}/${num(10)}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* WhatsApp first (heavier); principal-specific PDF generated at build */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <WhatsAppShare label={v.shareWhatsApp} text={s.name} />
            <a
              href={`/data/pcards/${s.udise}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-gov px-4 text-[14px] font-bold text-gov"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
              </svg>
              {v.downloadPdf}
            </a>
          </div>
        </section>

        {/* 3 principal actions */}
        <section className="mt-6">
          <h2 className="text-lg font-bold text-gov-ink">{v.principalActionsTitle}</h2>
          <p className="mt-1 text-muted">{v.principalActionsIntro}</p>
          <div className="mt-3 space-y-3">
            {actions.map((a) => (
              <div key={a.n} className="flex items-start gap-3 rounded-2xl border border-gov-line bg-white p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gov text-base font-extrabold text-white">
                  {num(a.n)}
                </span>
                <div>
                  <p className="font-bold text-gov-ink">{a.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
