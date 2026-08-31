import fs from "fs";
import path from "path";
import type { Locale } from "@/lib/i18n/config";

// Display-only Odia school-name overlay + the "no-result" extra schools, both
// committed under public/data (see school-od.json / extra-schools.json). Kept out
// of schools.json so the data pipeline and every aggregate/count are untouched.
// Server-only (fs); the client SchoolFinder fetches the same JSON files directly.

let odCache: Record<string, string> | null = null;
export function getSchoolOd(): Record<string, string> {
  if (!odCache) {
    const p = path.join(process.cwd(), "public", "data", "school-od.json");
    odCache = JSON.parse(fs.readFileSync(p, "utf-8"));
  }
  return odCache as Record<string, string>;
}

export type ExtraSchool = {
  id: string;
  udise: string | null;
  block: string;
  cluster: string;
  name: string;
  nameOd: string;
  odVerified: boolean;
};

let exCache: ExtraSchool[] | null = null;
export function getExtraSchools(): ExtraSchool[] {
  if (!exCache) {
    const p = path.join(process.cwd(), "public", "data", "extra-schools.json");
    exCache = JSON.parse(fs.readFileSync(p, "utf-8"));
  }
  return exCache as ExtraSchool[];
}

/** Localised school display name: Odia from the review when in `od`, else the raw name. */
export function schoolDisplayName(udise: string, raw: string, locale: Locale): string {
  return locale === "od" ? getSchoolOd()[udise] || raw : raw;
}
