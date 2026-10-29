"""
Generate the two district-level download files for /gov/district:

  public/data/downloads/district_report.pdf   one-page district summary
  public/data/downloads/district_report.xlsx  District Excel data, one sheet
                                              with one row per assessed school

Reads src/data/district.json (already renamed to the official unit names),
schools.json, the officials block files and students_anonymised.csv.
English-only (researcher-facing downloads).
Run after build_data.py:  python scripts/build_district_report.py
"""

import csv
import glob
import json
import os
from collections import defaultdict

import fitz  # PyMuPDF
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
DL = os.path.join(ROOT, "public", "data", "downloads")

district = json.load(open(os.path.join(ROOT, "src", "data", "district.json"), encoding="utf-8"))


# ---------- PDF ----------------------------------------------------------------
GREEN = (14 / 255, 90 / 255, 64 / 255)
INK = (20 / 255, 55 / 255, 38 / 255)
MUTED = (86 / 255, 101 / 255, 121 / 255)

doc = fitz.open()
page = doc.new_page(width=595, height=842)  # A4
y = 56

page.insert_text((56, y), f"{district['name']} District — SAKSHAM Report", fontsize=20, fontname="helv", color=GREEN)
y += 22
page.insert_text((56, y), "Assessment of Grade 5 and Grade 8 students in government schools", fontsize=10, fontname="helv", color=MUTED)
y += 30

stats = [
    ("Overall district score", f"{district['districtAverage']:.0f}%"),
    ("Schools assessed", f"{district['schoolsAssessed']:,}"),
    ("Students assessed", f"{district['studentsAssessed']:,}"),
    ("Blocks", str(len(district["blocks"]))),
    ("Top performing block", district["bestBlock"]),
]
for label, val in stats:
    page.insert_text((56, y), label, fontsize=10, fontname="helv", color=MUTED)
    page.insert_text((220, y), str(val), fontsize=11, fontname="hebo", color=INK)
    y += 17

y += 14
page.insert_text((56, y), "Blocks (sorted by overall score)", fontsize=13, fontname="hebo", color=GREEN)
y += 18
cols = [(56, "Block"), (200, "Overall"), (265, "Grade 5"), (330, "Grade 8"), (395, "Schools"), (460, "Students")]
for x, h in cols:
    page.insert_text((x, y), h, fontsize=9, fontname="hebo", color=MUTED)
y += 6
page.draw_line((56, y), (539, y), color=GREEN, width=0.8)
y += 14
for b in sorted(district["blocks"], key=lambda r: -r["average"]):
    row = [b["name"], f"{b['average']:.1f}%", f"{b['g5']:.1f}%", f"{b['g8']:.1f}%", f"{b['schools']}", f"{b['students']:,}"]
    for (x, _), val in zip(cols, row):
        page.insert_text((x, y), val, fontsize=10, fontname="helv", color=INK)
    y += 16

y += 18
page.insert_text((56, y), "District subject means", fontsize=13, fontname="hebo", color=GREEN)
y += 18
for g in sorted(district["subjectMeans"]):
    means = district["subjectMeans"][g]
    line = "   ".join(f"{s}: {v:.1f}%" for s, v in sorted(means.items()))
    page.insert_text((56, y), f"{g}:  {line}", fontsize=10, fontname="helv", color=INK)
    y += 16

y += 22
page.insert_text((56, y), "All reports are based on the SAKSHAM assessment of Grade 5 and Grade 8 students.", fontsize=8.5, fontname="helv", color=MUTED)

doc.subset_fonts()
doc.save(os.path.join(DL, "district_report.pdf"), deflate=True, garbage=4)
doc.close()
print(f"  wrote district_report.pdf ({os.path.getsize(os.path.join(DL, 'district_report.pdf')) / 1024:.0f} KB)")

# ---------- XLSX ----------------------------------------------------------------
wb = openpyxl.Workbook()


def district_excel_data_sheet(ws):
    """SAKSHAM District Excel data: one row per assessed school with grade-wise
    students and scores, subject scores and the block topper's score."""
    schools = json.load(open(os.path.join(ROOT, "src", "data", "schools.json"), encoding="utf-8"))
    grade_score = {"g5": {}, "g8": {}}
    for f in glob.glob(os.path.join(ROOT, "src", "data", "officials", "blocks", "*.json")):
        b = json.load(open(f, encoding="utf-8"))
        for g in grade_score:
            for s in b["bands"][g]["schools"]:
                grade_score[g][s["udise"]] = s["score"]
    # Grade-wise counts from the anonymised student file. A single-grade
    # school takes its official total; see the note on the sheet.
    pseudo = defaultdict(set)
    for r in csv.DictReader(open(os.path.join(DL, "students_anonymised.csv"), encoding="utf-8-sig")):
        pseudo[(r["udise"], r["grade"])].add(r["student_pseudo_id"])

    def out_of_10(score):
        return int(score / 10 + 0.5)  # same rounding as the report cards

    topper = defaultdict(int)
    for s in schools.values():
        topper[s["block"]] = max(topper[s["block"]], out_of_10(s["overall"]["score"]))
    block_en = {"Athamalik": "Athamallik", "Kishore Nagar": "Kishorenagar", "Talachera": "Talacher"}

    navy = "2D3A47"
    head_fill = PatternFill("solid", fgColor="E9ECEE")
    thin = Side(style="thin", color="C9CED3")
    box = Border(left=thin, right=thin, top=thin, bottom=thin)
    ws["A1"] = "SAKSHAM District Excel data"
    ws["A1"].font = Font(bold=True, size=14, color=navy)
    ws["A2"] = f"{district['name']} district, Grade 5 and Grade 8, 2025-26. One row per assessed school; scores are the share of answers correct (%)."
    ws["A2"].font = Font(italic=True, color="566579")

    heads = ["S. No.", "District", "Block", "Cluster", "UDISE", "School Name",
             "School Type (Co-located, G5 only / G8 only)", "Urban / Rural",
             "G5_Total Students Assessed", "G8_Total Students Assessed",
             "Overall G5 Assessment Score (%)", "Overall G8 Assessment Score (%)",
             "Consolidated Assessment Score (%)", "Overall School Score (out of 10)",
             "Overall Block Topper School (Score out of 10)",
             "English_G5 Score", "English_G8 Score", "Odia_G5 Score", "Odia_G8 Score",
             "EVS_G5 Score", "Science_G8 Score", "Social Science_G8 Score",
             "Maths_G5 Score", "Maths_G8 Score"]
    subjects = [("Grade 5", "English"), ("Grade 8", "English"), ("Grade 5", "Odia"), ("Grade 8", "Odia"),
                ("Grade 5", "EVS"), ("Grade 8", "Science"), ("Grade 8", "SST"),
                ("Grade 5", "Maths"), ("Grade 8", "Maths")]
    for c, h in enumerate(heads, 1):
        cell = ws.cell(row=3, column=c, value=h)
        cell.font = Font(bold=True, color=navy)
        cell.fill = head_fill
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = box

    order = sorted(schools.values(), key=lambda s: (s["block"], s["cluster"].lower(), s["name"].lower()))
    short = 0
    for i, s in enumerate(order, 1):
        u = s["udise"]
        grades = s["byGrade"]
        has5, has8 = "Grade 5" in grades, "Grade 8" in grades
        n5, n8 = len(pseudo[(u, "Grade 5")]), len(pseudo[(u, "Grade 8")])
        total = s["assessedStudents"] or 0
        if has5 and not has8:
            n5, n8 = total, None
        elif has8 and not has5:
            n5, n8 = None, total
        elif n5 + n8 != total:
            short += 1
        stype = "Co-located" if has5 and has8 else ("G5 only" if has5 else "G8 only")
        row = [i, district["name"], block_en.get(s["block"], s["block"]), s["cluster"], u, s["name"], stype,
               (s.get("profile") or {}).get("area", ""), n5, n8,
               grade_score["g5"].get(u), grade_score["g8"].get(u), s["overall"]["score"],
               out_of_10(s["overall"]["score"]), topper[s["block"]]]
        row += [grades.get(g, {}).get(sub) for g, sub in subjects]
        r = 3 + i
        for c, v in enumerate(row, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.border = box
            if c in (11, 12, 13) or c >= 16:
                cell.number_format = '0.0"%"'
            if c not in (2, 3, 4, 6):
                cell.alignment = Alignment(horizontal="center")
    last = 3 + len(order)

    notes = [
        "Notes",
        "School Type: Co-located schools were assessed in both Grade 5 and Grade 8; the others in one grade only. Blank cells mean the grade or subject was not assessed.",
        "Overall School Score (out of 10) is the Consolidated Assessment Score divided by 10 and rounded, as on the school report card. The block topper column shows the highest such score in the school's block.",
        f"Grade-wise student counts come from the anonymised student file. In {short} co-located schools they add up to one more than the school's official total of students assessed; the two sources count one student differently in each of these schools.",
    ]
    for j, n in enumerate(notes):
        cell = ws.cell(row=last + 2 + j, column=1, value=n)
        cell.font = Font(bold=(j == 0), color=navy if j == 0 else "566579")

    widths = {1: 7, 2: 10, 3: 13, 4: 26, 5: 13, 6: 36, 7: 13, 8: 9}
    for c in range(1, len(heads) + 1):
        ws.column_dimensions[get_column_letter(c)].width = widths.get(c, 11)
    ws.row_dimensions[3].height = 62
    ws.freeze_panes = "G4"
    ws.auto_filter.ref = f"A3:{get_column_letter(len(heads))}{last}"


district_excel_data_sheet(wb.active)
wb.active.title = "District Excel data"

wb.save(os.path.join(DL, "district_report.xlsx"))
print(f"  wrote district_report.xlsx ({os.path.getsize(os.path.join(DL, 'district_report.xlsx')) / 1024:.0f} KB)")
