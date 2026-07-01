import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BandMeter from "@/components/BandMeter";
import SubjectBars from "@/components/SubjectBars";
import BlockBars from "@/components/BlockBars";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { fmtNum } from "@/lib/format";
import { bandFromScore } from "@/lib/bands";
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

  return (
    <PhoneFrame>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="space-y-6 px-5 py-6">
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
            <div className="truncate text-xl font-extrabold text-brand-ink">
              {district.bestBlock}
            </div>
            <div className="text-xs text-muted">{t.analytics.topBlock}</div>
          </div>
        </div>

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
      </main>
      <SiteFooter locale={locale} t={t} />
    </PhoneFrame>
  );
}
