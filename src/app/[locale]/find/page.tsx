import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SchoolFinder from "@/components/SchoolFinder";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function FindPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  // Value strip: four equal tiles floating on the page background — no card,
  // no border, brand-green line icon + one caption, not clickable. Mirrors the
  // School Head screen's informational strip.
  const tiles = [
    {
      t: v.findTile1,
      icon: (
        <path d="M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 17v-4M12 17v-7M16 17v-2" />
      ),
    },
    {
      t: v.findTile2,
      icon: (
        <>
          <path d="M14 9a2 2 0 01-2 2H6l-4 4V4a2 2 0 012-2h8a2 2 0 012 2z" />
          <path d="M18 9h2a2 2 0 012 2v11l-4-4h-6a2 2 0 01-2-2v-1" />
        </>
      ),
    },
    {
      t: v.findTile3,
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </>
      ),
    },
    {
      t: v.findTile4,
      icon: (
        <>
          <path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      ),
    },
  ];

  return (
    <PageShell zone="full">
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* Clean heading area: just the H1 (subheading removed, owner 2026-07-21). */}
        <h1 className="text-2xl font-extrabold leading-tight text-gov">{v.findTitle}</h1>

        <div className="mt-5">
          <SchoolFinder
            locale={locale}
            tip={{ title: v.findTipT, body: v.findTipB }}
            labels={{
              nearMe: v.nearMe,
              nearMeFinding: v.nearMeFinding,
              nearMeDenied: v.nearMeDenied,
              nearMeResults: v.nearMeResults,
              showMore: v.showMore,
              showLess: v.showLess,
              searchAny: v.searchAny,
              searchNote: v.searchNote,
              stepFindTitle: v.stepFindTitle,
              chooseBlock: v.chooseBlock,
              chooseCluster: v.chooseCluster,
              pickSchool: v.pickSchool,
              changeSel: v.changeSel,
              schoolsFound: v.schoolsFound,
              openReport: v.openReport,
              overallScore: v.overallScore,
              noResults: t.find.noResults,
              showingFirst: v.showingFirst,
              kmAway: v.kmAway,
              viewReportAria: v.viewReportAria,
            }}
          />
        </div>

        {/* Value strip — four next steps for parents, sitting just above the
            leadership banner so finding your school stays the page's focus. */}
        <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.t} className="flex flex-col items-center text-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E56A4F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {tile.icon}
              </svg>
              <span className="mt-2 max-w-[12rem] text-sm font-bold leading-snug text-gov-ink">
                {tile.t}
              </span>
            </div>
          ))}
        </div>

        {/* Leadership banner — page-level accent; a soft coral border lifts it
            off the cream page gradient. Decorative only. */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-accent/40 bg-white p-5 shadow-card sm:gap-6 sm:p-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gov">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold leading-snug text-gov-ink">{v.findBannerT}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{v.findBannerB}</p>
          </div>
          {/* trophy + rising bars — one colour (slate), matching the shield chip */}
          <svg width="120" height="64" viewBox="0 0 120 64" fill="none" aria-hidden className="hidden shrink-0 md:block">
            <path d="M18 8h20v10a10 10 0 01-20 0V8z" fill="#2D3A47" stroke="#2D3A47" strokeWidth="1.6" />
            <path d="M18 10h-5a2 2 0 00-2 2c0 4 3 7 7 7M38 10h5a2 2 0 012 2c0 4-3 7-7 7" stroke="#2D3A47" strokeWidth="1.6" fill="none" />
            <path d="M25 28h6v6h-6z" fill="#2D3A47" stroke="#2D3A47" strokeWidth="1.4" />
            <path d="M20 34h16v6H20z" fill="#2D3A47" />
            <path d="M28 12l1.2 2.5 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4z" fill="#fff" />
            <rect x="56" y="38" width="10" height="18" rx="1.5" fill="#2D3A47" />
            <rect x="70" y="30" width="10" height="26" rx="1.5" fill="#2D3A47" />
            <rect x="84" y="22" width="10" height="34" rx="1.5" fill="#2D3A47" />
            <rect x="98" y="12" width="10" height="44" rx="1.5" fill="#2D3A47" />
            <path d="M56 26c14-2 34-8 50-18" stroke="#2D3A47" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M99 6l7 2-3 6" stroke="#2D3A47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
