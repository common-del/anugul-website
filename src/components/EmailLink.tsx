"use client";

import { track } from "@/lib/analytics";

// A mailto: link that records a contact_click when tapped. mailto clicks aren't
// caught by GA's outbound-click tracking, so this is the only way to see how
// many visitors reach out by email.
export default function EmailLink({
  email,
  className,
  children,
}: {
  email: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={() => track("contact_click", { method: "email" })}
    >
      {children}
    </a>
  );
}
