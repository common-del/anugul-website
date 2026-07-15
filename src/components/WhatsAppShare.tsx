"use client";

// Green "Share on WhatsApp" button (docx mock). Shares the school name and
// the current page URL; wa.me works in browser and app alike.
export default function WhatsAppShare({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const onClick = () => {
    const msg = `${text} ${window.location.href}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 text-sm font-extrabold text-white shadow-sm active:brightness-110"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15L2.1 21.9l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.4-.2-2.6.7.7-2.6-.2-.4A8 8 0 0 1 12 4zm4.3 9.6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6s1.7 2.7 4.2 3.7c1.6.7 2.2.7 3 .6a2.5 2.5 0 0 0 1.6-1.2 2 2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3z" />
      </svg>
      {label}
    </button>
  );
}
