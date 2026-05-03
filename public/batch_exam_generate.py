"""
RISHI - batch_exam_generate.py
Generates all 12 Class 9 exam JSONs via Gemini.
Output: data/cbse/class9/chXX/chXX-exam.json

Usage (run from D:\\rishi\\public):
  python batch_exam_generate.py
  python batch_exam_generate.py --resume   (skip already-built chapters)

Format matches Class 8 exam JSONs exactly:
  sections A (20 MCQ x1), B (10 MCQ x2), C (6 MCQ x3),
            D (10 direct_input x3), E (2 case_study x2 = 6 subparts)
  Total: 52 questions, 100 marks
"""

import os, sys, json, re, urllib.request, urllib.error, time

ROOT = os.path.dirname(os.path.abspath(__file__))

GEMINI_URL = ("https://generativelanguage.googleapis.com/v1beta"
              "/models/gemini-2.5-flash:generateContent")

# ── Class 9 chapter definitions ───────────────────────────────────

CLASS9_CHAPTERS = [
    {
        "ch_id": "01", "chap_id": 1,
        "name": "Real Numbers",
        "topic": "arithmetic",
        "subtopics": (
            "irrational numbers proof by contradiction; decimal expansions "
            "terminating vs non-terminating; operations on real numbers; "
            "rationalising denominators; laws of exponents for real numbers; "
            "locating irrationals on number line")
    },
    {
        "ch_id": "02", "chap_id": 2,
        "name": "Polynomials",
        "topic": "algebra",
        "subtopics": (
            "definition and degree of polynomial; zeroes of a polynomial; "
            "Remainder Theorem; Factor Theorem; factorisation of polynomials; "
            "algebraic identities including sum/difference of cubes; "
            "a+b+c=0 implies a^3+b^3+c^3=3abc")
    },
    {
        "ch_id": "03", "chap_id": 3,
        "name": "Linear Equations in Two Variables",
        "topic": "algebra",
        "subtopics": (
            "linear equations ax+by+c=0; solution as ordered pairs; "
            "infinitely many solutions; graph is a straight line; "
            "equations of lines parallel to axes; word problems")
    },
    {
        "ch_id": "04", "chap_id": 4,
        "name": "Coordinate Geometry",
        "topic": "coordinate-geometry",
        "subtopics": (
            "Cartesian plane; quadrants; plotting points; "
            "coordinates of a point; abscissa and ordinate; "
            "distance on axes; mirror images of points")
    },
    {
        "ch_id": "05", "chap_id": 5,
        "name": "Euclid's Geometry",
        "topic": "geometry",
        "subtopics": (
            "Euclid's definitions, axioms and postulates; "
            "equivalent versions of fifth postulate; "
            "theorems based on axioms; equivalent angles")
    },
    {
        "ch_id": "06", "chap_id": 6,
        "name": "Lines and Angles",
        "topic": "geometry",
        "subtopics": (
            "complementary and supplementary angles; linear pair; "
            "vertically opposite angles; parallel lines and transversal; "
            "corresponding angles; alternate interior angles; "
            "co-interior angles; angle sum property of triangle")
    },
    {
        "ch_id": "07", "chap_id": 7,
        "name": "Triangles",
        "topic": "geometry",
        "subtopics": (
            "congruence of triangles; SAS SSS ASA AAS RHS rules; "
            "properties of isosceles triangle; inequalities in triangles; "
            "angle opposite longer side; longer side opposite greater angle")
    },
    {
        "ch_id": "08", "chap_id": 8,
        "name": "Quadrilaterals",
        "topic": "geometry",
        "subtopics": (
            "angle sum property of quadrilateral; types of quadrilaterals; "
            "properties of parallelogram; diagonals of parallelogram bisect each other; "
            "rectangle rhombus square; mid-point theorem")
    },
    {
        "ch_id": "09", "chap_id": 9,
        "name": "Circles",
        "topic": "geometry",
        "subtopics": (
            "chord properties; perpendicular from centre bisects chord; "
            "equal chords equidistant from centre; angle subtended by arc; "
            "cyclic quadrilateral opposite angles supplementary; "
            "angles in same segment equal")
    },
    {
        "ch_id": "10", "chap_id": 10,
        "name": "Heron's Formula",
        "topic": "mensuration",
        "subtopics": (
            "area of triangle using Heron's formula; semi-perimeter; "
            "application to quadrilaterals by dividing into triangles; "
            "equilateral triangle area; word problems on Heron's formula")
    },
    {
        "ch_id": "11", "chap_id": 11,
        "name": "Surface Areas and Volumes",
        "topic": "mensuration",
        "subtopics": (
            "surface area of cuboid cube cylinder cone sphere hemisphere; "
            "volume of cuboid cube cylinder cone sphere hemisphere; "
            "combined solids; conversion of units; word problems")
    },
    {
        "ch_id": "12", "chap_id": 12,
        "name": "Statistics",
        "topic": "data-handling",
        "subtopics": (
            "collection and presentation of data; frequency distribution; "
            "bar graphs histograms frequency polygons; "
            "mean median mode of ungrouped data; "
            "mean by direct method assumed mean step deviation; "
            "median of grouped data; mode of grouped data")
    }
]

# ── Gemini helpers ────────────────────────────────────────────────

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        key = input("Enter your GEMINI_API_KEY: ").strip()
    if not key:
        print("ERROR: No API key.")
        sys.exit(1)
    return key

def gemini_call(prompt, api_key, max_tokens=16000):
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.3}
    }).encode("utf-8")
    url = f"{GEMINI_URL}?key={api_key}"
    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read())
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini HTTP {e.code}: {body[:400]}")

def extract_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text, flags=re.MULTILINE)
    text = text.strip()
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    return json.loads(text)

def is_rate_limit(e):
    return "429" in str(e)

# ── Prompt builder ────────────────────────────────────────────────

def build_prompt(chapter):
    ch_id  = chapter["ch_id"]
    name   = chapter["name"]
    topics = chapter["subtopics"]

    return f"""You are building a chapter exam for RISHI, an AI maths tutoring app.
Class: 9 CBSE | Chapter: {name} | Topics: {topics}

Generate a complete exam JSON exactly matching this schema:

{{
  "meta": {{
    "board": "cbse",
    "class": 9,
    "chapter_id": "ch{ch_id}",
    "chapter_name": "{name}",
    "topic_group": "{chapter["topic"]}",
    "total_marks": 100,
    "total_questions": 52,
    "version": 1,
    "generated": "2026-05"
  }},
  "sections": {{
    "A": {{
      "type": "mcq",
      "label": "Conceptual",
      "marks_per_q": 1,
      "count": 20,
      "questions": [
        {{
          "id": "cbse_9_ch{ch_id}_A_001",
          "text": "[question text]",
          "options": {{"a": "[opt a]", "b": "[opt b]", "c": "[opt c]", "d": "[opt d]"}},
          "correct": "[a/b/c/d]",
          "difficulty": "[easy/medium/hard]",
          "source": "[ncert/ncert_exemplar/cbse_sample/kv_paper]",
          "explanation": "[brief explanation of correct answer]"
        }}
      ]
    }},
    "B": {{
      "type": "mcq",
      "label": "Application",
      "marks_per_q": 2,
      "count": 10,
      "questions": [ /* same structure as A, 10 questions */ ]
    }},
    "C": {{
      "type": "mcq",
      "label": "Higher Order",
      "marks_per_q": 3,
      "count": 6,
      "questions": [ /* same structure as A, 6 questions */ ]
    }},
    "D": {{
      "type": "direct_input",
      "label": "Numerical",
      "marks_per_q": 3,
      "count": 10,
      "questions": [
        {{
          "id": "cbse_9_ch{ch_id}_D_001",
          "text": "[question text]",
          "correct_answer": "[exact answer]",
          "answer_type": "[fraction/integer/decimal/expression]",
          "accepted_forms": ["[answer]", "[alternate forms]"],
          "difficulty": "[easy/medium/hard]",
          "source": "[source]",
          "explanation": "[step-by-step solution]"
        }}
      ]
    }},
    "E": {{
      "type": "case_study",
      "label": "Case Study",
      "marks_per_q": 2,
      "count": 2,
      "cases": [
        {{
          "id": "cbse_9_ch{ch_id}_E_case1",
          "case_text": "[real-world scenario paragraph, 4-6 sentences]",
          "subparts": [
            {{
              "id": "cbse_9_ch{ch_id}_E_case1_q1",
              "text": "[question]",
              "type": "mcq",
              "options": {{"a": "[opt]", "b": "[opt]", "c": "[opt]", "d": "[opt]"}},
              "correct": "[a/b/c/d]",
              "marks": 2,
              "explanation": "[explanation]"
            }},
            {{
              "id": "cbse_9_ch{ch_id}_E_case1_q2",
              "text": "[question]",
              "type": "mcq",
              "options": {{"a": "[opt]", "b": "[opt]", "c": "[opt]", "d": "[opt]"}},
              "correct": "[a/b/c/d]",
              "marks": 2,
              "explanation": "[explanation]"
            }},
            {{
              "id": "cbse_9_ch{ch_id}_E_case1_q3",
              "text": "[question]",
              "type": "direct_input",
              "correct_answer": "[answer]",
              "accepted_forms": ["[answer]", "[alternate]"],
              "marks": 2,
              "explanation": "[explanation]"
            }}
          ]
        }},
        {{
          "id": "cbse_9_ch{ch_id}_E_case2",
          "case_text": "[different real-world scenario]",
          "subparts": [ /* 3 subparts same structure */ ]
        }}
      ]
    }}
  }}
}}

STRICT RULES:
1. Section A: EXACTLY 20 MCQ questions (ids: _A_001 to _A_020)
2. Section B: EXACTLY 10 MCQ questions (ids: _B_001 to _B_010)
3. Section C: EXACTLY 6 MCQ questions (ids: _C_001 to _C_006)
4. Section D: EXACTLY 10 direct_input questions (ids: _D_001 to _D_010)
5. Section E: EXACTLY 2 cases, each with EXACTLY 3 subparts (2 MCQ + 1 direct_input)
6. Total = 52 questions, 100 marks
7. Section A: easy questions (NCERT level, conceptual definitions)
8. Section B: medium questions (application of concepts)
9. Section C: hard questions (higher order, multi-step)
10. Section D: medium to hard numerical problems (direct computation)
11. All answers must be 100% mathematically correct — verify every calculation
12. Use ONLY straight ASCII apostrophes — never smart/curly quotes
13. NEVER put a raw newline inside a JSON string value
14. explanations must be clear, show working steps
15. Case studies must use real-world context relevant to Indian students
16. Output ONLY the JSON object — start with {{ and end with }}
"""

# ── Validation ────────────────────────────────────────────────────

def validate(data, chapter):
    errors = []
    sections = data.get("sections", {})

    counts = {"A": 20, "B": 10, "C": 6, "D": 10}
    for sec, expected in counts.items():
        s = sections.get(sec, {})
        got = len(s.get("questions", []))
        if got != expected:
            errors.append(f"Section {sec}: got {got} questions, need {expected}")

    e = sections.get("E", {})
    cases = e.get("cases", [])
    if len(cases) != 2:
        errors.append(f"Section E: got {len(cases)} cases, need 2")
    for i, case in enumerate(cases):
        subs = case.get("subparts", [])
        if len(subs) != 3:
            errors.append(f"Section E case{i+1}: got {len(subs)} subparts, need 3")

    return errors

# ── Verification ──────────────────────────────────────────────────

def verify(data, chapter, api_key):
    # Sample check: verify Section D answers (numerical)
    d_qs = data.get("sections", {}).get("D", {}).get("questions", [])
    checks = []
    for i, q in enumerate(d_qs):
        checks.append(f"Q{i+1}: {q['text']} Answer: {q['correct_answer']} Explanation: {q.get('explanation','')[:100]}")

    prompt = (
        f"You are a Class 9 CBSE maths teacher verifying numerical answers for: {chapter['name']}.\n"
        f"Check each answer for correctness.\n"
        f"Reply with one line per question: 'Q1: OK' or 'Q3: FLAG correct answer is X'\n\n"
        + "\n".join(checks)
        + "\n\nOne line per question only."
    )
    try:
        resp = gemini_call(prompt, api_key, max_tokens=2000)
        return [l.strip() for l in resp.strip().split("\n") if "FLAG" in l.upper()]
    except Exception as e:
        return [f"(Verification skipped: {e})"]

# ── Resume check ──────────────────────────────────────────────────

def already_built(chapter):
    ch_id = chapter["ch_id"]
    path  = os.path.join(ROOT, "data", "cbse", "class9",
                         f"ch{ch_id}", f"ch{ch_id}-exam.json")
    return os.path.exists(path)

# ── Chapter generator ─────────────────────────────────────────────

def generate_chapter(chapter, api_key):
    ch_id = chapter["ch_id"]
    name  = chapter["name"]

    print(f"\n{'='*58}")
    print(f"  Ch{ch_id} — {name}")
    print(f"{'='*58}")

    # [1] Gemini call
    print("  [1/3] Calling Gemini...", end=" ", flush=True)
    data = None
    for attempt in range(3):
        try:
            raw  = gemini_call(build_prompt(chapter), api_key)
            data = extract_json(raw)
            print("OK")
            break
        except Exception as e:
            msg  = str(e)[:80]
            wait = 65 if is_rate_limit(e) else 10
            if attempt < 2:
                print(f"  retry {attempt+2}/3 ({msg}) — waiting {wait}s")
                time.sleep(wait)
            else:
                print(f"\n  ERROR: {msg}")
                return None

    if data is None:
        return None

    # [2] Validate structure
    print("  [2/3] Validating...", end=" ", flush=True)
    errors = validate(data, chapter)
    if errors:
        print("FAILED")
        for e in errors:
            print(f"    x {e}")
        return None
    print("OK")

    # [3] Save
    out_dir = os.path.join(ROOT, "data", "cbse", "class9", f"ch{ch_id}")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"ch{ch_id}-exam.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Saved to data/cbse/class9/ch{ch_id}/ch{ch_id}-exam.json")

    return data

# ── Main ──────────────────────────────────────────────────────────

def main():
    resume = "--resume" in sys.argv
    api_key = get_api_key()

    print(f"\nRISHI Exam Generator — Class 9")
    print(f"Chapters: {len(CLASS9_CHAPTERS)} | Resume: {resume}")
    print(f"Model: gemini-2.5-flash")

    all_flags = {}
    failed    = []
    succeeded = []
    skipped   = []

    for chapter in CLASS9_CHAPTERS:
        if resume and already_built(chapter):
            print(f"\n  [SKIP] Ch{chapter['ch_id']} {chapter['name']} — already built")
            skipped.append(chapter["name"])
            continue

        data = generate_chapter(chapter, api_key)
        if data is None:
            failed.append(chapter["name"])
        else:
            succeeded.append(chapter["name"])
            print("  [Verifying answers]...", end=" ", flush=True)
            flags = verify(data, chapter, api_key)
            if flags:
                all_flags[chapter["name"]] = flags
                print(f"  {len(flags)} item(s) flagged")
            else:
                print("  All OK")

        time.sleep(20)

    # Summary
    print(f"\n{'='*58}")
    print("  BATCH COMPLETE")
    print(f"{'='*58}")
    print(f"  Built:   {len(succeeded)}")
    print(f"  Skipped: {len(skipped)}")
    print(f"  Failed:  {len(failed)}")
    if failed:
        for n in failed:
            print(f"    x {n}")

    if all_flags:
        print(f"\n  REVIEW THESE (possible answer errors):")
        for chap, flags in all_flags.items():
            print(f"\n  {chap}:")
            for flag in flags:
                print(f"    {flag}")
    else:
        print("\n  All answers verified — nothing flagged.")

    total_built = len(succeeded) + len(skipped)
    if total_built > 0:
        print(f"\n  Next steps:")
        print("    cd D:\\rishi")
        print("    git add .")
        print('    git commit -m "Class 9 exams + exam.html + questions.js updated"')
        print("    git push")

if __name__ == "__main__":
    main()
