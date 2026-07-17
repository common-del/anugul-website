import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import WhatsAppShare from "@/components/WhatsAppShare";
import Stars from "@/components/Stars";
import CardLightbox from "@/components/CardLightbox";
import { hasCard, cardUrl, cardImg, hasHcard, hcardUrl, hcardImg } from "@/lib/cards";
import { getBlockSlugs } from "@/lib/officialsData";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import { bandTint10, type BandKey } from "@/lib/bands";
import { getSchools } from "@/lib/schools";

type Profile = {
  classRange: string | null;
  management: string | null;
  enrolment: number | null;
  teachers: number | null;
};
type School = {
  udise: string; name: string; block: string; cluster: string;
  overall: { score: number; band: BandKey };
  byGrade: Record<string, Record<string, number>>;
  assessedStudents: number | null;
  profile: Profile | null;
  inputs: { basicsIn?: string[]; basicsOut?: string[] } | null;
  neighbours: { udise: string; km: number | null }[];
};
const schools = getSchools() as unknown as Record<string, School>;
const score10 = (pct: number) => Math.round(pct / 10);

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(schools).map((udise) => ({ locale, udise })),
  );
}
export const dynamicParams = false;

// Wraps DIET / CRCC occurrences in <abbr> with the full form as a native
// tooltip (dotted underline as the affordance).
function AbbrText({ text, diet, crcc }: { text: string; diet: string; crcc: string }) {
  const parts = text.split(/(DIET|CRCCs?)/);
  return (
    <>
      {parts.map((p, i) =>
        p === "DIET" || p === "CRCC" || p === "CRCCs" ? (
          <abbr
            key={i}
            title={p === "DIET" ? diet : crcc}
            className="cursor-help underline decoration-dotted underline-offset-2"
          >
            {p}
          </abbr>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

// Nearby-card tint = the school's /10 band colour, muted/translucent (8-10
// green, 6-7 orange, 3-5 gold, 0-2 red — see BAND_TINT).
const tintFor = (s10: number) => bandTint10(s10);

// School Head report card (spec 2026-07-10, trimmed per the 2026-07-15 School
// Head specs): parent-pattern preview + download & share, "What should you do"
// actions, six-tile About, tinted nearby list, Explore More Reports. The
// subject-scores panel, cluster panel, print option, and block-misconceptions
// annexure were removed per the School Head specs.
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
  const overall10 = score10(s.overall.score);

  const actions = [
    { n: 1, title: v.pa1Title, text: v.pa1Text,
      icon: "M2 4h6a4 4 0 014 4v12a3 3 0 00-3-3H2zM22 4h-6a4 4 0 00-4 4v12a3 3 0 013-3h7z" },
    { n: 2, title: v.pa2Title, text: v.pa2Text,
      icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" },
    { n: 3, title: v.pa3Title, text: v.pa3Text,
      icon: "M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 12l2 2 4-4" },
  ];

  // About tiles (spec order) — backend-driven values
  const tiles = [
    { l: v.tileMgmt, val: s.profile?.management ?? "—",
      icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" },
    { l: v.tileClasses, val: s.profile?.classRange ?? "—",
      icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" },
    { l: v.tileStudents, val: s.profile?.enrolment != null ? num(s.profile.enrolment) : "—",
      icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21v-1a6 6 0 0112 0v1M20 21v-1a6 6 0 00-3-5.2" },
    { l: v.tileTeachers, val: s.profile?.teachers != null ? num(s.profile.teachers) : "—",
      icon: "M12 11a4 4 0 100-8 4 4 0 000 8zM6 21v-1a6 6 0 0112 0v1" },
    { l: v.tileUdise, val: s.udise,
      icon: "M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 12h8M8 16h5" },
    { l: v.tileCluster, val: s.cluster,
      icon: "M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  ];

  // infrastructure accordion (same grouping as the parent page)
  const SMC_KEY = "SMC formed";
  const bLabel = (k: string) => (t.peerCard.basics as Record<string, string>)[k] ?? k;
  const infraIn = (s.inputs?.basicsIn ?? []).filter((k) => k !== SMC_KEY).map(bLabel);
  const infraOut = (s.inputs?.basicsOut ?? []).filter((k) => k !== SMC_KEY).map(bLabel);
  const smcFormed = s.inputs?.basicsIn?.includes(SMC_KEY)
    ? true
    : s.inputs?.basicsOut?.includes(SMC_KEY)
      ? false
      : null;

  // nearby schools (same source as the parent page)
  const neighbours = (s.neighbours ?? [])
    .filter((n) => n.udise !== s.udise)
    .map((n) => {
      const ns = schools[n.udise];
      return ns
        ? { udise: ns.udise, name: ns.name, km: n.km, s10: score10(ns.overall.score) }
        : null;
    })
    .filter(Boolean) as { udise: string; name: string; km: number | null; s10: number }[];
  neighbours.sort((a, z) => z.s10 - a.s10);

  // block slug for the Explore links
  const blockSlug = getBlockSlugs().find((b) => b.name === s.block)?.slug;

  const explore = [
    { t: v.exp1T, d: v.exp1D, href: "/data/downloads/learning_outcomes_report.pdf", ext: true,
      icon: "M4 20V10M10 20V4M16 20v-9M20 20H4" },
    { t: v.exp2T, d: v.exp2D, href: blockSlug ? `/${locale}/gov/${blockSlug}/` : `/${locale}/gov/`, ext: false,
      icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" },
    { t: v.exp3T, d: v.exp3D, href: `/${locale}/gov/district/`, ext: false,
      icon: "M9 20l-5.5-2.5V4L9 6.5 15 4l5.5 2.5V20L15 17.5 9 20zM9 6.5V20M15 4v13.5" },
  ];

  const downloadHref = hasHcard(s.udise)
    ? hcardUrl(s.udise)
    : hasCard(s.udise)
      ? cardUrl(s.udise)
      : null;

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack role="head" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* ===== heading + overall score (tight label+badge group) ===== */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-gov-line pb-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight text-gov">{s.name}</h1>
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

        {/* ===== hero: report-card preview | what should you do ===== */}
        <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov-ink">{v.yourReportCard}</h2>
            {(hasHcard(s.udise) || hasCard(s.udise)) && (
              <div className="mt-3">
                <CardLightbox
                  src={hasHcard(s.udise) ? hcardImg(s.udise) : cardImg(s.udise)}
                  alt={`${s.name} — ${v.yourReportCard}`}
                  enlargeLabel={v.enlargeCard}
                  closeLabel={v.closeCard}
                  pageLabel={v.pageOneOf}
                  digits={locale === "od" ? "୦୧୨୩୪୫୬୭୮୯" : undefined}
                />
              </div>
            )}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {downloadHref && (
                <a
                  href={downloadHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gov px-4 text-sm font-bold text-white shadow-sm transition hover:shadow-lift"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" />
                  </svg>
                  {v.downloadReportCard}
                </a>
              )}
              <WhatsAppShare label={v.shareWhatsApp} text={s.name} />
            </div>
          </section>

          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov">{v.headWhatT}</h2>
            <p className="mt-1 text-sm text-muted">{v.headWhatD}</p>
            <div className="mt-4 space-y-4">
              {actions.map((a) => (
                <div key={a.n} className="flex items-start gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gov-tint">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={a.icon} />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold leading-snug text-gov-ink">
                      {num(a.n)}.{" "}
                      <AbbrText text={a.title} diet={v.dietFull} crcc={v.crccFull} />
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-muted">
                      <AbbrText text={a.text} diet={v.dietFull} crcc={v.crccFull} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ===== about your school | nearby schools ===== */}
        <div className="mt-5 space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          <section className="gov-card p-5">
            <h2 className="text-lg font-bold text-gov">{v.aboutSchool}</h2>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {tiles.map((tile) => (
                <div key={tile.l} className="flex items-center gap-3 rounded-xl bg-gov-tint px-3.5 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={tile.icon} />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-muted">
                      {tile.l}
                    </span>
                    <span className="block truncate text-[15px] font-extrabold leading-snug text-gov">
                      {tile.val}
                    </span>
                  </span>
                </div>
              ))}
            </div>
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

          {neighbours.length > 0 && (
            <section className="gov-card p-5">
              <h2 className="text-lg font-bold text-gov-ink">{v.nearbyTitle}</h2>
              <p className="mt-1 text-sm text-muted">{v.nearbySub}</p>
              <ul className="mt-3 max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
                {neighbours.map((n) => (
                  <li key={n.udise}>
                    <Link
                      href={`/${locale}/principal/${n.udise}/`}
                      aria-label={v.viewReportAria
                        .replace("{name}", n.name)
                        .replace("{n}", num(n.s10))
                        .replace("{max}", num(10))}
                      className="flex min-h-[64px] items-center justify-between gap-3 rounded-xl px-4 py-3 transition hover:brightness-[0.97]"
                      style={{ backgroundColor: tintFor(n.s10) }}
                    >
                      <span className="min-w-0">
                        {n.km != null && (
                          <span className="block text-xs font-bold text-gov-ink">
                            {v.kmAway.replace("{km}", num(n.km))}
                          </span>
                        )}
                        <span className="mt-0.5 block truncate text-sm font-semibold text-gov-ink">
                          {n.name}
                        </span>
                        <span className="mt-1 block">
                          <Stars score={n.s10} size={20} label={`${num(n.s10)}/${num(10)}`} />
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2.5">
                        <span className="tabular-nums">
                          <span className="text-2xl font-extrabold text-gov-ink">{num(n.s10)}</span>
                          <span className="text-xs text-gov-ink/70">/{num(10)}</span>
                        </span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

        {/* ===== explore more reports (full width) ===== */}
        <section className="mt-5 gov-card p-5">
          <h2 className="text-lg font-bold text-gov">{v.headExploreT}</h2>
          <p className="mt-1 text-sm text-muted">{v.headExploreD}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {explore.map((e) =>
              e.ext ? (
                <a
                  key={e.t}
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-gov-line bg-white p-4 shadow-sm transition hover:bg-gov-tint hover:shadow-lift"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gov-tint">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={e.icon} />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-snug text-gov-ink">{e.t}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{e.d}</span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={e.t}
                  href={e.href}
                  className="flex items-center gap-3 rounded-xl border border-gov-line bg-white p-4 shadow-sm transition hover:bg-gov-tint hover:shadow-lift"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gov-tint">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={e.icon} />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-snug text-gov-ink">{e.t}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{e.d}</span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              ),
            )}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
