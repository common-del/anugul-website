import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";
import EmailLink from "@/components/EmailLink";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Dedicated website inbox (owner 2026-07-27). Postal address sourced from the
// public Google listing for the District Education Office, Angul. No public
// phone line.
const DEO_EMAIL = "anugolasaksham@gmail.com";
const DEO_ADDRESS = "District Education Office, Amalapada, Angul, Odisha – 759122";

export default function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  return (
    <PageShell zone="full">
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.contactTitle}
        </h1>

        <section className="mt-4 gov-card p-5">
          <p className="font-bold text-gov-ink">{v.contactOffice}</p>
          <p className="mt-1 text-sm leading-relaxed text-gov-ink">{DEO_ADDRESS}</p>
          <dl className="mt-3 text-sm">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 font-semibold text-muted">{v.contactEmailL}</dt>
              <dd className="text-gov-ink">
                <EmailLink
                  email={DEO_EMAIL}
                  className="underline underline-offset-2 hover:text-gov"
                >
                  {DEO_EMAIL}
                </EmailLink>
              </dd>
            </div>
          </dl>
        </section>

        <ContactForm
          email={DEO_EMAIL}
          labels={{
            name: v.contactName,
            namePh: v.contactNamePh,
            msg: v.contactMsg,
            msgPh: v.contactMsgPh,
            send: v.contactSend,
            subject: v.contactSubject,
            noEmail: v.contactNoEmail,
          }}
        />
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
