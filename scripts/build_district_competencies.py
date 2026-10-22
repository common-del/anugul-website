# Builds two outputs from data the site already has:
#   src/data/district_competencies.json  - per grade+subject, the three weakest
#     and three strongest learning outcomes district-wide (District Report key
#     insights).
#   public/data/downloads/block_report.csv - one row per block in the District
#     Report Excel layout (S.No. ... Excelling), linked from the Block Report.
# Run after scripts/build_data.py: python scripts/build_district_competencies.py
import csv
import glob
import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = os.path.join(ROOT, "public", "data", "downloads")

# English display spellings (src/lib/placeNames.ts)
BLOCK_EN = {"Athamalik": "Athamallik", "Kishore Nagar": "Kishorenagar", "Talachera": "Talacher"}


def read_los(name):
    with open(os.path.join(DL, name), encoding="utf-8-sig") as f:
        return [
            {
                "block": r.get("Block"),
                "grade": r["Grade"],
                "subject": r["Subject"],
                "code": r["Learning Outcome Code"],
                "desc": r["Learning Outcome Description"],
                "pct": float(r["Percentage"]),
            }
            for r in csv.DictReader(f)
        ]


# --- district competencies -------------------------------------------------
by_subject = defaultdict(list)
for r in read_los("learning_outcomes.csv"):
    by_subject[r["grade"] + "|" + r["subject"]].append(
        {k: r[k] for k in ("grade", "subject", "code", "desc", "pct")}
    )
competencies = {
    k: {
        "weak": sorted(v, key=lambda x: x["pct"])[:3],
        "best": sorted(v, key=lambda x: -x["pct"])[:3],
    }
    for k, v in sorted(by_subject.items())
}
with open(os.path.join(ROOT, "src", "data", "district_competencies.json"), "w", encoding="utf-8") as f:
    json.dump(competencies, f, ensure_ascii=False, indent=1)

# --- block report (District Report Excel layout) ---------------------------
district = json.load(open(os.path.join(ROOT, "src", "data", "district.json"), encoding="utf-8"))
blocks = {
    b["name"]: b
    for b in (json.load(open(p, encoding="utf-8")) for p in glob.glob(os.path.join(ROOT, "src", "data", "officials", "blocks", "*.json")))
}
lo_by_block = defaultdict(list)
for r in read_los("learning_outcomes_by_block.csv"):
    lo_by_block[r["block"]].append(r)

COLS = [("Grade 5", "Odia"), ("Grade 8", "Odia"), ("Grade 5", "English"), ("Grade 8", "English"),
        ("Grade 5", "Maths"), ("Grade 8", "Maths"), ("Grade 5", "EVS"), ("Grade 8", "Science"), ("Grade 8", "SST")]
HEAD = ["S.No.", "Block Name", "Schools Assessed", "Students Assessed", "Overall Score", "Grade 5 Score",
        "Grade 8 Score", "Odia G5", "Odia G8", "English G5", "English G8", "Maths G5", "Maths G8",
        "EVS (only G5)", "Science (only G8)", "Social Science (only G8)",
        "No. of schools with recoverable points", "No. of schools scoring above their block's average",
        "Weakest learning outcomes (top 3)", "Best performing learning outcomes (top 3)",
        "Critical", "Needs Support", "Developing", "Excelling"]


def lo_list(items):
    return "; ".join("%s (%d%%)" % (x["code"], round(x["pct"])) for x in items)


with open(os.path.join(DL, "block_report.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(HEAD)
    for i, b in enumerate(district["blocks"], 1):
        ob = blocks[b["name"]]
        mean = ob["leverage"]["block_mean"]
        schools = ob["bands"]["overall"]["schools"]
        counts = ob["bands"]["overall"]["counts"]
        los = sorted(lo_by_block[b["name"]], key=lambda x: x["pct"])
        w.writerow(
            [i, BLOCK_EN.get(b["name"], b["name"]), b["schools"], b["students"], b["average"], b["g5"], b["g8"]]
            + [b["subjects"].get(g, {}).get(s, "") for g, s in COLS]
            + [sum(1 for s in schools if s["score"] < mean), sum(1 for s in schools if s["score"] > mean),
               lo_list(los[:3]), lo_list(los[::-1][:3])]
            + [counts.get(k, 0) for k in ("urgent", "needs", "developing", "excelling")]
        )

print("wrote src/data/district_competencies.json and public/data/downloads/block_report.csv")
