import { BAND_COLOR, BAND_TEXT, type BandKey } from "@/lib/bands";
import { fmtPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

// Headline: big % + plain-language band, over a 4-segment scale with the pass
// line (50) and a marker. Colour is backed by the word + number.
export default function BandMeter({
  score,
  band,
  label,
  explain,
  locale,
}: {
  score: number;
  band: BandKey;
  label: string;
  explain: string;
  locale: Locale;
}) {
  const color = BAND_COLOR[band];
  const pct = fmtPercent(Math.round(score), locale);
  const mx = Math.max(3, Math.min(97, score)); // clamp marker inside the meter
  return (
    <section className="rounded-2xl border border-brand-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-4xl font-extrabold" style={{ color: BAND_TEXT[band] }}>
          {pct}
        </span>
        <span
          className="rounded-full px-3 py-1.5 text-sm font-bold"
          style={{
            backgroundColor: color,
            /* the light gold fill (developing) needs dark text; others use white */
            color: band === "developing" ? "#12233d" : "#ffffff",
          }}
        >
          {label}
        </span>
      </div>
      <svg
        viewBox="0 0 100 16"
        className="mt-4 w-full"
        role="img"
        aria-label={`${label} — ${pct}`}
      >
        <rect x="0" y="7" width="25" height="6" fill={BAND_COLOR.urgent} />
        <rect x="25" y="7" width="25" height="6" fill={BAND_COLOR.needs} />
        <rect x="50" y="7" width="25" height="6" fill={BAND_COLOR.developing} />
        <rect x="75" y="7" width="25" height="6" fill={BAND_COLOR.excelling} />
        <line
          x1="50"
          y1="5"
          x2="50"
          y2="15"
          stroke="#12233d"
          strokeWidth="0.5"
          strokeDasharray="1 1"
        />
        <polygon points={`${mx},6.5 ${mx - 3},1 ${mx + 3},1`} fill="#12233d" />
        <line
          x1={mx}
          y1="6.5"
          x2={mx}
          y2="14"
          stroke="#12233d"
          strokeWidth="1.2"
        />
      </svg>
      <p className="mt-3 text-sm text-muted">{explain}</p>
    </section>
  );
}
