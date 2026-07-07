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
        <div className="mt-4">
          <SchoolFinder
            locale={locale}
            dest="principal"
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
            }}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
