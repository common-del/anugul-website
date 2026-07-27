import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";

// Temporary shell for v2 routes whose content lands in a later bucket.
export default function StubPage({
  locale,
  t,
  title,
  intro,
  active = "none",
}: {
  locale: Locale;
  t: Messages;
  title: string;
  intro?: string;
  active?: "home" | "reports" | "none";
}) {
  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active={active} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {title}
        </h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
        <p className="mt-5 rounded-xl border border-gov-line bg-white p-4 text-sm text-muted">
          {t.v2.comingSoon}
        </p>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
