// Responsive page wrapper. Mobile renders exactly as before (full-bleed,
// portrait); wider screens get real desktop layouts via md:/lg: classes in the
// pages. The phone-frame presentation now lives only on /demo.
//
// Visual system (2026-07-15): every page sits on a warm gradient "zone" behind
// its content. `zone="full"` (landing/reading pages) is the brighter gradient
// plus two decorative glow blobs; `zone="quiet"` (data pages, the default) is a
// subtler wash and no blobs. Content cards become translucent glass over it;
// header/nav/footer stay solid. The zone class also tiers the glass cards.
export default function PageShell({
  children,
  zone = "quiet",
}: {
  children: React.ReactNode;
  zone?: "full" | "quiet";
}) {
  return (
    <div
      className={`relative min-h-screen ${zone === "full" ? "zone-full" : "zone-quiet"}`}
      style={{ background: `var(--gradient-zone-${zone})` }}
    >
      {zone === "full" && (
        // Separate clipped layer so the off-edge blobs never cause horizontal
        // scroll — and so its overflow:hidden doesn't break the sticky header.
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <span className="glow-blob glow-coral" />
          <span className="glow-blob glow-slate" />
        </div>
      )}
      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
