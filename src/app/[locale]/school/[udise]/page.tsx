import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import { hasCard, cardUrl } from "@/lib/cards";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT, type BandKey } from "@/lib/bands";
import schoolsData from "@/data/schools.json";

type Profile = {
  classRange: string | null;
  management: string | null;
  enrolment: number | null;
  teachers: number | null;
  classrooms: number | null;
};
type Inputs = {
  basicsIn?: string[];
  basicsOut?: string[];
} | null;
type School = {
  udise: string;
  name: string;
  block: string;
  cluster: string;
  overall: { score: number; band: BandKey };
  byGrade: Record<string, Record<string, number>>;
  assessedStudents: number | null;
  profile: Profile | null;
  inputs: Inputs;
  neighbours: { udise: string; km: number | null }[];
};

const schools = schoolsData as unknown as Record<string, School>;

// Block-wise "how to read your report card" explainer videos (from the
// approved mock-up doc).
const EXPLAINER: Record<string, string> = {
  Angul: "https://youtu.be/gn9tbf-tLkA",
  Athamallik: "https://youtu.be/r04dfh8Gq94",
  Talcher: "https://youtu.be/lq_Z0Ikqlag",
};
const EXPLAINER_DEFAULT = "https://youtu.be/OcBdapIlGHM";

const score10 = (pct: number) => Math.round(pct / 10);

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(schools).map((udise) => ({ locale, udise })),
  );
}
export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: { locale: string; udise: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const s = schools[params.udise];
  if (!s) return {};
  const t = getDict(params.locale);
  const title = `${s.name} · ${t.site.name}`;
  return {
    title,
    description: t.site.description,
    openGraph: { title, description: t.site.description },
  };
}

// v2 parent report card (docx mock): /10 overall, subject scores, download +
// WhatsApp, per-block explainer video, About Your School, named nearby list.
export default function SchoolPage({
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
  const overall10 = score10(s.overall.score);
  const grades = Object.keys(s.byGrade).sort();

  const neighbours = (s.neighbours ?? [])
    // the source CSV occasionally lists a school as its own neighbour
    .filter((n) => n.udise !== s.udise)
    .map((n) => {
      const ns = schools[n.udise];
      return ns
        ? {
            udise: ns.udise,
            name: ns.name,
            cluster: ns.cluster,
            km: n.km,
            s10: score10(ns.overall.score),
            band: ns.overall.band,
          }
        : null;
    })
    .filter(Boolean) as {
    udise: string; name: string; cluster: string; km: number | null;
    s10: number; band: BandKey;
  }[];
  neighbours.sort((a, z) => z.s10 - a.s10);

  const about: { label: string; value: string }[] = [];
  if (s.profile?.management) about.push({ label: t.profile.management, value: s.profile.management });
  if (s.profile?.classRange) about.push({ label: t.profile.classRange, value: s.profile.classRange });
  if (s.profile?.enrolment != null) about.push({ label: t.profile.students, value: num(s.profile.enrolment) });
  if (s.profile?.teachers != null) about.push({ label: t.profile.teachers, value: num(s.profile.teachers) });

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* header row */}
        <section className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-dashed border-gov-line pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted">
              {v.youAre}{" "}
              <span className="rounded-full bg-gov px-2.5 py-0.5 text-[11px] font-bold text-white">
                {v.roleParent}
              </span>
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-gov-ink">
              {s.name}
            </h1>
            <p className="mt-1 text-sm text-muted">
              UDISE: {s.udise} · {s.block} · {s.cluster}
              {s.assessedStudents
                ? ` · ${num(s.assessedStudents)} ${t.report.studentsAssessed}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {v.overallScore}
              </div>
              <div
                className="text-[13px] font-bold"
                style={{ color: BAND_TEXT[s.overall.band] }}
              >
                {t.band[s.overall.band]}
              </div>
            </div>
            <div className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full bg-gov">
              <div className="text-center leading-none">
                <span className="block text-[26px] font-extrabold text-white">
                  {num(overall10)}
                </span>
                <span className="mt-1 block text-[11px] text-white/75">
                  /{num(10)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* plain-language band strip (docx follow-up): where this school stands */}
        <section className="mt-5 rounded-2xl border border-gov-line bg-white p-5">
          <h2 className="text-base font-bold text-gov-ink">{v.bandStripTitle}</h2>
          <div className="relative mt-7" aria-hidden>
            <div
              className="absolute -top-5 z-10 -translate-x-1/2 text-gov-ink"
              style={{ left: `${Math.min(Math.max(s.overall.score, 3), 97)}%` }}
            >
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                <path d="M8 12L0 0h16z" />
              </svg>
            </div>
            <div className="flex h-6 overflow-hidden rounded-lg">
              {(["urgent", "needs", "developing", "excelling"] as BandKey[]).map((k) => (
                <div key={k} className="flex-1" style={{ backgroundColor: BAND_COLOR[k] }} />
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-4 gap-1 text-center">
              {(["urgent", "needs", "developing", "excelling"] as BandKey[]).map((k) => (
                <div key={k} className="min-w-0">
                  <div
                    className="truncate text-[11px] font-bold leading-tight"
                    style={{ color: BAND_TEXT[k] }}
                  >
                    {t.band[k]}
                  </div>
                  <div className="text-[10.5px] leading-tight text-muted">
                    {
                      {
                        urgent: v.bandDescUrgent,
                        needs: v.bandDescNeeds,
                        developing: v.bandDescDeveloping,
                        excelling: v.bandDescExcelling,
                      }[k]
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-gov-ink">
            {v.bandStripLine
              .replace("{band}", t.band[s.overall.band])
              .replace(
                "{desc}",
                {
                  urgent: v.bandDescUrgent,
                  needs: v.bandDescNeeds,
                  developing: v.bandDescDeveloping,
                  excelling: v.bandDescExcelling,
                }[s.overall.band],
              )}
          </p>
        </section>

        {/* what you can do */}
        <section className="mt-5 rounded-2xl bg-gov-tint p-5">
          <h2 className="text-base font-bold text-gov-ink">{v.whatYouCanDo}</h2>
          <ul className="mt-2 space-y-2 text-sm text-gov-ink">
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gov" />
              {v.doAsk.replace("{n}", num(overall10))}
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gov" />
              {v.doCompare}
            </li>
          </ul>
        </section>

        <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          <div className="space-y-5">
            {/* subject scores /10 */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h2 className="text-lg font-bold text-gov-ink">{v.subjectsTitle}</h2>
              {grades.map((g) => (
                <div key={g} className="mt-3">
                  {grades.length > 1 && (
                    <h3 className="text-sm font-bold text-gov-ink">
                      {t.grades[g as keyof typeof t.grades] ?? g}
                    </h3>
                  )}
                  <div className="mt-2 space-y-2.5">
                    {Object.entries(s.byGrade[g]).map(([subj, pct]) => {
                      const v10 = score10(pct);
                      return (
                        <div key={subj}>
                          <div className="flex justify-between text-sm">
                            <span className="text-gov-ink">
                              {t.subjects[subj as keyof typeof t.subjects] ?? subj}
                            </span>
                            <span className="font-bold tabular-nums text-gov-ink">
                              {num(v10)}/{num(10)}
                            </span>
                          </div>
                          <div className="mt-1 flex gap-[3px]" aria-hidden>
                            {Array.from({ length: 10 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-3 flex-1 rounded-[3px] ${
                                  i < v10 ? "bg-gov" : "bg-gov-tint"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {grades.length === 0 && (
                <p className="mt-2 text-sm text-muted">{t.report.fewStudents}</p>
              )}
              {/* WhatsApp carries more weight than the PDF download (user call) */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <WhatsAppShare label={v.shareWhatsApp} text={s.name} />
                {hasCard(s.udise) && (
                  <a
                    href={cardUrl(s.udise)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border-2 border-gov px-4 text-[14px] font-bold text-gov"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                    {v.downloadPdf}
                  </a>
                )}
              </div>
            </section>
            {/* explainer video */}
            <section className="rounded-2xl border border-gov-line bg-white p-5">
              <h2 className="text-base font-bold text-gov-ink">{v.watchTitle}</h2>
              <p className="mt-1 text-sm text-muted">{v.watchDesc}</p>
              <a
                href={EXPLAINER[s.block] ?? EXPLAINER_DEFAULT}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-[46px] items-center gap-2 rounded-xl border-2 border-gov px-4 text-[15px] font-bold text-gov"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                {v.watchCta}
              </a>
            </section>
          </div>

          <div className="space-y-5">

            {/* about your school */}
            {(about.length > 0 || s.inputs) && (
              <section className="rounded-2xl border border-gov-line bg-white p-5">
                <h2 className="text-lg font-bold text-gov-ink">{v.aboutSchool}</h2>
                {about.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {about.map((a) => (
                      <div
                        key={a.label}
                        className="rounded-lg border-l-4 border-gov-mid bg-gov-tint px-3.5 py-2.5"
                      >
                        <div className="text-lg font-extrabold leading-tight text-gov-ink">
                          {a.value}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">{a.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {s.inputs?.basicsIn && s.inputs.basicsIn.length > 0 && (
                  <p className="mt-3 text-sm text-gov-ink">
                    <span className="font-semibold">{t.peerCard.rteBasicsIn}:</span>{" "}
                    {s.inputs.basicsIn.map((b) => (t.peerCard.basics as Record<string, string>)[b] ?? b).join(", ")}
                  </p>
                )}
                {s.inputs?.basicsOut && s.inputs.basicsOut.length > 0 && (
                  <p className="mt-1 text-sm text-[#b3261e]">
                    <span className="font-semibold">{t.peerCard.rteBasicsOut}:</span>{" "}
                    {s.inputs.basicsOut.map((b) => (t.peerCard.basics as Record<string, string>)[b] ?? b).join(", ")}
                  </p>
                )}
              </section>
            )}

            {/* nearby schools, named with /10 */}
            {neighbours.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-gov-line bg-white">
                <div className="bg-gov px-5 py-3.5">
                  <h2 className="text-base font-bold text-white">{v.nearbyTitle}</h2>
                  <p className="mt-0.5 text-xs text-white/80">{v.nearbySub}</p>
                </div>
                <ul className="divide-y divide-gov-line">
                  {neighbours.map((n) => (
                    <li key={n.udise}>
                      <Link
                        href={`/${locale}/school/${n.udise}/`}
                        className="flex min-h-[60px] items-center justify-between gap-3 px-4 py-2.5 active:bg-gov-tint"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-gov-ink">
                            {n.name}
                          </span>
                          <span className="block text-xs text-muted">
                            {n.cluster}
                            {n.km != null
                              ? ` · ${v.kmAway.replace("{km}", num(n.km))}`
                              : ""}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="tabular-nums">
                            <span
                              className="text-lg font-extrabold"
                              style={{ color: BAND_TEXT[n.band] }}
                            >
                              {num(n.s10)}
                            </span>
                            <span className="text-xs text-muted">/{num(10)}</span>
                          </span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                            className="text-gov-mid"
                          >
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
