import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/ContactForm";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// TODO: fill in the real DEO Angul contact details. Leave "" until confirmed —
// the form disables Send and shows a note when the email is empty.
const DEO_EMAIL = "";
const DEO_PHONE = "";

export default function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  const rows = [
    { label: v.contactEmailL, value: DEO_EMAIL },
    { label: v.contactPhoneL, value: DEO_PHONE },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.contactTitle}
        </h1>

        <section className="mt-4 gov-card p-5">
          <p className="font-bold text-gov-ink">{v.contactOffice}</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-2">
                <dt className="w-16 shrink-0 font-semibold text-muted">{r.label}</dt>
                <dd className="text-gov-ink">
                  {r.value ? (
                    r.value
                  ) : (
                    <span className="italic text-muted">{v.contactPending}</span>
                  )}
                </dd>
              </div>
            ))}
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
