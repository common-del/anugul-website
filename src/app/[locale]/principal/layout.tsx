import type { Metadata } from "next";

// The principal (school-head) report is a discreet officer view of a school's
// data, reached from the school-head landing — not a public page. Keep it out
// of Google so it doesn't compete with the public /school report card.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
