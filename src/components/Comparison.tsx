import { BAND_COLOR, BAND_TEXT, bandFromScore } from "@/lib/bands";
import { fmtNum, fmtPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

type Nearby = {
  compared: number;
  ahead: number;
  behind: number;
  likeForLike: boolean;
  nearestKm: number | null;
};

type Copy = {
  yourSchool: string;
  blockAvg: string;
  aboveBlock: string;
  belowBlock: string;
  atBlock: string;
  nearbyTitle: string;
  nearbyLine: string;
  nearbyNone: string;
  nearbyFar: string;
};

function Bar({
  label,
  value,
  locale,
}: {
  label: string;
  value: number;
  locale: Locale;
}) {
  const b = bandFromScore(value);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-brand-ink">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color: BAND_TEXT[b] }}>
          {fmtPercent(Math.round(value), locale)}
        </span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-brand-tint">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: BAND_COLOR[b] }}
        />
      </div>
    </div>
  );
}

export default function Comparison({
  score,
  blockAverage,
  nearby,
  c,
  locale,
}: {
  score: number;
  blockAverage: number;
  nearby: Nearby;
  c: Copy;
  locale: Locale;
}) {
  const delta = Math.round(score - blockAverage);
  const deltaText =
    delta >= 2
      ? c.aboveBlock.replace("{n}", fmtNum(delta, locale))
      : delta <= -2
        ? c.belowBlock.replace("{n}", fmtNum(Math.abs(delta), locale))
        : c.atBlock;

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <Bar label={c.yourSchool} value={score} locale={locale} />
        <Bar label={c.blockAvg} value={blockAverage} locale={locale} />
      </div>
      <p className="text-sm font-semibold text-brand-ink">{deltaText}</p>

      <div className="rounded-xl bg-brand-tint p-4">
        <p className="text-sm font-bold text-brand-ink">{c.nearbyTitle}</p>
        {nearby.compared > 0 ? (
          <>
            <div className="mt-2 flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: nearby.compared }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${
                    i < nearby.ahead ? "bg-brand" : "bg-brand-line"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">
              {c.nearbyLine
                .replace("{ahead}", fmtNum(nearby.ahead, locale))
                .replace("{total}", fmtNum(nearby.compared, locale))}
            </p>
            {nearby.nearestKm !== null && nearby.nearestKm > 15 && (
              <p className="mt-1 text-xs text-muted">{c.nearbyFar}</p>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">{c.nearbyNone}</p>
        )}
      </div>
    </div>
  );
}
