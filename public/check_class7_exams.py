#!/usr/bin/env python3
"""
=============================================================
  RISHI — Class 7 Exam JSON Checker
  Run after deploying all 8 chapter exam JSONs.

  Usage (from D:\\rishi\\public\\):
      python check_class7_exams.py

  Checks:
    [1] JSON file validity & structure
    [2] Section counts (A=20 B=10 C=6 D=10 E=2 cases)
    [3] Marks totals (each chapter = 100)
    [4] Answer integrity (MCQ options, direct_input forms)
    [5] Case study subparts (3 per case, marks sum = 12)
    [6] Question ID uniqueness
    [7] Explanation & difficulty fields
    [8] HTTP: API endpoint for each chapter
    [9] HTTP: exam.html page per chapter
    [10] HTTP: Syllabus page (Class 7 exam_paths present)
    [11] HTTP: Parent portal loads
    [12] HTTP: Admin page loads
    [13] HTTP: Avatar (Rishika) referenced in exam page
    [14] HTTP: Explain pages load (animation pages)
    [15] HTTP: Practice pages load
=============================================================
"""

import json
import os
import sys
import time

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# ─── Config ───────────────────────────────────────────────
BASE_URL       = "https://rishi-ewh.pages.dev"
DATA_DIR       = os.path.join(os.path.dirname(__file__), "data", "cbse", "class7")
TIMEOUT        = 10

CHAPTERS = [
    {"ch": "ch01", "exam_key": "c7-01", "slug": "large-numbers-around-us",          "topic": "arithmetic"},
    {"ch": "ch02", "exam_key": "c7-02", "slug": "arithmetic-expressions",            "topic": "arithmetic"},
    {"ch": "ch03", "exam_key": "c7-03", "slug": "a-peek-beyond-the-point",           "topic": "arithmetic"},
    {"ch": "ch04", "exam_key": "c7-04", "slug": "number-play",                       "topic": "arithmetic"},
    {"ch": "ch05", "exam_key": "c7-05", "slug": "working-with-fractions",            "topic": "arithmetic"},
    {"ch": "ch06", "exam_key": "c7-06", "slug": "expressions-using-letter-numbers",  "topic": "algebra"},
    {"ch": "ch07", "exam_key": "c7-07", "slug": "parallel-and-intersecting-lines",   "topic": "geometry"},
    {"ch": "ch08", "exam_key": "c7-08", "slug": "a-tale-of-three-intersecting-lines","topic": "geometry"},
]

EXPECTED = {
    "A": {"count": 20, "marks": 1},
    "B": {"count": 10, "marks": 2},
    "C": {"count":  6, "marks": 3},
    "D": {"count": 10, "marks": 3},
}
EXPECTED_E_CASES    = 2
EXPECTED_E_SUBPARTS = 3
EXPECTED_E_MARKS    = 2   # per subpart
EXPECTED_TOTAL      = 100

# ─── Color helpers ────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def ok(msg):   print(f"  {GREEN}✓{RESET} {msg}")
def fail(msg): print(f"  {RED}✗{RESET} {msg}"); return False
def warn(msg): print(f"  {YELLOW}⚠{RESET} {msg}")
def head(msg): print(f"\n{BOLD}{CYAN}{msg}{RESET}")
def sub(msg):  print(f"  {BOLD}{msg}{RESET}")

pass_count = 0
fail_count = 0

def check(condition, ok_msg, fail_msg):
    global pass_count, fail_count
    if condition:
        ok(ok_msg)
        pass_count += 1
        return True
    else:
        fail(fail_msg)
        fail_count += 1
        return False


# ═══════════════════════════════════════════════════════════
# SECTION 1 — JSON File Checks
# ═══════════════════════════════════════════════════════════
def check_json_files():
    head("═══ [1–7] JSON FILE CHECKS ═══")
    results = {}

    for ch_info in CHAPTERS:
        ch   = ch_info["ch"]
        key  = ch_info["exam_key"]
        path = os.path.join(DATA_DIR, ch, f"{ch}-exam.json")

        sub(f"\n{key} — {ch_info['slug']}")

        # 1. File exists
        if not check(os.path.exists(path), f"File found: {path}", f"File MISSING: {path}"):
            results[ch] = None
            continue

        # 2. Valid JSON
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            ok("Valid JSON")
            pass_count += 1
        except json.JSONDecodeError as e:
            fail(f"JSON parse error: {e}")
            fail_count += 1
            results[ch] = None
            continue

        results[ch] = data
        sections = data.get("sections", {})
        total_marks = 0
        all_ids = []

        # 3. Section structure + counts
        for sec_name, spec in EXPECTED.items():
            sec = sections.get(sec_name, {})
            qs  = sec.get("questions", [])
            check(
                len(qs) == spec["count"],
                f"Section {sec_name}: {len(qs)} questions (expected {spec['count']})",
                f"Section {sec_name}: got {len(qs)}, expected {spec['count']}"
            )
            total_marks += len(qs) * spec["marks"]
            all_ids += [q.get("id","") for q in qs]

            # 4. Answer integrity per section
            if sec_name in ("A", "B", "C"):
                for q in qs:
                    opts = q.get("options", {})
                    check(
                        set(opts.keys()) == {"a","b","c","d"},
                        f"  Q {q.get('id','')} has a/b/c/d options",
                        f"  Q {q.get('id','')} missing options: {set(opts.keys())}"
                    )
                    check(
                        q.get("correct","") in ("a","b","c","d"),
                        f"  Q {q.get('id','')} correct field valid ({q.get('correct','')})",
                        f"  Q {q.get('id','')} correct field invalid: '{q.get('correct','')}'"
                    )
            elif sec_name == "D":
                for q in qs:
                    check(
                        bool(q.get("correct_answer","")),
                        f"  Q {q.get('id','')} has correct_answer",
                        f"  Q {q.get('id','')} MISSING correct_answer"
                    )
                    check(
                        bool(q.get("accepted_forms",[])),
                        f"  Q {q.get('id','')} has accepted_forms",
                        f"  Q {q.get('id','')} MISSING accepted_forms"
                    )

        # 5. Section E — case studies
        sec_e     = sections.get("E", {})
        cases     = sec_e.get("questions", [])
        e_marks   = 0
        check(
            len(cases) == EXPECTED_E_CASES,
            f"Section E: {len(cases)} case studies (expected {EXPECTED_E_CASES})",
            f"Section E: got {len(cases)}, expected {EXPECTED_E_CASES}"
        )
        for case in cases:
            check(
                bool(case.get("case_text","")),
                f"  Case {case.get('id','')} has case_text",
                f"  Case {case.get('id','')} MISSING case_text"
            )
            subparts = case.get("subparts", [])
            check(
                len(subparts) == EXPECTED_E_SUBPARTS,
                f"  Case {case.get('id','')} has {len(subparts)} subparts",
                f"  Case {case.get('id','')} has {len(subparts)}, expected {EXPECTED_E_SUBPARTS}"
            )
            for sp in subparts:
                e_marks += sp.get("marks", 0)
                all_ids.append(sp.get("id",""))
                sp_type = sp.get("type","")
                if sp_type == "mcq":
                    opts = sp.get("options", {})
                    check(
                        set(opts.keys()) == {"a","b","c","d"},
                        f"    Subpart {sp.get('id','')} has a/b/c/d options",
                        f"    Subpart {sp.get('id','')} missing options"
                    )
                    check(
                        sp.get("correct","") in ("a","b","c","d"),
                        f"    Subpart {sp.get('id','')} correct field valid",
                        f"    Subpart {sp.get('id','')} correct field invalid: '{sp.get('correct','')}'"
                    )
                elif sp_type == "direct_input":
                    check(
                        bool(sp.get("correct_answer","")),
                        f"    Subpart {sp.get('id','')} has correct_answer",
                        f"    Subpart {sp.get('id','')} MISSING correct_answer"
                    )

        total_marks += e_marks

        # 6. Marks total
        check(
            total_marks == EXPECTED_TOTAL,
            f"Total marks = {total_marks} ✓",
            f"Total marks = {total_marks} (expected {EXPECTED_TOTAL})"
        )

        # 7. ID uniqueness
        dup = [i for i in all_ids if all_ids.count(i) > 1 and i]
        dup = list(set(dup))
        check(
            len(dup) == 0,
            f"All question IDs are unique",
            f"Duplicate IDs found: {dup}"
        )

        # Explanation field check (sample first question of each section)
        for sec_name in ("A","B","C","D"):
            sec_qs = sections.get(sec_name,{}).get("questions",[])
            if sec_qs:
                q = sec_qs[0]
                check(
                    bool(q.get("explanation","")),
                    f"Section {sec_name} Q1 has explanation",
                    f"Section {sec_name} Q1 MISSING explanation"
                )
                check(
                    q.get("difficulty","") in ("easy","medium","hard"),
                    f"Section {sec_name} Q1 has valid difficulty",
                    f"Section {sec_name} Q1 difficulty invalid: '{q.get('difficulty','')}'"
                )

    return results


# ═══════════════════════════════════════════════════════════
# SECTION 2 — HTTP / Live Site Checks
# ═══════════════════════════════════════════════════════════
def get(url, label, check_text=None):
    """GET a URL, return (ok:bool, status_code, text)"""
    global pass_count, fail_count
    try:
        r = requests.get(url, timeout=TIMEOUT)
        if r.status_code == 200:
            if check_text:
                found = check_text.lower() in r.text.lower()
                if found:
                    ok(f"{label} — 200 OK + '{check_text}' found")
                    pass_count += 1
                else:
                    fail(f"{label} — 200 OK but '{check_text}' NOT found in response")
                    fail_count += 1
                return found, 200, r.text
            else:
                ok(f"{label} — 200 OK")
                pass_count += 1
                return True, 200, r.text
        else:
            fail(f"{label} — HTTP {r.status_code}")
            fail_count += 1
            return False, r.status_code, ""
    except requests.exceptions.ConnectionError:
        fail(f"{label} — Connection failed (site down?)")
        fail_count += 1
        return False, 0, ""
    except requests.exceptions.Timeout:
        fail(f"{label} — Timeout after {TIMEOUT}s")
        fail_count += 1
        return False, 0, ""
    except Exception as e:
        fail(f"{label} — Error: {e}")
        fail_count += 1
        return False, 0, ""


def check_http():
    head("═══ [8] API ENDPOINTS ═══")
    for ch_info in CHAPTERS:
        ch_num = ch_info["ch"].replace("ch","")  # "01" .. "08"
        url = f"{BASE_URL}/api/questions?board=cbse&class=7&ch={ch_num}&type=exam"
        ok_flag, status, body = get(url, f"API ch{ch_num}")
        if ok_flag and body:
            try:
                api_data = json.loads(body)
                # Check it returned questions
                if isinstance(api_data, dict) and api_data.get("sections"):
                    ok(f"  API ch{ch_num} returned valid sections")
                    pass_count += 1
                elif isinstance(api_data, list) and len(api_data) > 0:
                    ok(f"  API ch{ch_num} returned {len(api_data)} items")
                    pass_count += 1
                else:
                    warn(f"  API ch{ch_num} response structure unexpected")
            except json.JSONDecodeError:
                warn(f"  API ch{ch_num} response is not JSON (might be HTML proxy)")

    head("═══ [9] EXAM PAGES ═══")
    for ch_info in CHAPTERS:
        key = ch_info["exam_key"]
        url = f"{BASE_URL}/exam.html?ch={key}"
        get(url, f"exam.html?ch={key}")

    head("═══ [10] SYLLABUS PAGE ═══")
    ok_flag, _, body = get(f"{BASE_URL}/syllabus.html", "syllabus.html loads")
    if ok_flag and body:
        # Check that Class 7 exam keys are referenced
        for ch_info in CHAPTERS:
            key = ch_info["exam_key"]
            found = key in body
            check(
                found,
                f"syllabus.html references {key}",
                f"syllabus.html MISSING reference to {key}"
            )

    head("═══ [11] PARENT PORTAL ═══")
    get(f"{BASE_URL}/parent.html",           "parent.html loads")
    get(f"{BASE_URL}/parent-dashboard.html", "parent-dashboard.html loads")

    head("═══ [12] ADMIN PAGE ═══")
    ok_flag, _, body = get(f"{BASE_URL}/admin.html", "admin.html loads")
    if ok_flag and body:
        # Check Class 7 chapters appear in admin
        for ch_info in CHAPTERS:
            key = ch_info["exam_key"]
            check(
                key in body,
                f"admin.html references {key}",
                f"admin.html MISSING {key}"
            )

    head("═══ [13] AVATAR (Rishika) CHECK ═══")
    # Check that exam.html contains Rishika avatar reference
    ok_flag, _, body = get(f"{BASE_URL}/exam.html?ch=c7-01", "exam.html?ch=c7-01 for avatar check")
    if ok_flag and body:
        check("rishika" in body.lower(),
              "Rishika avatar referenced in exam page",
              "Rishika avatar NOT found in exam page")
        check("rishi-core.js" in body.lower(),
              "rishi-core.js injected in exam page",
              "rishi-core.js NOT found in exam page")
        check("rishi-presence.js" in body.lower(),
              "rishi-presence.js injected in exam page",
              "rishi-presence.js NOT found in exam page")

    head("═══ [14] EXPLAIN PAGES (Animations) ═══")
    for ch_info in CHAPTERS:
        slug  = ch_info["slug"]
        topic = ch_info["topic"]
        url   = f"{BASE_URL}/explain/class7/{topic}/{slug}.html"
        ok_flag, _, body = get(url, f"explain/{topic}/{slug}")
        if ok_flag and body:
            # Check animation-related elements
            has_svg    = "anim_svg" in body or "<svg" in body or "at(" in body
            has_voice  = "say(" in body or "initVoices" in body
            has_avatar = "rishika" in body.lower()
            check(has_svg,    f"  {slug} — SVG/animation present",    f"  {slug} — No animation detected")
            check(has_avatar, f"  {slug} — Rishika avatar present",   f"  {slug} — Rishika avatar NOT found")
            check(has_voice,  f"  {slug} — Voice (TTS) wired up",     f"  {slug} — Voice code NOT found")

    head("═══ [15] PRACTICE PAGES ═══")
    for ch_info in CHAPTERS:
        slug  = ch_info["slug"]
        topic = ch_info["topic"]
        url   = f"{BASE_URL}/practice/class7/{topic}/{slug}.html"
        get(url, f"practice/{topic}/{slug}")


# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════
def main():
    print(f"\n{BOLD}{'='*60}")
    print(f"  RISHI — Class 7 Exam Checker")
    print(f"  Site: {BASE_URL}")
    print(f"{'='*60}{RESET}\n")

    # Always run JSON checks
    check_json_files()

    # HTTP checks only if requests available
    if not HAS_REQUESTS:
        warn("\nrequests library not found. Skipping HTTP checks.")
        warn("Install with:  pip install requests --break-system-packages")
    else:
        check_http()

    # ─── Final Report ─────────────────────────────────────
    total  = pass_count + fail_count
    pct    = int((pass_count / total) * 100) if total else 0
    status = f"{GREEN}ALL PASSED{RESET}" if fail_count == 0 else f"{RED}{fail_count} FAILED{RESET}"

    print(f"\n{BOLD}{'='*60}")
    print(f"  RESULTS: {pass_count}/{total} checks passed  ({pct}%)")
    print(f"  STATUS : {status}")
    print(f"{'='*60}{RESET}\n")

    sys.exit(0 if fail_count == 0 else 1)


if __name__ == "__main__":
    main()
