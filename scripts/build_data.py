"""
Build-time data pipeline for the Angul school report-card site.

Reads the raw SAKSHAM_Analysis files (scores, neighbours, UDISE profile, student
master) and emits ONLY school-level aggregates into ../src/data/ for the website.

Privacy: individual student rows and *_PRIVATE integrity files are used here only
as build inputs (when needed) and are NEVER written to the output. Nothing
individual or any integrity flag is emitted.

Run:  python scripts/build_data.py
Source dir can be overridden with env SAKSHAM_SOURCE.
"""

import csv
import json
import math
import os
import sys
from collections import defaultdict

SOURCE = os.environ.get(
    "SAKSHAM_SOURCE", r"D:\Claude_Cowork_CSF\SAKSHAM_Analysis"
)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "data"))

# ---------- helpers ----------------------------------------------------------

def src(name):
    return os.path.join(SOURCE, name)

def read_csv(name):
    with open(src(name), encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def num(x):
    try:
        if x is None:
            return None
        x = str(x).strip()
        if x == "" or x.upper() == "NA":
            return None
        return float(x)
    except (ValueError, TypeError):
        return None

def udise(x):
    return str(x).strip()

# Coded UDISE values look like "1-Yes", "2-No", "2-Partial", "1 - Rural",
# "3-Government Owned". Take the label after the first dash.
def decode(v):
    if v is None:
        return None
    s = str(v).strip()
    if s == "" or s.upper() == "NA":
        return None
    if "-" in s:
        label = s.split("-", 1)[1].strip()
        return label if label else None
    return s

def yesno(v):
    d = decode(v)
    if d is None:
        return None
    low = d.lower()
    if low.startswith("yes"):
        return "yes"
    if low.startswith("no"):
        return "no"
    if low.startswith("partial"):
        return "partial"
    return d

# ---------- bands ------------------------------------------------------------

# Internal band keys. Human-readable labels live in the i18n catalogs (od/en/…).
# The band is DERIVED from the rounded score (band_from_score below) so the
# badge always agrees with the number shown (the v3 label can disagree at the
# 75.0 boundary).

def band_from_score(s):
    if s is None:
        return None
    if s <= 25:
        return "urgent"
    if s <= 50:
        return "needs"
    if s <= 75:
        return "developing"
    return "excelling"

# ---------- load sources -----------------------------------------------------

print(f"Source: {SOURCE}")
dash = json.load(open(src("Angul_v3_dashboard_data.json"), encoding="utf-8"))
district = dash["district"]
blocks = dash["blocks"]

# canonical per-school score/band/name from the official dashboard
canon = {}
for bname, b in blocks.items():
    for s in b["bands"]["overall"]["schools"]:
        sc = round(float(s["score"]), 1)
        canon[udise(s["udise"])] = {
            "score": sc,
            "band": band_from_score(sc),
            "name": s["name"],
            "cluster": s["cluster"],
            "block": bname,
        }
print(f"canonical schools (with official score): {len(canon)}")

# block + district averages (student-weighted, matches dashboard)
block_avg = {b: round(float(blocks[b]["headline"]["overall"]), 1) for b in blocks}
district_avg = round(float(district.get("district_avg", 0)), 1)

# student master -> per-school subject means + assessed counts (build-only input)
SUBJECTS = ["Odia", "English", "Maths", "EVS", "Science", "SST"]

# Show every subject average, including single-student grades (client decision;
# note this can expose an individual child's result for tiny cohorts).
MIN_SUBJECT_N = 1
sm_sum = defaultdict(lambda: defaultdict(float))   # (udise,grade) -> subj -> sum
sm_cnt = defaultdict(lambda: defaultdict(int))     # (udise,grade) -> subj -> n
sm_students = defaultdict(set)                       # udise -> {(roll,grade)}
sm_overall_sum = defaultdict(float)
sm_overall_cnt = defaultdict(int)
for row in read_csv("Student_Master_clean.csv"):
    u = udise(row["UDISE"])
    g = (row.get("Grade") or "").strip()
    sm_students[u].add((row.get("Roll"), g))
    ov = num(row.get("Overall_avg"))
    if ov is not None:
        sm_overall_sum[u] += ov
        sm_overall_cnt[u] += 1
    for subj in SUBJECTS:
        val = num(row.get(subj))
        if val is not None:
            sm_sum[(u, g)][subj] += val
            sm_cnt[(u, g)][subj] += 1

def school_subjects(u):
    out = {}
    for (uu, g), subjmap in sm_sum.items():
        if uu != u:
            continue
        means = {}
        for subj, total in subjmap.items():
            n = sm_cnt[(uu, g)][subj]
            if n >= MIN_SUBJECT_N:
                means[subj] = round(total / n, 1)
        if means:
            out[g] = means
    return out

# neighbours
neigh_file = read_csv("Angul_Lat_Long_Scores_All_Schools_Neighbours_Scores.csv")
ll = {}  # udise -> {type, lat, lon, neighbours:[(udise,km)]}
for row in neigh_file:
    u = udise(row["Udise code"])
    nb = []
    for i in range(1, 6):
        nu = row.get(f"Neighbor{i}_UDISE")
        nk = num(row.get(f"Neighbor{i}_km"))
        if nu and str(nu).strip():
            nb.append((udise(nu), nk))
    ll[u] = {
        "type": (row.get("School Type") or "").strip(),
        "lat": num(row.get("Latitude")),
        "lon": num(row.get("Longitude")),
        "neighbours": nb,
    }

# UDISE profile
udise_rows = {}
for row in read_csv("Angul_UDISE.csv"):
    udise_rows[udise(row["UDISE_Code"])] = row

# Backfill missing school names (a few v3 rows have name == UDISE / blank) from
# the UDISE roster so cards and name-search show a real name.
for u, c in canon.items():
    if not str(c["name"]).strip() or str(c["name"]).strip() == u:
        alt = (udise_rows.get(u, {}).get("School_Name") or "").strip()
        if alt:
            c["name"] = alt

def profile(u):
    r = udise_rows.get(u)
    if not r:
        return None
    enrol = num(r.get("student strength"))
    tch = num(r.get("Teacher strength"))
    ptr = round(enrol / tch) if (enrol and tch) else None
    return {
        "classRange": (r.get("Class Range") or "").strip() or None,
        "management": decode(r.get("School_Management")),
        "area": decode(r.get("Urban/Rural")),
        "enrolment": int(enrol) if enrol is not None else None,
        "teachers": int(tch) if tch is not None else None,
        "ptr": ptr,
        "classrooms": int(num(r.get("Available Classroom"))) if num(r.get("Available Classroom")) is not None else None,
        "dilapidatedClassrooms": int(num(r.get("Clsrm_DilapCond"))) if num(r.get("Clsrm_DilapCond")) is not None else None,
        "buildingOwnership": decode(r.get("BldStatus")),
        "boundaryWall": decode(r.get("BoundWall_Type")),
        "electricity": yesno(r.get("Electricity")),
        "toilet": yesno(r.get("SchToilet")),
        "handwash": yesno(r.get("Handwash_Facility")),
        "playground": yesno(r.get("Playgrnd_Fac")),
        "ramp": yesno(r.get("RampAvail")),
        "furniture": yesno(r.get("Furniture_avail")),
        "kitchenShed": yesno(r.get("Kitchen_shed")),
        "balvatika": yesno(r.get("Balvatika")),
        "smc": yesno(r.get("SMC")),
        "sdmc": yesno(r.get("SDMC")),
    }

# ---------- build per-school records ----------------------------------------

schools = {}
for u, c in canon.items():
    block = c["block"]
    score = c["score"]
    # nearby: count how many neighbours (with an official score) are ahead.
    # Prefer neighbours of the same grade-span; fall back to all if too few.
    nb = ll.get(u, {}).get("neighbours", [])
    my_type = ll.get(u, {}).get("type", "")
    same = [(nu, km) for (nu, km) in nb if ll.get(nu, {}).get("type") == my_type and nu in canon]
    alln = [(nu, km) for (nu, km) in nb if nu in canon]
    use = same if len(same) >= 3 else alln
    ahead = sum(1 for (nu, km) in use if canon[nu]["score"] > score)
    nearby = {
        "compared": len(use),
        "ahead": ahead,
        "behind": len(use) - ahead,
        "likeForLike": len(same) >= 3,
        "nearestKm": round(min((km for (_, km) in use if km is not None), default=0), 2) if use else None,
    }
    schools[u] = {
        "udise": u,
        "name": c["name"],
        "block": block,
        "cluster": c["cluster"],
        "overall": {"score": score, "band": c["band"]},
        "byGrade": school_subjects(u),
        "assessedStudents": len(sm_students.get(u, [])) or None,
        "comparison": {
            "blockName": block,
            "blockAverage": block_avg.get(block),
            "districtAverage": district_avg,
            "nearby": nearby,
        },
        "profile": profile(u),
        "hasProfile": u in udise_rows,
        "hasNeighbours": bool(nb),
        # nearest schools (with a score), nearest-first — for the school-head view
        "neighbours": [{"udise": nu, "km": km} for (nu, km) in use],
    }

# search index (light, ships to client). v2: includes the /10 score shown on
# result cards — the user reversed the earlier no-scores-for-parents decision
# (2026-07-06, docx mock: named schools with scores are now public by design).
search = [
    {"u": s["udise"], "n": s["name"], "b": s["block"], "c": s["cluster"],
     # setting (Urban/Rural) is the only extra geographical field the sources
     # hold — no village/pincode/panchayat exist in any source file.
     "st": (s.get("profile") or {}).get("area") or "",
     # floor(x+0.5) matches JS Math.round on the report page — python round()
     # is half-to-even and made 17 schools show a different /10 in Find.
     "s10": int(math.floor(s["overall"]["score"] / 10 + 0.5)), "band": s["overall"]["band"]}
    for s in schools.values()
]
search.sort(key=lambda x: x["n"])

# district + blocks summary (for "How is Angul doing?")
district_out = {
    "name": district.get("name"),
    "districtAverage": district_avg,
    "passLine": district.get("pass_line"),
    "bestBlock": district.get("best_block"),
    "schoolsAssessed": len(canon),
    "studentsAssessed": sum(blocks[b]["headline"].get("students") or 0 for b in blocks),
    "subjectMeans": district.get("subject_means"),
    "blocks": [
        {"name": b, "average": block_avg[b],
         "schools": len(blocks[b]["bands"]["overall"]["schools"]),
         "students": blocks[b]["headline"].get("students"),
         "g5": blocks[b]["headline"].get("g5"), "g8": blocks[b]["headline"].get("g8"),
         "subjects": blocks[b].get("subjects")}
        for b in blocks
    ],
}

# ---------- officials data (block/cluster/research views) --------------------
# Guardrails applied here, at the data layer:
#  - nothing from *_PRIVATE / Suspicious_* files; bright-spots 'spikes' column dropped
#  - 9 answer-key-suspect items excluded from item bank, hard-LO and weak-LO lists,
#    and misconception cards (plus 3 known-broken items) — never exposed as a flag
#  - cluster_league 'pct_below' and block-level plain 'whatif' omitted (unverified)
#  - cognitive views: Grade 5 only (client's own analysis rejects the G8 cut)
#  - band keys derived from displayed scores (consistent with parent pages)

import math
import re as _re

def slugify(name):
    return _re.sub(r"-+", "-", _re.sub(r"[^a-z0-9]+", "-", str(name).lower())).strip("-")

items = d_items = dash["district"]["items"]
keysuspect_keys = {(i["grade"], i["subject"], i["q_no"]) for i in d_items if i.get("keysuspect")}
keysuspect_los = {str(i["lo"]).strip() for i in d_items if i.get("keysuspect")}
BROKEN_MISCON = {("Grade 8", "Maths", 6), ("Grade 8", "Odia", 20), ("Grade 8", "SST", 15)}

def clean_weak_los(lst):
    # Drops key-suspect LOs and rows whose LO code contradicts the subject —
    # the G8 language papers have known Odia/English cross-tagging (e.g. an
    # 'OD 811' row labelled English on Talcher).
    out = []
    for w in (lst or []):
        lo = str(w.get("lo", "")).strip()
        if lo in keysuspect_los:
            continue
        if lo.startswith("OD") and w.get("subject") != "Odia":
            continue
        out.append(w)
    return out

def band_list(schools_list):
    out = []
    for s in schools_list:
        u = udise(s["udise"])
        c = canon.get(u)
        sc = round(float(s["score"]), 1)
        out.append({"udise": u, "name": c["name"] if c else s["name"],
                    "cluster": s["cluster"], "score": sc, "band": band_from_score(sc)})
    return out

def named(rows):
    out = []
    for r in rows:
        r = dict(r)
        u = udise(r.get("udise", ""))
        if u in canon:
            r["name"] = canon[u]["name"]
        r["udise"] = u
        out.append(r)
    return out

OFF_DIR = os.path.join(HERE, "..", "src", "data", "officials")
os.makedirs(os.path.join(OFF_DIR, "blocks"), exist_ok=True)
os.makedirs(os.path.join(OFF_DIR, "clusters"), exist_ok=True)

# --- school inputs (UDISE) read once; used for the per-school card and for
# block/cluster roll-ups. Roll-ups juxtapose inputs with outcomes at an
# aggregated level; no correlation is claimed (the client's own analysis shows
# inputs explain ~6% of the score gap). Per-school supervisory-visit counts are
# never read — a public "0 visits" would implicitly name an absent CRCC/BEO.
BASICS8 = ["Electricity", "Toilet", "Handwash", "Playground", "Ramp",
           "Furniture", "Kitchen", "SMC formed"]
inputs_full = {}
try:
    import openpyxl
    _wb = openpyxl.load_workbook(src("School_Inputs_Enrichment.xlsx"),
                                 read_only=True, data_only=True)
    _ws = _wb["Schools"]
    _hdr = None
    for _row in _ws.iter_rows(values_only=True):
        if _hdr is None:
            _hdr = list(_row); continue
        rec = dict(zip(_hdr, _row))
        if not rec.get("Has UDISE data"):
            continue
        inputs_full[udise(rec["UDISE"])] = {
            "ptr": rec.get("PTR"), "ptrNorm": rec.get("PTR norm"),
            "ptrOver": rec.get("PTR over norm"),
            "singleTeacher": bool(rec.get("Single-teacher")),
            "dilapidated": rec.get("Dilapidated rooms"),
            "basics": rec.get("Basics met /8"),
            "supportPriority": (str(rec.get("Support priority") or "").strip().lower() == "yes"),
            "fac": {b: (str(rec.get(b) or "").strip().lower() == "yes") for b in BASICS8},
        }
    _wb.close()
except Exception as e:
    print("  WARN: school inputs read skipped:", e)

def rollup_inputs(udises):
    """Aggregate UDISE inputs over a set of assessed schools. coverage.total is
    the assessed-school count; withData is how many have a UDISE input panel."""
    recs = [inputs_full[u] for u in udises if u in inputs_full]
    total = len(udises)
    if not recs:
        return {"coverage": {"withData": 0, "total": total}}
    bvals = [r["basics"] for r in recs if r["basics"] is not None]
    gaps = []
    for b in BASICS8:
        miss = sum(1 for r in recs if not r["fac"].get(b))
        if miss:
            gaps.append({"name": b, "missing": miss})
    return {
        "coverage": {"withData": len(recs), "total": total},
        "avgBasics": round(sum(bvals) / len(bvals), 1) if bvals else None,
        "ptrOver": sum(1 for r in recs if (r["ptrOver"] or 0) > 0),
        "singleTeacher": sum(1 for r in recs if r["singleTeacher"]),
        "dilapidated": sum(1 for r in recs if (r["dilapidated"] or 0) > 0),
        "supportPriority": sum(1 for r in recs if r["supportPriority"]),
        "facilityGaps": sorted(gaps, key=lambda x: -x["missing"]),
    }

# --- per-block officials slice ---
block_slugs = {}
for bname, bd in blocks.items():
    slug = slugify(bname)
    block_slugs[bname] = slug
    bands_out = {}
    for gkey in ("overall", "g5", "g8"):
        raw = bd["bands"].get(gkey)
        if not raw:
            continue
        lst = band_list(raw["schools"])
        counts = {}
        for s in lst:
            counts[s["band"]] = counts.get(s["band"], 0) + 1
        bands_out[gkey] = {"counts": counts, "schools": sorted(lst, key=lambda x: x["score"])}
    league_rows = [{k: r[k] for k in ("cluster", "score", "students", "schools",
                                      "best_school", "worst_school")}
                   for r in bd["cluster_league"]["rows"]]
    # Misconception cards: exclude only the 3 known-broken items. The naive
    # key-suspect flag also catches REAL misconceptions (a strong trap beating
    # the key is the phenomenon itself); those stay — validated in the client's
    # own item-analysis memo.
    miscon = [m for m in bd["action"]["miscon"]
              if (m["grade"], m["subject"], m["qno"]) not in BROKEN_MISCON]
    # Foundational (this-year vs prior-year) for every assessed grade.
    foundational = {}
    for gk, gf in bd["foundational"].items():
        if not gf:
            continue
        foundational[gk] = {"at": gf.get("at"), "gm1": gf.get("gm1"),
                            "by_subject": gf.get("by_subject"),
                            "weak_los": clean_weak_los(gf.get("weak_los"))[:8]}
    block_out = {
        "name": bname,
        "slug": slug,
        "headline": bd["headline"],
        "vs_best": bd["vs_best"],
        "drop": bd["drop"],
        "rel_subject": bd["rel_subject"],
        "bands": bands_out,
        "cluster_league": {"block_score": bd["cluster_league"]["block_score"], "rows": league_rows},
        "clusters_heatmap": bd["clusters"],
        "concentration": bd["concentration"],
        "failing_all": bd["failing_all"],
        "subj_grade_below": bd["subj_grade_below"],
        "leverage": {"top": named(bd["leverage"]["top"]),
                     "whatif": bd["leverage"]["whatif"],
                     "schools_for_half_deficit": bd["leverage"]["schools_for_half_deficit"],
                     "n_schools": bd["leverage"]["n_schools"],
                     "block_mean": bd["leverage"]["block_mean"]},
        "bright_spots": named(bd["bright_spots"]),
        "foundational": foundational,
        "cognitive": bd["cognitive"],
        "skills": {"bottom": bd["action"]["bottom"], "top": bd["action"]["top"]},
        "miscon": miscon,
        "inputs": rollup_inputs([s["udise"] for s in bands_out["overall"]["schools"]]),
    }
    with open(os.path.join(OFF_DIR, "blocks", f"{slug}.json"), "w", encoding="utf-8") as f:
        json.dump(block_out, f, ensure_ascii=False, separators=(",", ":"))
print(f"  wrote {len(blocks)} officials block slices -> src/data/officials/blocks/")

# --- misconception cards (district view: same item across blocks) ---
mis_by_item = {}
for bname, bd in blocks.items():
    for m in bd["action"]["miscon"]:
        key = (m["grade"], m["subject"], m["qno"])
        if key in BROKEN_MISCON:
            continue
        entry = mis_by_item.setdefault(key, {
            "grade": m["grade"], "subject": m["subject"], "qno": m["qno"],
            "stem": m["stem"], "opts": m["opts"], "correct": m["correct"],
            "chosen": m["chosen"], "text": m["text"], "byBlock": {}})
        entry["byBlock"][bname] = m["pct"]
mis_cards = sorted(mis_by_item.values(),
                   key=lambda x: -max(x["byBlock"].values()))
with open(os.path.join(OFF_DIR, "misconceptions.json"), "w", encoding="utf-8") as f:
    json.dump(mis_cards, f, ensure_ascii=False, separators=(",", ":"))
print(f"  wrote {len(mis_cards)} misconception cards")

# --- clean item bank (researchers): v3 items + psychometrics + full LO text ---
psy = {}
for row in read_csv("Item_Psychometrics.csv"):
    psy[(row["grade"], row["subject"], int(row["qno"].lstrip("q") if str(row["qno"]).startswith("q") else row["qno"]))] = row
blueprint_desc = {}
for row in read_csv("TEMPLATE_AnswerKey_Blueprint.csv"):
    try:
        blueprint_desc[(row["grade"], row["subject"], int(row["q_no"]))] = (row.get("LO Description") or "").strip()
    except (ValueError, KeyError):
        pass
items_clean = []
for i in d_items:
    if i.get("keysuspect"):
        continue
    key = (i["grade"], i["subject"], i["q_no"])
    p = psy.get(key, {})
    items_clean.append({
        "grade": i["grade"], "subject": i["subject"], "q_no": i["q_no"],
        "lo": str(i["lo"]).strip(), "desc": blueprint_desc.get(key) or i["desc"],
        "gl": i["gl"], "cog": (p.get("cog") or "").strip() or None,
        "correct_pct": i["correct_pct"], "top_wrong_pct": i["top_wrong_pct"],
        "blank": i["blank"],
        "discrimination": num(p.get("D")), "rpbis": num(p.get("rpbis")),
    })
with open(os.path.join(OFF_DIR, "items.json"), "w", encoding="utf-8") as f:
    json.dump(items_clean, f, ensure_ascii=False, separators=(",", ":"))
print(f"  wrote {len(items_clean)} clean items (of {len(d_items)})")

# --- district officials summary ---
hard_los = [h for h in district.get("hard_los", [])
            if str(h.get("lo", "")).strip() not in keysuspect_los]
# NOTE: the source's 'distress_blocks' label is deliberately NOT shipped — the
# client's own report renders no such label; below50/proficiency numbers speak.
district_off = {
    "rank": district["rank"],
    "proficiency": district["proficiency"],
    "below50": district["below50"],
    "variance": district["variance"],
    "foundational": district["foundational"],
    "cognitive": district["cognitive"],
    "hard_los": hard_los,
    "leverage": {"whatif": district["leverage"]["whatif"],
                 "schools_for_half_deficit": district["leverage"]["schools_for_half_deficit"],
                 "n_schools": district["leverage"]["n_schools"]},
    "blocks": [{"name": b, "slug": block_slugs[b]} for b in sorted(blocks)],
}
with open(os.path.join(OFF_DIR, "district.json"), "w", encoding="utf-8") as f:
    json.dump(district_off, f, ensure_ascii=False, separators=(",", ":"))
print("  wrote officials district summary")

# --- bright-spot recognition rows (cluster level; 'spikes' never read) ---
bs_clusters = []
for row in read_csv("Bright_Spots_clusters.csv"):
    bs_clusters.append({"cluster": (row.get("unit") or "").strip(),
                        "grade": row["grade"], "subject": row["subject"],
                        "desc": (row.get("desc") or "").strip(),
                        "observed": num(row.get("observed")),
                        "district": num(row.get("district")),
                        "n": int(num(row.get("n")) or 0)})

# --- per-cluster one-pager data ---
cluster_index = []
cluster_slug_seen = {}
for bname, bd in blocks.items():
    rows = bd["cluster_league"]["rows"]
    ranked = sorted(rows, key=lambda r: -r["score"])
    heat = bd["clusters"]
    for pos, r in enumerate(ranked, 1):
        cname = r["cluster"]
        slug = slugify(cname)
        if slug in cluster_slug_seen and cluster_slug_seen[slug] != (bname, cname):
            slug = f"{slug}-{block_slugs[bname]}"
        cluster_slug_seen[slug] = (bname, cname)
        schools_in = [s for s in band_list(bd["bands"]["overall"]["schools"])
                      if s["cluster"] == cname]
        schools_in.sort(key=lambda x: x["name"])
        spots = [b for b in bd["bright_spots"] if b["cluster"] == cname]
        recognition = [x for x in bs_clusters if x["cluster"] == cname][:3]
        hm = heat.get(cname, {})
        subj_pcts = {k: v for k, v in hm.items() if not k.startswith("_")}
        worst_subject = max(subj_pcts, key=subj_pcts.get) if subj_pcts else None
        cluster_out = {
            "cluster": cname, "block": bname, "blockSlug": block_slugs[bname],
            "rank": pos, "of": len(ranked), "score": r["score"],
            "blockScore": bd["cluster_league"]["block_score"],
            "students": r["students"], "schools": schools_in,
            "brightSpots": named(spots)[:2], "recognition": recognition,
            "worstSubject": worst_subject,
            "worstSubjectPct": subj_pcts.get(worst_subject) if worst_subject else None,
            "inputs": rollup_inputs([s["udise"] for s in schools_in]),
        }
        with open(os.path.join(OFF_DIR, "clusters", f"{slug}.json"), "w", encoding="utf-8") as f:
            json.dump(cluster_out, f, ensure_ascii=False, separators=(",", ":"))
        cluster_index.append({"cluster": cname, "block": bname, "slug": slug,
                              "schools": len(schools_in)})
with open(os.path.join(OFF_DIR, "cluster-index.json"), "w", encoding="utf-8") as f:
    json.dump(sorted(cluster_index, key=lambda x: (x["block"], x["cluster"])),
              f, ensure_ascii=False, separators=(",", ":"))
print(f"  wrote {len(cluster_index)} cluster one-pager slices")

# --- school enrichment: peer benchmark, cluster position, bright spot, inputs ---
peer_rows = {}
for row in read_csv("Per_School_Peer_Enrichment.csv"):
    u = udise(row["UDISE_Code"])
    peer_rows[u] = {
        "nPeers": int(num(row.get("n_peers")) or 0),
        "median": num(row.get("peer_median")),
        "pctile": num(row.get("pctile")),
        "bestSubj": (row.get("best_subj") or "").strip() or None,
        "bestSubjPct": num(row.get("best_subj_pct")),
        "worstSubj": (row.get("worst_subj") or "").strip() or None,
        "worstSubjPct": num(row.get("worst_subj_pct")),
    }

# per-school card fields, derived from the inputs read once above
inputs_rows = {
    u: {"ptr": r["ptr"], "ptrNorm": r["ptrNorm"], "ptrOver": r["ptrOver"],
        "singleTeacher": r["singleTeacher"], "basicsMet": r["basics"],
        "basicsIn": [b for b in BASICS8 if r["fac"].get(b)],
        "basicsOut": [b for b in BASICS8 if not r["fac"].get(b)]}
    for u, r in inputs_full.items()
}

# cluster position + nearest bright spot per school
cluster_pos = {}   # (block, cluster) -> (rank, of, score)
for bname, bd in blocks.items():
    ranked = sorted(bd["cluster_league"]["rows"], key=lambda r: -r["score"])
    for pos, r in enumerate(ranked, 1):
        cluster_pos[(bname, r["cluster"])] = (pos, len(ranked), r["score"])

def hav_km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))

spots_by_block = {}
for bname, bd in blocks.items():
    spots_by_block[bname] = named(bd["bright_spots"])

for u, s in schools.items():
    s["peer"] = peer_rows.get(u)
    s["inputs"] = inputs_rows.get(u)
    cp = cluster_pos.get((s["block"], s["cluster"]))
    s["clusterPos"] = ({"rank": cp[0], "of": cp[1], "score": cp[2]} if cp else None)
    spot = None
    cands = [b for b in spots_by_block.get(s["block"], []) if b["udise"] != u]
    same_cluster = [b for b in cands if b["cluster"] == s["cluster"]]
    if same_cluster:
        spot = same_cluster[0]
    elif cands:
        me = ll.get(u, {})
        if me.get("lat") is not None:
            geo = [(hav_km((me["lat"], me["lon"]),
                           (ll[b["udise"]]["lat"], ll[b["udise"]]["lon"])), b)
                   for b in cands if ll.get(b["udise"], {}).get("lat") is not None]
            if geo:
                geo.sort(key=lambda x: x[0])
                spot = dict(geo[0][1]); spot["km"] = round(geo[0][0], 1)
        if spot is None:
            spot = cands[0]
    s["brightSpot"] = spot
print(f"  enriched schools: peer={sum(1 for s in schools.values() if s['peer'])}, "
      f"inputs={len(inputs_rows)}, clusterPos={sum(1 for s in schools.values() if s['clusterPos'])}")

# --- open downloads (aggregates only) ---
DL = os.path.join(HERE, "..", "public", "data", "downloads")
os.makedirs(DL, exist_ok=True)
with open(os.path.join(DL, "block_aggregates.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["block", "overall", "g5", "g8", "schools", "students", "pct_below50", "pct_proficient"])
    for r in district["rank"]:
        b = r["block"]
        h = blocks[b]["headline"]
        w.writerow([b, h["overall"], h["g5"], h["g8"], h["schools"], h["students"],
                    district["below50"].get(b), district["proficiency"].get(b)])
with open(os.path.join(DL, "cluster_league.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["block", "cluster", "score", "students", "schools", "best_school", "worst_school"])
    for bname, bd in sorted(blocks.items()):
        for r in bd["cluster_league"]["rows"]:
            w.writerow([bname, r["cluster"], r["score"], r["students"], r["schools"],
                        r["best_school"], r["worst_school"]])
with open(os.path.join(DL, "items_clean.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["grade", "subject", "q_no", "lo", "gl", "desc", "correct_pct", "top_wrong_pct", "blank_pct"])
    for i in items_clean:
        w.writerow([i["grade"], i["subject"], i["q_no"], i["lo"], i["gl"], i["desc"],
                    i["correct_pct"], i["top_wrong_pct"], i["blank"]])
print("  wrote downloads: block_aggregates.csv, cluster_league.csv, items_clean.csv")

# ---------- researcher download suite (public, multiple cuts) -----------------
# Granularity ceiling chosen by the owner (2026-07-07): anonymised student rows
# are public. Anonymisation: Roll_Number destroyed and replaced by a pseudo id
# randomly assigned within (school, grade); rows shuffled; no names/DOB exist in
# the source. Residual small-class re-identification risk was flagged and accepted.
import random as _random

_rng = _random.Random(20260707)

# 1) anonymised student-level (long: one row per student x subject)
_stu_rows = []
_pseudo = {}   # (udise, grade, roll) -> pseudo id within school+grade
_counter = defaultdict(int)
for row in read_csv("Studentwise_Scores.csv"):
    u = udise(row["UDISE_Code"])
    if u not in canon:
        continue
    grade = (row.get("Grade") or "").strip()
    subj = (row.get("Subject") or "").strip()
    pct = num(row.get("Perc"))
    if not grade or not subj or pct is None:
        continue
    key = (u, grade, str(row.get("Roll_Number") or "").strip())
    if key not in _pseudo:
        _counter[(u, grade)] += 1
        _pseudo[key] = _counter[(u, grade)]
    _stu_rows.append([u, canon[u]["name"], canon[u]["block"], canon[u]["cluster"],
                      grade, _pseudo[key], subj, pct])
# shuffle then re-number pseudo ids in shuffled order so output order carries
# no trace of the roll sequence
_rng.shuffle(_stu_rows)
with open(os.path.join(DL, "students_anonymised.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["udise", "school_name", "block", "cluster", "grade",
                "student_pseudo_id", "subject", "pct_correct"])
    w.writerows(_stu_rows)
print(f"  wrote students_anonymised.csv ({len(_stu_rows)} rows)")

# Data note shipped alongside the CSV (owner decision 2026-07-09): in some
# multi-section schools two or more children share a school+grade+roll key in
# the source, so they appear under ONE student_pseudo_id with repeated subject
# rows. Disclosed rather than repaired — the source has no section column, so
# any split would be a guess.
with open(os.path.join(DL, "students_anonymised_README.txt"), "w", encoding="utf-8") as f:
    f.write(
        "students_anonymised.csv — data notes\n"
        "\n"
        "* One row per student x subject. student_pseudo_id is randomly assigned\n"
        "  within each (school, grade) and carries no trace of real roll numbers.\n"
        "* Known limitation: in some multi-section schools, two or more children\n"
        "  shared a school+grade+roll number in the source data (about 1,050 such\n"
        "  keys across ~220 schools). These children appear under a SINGLE\n"
        "  student_pseudo_id, so a pseudo-student can carry more than one score\n"
        "  for the same subject. The source has no section column, so these\n"
        "  records cannot be reliably separated.\n"
        "* The official assessed-student count (28,079) counts such merged\n"
        "  records once.\n"
    )
print("  wrote students_anonymised_README.txt")

# 2) school x grade x subject (finest safe aggregate)
with open(os.path.join(DL, "school_grade_subject.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["udise", "school_name", "block", "cluster", "setting",
                "grade", "subject", "pct_correct"])
    for u, s in sorted(schools.items()):
        st = (s.get("profile") or {}).get("area") or ""
        for g in sorted(s["byGrade"]):
            for subj in sorted(s["byGrade"][g]):
                w.writerow([u, s["name"], s["block"], s["cluster"], st,
                            g, subj, s["byGrade"][g][subj]])

# 3) schools master. Owner decision 2026-07-09: downloads must NOT carry
# lat/lon, overall_pct or band — only the /10 score shown on the site.
with open(os.path.join(DL, "schools_overall.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["udise", "school_name", "block", "cluster", "setting",
                "score_out_of_10", "students_assessed"])
    for u, s in sorted(schools.items()):
        st = (s.get("profile") or {}).get("area") or ""
        w.writerow([u, s["name"], s["block"], s["cluster"], st,
                    int(math.floor(s["overall"]["score"] / 10 + 0.5)),
                    s["assessedStudents"] or ""])

# 4) block x grade x subject
with open(os.path.join(DL, "block_grade_subject.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["block", "grade", "subject", "pct_correct"])
    for b in district_out["blocks"]:
        for g, subs in (b.get("subjects") or {}).items():
            for subj, v in sorted(subs.items()):
                w.writerow([b["name"], g, subj, v])

# 5) misconceptions by block + 6) best/weakest LOs by block (from officials slices)
with open(os.path.join(DL, "misconceptions_by_block.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["block", "grade", "subject", "q_no", "pct_chose_wrong",
                "wrong_option", "correct_option", "question", "why_it_matters"])
    for bname in sorted(blocks):
        bslug = block_slugs[bname]
        bj = json.load(open(os.path.join(OFF_DIR, "blocks", f"{bslug}.json"), encoding="utf-8"))
        for m in bj.get("miscon", []):
            w.writerow([bname, m["grade"], m["subject"], m["qno"], m.get("pct") or "",
                        m["chosen"], m["correct"], m["stem"], m["text"]])
# learning_outcomes_by_block.csv is generated by build_mislib.py (owner
# decision 2026-07-09: ALL LOs per block from the LO report, no strength/gap
# 'kind' column) — no longer written here, so a data rebuild can't regress it.
print("  wrote researcher cuts: school_grade_subject, schools_overall, "
      "block_grade_subject, misconceptions_by_block")

# ---------- QA / coverage ----------------------------------------------------

set_canon = set(canon)
set_udise = set(udise_rows)
set_ll = set(ll)
# variance check on yes/no profile fields (triage caution)
variance = {}
for field in ["electricity", "toilet", "handwash", "playground", "ramp",
              "furniture", "kitchenShed", "balvatika", "smc"]:
    vals = defaultdict(int)
    for s in schools.values():
        p = s.get("profile")
        if p and p.get(field) is not None:
            vals[p[field]] += 1
    variance[field] = dict(vals)

# verify Student_Master overall vs official canonical score
diffs = []
for u, c in canon.items():
    if sm_overall_cnt.get(u):
        sm_ov = sm_overall_sum[u] / sm_overall_cnt[u]
        diffs.append(abs(sm_ov - c["score"]))
maxdiff = round(max(diffs), 2) if diffs else None
meandiff = round(sum(diffs) / len(diffs), 3) if diffs else None

qa = {
    "schoolsWithScore": len(set_canon),
    "schoolsWithProfile": len(set_canon & set_udise),
    "schoolsWithNeighbours": len(set_canon & set_ll),
    "scoredButNoProfile": sorted(set_canon - set_udise)[:20],
    "scoredButNoProfile_count": len(set_canon - set_udise),
    "profileButNoScore_count": len(set_udise - set_canon),
    "verify_studentmaster_vs_official": {
        "n": len(diffs), "max_abs_diff": maxdiff, "mean_abs_diff": meandiff,
        "note": "should be tiny; confirms official score == mean of student Overall_avg",
    },
    "yesno_variance": variance,
}

# block centroids for the browse map, normalised into a 0-100 SVG space
blat, blon, bcount = defaultdict(list), defaultdict(list), defaultdict(int)
for u, c in canon.items():
    bcount[c["block"]] += 1
    g = ll.get(u, {})
    if g.get("lat") is not None and g.get("lon") is not None:
        blat[c["block"]].append(g["lat"])
        blon[c["block"]].append(g["lon"])
cent = {b: (sum(blon[b]) / len(blon[b]), sum(blat[b]) / len(blat[b]))
        for b in bcount if blat[b]}
lons = [x for x, _ in cent.values()]
lats = [y for _, y in cent.values()]
lon_min, lon_max = min(lons), max(lons)
lat_min, lat_max = min(lats), max(lats)

def nx(lon):
    return round(10 + 80 * (lon - lon_min) / (lon_max - lon_min), 1) if lon_max > lon_min else 50.0

def ny(lat):  # invert so north sits at the top
    return round(10 + 80 * (lat_max - lat) / (lat_max - lat_min), 1) if lat_max > lat_min else 50.0

blocks_out = sorted(
    [{"name": b, "x": nx(cent[b][0]), "y": ny(cent[b][1]), "schools": bcount[b]} for b in cent],
    key=lambda d: d["name"],
)

# district outline (real Angul border from india-maps-data) + block markers at
# their true centroids, both in one normalised viewBox for the Find map.
geo = json.load(open(os.path.join(HERE, "angul-district.geojson"), encoding="utf-8"))
outer_rings = [poly[0] for poly in geo["geometry"]["coordinates"]]
mpts = [p for ring in outer_rings for p in ring]
mlon_min, mlon_max = min(p[0] for p in mpts), max(p[0] for p in mpts)
mlat_min, mlat_max = min(p[1] for p in mpts), max(p[1] for p in mpts)
mscale = 100.0 / (mlon_max - mlon_min)
mheight = round((mlat_max - mlat_min) * mscale, 1)
def mx(lon):
    return round((lon - mlon_min) * mscale, 1)
def my(lat):
    return round((mlat_max - lat) * mscale, 1)
paths = ["M" + " L".join(f"{mx(lon)},{my(lat)}" for lon, lat in ring) + " Z"
         for ring in outer_rings]
district_map = {
    "viewBox": f"0 0 100 {mheight}",
    "path": " ".join(paths),
    "blocks": [{"name": b, "x": mx(cent[b][0]), "y": my(cent[b][1])} for b in sorted(cent)],
}

# ---------- write ------------------------------------------------------------

os.makedirs(OUT, exist_ok=True)
PUBLIC = os.path.normpath(os.path.join(HERE, "..", "public", "data"))
os.makedirs(PUBLIC, exist_ok=True)

def dump(base, name, obj):
    path = os.path.join(base, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  wrote {os.path.relpath(path, HERE)}  ({os.path.getsize(path) / 1024:.0f} KB)")

# server-only build inputs (never shipped whole to the client)
dump(OUT, "schools.json", schools)
dump(OUT, "district.json", district_out)
dump(OUT, "_qa.json", qa)
# client assets for the Find page — name/block/cluster + /10 score + map
dump(PUBLIC, "search-index.json", search)
# coordinates for the "Schools near me" GPS path (only schools that have them)
geo = [{"u": u, "lat": round(v["lat"], 5), "lon": round(v["lon"], 5)}
       for u, v in ll.items()
       if u in schools and v.get("lat") is not None and v.get("lon") is not None]
dump(PUBLIC, "geo.json", geo)
dump(PUBLIC, "district-map.json", district_map)

# per-school compact records for the client-side Compare view (one file each,
# so there is no single bulk download of all scores)
SCHOOL_DIR = os.path.join(PUBLIC, "school")
os.makedirs(SCHOOL_DIR, exist_ok=True)
for u, s in schools.items():
    rec = {"name": s["name"], "block": s["block"], "cluster": s["cluster"],
           "score": s["overall"]["score"], "band": s["overall"]["band"],
           "byGrade": s["byGrade"]}
    with open(os.path.join(SCHOOL_DIR, f"{u}.json"), "w", encoding="utf-8") as f:
        json.dump(rec, f, ensure_ascii=False, separators=(",", ":"))
print(f"  wrote {len(schools)} per-school JSON -> public/data/school/")

# --- apply official unit renames (district + blocks) to all emitted data -----
# Govt renamed (2026): Angul->Anugola, Athamallik->Athamalik, Pallahara->
# Palalahada, Talcher->Talachera. Slugs/filenames keep the original spelling so
# URLs + PDF references stay stable; only display VALUES change. Idempotent.
try:
    from apply_unit_renames import apply as _apply_unit_renames
    _apply_unit_renames()
except Exception as _e:
    print("  WARN: unit rename post-process skipped:", _e)

print("\n--- QA summary ---")
print(json.dumps(qa, ensure_ascii=False, indent=2)[:2000])
print(f"\nDONE. {len(schools)} school records -> {OUT}")
