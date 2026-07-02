import fs from "fs";
import path from "path";

// Build-time loaders for the officials data slices (server components only —
// runs during static prerender, nothing here ships to the client as JS).
const OFF = path.join(process.cwd(), "src", "data", "officials");

function readJson(rel: string) {
  return JSON.parse(fs.readFileSync(path.join(OFF, rel), "utf-8"));
}

export type BandKeyStr = "urgent" | "needs" | "developing" | "excelling";

// Aggregated UDISE inputs for a block/cluster, juxtaposed with outcomes.
export type InputsRollup = {
  coverage: { withData: number; total: number };
  avgBasics?: number | null;
  ptrOver?: number;
  singleTeacher?: number;
  dilapidated?: number;
  supportPriority?: number;
  facilityGaps?: { name: string; missing: number }[];
};

export type BlockSlice = {
  name: string;
  slug: string;
  headline: { overall: number; g5: number; g8: number; schools: number; students: number };
  vs_best: { overall: { block: number; best: number; best_name: string; rank: number; n_blocks: number; district_avg: number } };
  drop: Record<string, number>;
  rel_subject: Record<string, { subject: string; block: number; district: number; gap: number }[]>;
  bands: Record<string, { counts: Record<string, number>; schools: { udise: string; name: string; cluster: string; score: number; band: BandKeyStr }[] }>;
  cluster_league: { block_score: number; rows: { cluster: string; score: number; students: number; schools: number; best_school: number; worst_school: number }[] };
  clusters_heatmap: Record<string, Record<string, number>>;
  concentration: { struggling: number; pct_struggling: number; top20_share: number; top20_schools: number };
  failing_all: Record<string, { pct: number; n: number; N: number }>;
  leverage: { top: { udise: string; name: string; cluster: string; score: number; students: number; recoverable: number }[]; whatif: Record<string, { delta: number; new: number }>; schools_for_half_deficit: number; n_schools: number; block_mean: number };
  bright_spots: { udise: string; name: string; cluster: string; score: number; cluster_score: number; gap: number; students: number }[];
  foundational: Record<string, {
    at: number; gm1: number;
    by_subject?: Record<string, { at?: number; gm1?: number }>;
    weak_los?: { lo: string; subject: string; gl: string; pct: number; desc: string }[];
  }>;
  cognitive: Record<string, { by_cog: Record<string, number>; by_subject?: Record<string, Record<string, number>> } | null>;
  miscon: MisconCard[];
  inputs: InputsRollup;
};

export type MisconCard = {
  grade: string; subject: string; qno: number; stem: string;
  opts: Record<string, string>; correct: string; chosen: string; text: string;
  byBlock?: Record<string, number>; pct?: number; correct_pct?: number;
};

export type ClusterSlice = {
  cluster: string; block: string; blockSlug: string; rank: number; of: number;
  score: number; blockScore: number; students: number;
  schools: { udise: string; name: string; score: number; band: BandKeyStr }[];
  brightSpots: { name: string; score: number; cluster_score: number; students: number }[];
  recognition: { grade: string; subject: string; desc: string; observed: number; district: number; n: number }[];
  worstSubject: string | null;
  worstSubjectPct: number | null;
  inputs: InputsRollup;
};

export function getDistrictOfficials() {
  return readJson("district.json");
}
export function getBlockSlugs(): { name: string; slug: string }[] {
  return getDistrictOfficials().blocks;
}
export function getBlock(slug: string): BlockSlice {
  return readJson(path.join("blocks", `${slug}.json`));
}
export function getClusterIndex(): { cluster: string; block: string; slug: string; schools: number }[] {
  return readJson("cluster-index.json");
}
export function getCluster(slug: string): ClusterSlice {
  return readJson(path.join("clusters", `${slug}.json`));
}
export function getMisconceptions(): MisconCard[] {
  return readJson("misconceptions.json");
}
export function getItems(): {
  grade: string; subject: string; q_no: number; lo: string; desc: string;
  gl: string; cog: string | null; correct_pct: number; top_wrong_pct: number;
  blank: number; discrimination: number | null; rpbis: number | null;
}[] {
  return readJson("items.json");
}
