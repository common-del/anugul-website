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

// School Head journey entry: find your school, then open its principal report
// (/principal/[udise]) — the same finder as parents, routed to the head view.
export default function SchoolHeadPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack role="head" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold text-gov-ink">{v.findTitle}</h1>
        <p className="mt-1 text-muted">{v.headFindIntro}</p>

        {/* informational strip (School Head only): four equal tiles floating
            on the page background — no card, no border, not clickable */}
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          {[
            {
              t: v.headTile1,
              icon: "M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 17v-4M12 17v-7M16 17v-2",
            },
            {
              t: v.headTile2,
              icon: "M4 20V10M10 20V4M16 20v-9M20 20H4M19 4l-5 5-3-3-4 4",
            },
            {
              t: v.headTile3,
              icon: "M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M8 11l1.5 1.5L12 10M8 16.5L9.5 18 12 15.5M14 12h3M14 17h3",
            },
            {
              t: v.headTile4,
              icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21v-1a6 6 0 0112 0v1M20 21v-1a6 6 0 00-3-5.2",
            },
          ].map((tile) => (
            <div key={tile.t} className="flex flex-col items-center text-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0E5A40" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={tile.icon} />
              </svg>
              <span className="mt-2 max-w-[12rem] text-sm font-bold leading-snug text-gov-ink">
                {tile.t}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <SchoolFinder
            locale={locale}
            dest="principal"
            tip={{ title: v.headTipT, body: v.headTipB }}
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
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
