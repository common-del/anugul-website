import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BandMeter from "@/components/BandMeter";
import SubjectBars from "@/components/SubjectBars";
import BlockBars from "@/components/BlockBars";
import Link from "next/link";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum, fmtPercent } from "@/lib/format";
import { bandFromScore } from "@/lib/bands";
import { getDistrictOfficials } from "@/lib/officialsData";
import districtData from "@/data/district.json";

type District = {
  name: string;
  districtAverage: number;
  passLine: number;
  bestBlock: string;
  schoolsAssessed: number;
  studentsAssessed: number;
  subjectMeans: Record<string, Record<string, number>>;
  blocks: { name: string; average: number; schools: number }[];
};

const district = districtData as unknown as District;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function AnalyticsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const off = getDistrictOfficials();
  const variance: [string, number][] = [
    [t.officials.varBlock, off.variance.block],
    [t.officials.varCluster, off.variance.cluster],
    [t.officials.varSchool, off.variance.school],
    [t.officials.varChild, off.variance.child],
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-6">
        <section>
          <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
            {t.analytics.title}
          </h1>
          <p className="mt-1 text-muted">{t.analytics.intro}</p>
        </section>

        <BandMeter
          score={district.districtAverage}
          band={bandFromScore(district.districtAverage)}
          label={t.band[bandFromScore(district.districtAverage)]}
          explain={t.analytics.districtExplain}
          locale={locale}
        />

        <div className="grid grid-cols-3 gap-3">
          {[
            { v: district.schoolsAssessed, l: t.analytics.schoolsAssessed },
            { v: district.studentsAssessed, l: t.analytics.studentsAssessed },
          ].map((s) => (
            <div key={s.l} className="rounded-xl bg-brand-tint p-3">
              <div className="text-xl font-extrabold tabular-nums text-brand-ink">
                {fmtNum(s.v, locale)}
              </div>
              <div className="text-xs text-muted">{s.l}</div>
            </div>
          ))}
          <div className="rounded-xl bg-brand-tint p-3">
            <div className="text-lg font-extrabold leading-tight text-brand-ink">
              {district.bestBlock}
            </div>
            <div className="mt-0.5 text-xs text-muted">{t.analytics.topBlock}</div>
          </div>
        </div>

        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:space-y-0">
          <section>
            <h2 className="mb-3 text-lg font-bold text-brand-ink">
              {t.analytics.subjectTitle}
            </h2>
            <SubjectBars
              byGrade={district.subjectMeans}
              gradeLabels={t.grades}
              subjectLabels={t.subjects}
              locale={locale}
            />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-brand-ink">
              {t.analytics.blockTitle}
            </h2>
            <BlockBars
              blocks={district.blocks}
              bestBlock={district.bestBlock}
              locale={locale}
            />
          </section>
        </div>

        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:space-y-0">
          <section className="rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="text-lg font-bold text-brand-ink">
              {t.officials.varianceTitle}
            </h2>
            <p className="mt-1 text-sm text-muted">{t.officials.varianceIntro}</p>
            <div className="mt-3 space-y-2">
              {variance.map(([label, v]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-ink">{label}</span>
                    <span className="font-semibold tabular-nums text-brand-ink">
                      {fmtPercent(Math.round(v), locale)}
                    </span>
                  </div>
                  <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-brand-tint">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${v}%`,
                        backgroundColor: v >= 40 ? "#123c7b" : "#8fabd4",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="text-lg font-bold text-brand-ink">
              {t.analytics.below50Title}
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {Object.entries(off.below50 as Record<string, number>)
                .sort((a, z) => z[1] - a[1])
                .map(([block, v]) => (
                  <li key={block} className="flex items-center justify-between">
                    <Link
                      href={`/${locale}/officials/block/${block.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`}
                      className="text-brand underline-offset-2 hover:underline"
                    >
                      {block}
                    </Link>
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color: v >= 30 ? "#C24E36" : "#12233d" }}
                    >
                      {fmtPercent(Math.round(v), locale)}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
