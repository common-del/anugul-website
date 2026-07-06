import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import { hasCard, cardUrl } from "@/lib/cards";
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

  const Ladder = ({ value, top }: { value: number; top?: boolean }) => (
    <div className="flex gap-[3px]" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`h-3 flex-1 rounded-[3px] ${
            i < value ? (top ? "bg-accent" : "bg-gov") : "bg-gov-tint"
          }`}
        />
      ))}
    </div>
  );

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
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
              <span className="h-3 w-3 rounded bg-gov" /> {v.ourSchool}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-accent" /> {v.blockTop}
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
                        <Ladder value={mine} />
                        <Ladder value={top} top />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-5 flex flex-wrap gap-3">
            {hasCard(s.udise) && (
              <a
                href={cardUrl(s.udise)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-gov px-5 text-[15px] font-bold text-white active:brightness-110"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
                </svg>
                {v.downloadPdf}
              </a>
            )}
            <WhatsAppShare label={v.shareWhatsApp} text={s.name} />
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
