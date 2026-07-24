"""Extracts the full-fidelity misconception library from the SAKSHAM Academic
LO report (the embedded `const D=` dataset) — item stimulus images, stem,
extended stem, all options (with Odia originals), correct/trap options, the
percentage choosing each, the misconception text and the teaching response.
Nothing is truncated; the site renders these cards exactly as the HTML does.

Writes:
  src/data/officials/mislib.json      { cards: {id: card}, units: {unit: rows} }
  public/data/miscon/<id>.png         stimulus images (decoded from base64)
  public/data/downloads/learning_outcomes_by_block.csv
        ALL learning outcomes per block with the block's pct_correct (owner
        decision 2026-07-09: no 'kind' strength/gap column, full LO coverage —
        not just the top/bottom lists). Same guardrails as the district LO
        file: key-suspect LOs and cross-tagged Odia items excluded.

Run after build_data.py:  python scripts/build_mislib.py
Source override: env SAKSHAM_SOURCE (same as build_data.py).
"""
import base64
import csv
import json
import os
import re

from apply_unit_renames import RENAME

SRC_DIR = os.environ.get("SAKSHAM_SOURCE", r"D:\Claude_Cowork_CSF\SAKSHAM_Analysis")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
OUT_JSON = os.path.join(ROOT, "src", "data", "officials", "mislib.json")
IMG_DIR = os.path.join(ROOT, "public", "data", "miscon")
os.makedirs(IMG_DIR, exist_ok=True)

html = open(os.path.join(SRC_DIR, "SAKSHAM_Academic_LO_Report.html"),
            encoding="utf-8", errors="ignore").read()
m = re.search(r"const D=(\{)", html)
obj, _ = json.JSONDecoder().raw_decode(html[m.end(1) - 1:])

mislib = obj["mislib"]
misu = obj["acad"]["misu"]

cards = {}
for key, card in mislib.items():
    g, sub, qno = key.split("|")
    cid = f"{g}_{sub}_{qno}"
    c = dict(card)
    img = c.pop("img", None)
    if img and img.startswith("data:image/"):
        head, b64 = img.split(",", 1)
        ext = "png" if "png" in head else "jpg"
        fn = f"{cid}.{ext}"
        with open(os.path.join(IMG_DIR, fn), "wb") as f:
            f.write(base64.b64decode(b64))
        c["img"] = f"/data/miscon/{fn}"
    cards[key] = c

# keep the district (ALL) and per-block unit rows; clusters would balloon the
# payload and the site renders district + block views only
units = {k: v for k, v in misu.items() if k == "ALL" or k.startswith("B::")}

json.dump({"cards": cards, "units": units},
          open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False,
          separators=(",", ":"))
imgs = len([f for f in os.listdir(IMG_DIR)])
print(f"mislib: {len(cards)} cards ({imgs} stimulus images), "
      f"units: {sorted(units.keys())}")

# ---- learning_outcomes_by_block.csv (ALL LOs per block) ----------------------
# acad.units["B::<block>"] holds one row per LO with the block's pct; acad.desc
# maps "Grade <g>|<lo>" to the LO description. Exclusions mirror the district
# learning_outcomes.csv: key-suspect LOs (from the dashboard item flags) and
# OD-coded LOs cross-tagged to a non-Odia subject.
dash = json.load(open(os.path.join(SRC_DIR, "Angul_v3_dashboard_data.json"),
                      encoding="utf-8"))
keysuspect_los = {str(i["lo"]).strip() for i in dash["district"]["items"]
                  if i.get("keysuspect")}
acad = obj["acad"]
desc = acad["desc"]

DL = os.path.join(ROOT, "public", "data", "downloads")
rows_out = []
for unit, rows in acad["units"].items():
    if not unit.startswith("B::"):
        continue
    bname = RENAME.get(unit[3:], unit[3:])
    for r in rows:
        lo = str(r["lo"]).strip()
        grade = f"Grade {r['g']}"
        sub = r["sub"]
        if lo in keysuspect_los:
            continue
        if lo.startswith("OD") and sub != "Odia":
            continue
        rows_out.append([bname, grade, sub, lo,
                         desc.get(f"{grade}|{lo}", ""), r["pct"]])
rows_out.sort(key=lambda x: (x[0], x[1], x[2], x[3]))
with open(os.path.join(DL, "learning_outcomes_by_block.csv"), "w",
          encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["block", "grade", "subject", "lo_code", "lo_description",
                "pct_correct"])
    w.writerows(rows_out)
per_block = len(rows_out) // 8
print(f"learning_outcomes_by_block.csv: {len(rows_out)} rows "
      f"(~{per_block} LOs x 8 blocks)")
