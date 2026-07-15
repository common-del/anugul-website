// Score out of 10 shown as filled vs outline stars — the same representation as
// the printed report card (never invented bars). Used everywhere a /10 score
// appears: subject scores, nearby schools, finder cards, principal comparison.
const STAR =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

const TONES: Record<string, { on: string; off: string }> = {
  gov: { on: "#2D3A47", off: "#E9ECEE" },
  accent: { on: "#E5A24F", off: "#FCEBE5" },
};

export default function Stars({
  score,
  max = 10,
  size = 16,
  tone = "gov",
  label,
}: {
  score: number;
  max?: number;
  size?: number;
  tone?: "gov" | "accent";
  label?: string;
}) {
  const c = TONES[tone] ?? TONES.gov;
  const n = Math.max(0, Math.min(max, Math.round(score)));
  return (
    <span
      role="img"
      aria-label={label ?? `${n} / ${max}`}
      className="inline-flex flex-wrap items-center gap-[2px] align-middle"
    >
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < n ? c.on : c.off}
          aria-hidden
        >
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}
