import { fmtNum } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { InputsRollup } from "@/lib/officialsData";

// Inputs (what schools have) juxtaposed with outcomes at block/cluster level.
// Aggregate counts only, and no correlation is claimed — the source analysis
// shows inputs explain ~6% of the score gap. Coverage-aware: many blocks
// (Talcher, most of Pallahara) have no UDISE input panel yet.
type Copy = {
  inputsTitle: string; inputsIntro: string; inputsCoverage: string;
  inputsNoData: string; inputsBasics: string; inputsPtrOver: string;
  inputsSingle: string; inputsDilapidated: string; inputsSupport: string;
  inputsGapsTitle: string; inputsGapLine: string; inputsNone: string;
  basics: Record<string, string>;
};

function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    s,
  );
}

export default function InputsCard({
  data,
  unitName,
  o,
  locale,
}: {
  data: InputsRollup;
  unitName: string;
  o: Copy;
  locale: Locale;
}) {
  const num = (n: number) => fmtNum(n, locale);
  const { withData, total } = data.coverage;

  const lines: string[] = [];
  if (withData > 0) {
    if (data.avgBasics != null) lines.push(fill(o.inputsBasics, { n: num(data.avgBasics) }));
    if (data.ptrOver) lines.push(fill(o.inputsPtrOver, { n: num(data.ptrOver) }));
    if (data.singleTeacher) lines.push(fill(o.inputsSingle, { n: num(data.singleTeacher) }));
    if (data.dilapidated) lines.push(fill(o.inputsDilapidated, { n: num(data.dilapidated) }));
    if (data.supportPriority) lines.push(fill(o.inputsSupport, { n: num(data.supportPriority) }));
  }
  const gaps = data.facilityGaps ?? [];

  return (
    <section className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="text-lg font-bold text-brand-ink">{o.inputsTitle}</h2>
      <p className="mt-1 text-sm text-muted">{o.inputsIntro}</p>

      {withData === 0 ? (
        <p className="mt-3 rounded-xl bg-brand-tint p-3 text-sm text-brand-ink">
          {fill(o.inputsNoData, { block: unitName })}
        </p>
      ) : (
        <>
          <p className="mt-3 text-xs text-muted">
            {fill(o.inputsCoverage, { withData: num(withData), total: num(total) })}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-brand-ink">
            {lines.map((l, i) => (
              <li key={i} className="flex items-start gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {l}
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t border-brand-line pt-3">
            <p className="text-sm font-bold text-brand-ink">{o.inputsGapsTitle}</p>
            {gaps.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {gaps.map((g) => (
                  <span
                    key={g.name}
                    className="rounded-full bg-brand-tint px-3 py-1 text-sm text-brand-ink"
                  >
                    {o.basics[g.name] ?? g.name}{" "}
                    <span className="font-semibold tabular-nums">
                      {fill(o.inputsGapLine, { name: "", n: num(g.missing) }).replace(/^\s*—\s*/, "")}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted">{o.inputsNone}</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
