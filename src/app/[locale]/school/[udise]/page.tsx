import Link from "next/link";
import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BandMeter from "@/components/BandMeter";
import Comparison from "@/components/Comparison";
import SubjectBars from "@/components/SubjectBars";
import SchoolProfile, { type Profile } from "@/components/SchoolProfile";
import Guidance from "@/components/Guidance";
import ShareBar from "@/components/ShareBar";
import type { Metadata } from "next";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import type { BandKey } from "@/lib/bands";
import schoolsData from "@/data/schools.json";

type School = {
  udise: string;
  name: string;
  block: string;
  cluster: string;
  overall: { score: number; band: BandKey };
  byGrade: Record<string, Record<string, number>>;
  assessedStudents: number | null;
  comparison: {
    blockName: string;
    blockAverage: number;
    districtAverage: number;
    nearby: {
      compared: number;
      ahead: number;
      behind: number;
      likeForLike: boolean;
      nearestKm: number | null;
    };
  };
  profile: Profile | null;
};

const schools = schoolsData as unknown as Record<string, School>;

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
  const hasSubjects = Object.keys(s.byGrade).length > 0;

  return (
    <PhoneFrame>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="space-y-6 px-5 py-6">
        <section>
          <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
            {s.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {s.block} · {s.cluster}
          </p>
          <p className="mt-1 text-xs text-muted">
            UDISE {s.udise}
            {s.assessedStudents
              ? ` · ${fmtNum(s.assessedStudents, locale)} ${t.report.studentsAssessed}`
              : ""}
          </p>
        </section>

        <BandMeter
          score={s.overall.score}
          band={s.overall.band}
          label={t.band[s.overall.band]}
          explain={t.report.overallExplain}
          locale={locale}
        />

        <section>
          <h2 className="mb-3 text-lg font-bold text-brand-ink">
            {t.report.compareTitle}
          </h2>
          <Comparison
            score={s.overall.score}
            blockAverage={s.comparison.blockAverage}
            nearby={s.comparison.nearby}
            c={t.report}
            locale={locale}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-brand-ink">
            {t.report.subjectsTitle}
          </h2>
          {hasSubjects ? (
            <SubjectBars
              byGrade={s.byGrade}
              gradeLabels={t.grades}
              subjectLabels={t.subjects}
              locale={locale}
            />
          ) : (
            <p className="rounded-xl border border-brand-line bg-white p-4 text-sm text-muted">
              {t.report.fewStudents}
            </p>
          )}
        </section>

        {s.profile && (
          <SchoolProfile profile={s.profile} c={t.profile} locale={locale} />
        )}

        <Guidance c={t.guidance} />

        <ShareBar schoolName={s.name} labels={t.share} />

        <Link
          href={`/${locale}/find/`}
          className="no-print inline-block text-sm font-semibold text-brand underline underline-offset-2"
        >
          {t.school.backToFind}
        </Link>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PhoneFrame>
  );
}
