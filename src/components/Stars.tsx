// Score out of 10 shown as filled vs outline stars — the same representation as
// the printed report card (never invented bars). Used everywhere a /10 score
// appears: subject scores, nearby schools, finder cards, principal comparison.
// Empty stars are drawn as a visible outline (not a pale fill): the nearby-school
// rows are tinted #E9ECEE / #FCEBE5, and a pale-filled empty star would vanish
// into them (esp. the #E9ECEE row, which matched the old off-colour exactly).
const STAR =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

// on = filled fill; line = empty-star outline stroke (mid-tone, legible on white
// and on the tinted nearby rows alike).
const TONES: Record<string, { on: string; line: string }> = {
  gov: { on: "#2D3A47", line: "#7B8794" },
  accent: { on: "#E5A24F", line: "#D3A15E" },
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
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < n;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? c.on : "none"}
            stroke={filled ? "none" : c.line}
            strokeWidth={filled ? 0 : 1.8}
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={STAR} />
          </svg>
        );
      })}
    </span>
  );
}
