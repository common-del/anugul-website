import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AwarenessFilm from "@/components/AwarenessFilm";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import districtData from "@/data/district.json";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type District = {
  schoolsAssessed: number;
  studentsAssessed: number;
  blocks: { name: string }[];
};
const district = districtData as unknown as District;

// Renders **bold** markers inside a translated string as heavier text, so the
// emphasised phrases survive translation without splitting the copy into
// fragments.
function Emphasised({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-gov-ink">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// v2 home: hero (message + CTAs | awareness film), then the About Saksham /
// Did-you-know panel and the four-tile statistics band (mock-up addition).
export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const num = (n: number) => fmtNum(n, locale);

  const dyk = [
    {
      t: v.dyk1T,
      d: v.dyk1D,
      icon: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
      fill: true,
    },
    {
      t: v.dyk2T,
      d: v.dyk2D,
      icon: "M2 4h6a4 4 0 014 4v12a3 3 0 00-3-3H2zM22 4h-6a4 4 0 00-4 4v12a3 3 0 013-3h7z",
      fill: false,
    },
    {
      t: v.dyk3T,
      d: v.dyk3D,
      icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
      fill: false,
    },
    {
      t: v.dyk4T,
      d: v.dyk4D,
      icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21v-1a6 6 0 0112 0v1M20 21v-1a6 6 0 00-3-5.2",
      fill: false,
    },
  ];

  const stats = [
    { val: num(district.schoolsAssessed), l: v.statSchoolsL, c: v.statSchoolsC,
      icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M12 7h.01" },
    { val: num(district.studentsAssessed), l: v.statStudentsL, c: v.statStudentsC,
      icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21v-1a6 6 0 0112 0v1M20 21v-1a6 6 0 00-3-5.2" },
    { val: num(district.blocks.length), l: v.statBlocksL, c: v.statBlocksC,
      icon: "M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
    { val: fmtPercent(100, locale), l: v.statDataL, c: v.statDataC,
      icon: "M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 12l2 2 4-4" },
  ];

  // per-tile divider classes: 1 col (mobile) → 2×2 (sm) → 4-up (lg)
  const tileBorder = [
    "",
    "border-t border-gov-line sm:border-t-0 sm:border-l",
    "border-t border-gov-line lg:border-t-0 lg:border-l",
    "border-t border-gov-line sm:border-l lg:border-t-0",
  ];

  return (
    <PageShell zone="full">
      <SiteHeader locale={locale} t={t} active="home" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:space-y-0">
          {/* hero */}
          <section className="flex flex-col justify-center glass-strong p-6">
            <h1 className="text-[27px] font-extrabold leading-tight text-gov-ink">
              {v.heroTitle}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              {v.heroDesc}
            </p>
            {/* Two full-width stacked buttons: Find (primary), Explore (secondary). */}
            <Link
              href={`/${locale}/find/`}
              className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[17px] font-extrabold text-gov-ink shadow-sm transition hover:shadow-lift active:brightness-105"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              {v.findSchool}
            </Link>
            <Link
              href={`/${locale}/gov/`}
              className="btn-glass mt-3 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-gov px-6 text-[17px] font-bold text-gov transition hover:shadow-sm"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                <path d="M4 20V10M10 20V4M16 20v-9M20 20H4" />
              </svg>
              {v.exploreReports}
            </Link>
          </section>

          {/* awareness film — click-to-play, permanent */}
          <AwarenessFilm
            videoId="txr94hVoMWo"
            title={v.awarenessFilm}
            desc={v.filmDesc}
            minutes={v.filmMinutes}
          />
        </div>

        {/* About Saksham | Did you know? — full-width card, 55/45 split */}
        <section className="mt-5 gov-card p-5 md:p-6">
          <div className="md:grid md:grid-cols-[11fr,9fr] md:gap-0">
            <div className="md:pr-8">
              <h2 className="text-xl font-extrabold leading-tight text-gov">
                {v.homeAboutT}
              </h2>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Illustration placeholder — swap for the approved artwork
                    (children reading a report card) when the file is supplied. */}
                <div
                  aria-hidden
                  className="grid h-28 w-full shrink-0 place-items-center rounded-xl bg-gov-tint sm:h-32 sm:w-40"
                >
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E56A4F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4h6a4 4 0 014 4v12a3 3 0 00-3-3H2zM22 4h-6a4 4 0 00-4 4v12a3 3 0 013-3h7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] leading-relaxed text-muted">
                    <Emphasised text={v.homeAboutBody} />
                  </p>
                  <details className="group mt-2">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-gov underline underline-offset-2 [&::-webkit-details-marker]:hidden">
                      {v.homeAboutMore}
                      <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-muted">
                      {v.homeAboutMoreBody.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gov-line pt-6 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <h2 className="text-xl font-extrabold leading-tight text-gov">
                {v.homeDykT}
              </h2>
              <ul className="mt-4 space-y-4">
                {dyk.map((r) => (
                  <li key={r.t} className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={r.fill ? "#2D3A47" : "none"}
                      stroke={r.fill ? "none" : "#2D3A47"}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="mt-0.5 shrink-0"
                    >
                      <path d={r.icon} />
                    </svg>
                    <span>
                      <span className="block text-sm font-bold leading-snug text-gov-ink">
                        {r.t}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                        {r.d}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* statistics band — four tiles, dividers only */}
        <section className="mt-5 gov-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.l}
                className={`flex items-center gap-3.5 px-5 py-5 ${tileBorder[i]}`}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E56A4F"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="shrink-0"
                >
                  <path d={s.icon} />
                </svg>
                <div className="min-w-0">
                  <div className="text-2xl font-extrabold leading-tight tabular-nums text-gov-ink">
                    {s.val}
                  </div>
                  <div className="text-sm font-bold leading-snug text-gov-ink">{s.l}</div>
                  <div className="text-xs leading-snug text-muted">{s.c}</div>
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
