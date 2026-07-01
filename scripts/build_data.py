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

# Internal band keys. Human-readable labels live in the i18n catalogs (od/en/…),
# never baked into the data, so language stays swappable.
BAND_RELABEL = {"Critical": "urgent", "Needs support": "needs",
                "Developing": "developing", "Excelling": "excelling"}

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
        canon[udise(s["udise"])] = {
            "score": round(float(s["score"]), 1),
            "band": BAND_RELABEL.get(s["band"], "needs"),
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

# Privacy guard: don't publish a subject average built from very few students —
# a mean over 1-2 children can reveal an individual result. Threshold is a
# policy choice, confirmed at the Bucket 0 checkpoint (cautious end, privacy-first).
MIN_SUBJECT_N = 10
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
    }

# search index (light, ships to client). Name/block/cluster only — deliberately
# NO scores or bands, so the client asset can't be scraped into a league table.
search = [
    {"u": s["udise"], "n": s["name"], "b": s["block"], "c": s["cluster"]}
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
    "blocks": [
        {"name": b, "average": block_avg[b],
         "schools": len(blocks[b]["bands"]["overall"]["schools"]),
         "students": blocks[b]["headline"].get("students"),
         "g5": blocks[b]["headline"].get("g5"), "g8": blocks[b]["headline"].get("g8"),
         "subjects": blocks[b].get("subjects")}
        for b in blocks
    ],
}

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
# client assets for the Find page — name/block/cluster + map only, no scores
dump(PUBLIC, "search-index.json", search)
dump(PUBLIC, "blocks.json", blocks_out)
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

print("\n--- QA summary ---")
print(json.dumps(qa, ensure_ascii=False, indent=2)[:2000])
print(f"\nDONE. {len(schools)} school records -> {OUT}")
