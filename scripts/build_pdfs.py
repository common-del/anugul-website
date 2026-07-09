"""Generates the downloadable PDFs for the v2 site (all vector, bilingual):

  public/data/downloads/blocks/<slug>.pdf           block report cards (8)
  public/data/downloads/learning_outcomes_report.pdf  full LO report (district)
  public/data/downloads/learning_outcomes.csv         same as data

(School-Head cards are NOT generated here — the official PDFs ship to
public/data/hcards from SAKSHAM_Code/Colocated/output/Angul/_mobile.)

Uses PyMuPDF's insert_htmlbox (Story engine — proper Odia shaping, verified)
with Noto Sans Oriya, and subset_fonts() so each file stays small.
Run after build_data.py:  python scripts/build_pdfs.py
"""
import csv
import json
import math
import os
import sys
import time

import fitz

t0 = time.time()

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
FONT_R = os.path.join(HERE, "fonts", "NotoSansOriya-Regular.ttf")
FONT_B = os.path.join(HERE, "fonts", "NotoSansOriya-Bold.ttf")
if not (os.path.exists(FONT_R) and os.path.getsize(FONT_R) > 10000):
    sys.exit("Noto Sans Oriya fonts missing in scripts/fonts/ — fetch them first.")

# Single (Regular) face only: a second embedded subset per file added ~40 KB
# to each of the 1,361 principal cards. Bold falls back to Regular.
CSS = f"""
@font-face {{ font-family: noto; src: url({FONT_R.replace(os.sep, '/')}); }}
* {{ font-family: noto, sans-serif; }}
body {{ font-size: 10px; color: #111; }}
h1 {{ font-size: 17px; margin: 0; }}
h2 {{ font-size: 12px; margin: 10px 0 2px; }}
p {{ margin: 2px 0; }}
table {{ width: 100%; border-collapse: collapse; }}
td, th {{ padding: 2.5px 4px; border-bottom: 0.5px solid #cccccc; text-align: left; font-size: 9.5px; }}
th {{ background-color: #eeeeee; }}
.hdr {{ background-color: #111111; color: #ffffff; padding: 8px 10px; }}
.hdr h1 {{ color: #ffffff; }}
.hdr p {{ color: #dddddd; margin: 1px 0 0; }}
.muted {{ color: #555555; }}
.big {{ font-size: 15px; font-weight: bold; }}
.bar {{ background-color: #dddddd; }}
.fill {{ background-color: #444444; color: #ffffff; }}
.good {{ color: #1e6b3a; }}
.bad {{ color: #b3261e; }}
"""

A4 = fitz.paper_rect("a4")
BOX = A4 + (36, 30, -36, -30)  # margins

sch = json.load(open(os.path.join(ROOT, "src", "data", "schools.json"), encoding="utf-8"))
od = json.load(open(os.path.join(ROOT, "src", "lib", "i18n", "messages", "od.json"), encoding="utf-8"))
SUBJ_OD = od["subjects"]
GRADE_OD = od["grades"]
s10 = lambda p: int(math.floor(p / 10 + 0.5))


def page_pdf(html_pages, dst):
    doc = fitz.open()
    for html in html_pages:
        page = doc.new_page(width=A4.width, height=A4.height)
        page.insert_htmlbox(BOX, html, css=CSS)
    doc.subset_fonts()
    doc.save(dst, deflate=True, garbage=3)
    doc.close()


def esc(x):
    return str(x).replace("&", "&amp;").replace("<", "&lt;")


# principal cards: superseded by the official School-Head PDFs shipped to
# public/data/hcards (source: SAKSHAM_Code/Colocated/output/Angul/_mobile).

# ---------------- block report PDFs ----------------
OFF = os.path.join(ROOT, "src", "data", "officials")
DL = os.path.join(ROOT, "public", "data", "downloads")
os.makedirs(os.path.join(DL, "blocks"), exist_ok=True)
district = json.load(open(os.path.join(OFF, "district.json"), encoding="utf-8"))

for f in sorted(os.listdir(os.path.join(OFF, "blocks"))):
    b = json.load(open(os.path.join(OFF, "blocks", f), encoding="utf-8"))
    clusters = sorted(b["cluster_league"]["rows"], key=lambda r: -r["score"])
    all_subj = [dict(r, grade=g) for g, rows in b["rel_subject"].items() for r in rows]
    best_subj = max(all_subj, key=lambda r: r["block"]) if all_subj else None
    flat = lambda m: [dict(r, subject=sub) for sub, rows in (m or {}).items() for r in rows]
    best_lo = sorted(flat(b.get("skills", {}).get("top")), key=lambda r: -r["pct"])[:5]
    weak_lo = sorted(flat(b.get("skills", {}).get("bottom")), key=lambda r: r["pct"])[:5]
    counts = b["bands"]["overall"]["counts"]
    band_lbl = {"excelling": "Excelling (>75%)", "developing": "Developing (51-75%)",
                "needs": "Needs support (26-50%)", "urgent": "Urgent (<=25%)"}
    subj_rows = "".join(
        f"<tr><td>{esc(g)}</td><td>{esc(r['subject'])}</td><td>{r['block']:.0f}%</td>"
        f"<td class=\"{'bad' if r['gap'] < 0 else 'good'}\">{r['gap']:+.0f}</td></tr>"
        for g, rows in b["rel_subject"].items() for r in rows
    )
    cl_rows = "".join(
        f"<tr><td>{i+1}</td><td>{esc(r['cluster'])}</td><td>{r['score']:.0f}%</td>"
        f"<td>{r['schools']}</td><td>{r['students']}</td></tr>"
        for i, r in enumerate(clusters)
    )
    lo_rows = lambda los, cls: "".join(
        f"<tr><td>{esc(r['subject'])}</td><td>{esc(r['grade'])}</td>"
        f"<td>{esc(r['skill'][:110])}</td><td class='{cls}'>{r['pct']:.0f}%</td></tr>"
        for r in los
    )
    p1 = f"""
<div class="hdr"><h1>{esc(b['name'])} Block Report Card</h1>
<p>SAKSHAM · ଶିକ୍ଷାବର୍ଷ 2025-26 · ବ୍ଲକ୍ ରିପୋର୍ଟ କାର୍ଡ</p></div>
<p style="margin-top:6px"><span class="big">Overall block score: {b['headline']['overall']:.0f}%</span>
&nbsp;<span class="muted">district average {b['vs_best']['overall']['district_avg']:.0f}% · rank {b['vs_best']['overall']['rank']} of {b['vs_best']['overall']['n_blocks']}</span></p>
<p class="muted">{b['headline']['schools']} schools · {b['headline']['students']} students ·
Grade 5: {b['headline']['g5']:.0f}% · Grade 8: {b['headline']['g8']:.0f}%</p>
<h2>Key insights</h2>
<p>Best performing subject: <b>{esc(best_subj['subject'])} ({esc(best_subj['grade'])}) {best_subj['block']:.0f}%</b></p>
<p>Best cluster: <b>{esc(clusters[0]['cluster'])} {clusters[0]['score']:.0f}%</b> ·
Cluster needing most support: <b>{esc(clusters[-1]['cluster'])} {clusters[-1]['score']:.0f}%</b></p>
<p>Schools by band: {' · '.join(f"{band_lbl[k]}: <b>{v}</b>" for k, v in counts.items())}</p>
<h2>Subjects vs district</h2>
<table><tr><th>Grade</th><th>Subject</th><th>Block</th><th>Gap</th></tr>{subj_rows}</table>
<h2>Learning outcomes — doing well</h2>
<table>{lo_rows(best_lo, 'good')}</table>
<h2>Learning outcomes — need most support</h2>
<table>{lo_rows(weak_lo, 'bad')}</table>
"""
    p2 = f"""
<h2>Cluster league — {esc(b['name'])}</h2>
<table><tr><th>#</th><th>Cluster</th><th>Score</th><th>Schools</th><th>Students</th></tr>{cl_rows}</table>
<p class="muted" style="margin-top:8px">Source: SAKSHAM assessment, Angul district. Generated from the same data as anugul-website.</p>
"""
    page_pdf([p1, p2], os.path.join(DL, "blocks", f.replace(".json", ".pdf")))
print("block PDFs: 8 written")

# ---------------- learning-outcome report (district) ----------------
# Consolidated PER LEARNING OUTCOME (owner decision 2026-07-09): question
# number, grade_level and cognitive columns dropped; where several questions
# assess the same LO, pct_correct is the simple mean across those questions
# (questions_assessed says how many the figure is based on).
items = json.load(open(os.path.join(OFF, "items.json"), encoding="utf-8"))
by_lo = {}
for i in items:
    # Known G8 cross-tagging: OD-coded LOs appearing under a non-Odia subject
    # are mislabelled in the source — excluded here as everywhere else.
    if str(i["lo"]).startswith("OD") and i["subject"] != "Odia":
        continue
    key = (i["grade"], i["subject"], i["lo"])
    e = by_lo.setdefault(key, {"grade": i["grade"], "subject": i["subject"], "lo": i["lo"],
                               "desc": "", "pcts": []})
    e["pcts"].append(i["correct_pct"])
    if len(i.get("desc") or "") > len(e["desc"]):
        e["desc"] = i["desc"]  # fullest description among the LO's questions
los = sorted(by_lo.values(), key=lambda e: (e["grade"], e["subject"], e["lo"]))
for e in los:
    e["n"] = len(e["pcts"])
    e["pct"] = round(sum(e["pcts"]) / e["n"], 1)

# Owner decision 2026-07-09: no question-count column in the download.
with open(os.path.join(DL, "learning_outcomes.csv"), "w", encoding="utf-8-sig", newline="") as fcsv:
    w = csv.writer(fcsv)
    w.writerow(["grade", "subject", "lo_code", "lo_description", "pct_correct"])
    for e in los:
        w.writerow([e["grade"], e["subject"], e["lo"], e["desc"], e["pct"]])

pages, cur, count = [], "", 0
header = """<div class="hdr"><h1>Learning-Outcome Report · Anugola district</h1>
<p>SAKSHAM · ଶିକ୍ଷାବର୍ଷ 2025-26 · every assessed learning outcome with the share of children answering correctly</p></div>"""
cur = header
last_group = None
for e in los:
    grp = f"{e['grade']} · {e['subject']}"
    if grp != last_group:
        cur += f"<h2>{esc(grp)}</h2><table><tr><th>LO</th><th>Description</th><th>%</th></tr>"
        last_group = grp
        count += 2
    cls = "bad" if e["pct"] < 40 else ("good" if e["pct"] >= 75 else "")
    cur += (f"<tr><td>{esc(e['lo'])}</td><td>{esc(e['desc'][:140])}</td>"
            f"<td class='{cls}'>{e['pct']:.0f}</td></tr>")
    count += 1
    if count >= 38:
        cur += "</table>"
        pages.append(cur)
        cur, count, last_group = "", 0, None
if cur:
    pages.append(cur + "</table>")
page_pdf(pages, os.path.join(DL, "learning_outcomes_report.pdf"))
print(f"LOR: {len(pages)} pages + CSV ({len(los)} LOs from {len(items)} items)")
print("DONE in %.0fs" % (time.time() - t0))
