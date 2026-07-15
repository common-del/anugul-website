import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppShare from "@/components/WhatsAppShare";
import VideoEmbed from "@/components/VideoEmbed";
import Stars from "@/components/Stars";
import CardLightbox from "@/components/CardLightbox";
import { hasCard, cardUrl, cardImg } from "@/lib/cards";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import type { BandKey } from "@/lib/bands";
import { getSchools } from "@/lib/schools";

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

const schools = getSchools() as unknown as Record<string, School>;

// Block-wise "how to read your report card" explainer videos (YouTube IDs,
// from the approved mock-up doc).
const EXPLAINER: Record<string, string> = {
  Anugola: "gn9tbf-tLkA",
  Athamalik: "r04dfh8Gq94",
  Talachera: "lq_Z0Ikqlag",
};
const EXPLAINER_DEFAULT = "OcBdapIlGHM";

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

  // Infrastructure lists for the About accordion; SMC pulled out as its own row.
  const SMC_KEY = "SMC formed";
  const bLabel = (k: string) => (t.peerCard.basics as Record<string, string>)[k] ?? k;
  const infraIn = (s.inputs?.basicsIn ?? []).filter((k) => k !== SMC_KEY).map(bLabel);
  const infraOut = (s.inputs?.basicsOut ?? []).filter((k) => k !== SMC_KEY).map(bLabel);
  const smcFormed = s.inputs?.basicsIn?.includes(SMC_KEY)
    ? true
    : s.inputs?.basicsOut?.includes(SMC_KEY)
      ? false
      : null;
  // Nearby-card tint by /10 bucket (8-10 green, 5-7 amber, 0-4 red) — muted so
  // AA holds; score + stars remain the primary signal.
  const tintFor = (s10: number) =>
    s10 >= 8 ? "#E9ECEE" : s10 >= 5 ? "#FCEBE5" : "#FCEBE5";

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* header row */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-gov-line pb-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
              {s.name}
            </h1>
            <p className="mt-1.5 text-sm font-bold text-gov-ink">
              UDISE: {s.udise} | {s.block} | {s.cluster}
              {s.assessedStudents
                ? ` | ${num(s.assessedStudents)} ${t.report.studentsAssessed}`
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-full bg-gov-tint py-1.5 pl-4 pr-1.5">
            <span className="text-sm font-bold uppercase tracking-wide text-gov-ink">
              {v.overallScore}
            </span>
            <span className="grid h-[64px] w-[64px] place-items-center rounded-full bg-gov">
              <span className="text-center leading-none">
                <span className="block text-[22px] font-extrabold text-white">
                  {num(overall10)}
                </span>
                <span className="mt-0.5 block text-[10px] text-white/75">/{num(10)}</span>
              </span>
            </span>
          </div>
        </section>

        {/* HERO: report card (left) | video + what you can do (right).
            items-start: each column sizes to its own content — the right
            column must never stretch to match the left. */}
        <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          {/* left — the report card, first and largest */}
          <section className="flex flex-col gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.yourReportCard}</h2>
            {hasCard(s.udise) ? (
              <>
                <div className="mt-3">
                  <CardLightbox
                    src={cardImg(s.udise)}
                    alt={`${s.name} — ${v.yourReportCard}`}
                    enlargeLabel={v.enlargeCard}
                    closeLabel={v.closeCard}
                    pageLabel={v.pageOneOf}
                    digits={locale === "od" ? "୦୧୨୩୪୫୬୭୮୯" : undefined}
                  />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <a
                    href={cardUrl(s.udise)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gov px-4 text-sm font-bold text-white shadow-sm transition hover:shadow-lift"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
                    </svg>
                    {v.downloadReportCard}
                  </a>
                  <WhatsAppShare label={v.shareWhatsApp} text={s.name} />
                </div>
              </>
            ) : (
              <div className="mt-4">
                <WhatsAppShare label={v.shareWhatsApp} text={s.name} />
              </div>
            )}
          </section>

          {/* right — video (top) + what you can do (bottom) */}
          <div className="flex flex-col gap-5">
            <section className="gov-card p-5">
              <h2 className="text-base font-bold text-gov-ink">{v.watchTitle}</h2>
              <p className="mt-1 text-sm text-muted">{v.watchDesc}</p>
              <div className="mt-3">
                <VideoEmbed
                  videoId={EXPLAINER[s.block] ?? EXPLAINER_DEFAULT}
                  title={v.watchTitle}
                />
              </div>
            </section>
            <section className="gov-card p-5">
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
          </div>
        </div>

        {/* About your school (left) | Nearby schools (right) */}
        <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">

            {/* about your school */}
            {(about.length > 0 || s.inputs) && (
              <section className="gov-card p-5">
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
                {(infraIn.length > 0 || infraOut.length > 0 || smcFormed !== null) && (
                  <details className="group mt-4 rounded-xl border border-gov-line">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-bold text-gov [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">{v.viewMoreDetails}</span>
                      <span className="hidden group-open:inline">{v.viewLessDetails}</span>
                      <span aria-hidden className="text-lg leading-none text-gov transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="space-y-3 border-t border-gov-line px-4 py-3 text-sm">
                      {infraIn.length > 0 && (
                        <div>
                          <p className="font-semibold text-gov-ink">{v.infraAvailable}</p>
                          <p className="mt-0.5 text-muted">{infraIn.join(", ")}</p>
                        </div>
                      )}
                      {infraOut.length > 0 && (
                        <div>
                          <p className="font-semibold text-gov-ink">{v.infraNotAvailable}</p>
                          <p className="mt-0.5 text-[#C24E36]">{infraOut.join(", ")}</p>
                        </div>
                      )}
                      {smcFormed !== null && (
                        <div>
                          <p className="font-semibold text-gov-ink">{v.smcFormation}</p>
                          <p className="mt-0.5 text-muted">{smcFormed ? v.yes : v.no}</p>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </section>
            )}

            {/* nearby schools, named with /10 */}
            {neighbours.length > 0 && (
              <section className="overflow-hidden gov-card">
                <div className="bg-gov px-5 py-3.5">
                  <h2 className="text-base font-bold text-white">{v.nearbyTitle}</h2>
                  <p className="mt-0.5 text-xs text-white/80">{v.nearbySub}</p>
                </div>
                <ul className="max-h-[28rem] divide-y divide-white/70 overflow-y-auto">
                  {neighbours.map((n) => (
                    <li key={n.udise}>
                      <Link
                        href={`/${locale}/school/${n.udise}/`}
                        aria-label={v.viewReportAria
                          .replace("{name}", n.name)
                          .replace("{n}", num(n.s10))
                          .replace("{max}", num(10))}
                        className="flex min-h-[64px] items-center justify-between gap-3 px-4 py-3 transition hover:brightness-[0.97]"
                        style={{ backgroundColor: tintFor(n.s10) }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-gov-ink">
                            {n.name}
                          </span>
                          {n.km != null && (
                            <span className="mt-0.5 block text-xs font-bold text-gov-ink">
                              {v.kmAway.replace("{km}", num(n.km))}
                            </span>
                          )}
                          <span className="mt-1 block">
                            <Stars score={n.s10} size={16} label={`${num(n.s10)}/${num(10)}`} />
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="tabular-nums">
                            <span className="text-xl font-extrabold text-gov-ink">
                              {num(n.s10)}
                            </span>
                            <span className="text-xs text-gov-ink/70">/{num(10)}</span>
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
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
