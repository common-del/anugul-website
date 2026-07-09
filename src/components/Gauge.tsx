// Semi-circular gauge (server-rendered SVG, no client JS). Shows a 0–100%
// value as a coloured arc with the number centred beneath; the caption line
// (e.g. "District average: 62%") is the accessible comparison, so colour is
// never the only signal.
export default function Gauge({
  value,
  display,
  label,
  caption,
  color = "#0E5A40",
}: {
  value: number; // 0..100
  display: string; // localised "65%"
  label: string; // e.g. "Grade 5"
  caption?: string;
  color?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  // Semi-circle from 180° to 0°, radius 40, centre (50,50). The swept angle is
  // 180°·v/100, which never exceeds 180°, so the SVG large-arc-flag must be 0
  // for every value — setting it to 1 (an earlier bug) made the arc take the
  // long way through the bottom of the circle and get clipped away.
  const angle = Math.PI * (1 - v / 100);
  const x = 50 + 40 * Math.cos(angle);
  const y = 50 - 40 * Math.sin(angle);
  const large = 0;
  return (
    <div className="text-center">
      <svg viewBox="0 0 100 58" className="mx-auto w-full max-w-[180px]" aria-hidden>
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#D5E4DB"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {v > 0 && (
          <path
            d={`M 10 50 A 40 40 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
        <text
          x="50"
          y="52"
          textAnchor="middle"
          fontSize="17"
          fontWeight="800"
          fill="#143726"
        >
          {display}
        </text>
      </svg>
      <div className="text-sm font-bold text-gov-ink">{label}</div>
      {caption && <div className="mt-0.5 text-xs text-muted">{caption}</div>}
    </div>
  );
}
