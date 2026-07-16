"use client";

import { useState } from "react";

// Cluster name beside its bar. Default: one line, truncated with an ellipsis
// (never wraps, never shrinks the font) + full name in a title tooltip for
// desktop hover. On tap (mobile) it expands in place to reveal the full name.
// Note: a real cluster is literally named "Unknown" (backend data-quality
// issue) — render it as-is, it is not an error.
export default function ClusterName({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      onClick={() => setOpen((x) => !x)}
      className={`block text-left ${open ? "whitespace-normal" : "truncate"} ${className}`}
    >
      {name}
    </button>
  );
}
