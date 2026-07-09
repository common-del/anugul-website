// Responsive page wrapper. Mobile renders exactly as before (full-bleed,
// portrait); wider screens get real desktop layouts via md:/lg: classes in the
// pages. The phone-frame presentation now lives only on /demo.
export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gov-canvas">{children}</div>
  );
}
