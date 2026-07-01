import { fmtNum } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

export type Profile = {
  enrolment: number | null;
  teachers: number | null;
  ptr: number | null;
  classrooms: number | null;
  dilapidatedClassrooms: number | null;
  furniture: string | null;
  playground: string | null;
};

type Copy = {
  title: string;
  intro: string;
  students: string;
  teachers: string;
  ptr: string;
  classrooms: string;
  furniture: string;
  playground: string;
  furnitureYes: string;
  furniturePartial: string;
  furnitureNone: string;
  yes: string;
  no: string;
  needRepair: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

export default function SchoolProfile({
  profile,
  c,
  locale,
}: {
  profile: Profile;
  c: Copy;
  locale: Locale;
}) {
  const stats: { label: string; value: string }[] = [];
  if (profile.enrolment != null)
    stats.push({ label: c.students, value: fmtNum(profile.enrolment, locale) });
  if (profile.teachers != null)
    stats.push({ label: c.teachers, value: fmtNum(profile.teachers, locale) });
  if (profile.ptr != null)
    stats.push({ label: c.ptr, value: fmtNum(profile.ptr, locale) });
  if (profile.classrooms != null)
    stats.push({
      label: c.classrooms,
      value: fmtNum(profile.classrooms, locale),
    });

  const furnitureText =
    profile.furniture === "yes"
      ? c.furnitureYes
      : profile.furniture === "partial"
        ? c.furniturePartial
        : profile.furniture === "no"
          ? c.furnitureNone
          : null;
  const playgroundText =
    profile.playground === "yes"
      ? c.yes
      : profile.playground === "no"
        ? c.no
        : null;
  const repair =
    profile.dilapidatedClassrooms != null && profile.dilapidatedClassrooms > 0
      ? profile.dilapidatedClassrooms
      : null;

  return (
    <section className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="text-lg font-bold text-brand-ink">{c.title}</h2>
      <p className="mt-1 text-xs text-muted">{c.intro}</p>

      {stats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-brand-tint p-3">
              <div className="text-2xl font-extrabold tabular-nums text-brand-ink">
                {s.value}
              </div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {(furnitureText || playgroundText) && (
        <div className="mt-3 divide-y divide-brand-line">
          {furnitureText && <Row label={c.furniture} value={furnitureText} />}
          {playgroundText && <Row label={c.playground} value={playgroundText} />}
        </div>
      )}

      {repair != null && (
        <p className="mt-3 rounded-lg bg-brand-tint px-3 py-2 text-sm text-brand-ink">
          {c.needRepair.replace("{n}", fmtNum(repair, locale))}
        </p>
      )}
    </section>
  );
}
