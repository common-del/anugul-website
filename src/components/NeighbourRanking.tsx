import Link from "next/link";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT, type BandKey } from "@/lib/bands";
import type { Locale } from "@/lib/i18n/config";

export type NbRow = {
  udise?: string;
  name: string;
  score: number;
  band: BandKey;
  byGrade: Record<string, Record<string, number>>;
  km?: number | null;
  self?: boolean;
};

type Copy = {
  neighboursTitle: string; neighboursIntro: string; neighboursThis: string;
  neighboursAheadIn: string; neighboursNoAhead: string; neighboursKm: string;
  leagueScore: string;
};

// Where does `other` beat `self`, subject by subject (across shared grades)?
function leadsOver(
  self: NbRow,
  other: NbRow,
): { subj: string; grade: string; d: number }[] {
  const out: { subj: string; grade: string; d: number }[] = [];
  for (const g of Object.keys(other.byGrade)) {
    const sg = self.byGrade[g];
    if (!sg) continue;
    for (const [subj, v] of Object.entries(other.byGrade[g])) {
      if (sg[subj] == null) continue;
      const d = Math.round(v - sg[subj]);
      if (d >= 2) out.push({ subj, grade: g, d });
    }
  }
  return out.sort((a, z) => z.d - a.d);
}

export default function NeighbourRanking({
  self,
  neighbours,
  c,
  subjectLabels,
  gradeLabels,
  locale,
}: {
  self: NbRow;
  neighbours: NbRow[];
  c: Copy;
  subjectLabels: Record<string, string>;
  gradeLabels: Record<string, string>;
  locale: Locale;
}) {
  if (neighbours.length === 0) return null;
  const ranked = [{ ...self, self: true }, ...neighbours].sort((a, z) => z.score - a.score);
  const multiGrade = Object.keys(self.byGrade).length > 1;
  const num = (n: number) => fmtNum(n, locale);
  const pct = (n: number) => fmtPercent(Math.round(n), locale);

  return (
    <section className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="text-lg font-bold text-brand-ink">{c.neighboursTitle}</h2>
      <p className="mt-1 text-sm text-muted">{c.neighboursIntro}</p>

      <ol className="mt-3 space-y-1.5">
        {ranked.map((r, i) => (
          <li
            key={r.udise ?? "self"}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
              r.self ? "bg-brand-tint ring-1 ring-brand" : "bg-white"
            }`}
          >
            <span className="w-5 shrink-0 text-right text-sm font-bold tabular-nums text-muted">
              {num(i + 1)}
            </span>
            <span className="min-w-0 flex-1">
              {r.self ? (
                <span className="font-bold text-brand-ink">{r.name}</span>
              ) : (
                <Link
                  href={`/${locale}/officials/school/${r.udise}/`}
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  {r.name}
                </Link>
              )}
              {r.self && (
                <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                  {c.neighboursThis}
                </span>
              )}
              {r.km != null && !r.self && (
                <span className="ml-2 text-xs text-muted">
                  {c.neighboursKm.replace("{km}", num(r.km))}
                </span>
              )}
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: BAND_COLOR[r.band], color: r.band === "developing" ? "#12233d" : "#fff" }}
            >
              {pct(r.score)}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 space-y-2 border-t border-brand-line pt-3">
        {neighbours.map((n) => {
          const leads = leadsOver(self, n);
          return (
            <div key={n.udise} className="text-sm">
              <span className="font-semibold text-brand-ink">{n.name}</span>{" "}
              {leads.length ? (
                <>
                  <span className="text-muted">{c.neighboursAheadIn}:</span>{" "}
                  {leads.map((l, j) => (
                    <span key={`${l.grade}-${l.subj}`}>
                      {j > 0 && ", "}
                      <span className="font-semibold" style={{ color: BAND_TEXT.excelling }}>
                        {subjectLabels[l.subj] ?? l.subj}
                        {multiGrade ? ` (${gradeLabels[l.grade] ?? l.grade})` : ""} +{num(l.d)}
                      </span>
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-muted">{c.neighboursNoAhead}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
