"use client";

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-4 font-bold text-brand ring-1 ring-brand-line sm:w-auto sm:px-8"
    >
      {label}
    </button>
  );
}
