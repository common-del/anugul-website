// Display helpers for the UDISE school profile. Raw codes stay in the data
// (src/data/schools.json); these map them to reader-friendly, localisable text
// at render time. Used by both the parent (school/[udise]) and school-head
// (principal/[udise]) report cards so the two stay consistent.

// School_Management holds one of exactly four codes in the data (2026): "SME",
// "AIDED (BG)", "TRW", "PVT.". Mapped to parent-friendly labels; "PVT." and any
// unknown value render blank, per owner (every assessed school is one of the
// first three).
export function managementLabel(
  raw: string | null | undefined,
  labels: { mgmtGovernment: string; mgmtAided: string; mgmtTribal: string },
): string {
  if (!raw) return "";
  const s = raw.trim().toUpperCase();
  if (s === "SME") return labels.mgmtGovernment;
  if (s.startsWith("AIDED")) return labels.mgmtAided;
  if (s === "TRW") return labels.mgmtTribal;
  return "";
}

// Urban/Rural setting; the data holds "Rural" / "Urban".
export function areaLabel(
  raw: string | null | undefined,
  labels: { areaRural: string; areaUrban: string },
): string {
  if (!raw) return "";
  const s = raw.trim().toLowerCase();
  if (s === "rural") return labels.areaRural;
  if (s === "urban") return labels.areaUrban;
  return raw;
}

// Boundary wall is a TYPE in the data ("Pucca", "Partial", "No boundary walls",
// "Barbed wire fencing", "Hedges", "Under Construction", "Others", ...). Only an
// explicit "no ..." value counts as absent; null/blank means unknown so the
// caller can omit it entirely.
export function hasBoundaryWall(raw: string | null | undefined): boolean | null {
  if (!raw || raw.trim() === "" || raw.trim() === "#N/A") return null;
  return !/^no\b/i.test(raw.trim());
}

// balvatika is stored as "yes" / "no" (or null / "#N/A"). Returns a boolean or
// null when unknown.
export function boolYesNo(raw: string | null | undefined): boolean | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (s === "yes") return true;
  if (s === "no") return false;
  return null;
}
