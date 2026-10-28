"""
Generate the two district-level download files for /gov/district:

  public/data/downloads/district_report.pdf   one-page district summary
  public/data/downloads/district_report.xlsx  District Excel data (one row per
                                              school), District Report (one row
                                              per block), Blocks / Schools /
                                              Subjects sheets

Reads src/data/district.json (already renamed to the official unit names) and
the emitted researcher CSVs. English-only (researcher-facing downloads).
Run after build_data.py and build_district_competencies.py (which writes
block_report.csv):  python scripts/build_district_report.py
"""

import csv
import glob
import json
import os
from collections import defaultdict

import fitz  # PyMuPDF
import openpyxl
from openpyxl.formatting.rule import ColorScaleRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
DL = os.path.join(ROOT, "public", "data", "downloads")

district = json.load(open(os.path.join(ROOT, "src", "data", "district.json"), encoding="utf-8"))


def read_csv(name):
    with open(os.path.join(DL, name), encoding="utf-8-sig", newline="") as f:
        return list(csv.reader(f))


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


def sheet_from_csv(ws, rows):
    for r in rows:
        ws.append(r)
    for c in range(1, len(rows[0]) + 1):
        ws.cell(row=1, column=c).font = Font(bold=True)
        width = max(len(str(rows[i][c - 1])) for i in range(min(len(rows), 50)))
        ws.column_dimensions[get_column_letter(c)].width = min(max(width + 2, 10), 42)
    ws.freeze_panes = "A2"


def district_report_sheet(ws):
    """The District Report table: one row per block, scores as a red-yellow-green
    heat map, a district total row and a short legend. Block rows come from
    block_report.csv (same columns as the Block Report download)."""
    rows = read_csv("block_report.csv")[1:]
    los = read_csv("learning_outcomes.csv")[1:]  # Grade, Subject, Code, Description, Percentage
    los = sorted(los, key=lambda r: float(r[4]))

    def lo_list(items):
        return "; ".join(f"{r[2]} ({round(float(r[4]))}%)" for r in items)

    def grade_mean(g):
        m = district["subjectMeans"].get(g, {})
        return round(sum(m.values()) / len(m), 1) if m else ""

    sm = district["subjectMeans"]
    total = (
        ["", "Total (district)", district["schoolsAssessed"], district["studentsAssessed"],
         district["districtAverage"], grade_mean("Grade 5"), grade_mean("Grade 8")]
        + [sm.get(g, {}).get(s, "") for g, s in (
            ("Grade 5", "Odia"), ("Grade 8", "Odia"), ("Grade 5", "English"), ("Grade 8", "English"),
            ("Grade 5", "Maths"), ("Grade 8", "Maths"), ("Grade 5", "EVS"), ("Grade 8", "Science"), ("Grade 8", "SST"))]
        + [sum(int(r[16]) for r in rows), sum(int(r[17]) for r in rows), lo_list(los[:3]), lo_list(los[::-1][:3])]
        + [sum(int(r[i]) for r in rows) for i in range(20, 24)]
    )

    navy = "2D3A47"
    head_fill = PatternFill("solid", fgColor="E9ECEE")
    total_fill = PatternFill("solid", fgColor="F3EFE8")
    thin = Side(style="thin", color="C9CED3")
    box = Border(left=thin, right=thin, top=thin, bottom=thin)
    wrap = Alignment(wrap_text=True, vertical="center", horizontal="center")

    ws["A1"] = f"{district['name']} District: SAKSHAM District Report"
    ws["A1"].font = Font(bold=True, size=14, color=navy)
    ws["A2"] = "Grade 5 and Grade 8, 2025-26. Scores are the share of answers correct (%)."
    ws["A2"].font = Font(italic=True, color="566579")

    # two header rows (3 and 4); single columns are merged across both
    singles = {1: "S. No.", 2: "Block Name", 3: "Schools Assessed", 4: "Students Assessed",
               5: "Overall Score", 6: "Grade 5 Score", 7: "Grade 8 Score",
               17: "No. of schools with recoverable points",
               18: "No. of schools scoring above their block's average",
               19: "Weakest learning outcomes in this block (top 3)",
               20: "Best performing learning outcomes in this block (top 3)"}
    for c, label in singles.items():
        ws.cell(row=3, column=c, value=label)
        ws.merge_cells(start_row=3, start_column=c, end_row=4, end_column=c)
    for c, label in ((8, "Odia"), (10, "English"), (12, "Maths")):
        ws.cell(row=3, column=c, value=label)
        ws.merge_cells(start_row=3, start_column=c, end_row=3, end_column=c + 1)
        ws.cell(row=4, column=c, value="G5")
        ws.cell(row=4, column=c + 1, value="G8")
    for c, label, g in ((14, "EVS (only G5)", "G5"), (15, "Science (only G8)", "G8"), (16, "Social Science (only G8)", "G8")):
        ws.cell(row=3, column=c, value=label)
        ws.cell(row=4, column=c, value=g)
    ws.cell(row=3, column=21, value="Number of schools by band")
    ws.merge_cells(start_row=3, start_column=21, end_row=3, end_column=24)
    for c, label in zip(range(21, 25), ("Critical", "Needs Support", "Developing", "Excelling")):
        ws.cell(row=4, column=c, value=label)
    for r in (3, 4):
        for c in range(1, 25):
            cell = ws.cell(row=r, column=c)
            cell.font = Font(bold=True, color=navy)
            cell.fill = head_fill
            cell.alignment = wrap
            cell.border = box

    def num(v):
        try:
            f = float(v)
            return int(f) if f.is_integer() and "." not in str(v) else f
        except (TypeError, ValueError):
            return v

    first = 5
    for i, r in enumerate(rows + [total]):
        rr = first + i
        for c, v in enumerate(r, 1):
            cell = ws.cell(row=rr, column=c, value=num(v))
            cell.border = box
            cell.alignment = Alignment(vertical="center", wrap_text=c in (19, 20),
                                       horizontal="left" if c in (2, 19, 20) else "center")
            if 5 <= c <= 16 and isinstance(cell.value, (int, float)):
                cell.number_format = '0"%"'
        if r is total:
            for c in range(1, 25):
                ws.cell(row=rr, column=c).font = Font(bold=True)
                ws.cell(row=rr, column=c).fill = total_fill
    last = first + len(rows) - 1

    # heat map per score column, comparing the blocks (total row excluded)
    for c in range(5, 17):
        col = get_column_letter(c)
        ws.conditional_formatting.add(
            f"{col}{first}:{col}{last}",
            ColorScaleRule(start_type="min", start_color="F8696B",
                           mid_type="percentile", mid_value=50, mid_color="FFEB84",
                           end_type="max", end_color="63BE7B"),
        )
    # band counts in their band colours
    for c, hexc in zip(range(21, 25), ("C24E36", "B5530C", "A85A0F", "15803D")):
        for rr in range(first, last + 2):
            ws.cell(row=rr, column=c).font = Font(bold=True, color=hexc)

    notes = [
        "How to read this sheet",
        "Heat map: in each score column, red marks the lowest-scoring blocks, yellow the middle and green the highest. Colours compare the eight blocks with each other; the number is shown in every cell.",
        "Recoverable points: schools scoring below their block's average. Lifting these schools towards the average recovers the most points for the block and district score.",
        "Bands (school overall score): Critical 0 to 25%, Needs Support 26 to 50%, Developing 51 to 75%, Excelling 76 to 100%.",
        "Learning outcomes: code with the share of students answering correctly in brackets. Full descriptions are in learning_outcomes_by_block.csv.",
    ]
    for i, n in enumerate(notes):
        cell = ws.cell(row=last + 3 + i, column=1, value=n)
        cell.font = Font(bold=(i == 0), color=navy if i == 0 else "566579")

    widths = {1: 6, 2: 16, 3: 11, 4: 11, 5: 9, 6: 9, 7: 9, 17: 15, 18: 15, 19: 30, 20: 30}
    for c in range(1, 25):
        ws.column_dimensions[get_column_letter(c)].width = widths.get(c, 9 if c < 21 else 11)
    ws.row_dimensions[3].height = 48
    for rr in range(first, last + 2):
        ws.row_dimensions[rr].height = 48
    ws.freeze_panes = "C5"


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
district_report_sheet(wb.create_sheet("District Report"))
ws = wb.create_sheet("Blocks")
sheet_from_csv(ws, read_csv("block_aggregates.csv"))
sheet_from_csv(wb.create_sheet("Schools"), read_csv("schools_overall.csv"))
sheet_from_csv(wb.create_sheet("Subjects by block"), read_csv("block_grade_subject.csv"))

wb.save(os.path.join(DL, "district_report.xlsx"))
print(f"  wrote district_report.xlsx ({os.path.getsize(os.path.join(DL, 'district_report.xlsx')) / 1024:.0f} KB)")
