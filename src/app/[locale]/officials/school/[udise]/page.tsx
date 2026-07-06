import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BandMeter from "@/components/BandMeter";
import SubjectBars from "@/components/SubjectBars";
import SchoolProfile, { type Profile } from "@/components/SchoolProfile";
import SchoolContext, {
  type Peer, type ClusterPos, type BrightSpotRef, type Inputs,
} from "@/components/SchoolContext";
import NeighbourRanking, { type NbRow } from "@/components/NeighbourRanking";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import type { BandKey } from "@/lib/bands";
import schoolsData from "@/data/schools.json";

type School = {
  udise: string; name: string; block: string; cluster: string;
  overall: { score: number; band: BandKey };
  byGrade: Record<string, Record<string, number>>;
  assessedStudents: number | null;
  profile: Profile | null;
  peer: Peer; clusterPos: ClusterPos; brightSpot: BrightSpotRef; inputs: Inputs;
  neighbours: { udise: string; km: number | null }[];
};

const schools = schoolsData as unknown as Record<string, School>;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(schools).map((udise) => ({ locale, udise })),
  );
}
export const dynamicParams = false;

export default function OfficialSchoolPage({
  params,
}: {
  params: { locale: string; udise: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const s = schools[params.udise];
  if (!s) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const hasSubjects = Object.keys(s.byGrade).length > 0;

  const self: NbRow = { name: s.name, score: s.overall.score, band: s.overall.band, byGrade: s.byGrade };
  const neighbours: NbRow[] = (s.neighbours ?? [])
    .map((n) => {
      const ns = schools[n.udise];
      if (!ns) return null;
      return {
        udise: ns.udise, name: ns.name, score: ns.overall.score,
        band: ns.overall.band, byGrade: ns.byGrade, km: n.km,
      };
    })
    .filter(Boolean) as NbRow[];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <section>
          <p className="text-sm font-semibold text-accent-dark">{o.schoolHeadKicker}</p>
          <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">{s.name}</h1>
          <p className="mt-1 text-sm text-muted">{s.block} · {s.cluster}</p>
          <p className="mt-1 text-xs text-muted">
            UDISE {s.udise}
            {s.assessedStudents ? ` · ${fmtNum(s.assessedStudents, locale)} ${t.report.studentsAssessed}` : ""}
          </p>
        </section>

        <div className="mt-6 space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:space-y-0">
          <div className="space-y-6">
            <BandMeter
              score={s.overall.score}
              band={s.overall.band}
              label={t.band[s.overall.band]}
              explain={t.report.overallExplain}
              locale={locale}
            />
            <NeighbourRanking
              self={self}
              neighbours={neighbours}
              c={o}
              subjectLabels={t.subjects}
              gradeLabels={t.grades}
              locale={locale}
            />
          </div>

          <div className="space-y-6 lg:mt-0">
            <section>
              <h2 className="mb-3 text-lg font-bold text-brand-ink">{t.report.subjectsTitle}</h2>
              {hasSubjects ? (
                <SubjectBars byGrade={s.byGrade} gradeLabels={t.grades} subjectLabels={t.subjects} locale={locale} />
              ) : (
                <p className="rounded-xl border border-brand-line bg-white p-4 text-sm text-muted">
                  {t.report.fewStudents}
                </p>
              )}
            </section>

            {s.profile && <SchoolProfile profile={s.profile} c={t.profile} locale={locale} />}

            <SchoolContext
              peer={s.peer}
              clusterPos={s.clusterPos}
              cluster={s.cluster}
              block={s.block}
              brightSpot={s.brightSpot}
              inputs={s.inputs}
              c={t.peerCard}
              subjectLabels={t.subjects}
              locale={locale}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={`/${locale}/principal/${s.udise}/`}
            className="text-sm font-semibold text-brand underline underline-offset-2"
          >
            {t.v2.principalView} <span aria-hidden>→</span>
          </Link>
          <Link
            href={`/${locale}/officials/schools/`}
            className="text-sm font-semibold text-brand underline underline-offset-2"
          >
            {o.dirTitle} <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
