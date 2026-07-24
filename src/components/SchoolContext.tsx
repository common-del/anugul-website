import { fmtNum, fmtPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

export type Peer = {
  nPeers: number; median: number | null; pctile: number | null;
  bestSubj: string | null; bestSubjPct: number | null;
  worstSubj: string | null; worstSubjPct: number | null;
} | null;
export type ClusterPos = { rank: number; of: number; score: number } | null;
export type BrightSpotRef = {
  name: string; score: number; cluster_score: number;
} | null;
export type Inputs = {
  ptr: number | null; ptrNorm: number | null; ptrOver: number | null;
  singleTeacher: boolean; basicsMet: number | null;
  basicsIn?: string[]; basicsOut?: string[];
} | null;

type Copy = {
  title: string; intro: string; line: string; best: string; worst: string;
  clusterLine: string; brightTitle: string; brightLine: string;
  rteTitle: string; rtePtr: string; rteSingle: string; rteNA: string;
  rteBasicsIn: string; rteBasicsOut: string; basics: Record<string, string>;
};

function fill(s: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    s,
  );
}

// Peer benchmark + cluster position + nearby bright spot + RTE basics.
// Facts and fair comparisons — never framed as explaining the score.
export default function SchoolContext({
  peer,
  clusterPos,
  cluster,
  block,
  brightSpot,
  inputs,
  c,
  subjectLabels,
  locale,
}: {
  peer: Peer;
  clusterPos: ClusterPos;
  cluster: string;
  block: string;
  brightSpot: BrightSpotRef;
  inputs: Inputs;
  c: Copy;
  subjectLabels: Record<string, string>;
  locale: Locale;
}) {
  const num = (n: number) => fmtNum(Math.round(n), locale);
  return (
    <section className="rounded-2xl border border-brand-line bg-white p-5">
      <h2 className="text-lg font-bold text-brand-ink">{c.title}</h2>
      <p className="mt-1 text-xs text-muted">{c.intro}</p>

      {peer && peer.pctile != null && peer.median != null && (
        <p className="mt-3 text-sm text-brand-ink">
          {fill(c.line, {
            pctile: num(peer.pctile),
            n: num(peer.nPeers),
            median: num(peer.median),
          })}
        </p>
      )}
      {peer && peer.bestSubj && peer.worstSubj && (
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-brand-tint p-3">
            <div className="text-xs text-muted">{c.best}</div>
            <div className="font-bold text-brand-ink">
              {subjectLabels[peer.bestSubj] ?? peer.bestSubj}
              {peer.bestSubjPct != null && (
                <span className="ml-1 tabular-nums">{fmtPercent(Math.round(peer.bestSubjPct), locale)}</span>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-brand-tint p-3">
            <div className="text-xs text-muted">{c.worst}</div>
            <div className="font-bold text-brand-ink">
              {subjectLabels[peer.worstSubj] ?? peer.worstSubj}
              {peer.worstSubjPct != null && (
                <span className="ml-1 tabular-nums">{fmtPercent(Math.round(peer.worstSubjPct), locale)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {clusterPos && (
        <p className="mt-3 text-sm text-muted">
          {fill(c.clusterLine, {
            cluster,
            rank: num(clusterPos.rank),
            of: num(clusterPos.of),
            block,
          })}
        </p>
      )}

      {brightSpot && (
        <div className="mt-3 rounded-xl bg-brand-tint p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
            {c.brightTitle}
          </p>
          <p className="mt-1 text-sm text-brand-ink">
            {fill(c.brightLine, {
              name: brightSpot.name,
              score: fmtPercent(Math.round(brightSpot.score), locale),
              clusterScore: fmtPercent(Math.round(brightSpot.cluster_score), locale),
            })}
          </p>
        </div>
      )}

      <div className="mt-3 border-t border-brand-line pt-3">
        <p className="text-sm font-bold text-brand-ink">{c.rteTitle}</p>
        {inputs ? (
          <ul className="mt-1 space-y-1 text-sm text-brand-ink">
            {inputs.basicsIn && inputs.basicsIn.length > 0 && (
              <li>
                <span className="font-semibold">{c.rteBasicsIn}:</span>{" "}
                {inputs.basicsIn.map((b) => c.basics[b] ?? b).join(", ")}
              </li>
            )}
            {inputs.basicsOut && inputs.basicsOut.length > 0 && (
              <li className="text-[#C24E36]">
                <span className="font-semibold">{c.rteBasicsOut}:</span>{" "}
                {inputs.basicsOut.map((b) => c.basics[b] ?? b).join(", ")}
              </li>
            )}
            {inputs.ptr != null && inputs.ptrNorm != null && (
              <li>{fill(c.rtePtr, { ptr: num(inputs.ptr), norm: num(inputs.ptrNorm) })}</li>
            )}
            {inputs.singleTeacher && (
              <li className="font-semibold text-[#C24E36]">{c.rteSingle}</li>
            )}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">{c.rteNA}</p>
        )}
      </div>
    </section>
  );
}
