// English display names written in full ("High School", not "HS"). Only
// acronyms whose meaning is certain are expanded; the rest stay as written.
// Pure, so it runs on server and client alike.
const FIX: Record<string, string> = {
  "BALARAMPMRASAD HS": "Balaram Prasad High School",
  "BALARAMPRASAD H S": "Balaram Prasad High School",
};
const RULES: [RegExp, string][] = [
  [/\bGOV'?T\.?(?=[\s,.]|$|[A-Z])/gi, "Government "],
  [/\bU\.?\s?P\.?\s?S\.?(?=[\s,]|$)/gi, "Upper Primary School"],
  [/\bU\.?\s?P\.?\s+SCHOOL\b/gi, "Upper Primary School"],
  [/\bNUPS\b/gi, "Nodal Upper Primary School"],
  [/\bP\.?\s?S\.?(?=[\s,]|$)/gi, "Primary School"],
  [/\bH\.?\s?S\.?\s?S\.?(?=[\s,]|$)/gi, "Higher Secondary School"],
  [/\bH\.?\s?S\.?(?=[\s,]|$)/gi, "High School"],
];
const KEEP = new Set(["PM", "SHRI", "GP", "PUPS", "PPS", "PNHS", "LNGHS", "JGHS", "MHS", "YJHS", "NHS", "UGHS", "SS", "OGI", "HK", "PHS", "UGME", "AS", "ME"]);
const SMALL = new Set(["of", "and", "the"]);

function tc(w: string): string {
  const bare = w.replace(/[,.]/g, "");
  if (KEEP.has(bare.toUpperCase())) return w.toUpperCase();
  if (SMALL.has(w.toLowerCase())) return w.toLowerCase();
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

export function expandName(raw: string): string {
  const k = raw.trim();
  if (FIX[k]) return FIX[k];
  let s = k.replace(/\s+/g, " ").replace(/\bgovt\.?(?=[A-Za-z])/gi, "Govt ");
  for (const [re, rep] of RULES) s = s.replace(re, rep);
  s = s.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
  const out = s.split(" ").map(tc).join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export const nameChanged = (raw: string) => expandName(raw) !== raw.trim();
