type Copy = {
  title: string;
  intro: string;
  q1: string;
  q2: string;
  q3: string;
  smc: string;
};

// Gentle, non-directive prompts — questions a parent might carry into a school
// or SMC meeting. Suggestions, never instructions.
export default function Guidance({ c }: { c: Copy }) {
  return (
    <section className="rounded-2xl bg-brand-tint p-5">
      <h2 className="text-lg font-bold text-brand-ink">{c.title}</h2>
      <p className="mt-1 text-sm text-muted">{c.intro}</p>
      <ul className="mt-3 space-y-2">
        {[c.q1, c.q2, c.q3].map((q, i) => (
          <li
            key={i}
            className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-brand-ink"
          >
            “{q}”
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">{c.smc}</p>
    </section>
  );
}
