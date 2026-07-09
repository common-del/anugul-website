import fs from "fs";
import path from "path";

// Rich per-school records (name, block, cluster, scores, profile, inputs,
// neighbours). Read once from disk and cached at the module level — NOT via a
// static `import ... from "@/data/schools.json"`, which webpack would bundle
// (all ~2 MB) into every report-page server chunk. Reading with fs keeps the
// dataset out of the bundles (smaller output, faster compile) and holds a
// single in-memory copy per worker. Server-only (build-time under output:export).
let cache: Record<string, unknown> | null = null;

export function getSchools(): Record<string, unknown> {
  if (!cache) {
    const p = path.join(process.cwd(), "src", "data", "schools.json");
    cache = JSON.parse(fs.readFileSync(p, "utf-8"));
  }
  return cache as Record<string, unknown>;
}
