import { BAND_COLOR, bandFromScore } from "@/lib/bands";
import { fmtPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

const GRADE_ORDER = ["Grade 5", "Grade 8"];
const SUBJECT_ORDER = ["Odia", "English", "Maths", "EVS", "Science", "SST"];

export default function SubjectBars({
  byGrade,
  gradeLabels,
  subjectLabels,
  locale,
}: {
  byGrade: Record<string, Record<string, number>>;
  gradeLabels: Record<string, string>;
  subjectLabels: Record<string, string>;
  locale: Locale;
}) {
  const grades = GRADE_ORDER.filter((g) => byGrade[g]);
  return (
    <div className="space-y-5">
      {grades.map((g) => (
        <div key={g}>
          <h3 className="text-sm font-bold text-brand-ink">{gradeLabels[g]}</h3>
          <div className="mt-2 space-y-2.5">
            {SUBJECT_ORDER.filter((s) => byGrade[g][s] !== undefined).map((s) => {
              const pct = byGrade[g][s];
              const color = BAND_COLOR[bandFromScore(pct)];
              return (
                <div
                  key={s}
                  role="img"
                  aria-label={`${subjectLabels[s]}, ${Math.round(pct)}%`}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-ink">{subjectLabels[s]}</span>
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {fmtPercent(Math.round(pct), locale)}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-brand-tint">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
