import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const AWARENESS_FILM = "https://youtu.be/txr94hVoMWo";

// v2 home (docx mock): hero + Find Your School / Explore Reports,
// awareness film, "Who are you?" tiles (Parent, Government and Orgs).
export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} active="home" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:space-y-0">
          {/* hero */}
          <section className="flex flex-col justify-center rounded-2xl border border-gov-line bg-white p-6 shadow-sm">
            <h1 className="text-[27px] font-extrabold leading-tight text-gov-ink">
              {v.heroTitle}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              {v.heroDesc}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/find/`}
                className="flex min-h-[52px] items-center justify-center rounded-xl bg-gov px-6 text-[16px] font-bold text-white shadow-sm active:brightness-110"
              >
                {v.findSchool}
              </Link>
              <Link
                href={`/${locale}/reports/`}
                className="flex min-h-[52px] items-center justify-center rounded-xl border-2 border-gov px-6 text-[16px] font-bold text-gov"
              >
                {v.exploreReports}
              </Link>
            </div>
          </section>

          {/* awareness film */}
          <a
            href={AWARENESS_FILM}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-[#2b2c30] shadow-sm"
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.07), rgba(0,0,0,0) 60%)",
              }}
            />
            <span className="relative flex flex-col items-center gap-3">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-lg">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#0E5A40" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-wide text-white">
                {v.awarenessFilm}
              </span>
            </span>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white">
              {v.filmMinutes}
            </span>
          </a>
        </div>

        {/* who are you? */}
        <section className="mt-6">
          <h2 className="text-lg font-bold text-gov-ink">{v.whoAreYou}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
            {[
              { href: `/${locale}/`, label: v.roleParent, current: true },
              { href: `/${locale}/gov/`, label: v.roleOrgs, current: false },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className={`flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center text-sm font-bold ${
                  r.current
                    ? "border-gov bg-gov-tint text-gov-dark"
                    : "border-gov-line bg-white text-gov-ink hover:bg-gov-tint"
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {r.current ? (
                    <>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-1a8 8 0 0116 0v1" />
                    </>
                  ) : (
                    <>
                      <path d="M3 21h18" />
                      <path d="M5 21V7l7-4 7 4v14" />
                      <path d="M9 21v-6h6v6" />
                    </>
                  )}
                </svg>
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
