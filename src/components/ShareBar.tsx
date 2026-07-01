"use client";

export default function ShareBar({
  schoolName,
  labels,
}: {
  schoolName: string;
  labels: { title: string; whatsapp: string; print: string; message: string };
}) {
  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = `${labels.message.replace("{school}", schoolName)} ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <section className="no-print">
      <h2 className="mb-3 text-lg font-bold text-brand-ink">{labels.title}</h2>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 font-bold text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12.04 2c-5.46 0-9.9 4.43-9.9 9.9 0 1.74.46 3.44 1.32 4.94L2 22l5.3-1.38a9.86 9.86 0 004.73 1.2h.01c5.46 0 9.9-4.43 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0012.05 2zm5.8 14.06c-.24.68-1.42 1.32-1.96 1.36-.5.05-.98.24-3.3-.69-2.8-1.1-4.58-3.96-4.72-4.15-.14-.19-1.12-1.49-1.12-2.84s.71-2.01.96-2.29c.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.57.81 1.96.88 2.1.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.38-.42.51-.14.14-.29.29-.12.57.17.28.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.3 1.42.28.14.45.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.25.09 1.62.76 1.9.9.28.14.46.21.53.33.07.12.07.68-.17 1.36z" />
          </svg>
          {labels.whatsapp}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-white px-4 font-bold text-brand ring-1 ring-brand-line"
        >
          {labels.print}
        </button>
      </div>
    </section>
  );
}
