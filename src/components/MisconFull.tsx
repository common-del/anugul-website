import { fmtNum } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { MislibCard, MisuRow } from "@/lib/officialsData";

// Full-fidelity misconception cards, replicating the SAKSHAM Academic LO
// report's misHtml() exactly: stimulus image (as printed in the paper), full
// stem/extended stem, ALL options untruncated (Odia originals where present),
// the correct option tagged with its % chosen, the most-chosen wrong option
// tagged with its % chosen, then the misconception and teaching response.
type Copy = {
  misAnswerTag: string;
  misTrapTag: string;
  misLabel: string;
  misTry: string;
  misStimCap: string;
  misIndicative: string;
  misOrderNote: string;
};

export default function MisconFull({
  cards,
  rows,
  copy,
  subjectLabels,
  gradeLabels,
  locale,
}: {
  cards: Record<string, MislibCard>;
  rows: MisuRow[]; // one unit's rows (district ALL or a block), any order
  copy: Copy;
  subjectLabels: Record<string, string>;
  gradeLabels: Record<string, string>;
  locale: Locale;
}) {
  const num = (n: number) => fmtNum(n, locale);
  const ordered = [...rows].sort((a, z) => z.trap_pct - a.trap_pct);
  const hasLow = ordered.some((m) => m.conf === "low");

  return (
    <div>
      <p className="text-sm text-muted">{copy.misOrderNote}</p>
      {hasLow && <p className="mt-1 text-xs text-muted">{copy.misIndicative}</p>}
      <div className="mt-3 space-y-4">
        {ordered.map((m) => {
          const id = `${m.g}|${m.sub}|${m.qno}`;
          const L = cards[id];
          if (!L) return null;
          const gradeLabel = gradeLabels[`Grade ${m.g}`] ?? `Grade ${m.g}`;
          const opts = (["A", "B", "C", "D"] as const).filter(
            (o) => L.opts[o] || L.oopts?.[o],
          );
          return (
            <article
              key={id}
              className="gov-card p-5"
              style={{ breakInside: "avoid" }}
            >
              <p className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gov px-2.5 py-0.5 font-bold text-white">
                  {subjectLabels[m.sub] ?? m.sub}
                </span>
                <span className="font-semibold text-muted">{gradeLabel}</span>
                {m.conf === "low" && (
                  <span aria-hidden className="font-bold text-[#C24E36]">*</span>
                )}
              </p>

              {L.img && (
                <>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {copy.misStimCap}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={L.img}
                    alt={copy.misStimCap}
                    loading="lazy"
                    className="mt-1 w-full max-w-md rounded-lg border border-gov-line bg-white"
                  />
                </>
              )}

              <p className="mt-3 font-semibold leading-relaxed text-gov-ink">
                {L.xstem || L.stem}
              </p>

              <div className="mt-2 space-y-1.5 text-sm">
                {opts.map((o) => {
                  const isKey = o === L.key;
                  const isTrap = o === L.trap;
                  return (
                    <div
                      key={o}
                      className={`rounded-lg px-3 py-2 leading-relaxed ${
                        isKey
                          ? "bg-[#E9ECEE] text-[#2D3A47]"
                          : isTrap
                            ? "bg-[#FCEBE5] text-[#C24E36]"
                            : "bg-gov-tint text-gov-ink"
                      }`}
                    >
                      <b>{o}.</b> {L.oopts?.[o] ?? L.opts[o]}
                      {isKey && (
                        <span className="ml-2 inline-block rounded-full bg-[#2D3A47] px-2 py-0.5 text-[11px] font-bold text-white">
                          {copy.misAnswerTag.replace("{pct}", num(m.key_pct))}
                        </span>
                      )}
                      {isTrap && (
                        <span className="ml-2 inline-block rounded-full bg-[#C24E36] px-2 py-0.5 text-[11px] font-bold text-white">
                          {copy.misTrapTag.replace("{pct}", num(m.trap_pct))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 rounded-lg bg-gov-tint px-3 py-2 text-sm leading-relaxed text-gov-ink">
                <b>{copy.misLabel}</b> {L.mis} <b>{copy.misTry}</b> {L.note}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
