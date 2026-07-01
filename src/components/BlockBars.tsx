import { BAND_COLOR, bandFromScore } from "@/lib/bands";
import { fmtPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

type Block = { name: string; average: number; schools: number };

export default function BlockBars({
  blocks,
  bestBlock,
  locale,
}: {
  blocks: Block[];
  bestBlock: string;
  locale: Locale;
}) {
  const sorted = [...blocks].sort((a, b) => b.average - a.average);
  return (
    <div className="space-y-2.5">
      {sorted.map((bl) => {
        const color = BAND_COLOR[bandFromScore(bl.average)];
        return (
          <div key={bl.name}>
            <div className="flex justify-between text-sm">
              <span className="text-brand-ink">
                {bl.name}
                {bl.name === bestBlock && (
                  <span className="ml-1 text-accent-dark" aria-hidden>
                    ★
                  </span>
                )}
              </span>
              <span
                className="font-semibold tabular-nums"
                style={{ color }}
              >
                {fmtPercent(Math.round(bl.average), locale)}
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-brand-tint">
              <div
                className="h-full rounded-full"
                style={{ width: `${bl.average}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
