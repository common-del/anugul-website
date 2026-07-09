"use client";

import { useState } from "react";

// Static-site contact form: composes a mailto with the visitor's name +
// message. If no office email is configured yet, sending is disabled with a
// clear note (nothing is silently lost).
export default function ContactForm({
  email,
  labels,
}: {
  email: string;
  labels: {
    name: string; namePh: string; msg: string; msgPh: string;
    send: string; subject: string; noEmail: string;
  };
}) {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const send = () => {
    if (!email) return;
    const body = `${labels.name}: ${name}\n\n${msg}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      labels.subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="mt-5 space-y-4"
    >
      <label className="block">
        <span className="text-sm font-semibold text-gov-ink">{labels.name}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.namePh}
          className="mt-1 min-h-[48px] w-full rounded-xl border border-gov-line bg-white px-4 text-base text-gov-ink shadow-sm outline-none focus:border-gov"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-gov-ink">{labels.msg}</span>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={labels.msgPh}
          rows={5}
          className="mt-1 w-full rounded-xl border border-gov-line bg-white px-4 py-3 text-base text-gov-ink shadow-sm outline-none focus:border-gov"
        />
      </label>
      <button
        type="submit"
        disabled={!email || !msg.trim()}
        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gov px-6 text-[16px] font-extrabold text-white shadow-sm active:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        {labels.send}
      </button>
      {!email && <p className="text-sm text-muted">{labels.noEmail}</p>}
    </form>
  );
}
