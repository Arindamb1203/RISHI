"""
RISHI - batch_generate.py
Generates all Class 7 content JSONs via Gemini, then runs generate.py on each.
Includes automatic math verification pass and resume support.

Usage (run from D:\\rishi\\public):
  python batch_generate.py --class 7           # full run
  python batch_generate.py --class 7 --resume  # skip already-built chapters
"""

import os, sys, json, re, subprocess, urllib.request, urllib.error, time

ROOT = os.path.dirname(os.path.abspath(__file__))

GEMINI_URL = ("https://generativelanguage.googleapis.com/v1beta"
              "/models/gemini-2.5-flash:generateContent")

# ── Gemini helpers ────────────────────────────────────────────────

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        key = input("Enter your GEMINI_API_KEY: ").strip()
    if not key:
        print("ERROR: No API key. Exiting.")
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
    # Strip control characters Gemini sometimes embeds in strings
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    return json.loads(text)

def is_rate_limit(e):
    return "429" in str(e)

# ── SVG generator (programmatic) ─────────────────────────────────

def xml_escape(s):
    return (str(s)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;"))

def make_anim_svg(qid, steps, answer_label):
    parts = []
    for i, step in enumerate(steps[:3]):
        t = xml_escape(step.get("t", ""))
        t = t[:65] + ("..." if len(step.get("t", "")) > 65 else "")
        y = 28 + i * 40
        parts.append(
            f'<g id="{qid}s{i}" opacity="0">'
            f'<text x="22" y="{y}" font-size="11" font-weight="800"'
            f' fill="#5a4a30">{t}</text></g>')
    ans = xml_escape(str(answer_label))[:48]
    parts.append(
        f'<g id="{qid}ans" opacity="0">'
        f'<rect x="40" y="148" width="320" height="24" rx="7"'
        f' fill="#eef2eb" stroke="#6b4c2a" stroke-width="1.5"/>'
        f'<text x="210" y="163" text-anchor="middle"'
        f' font-family="Share Tech Mono" font-size="12"'
        f' font-weight="bold" fill="#7a8c6e">{ans}</text></g>')
    return "".join(parts)

# ── HTML sanitizer ────────────────────────────────────────────────

def safe_html(text):
    for ch in ["\u2019", "\u2018", "\u02bc"]:
        text = text.replace(ch, "&#39;")
    for ch in ["\u201c", "\u201d"]:
        text = text.replace(ch, "&quot;")
    text = text.replace("'", "&#39;")
    return text

# ── Chapter definitions ───────────────────────────────────────────

CLASS7_CHAPTERS = [
    {
        "chapter_slug":  "large-numbers-around-us",
        "chapter_name":  "Large Numbers Around Us",
        "chapter_emoji": "\U0001f522",
        "class_num": 7, "board": "cbse", "topic": "arithmetic",
        "chap_id": 1, "exam_key": "c7-01",
        "subtopics": (
            "place value up to crores and billions; Indian vs International "
            "number systems; comparison and ordering of large numbers; "
            "estimation and rounding large numbers; reading and writing large "
            "numbers in words and figures")
    },
    {
        "chapter_slug":  "arithmetic-expressions",
        "chapter_name":  "Arithmetic Expressions",
        "chapter_emoji": "\u2795",
        "class_num": 7, "board": "cbse", "topic": "arithmetic",
        "chap_id": 2, "exam_key": "c7-02",
        "subtopics": (
            "BODMAS/DMAS order of operations; types of brackets (round, curly, "
            "square) and their order; simplifying expressions step-by-step; "
            "operations with positive and negative integers; "
            "evaluating complex arithmetic expressions")
    },
    {
        "chapter_slug":  "a-peek-beyond-the-point",
        "chapter_name":  "A Peek Beyond the Point",
        "chapter_emoji": "\U0001f50d",
        "class_num": 7, "board": "cbse", "topic": "arithmetic",
        "chap_id": 3, "exam_key": "c7-03",
        "subtopics": (
            "decimal numbers and place value; comparing decimals; "
            "addition and subtraction of decimals; "
            "multiplication of decimals by whole numbers and decimals; "
            "division of decimals; converting fractions to decimals and back")
    },
    {
        "chapter_slug":  "number-play",
        "chapter_name":  "Number Play",
        "chapter_emoji": "\U0001f3ae",
        "class_num": 7, "board": "cbse", "topic": "arithmetic",
        "chap_id": 4, "exam_key": "c7-04",
        "subtopics": (
            "divisibility rules for 2,3,4,5,6,7,8,9,10,11; "
            "factors and multiples; HCF by listing factors and prime factorisation; "
            "LCM by listing multiples and prime factorisation; "
            "prime and composite numbers; prime factorisation using factor tree; "
            "relation between HCF and LCM")
    },
    {
        "chapter_slug":  "working-with-fractions",
        "chapter_name":  "Working with Fractions",
        "chapter_emoji": "\u00bd",
        "class_num": 7, "board": "cbse", "topic": "arithmetic",
        "chap_id": 5, "exam_key": "c7-05",
        "subtopics": (
            "types of fractions: proper, improper, mixed; equivalent fractions; "
            "comparing fractions using LCM; addition and subtraction of unlike "
            "fractions; multiplication of fractions; division of fractions; "
            "word problems on fractions")
    },
    {
        "chapter_slug":  "expressions-using-letter-numbers",
        "chapter_name":  "Expressions using Letter-Numbers",
        "chapter_emoji": "\U0001f524",
        "class_num": 7, "board": "cbse", "topic": "algebra",
        "chap_id": 6, "exam_key": "c7-06",
        "subtopics": (
            "variables and constants; algebraic expressions; terms, coefficients, "
            "factors; like and unlike terms; addition and subtraction of algebraic "
            "expressions; forming expressions from word problems; "
            "simple linear equations and solving them")
    },
    {
        "chapter_slug":  "parallel-and-intersecting-lines",
        "chapter_name":  "Parallel and Intersecting Lines",
        "chapter_emoji": "\U0001f4d0",
        "class_num": 7, "board": "cbse", "topic": "geometry",
        "chap_id": 7, "exam_key": "c7-07",
        "subtopics": (
            "parallel lines and transversal; corresponding angles (equal); "
            "alternate interior angles (equal); alternate exterior angles (equal); "
            "co-interior angles (supplementary); "
            "linear pair and vertically opposite angles; "
            "testing if lines are parallel using angle properties")
    },
    {
        "chapter_slug":  "a-tale-of-three-intersecting-lines",
        "chapter_name":  "A Tale of Three Intersecting Lines",
        "chapter_emoji": "\U0001f53a",
        "class_num": 7, "board": "cbse", "topic": "geometry",
        "chap_id": 8, "exam_key": "c7-08",
        "subtopics": (
            "triangles and their types; angle sum property of a triangle (180 deg); "
            "exterior angle theorem; properties of isosceles and equilateral triangles; "
            "median, altitude, perpendicular bisector; "
            "concurrent lines: centroid, orthocentre, circumcentre, incentre")
    }
]

# ── Prompt ────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """You are building content for RISHI, an AI maths tutoring app for Class 7 CBSE students (age 12-13) in India. Textbook: Ganita Prakash (new NCERT 2025-26).

Generate a complete content JSON for:
Chapter: {chapter_name}
Key topics: {subtopics}

Return ONLY valid JSON (no markdown, no preamble) matching EXACTLY this schema:

{{
  "intro_text": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! [Rishika greeting, 2 sentences, 1-2 emojis]",
  "complete_message": "[Short celebration, max 12 words, 1 emoji]",
  "explain_questions": [
    {{
      "id": "q1",
      "question": "[Concept question on screen]",
      "question_spoken": "[Same for TTS — spell out all symbols]",
      "steps": [
        {{"t": "[Step on screen — max 90 chars]", "s": "[Spoken step — max 110 chars]"}},
        {{"t": "[Step 2]", "s": "[Step 2 spoken]"}},
        {{"t": "[Step 3]", "s": "[Step 3 spoken]"}}
      ],
      "confirm_question": "[Short test question]",
      "confirm_question_spoken": "[Test question for TTS]",
      "answers": ["[primary answer]", "[alternate forms]"],
      "nudges": ["[Hint 1]", "[Hint 2]", "[Hint 3 — gives answer]"]
    }}
  ],
  "practice_questions": [
    {{
      "question": "[Question]",
      "question_spoken": "[Question for TTS]",
      "answers": ["[exact answer]", "[alternate forms]"],
      "steps": ["[Step 1]", "[Step 2]", "[Step 3]"],
      "trick": "[Rishika Trick: 1-2 sentence shortcut]",
      "alt": "[Alternative method, 2-3 sentences]"
    }}
  ]
}}

RULES — all mandatory:
1. EXACTLY 10 explain_questions, ids q1 to q10
2. EXACTLY 15 practice_questions
3. Each explain question: EXACTLY 3 steps, EXACTLY 3 nudges
4. Difficulty: explain q1-q4 easy, q5-q8 medium, q9-q10 hard
5. Difficulty: practice Q1-Q6 easy, Q7-Q12 medium, Q13-Q15 hard
6. ONLY straight ASCII apostrophe (') — never curly quotes
7. All calculations verified correct — double-check every number
8. Plain text math only: write x^2 not x squared symbol, sqrt not root symbol
9. intro_text MUST contain: <span class=\\"hl\\" id=\\"sName\\">there</span>
10. NEVER put a raw newline inside a JSON string value — use space instead
11. Output ONLY the JSON object — start with {{ end with }}
"""

def build_prompt(chapter):
    return PROMPT_TEMPLATE.format(
        chapter_name=chapter["chapter_name"],
        subtopics=chapter["subtopics"]
    )

# ── Verification ──────────────────────────────────────────────────

def verify_answers(content, chapter, api_key):
    pq = content.get("practice_questions", [])
    checks = []
    for i, q in enumerate(pq):
        ans = q.get("answers", [""])[0]
        steps = " | ".join(q.get("steps", []))
        checks.append(f"Q{i+1}: {q['question']} Answer: {ans} Steps: {steps}")
    verify_prompt = (
        f"You are a Class 7 CBSE maths teacher checking answers for: "
        f"{chapter['chapter_name']}.\n"
        f"Reply with one line per question: 'Q1: OK' or 'Q3: FLAG correct answer is X'\n\n"
        + "\n".join(checks)
        + "\n\nOne line per question only."
    )
    try:
        response = gemini_call(verify_prompt, api_key, max_tokens=2000)
        return [l.strip() for l in response.strip().split("\n") if "FLAG" in l.upper()]
    except Exception as e:
        return [f"(Verification skipped: {e})"]

# ── Resume check ──────────────────────────────────────────────────

def already_built(chapter):
    cls  = chapter["class_num"]
    slug = chapter["chapter_slug"]
    topic = chapter["topic"]
    json_path    = os.path.join(ROOT, "data", f"class{cls}", f"{slug}.json")
    explain_path = os.path.join(ROOT, "explain", f"class{cls}", topic, f"{slug}.html")
    practice_path= os.path.join(ROOT, "practice", f"class{cls}", topic, f"{slug}.html")
    return (os.path.exists(json_path) and
            os.path.exists(explain_path) and
            os.path.exists(practice_path))

# ── Chapter generator ─────────────────────────────────────────────

def generate_chapter(chapter, api_key):
    slug = chapter["chapter_slug"]
    name = chapter["chapter_name"]
    cls  = chapter["class_num"]

    print(f"\n{'='*58}")
    print(f"  {chapter['chapter_emoji']}  {name}  (Class {cls}, Ch {chapter['chap_id']})")
    print(f"{'='*58}")

    # [1] Gemini call — on 429 wait 65s, on JSON error retry with 10s gap
    print("  [1/4] Calling Gemini...", end=" ", flush=True)
    content = None
    for attempt in range(3):
        try:
            raw = gemini_call(build_prompt(chapter), api_key)
            content = extract_json(raw)
            print("OK")
            break
        except Exception as e:
            msg = str(e)[:80]
            if attempt < 2:
                wait = 65 if is_rate_limit(e) else 10
                print(f"  retry {attempt+2}/3 ({msg}) — waiting {wait}s")
                time.sleep(wait)
            else:
                print(f"\n  ERROR: {msg}")
                return None

    if content is None:
        return None

    # [2] Validate
    print("  [2/4] Validating...", end=" ", flush=True)
    eq = content.get("explain_questions", [])
    pq = content.get("practice_questions", [])
    errors = []
    if len(eq) != 10:
        errors.append(f"explain_questions: got {len(eq)}, need 10")
    if len(pq) != 15:
        errors.append(f"practice_questions: got {len(pq)}, need 15")
    for i, q in enumerate(eq):
        if len(q.get("steps", [])) != 3:
            errors.append(f"Q{i+1} steps: {len(q.get('steps',[]))}, need 3")
        if len(q.get("nudges", [])) != 3:
            errors.append(f"Q{i+1} nudges: {len(q.get('nudges',[]))}, need 3")
    if errors:
        print("FAILED")
        for e in errors:
            print(f"    x {e}")
        return None
    print("OK")

    # [3] Anim SVGs
    print("  [3/4] Building anim SVGs...", end=" ", flush=True)
    for q in eq:
        q["anim_svg"] = make_anim_svg(
            q["id"], q.get("steps", []), q.get("answers", [""])[0])
    print("OK")

    # Build final JSON
    intro = safe_html(content.get(
        "intro_text",
        f'Hi <span class="hl" id="sName">there</span>! Let&#39;s explore {name}! \U0001f680'))
    complete = safe_html(content.get(
        "complete_message",
        f"You have mastered {name}! Keep going! \U0001f4aa"))

    final = {
        "chapter_slug":       slug,
        "chapter_name":       name,
        "chapter_emoji":      chapter["chapter_emoji"],
        "class_num":          cls,
        "board":              chapter["board"],
        "topic":              chapter["topic"],
        "chap_id":            chapter["chap_id"],
        "exam_key":           chapter["exam_key"],
        "intro_text":         intro,
        "complete_message":   complete,
        "explain_questions":  eq,
        "practice_questions": pq
    }

    # Save JSON
    out_dir = os.path.join(ROOT, "data", f"class{cls}")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{slug}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)
    print(f"  Saved to data/class{cls}/{slug}.json")

    # [4] Run generate.py
    print("  [4/4] Running generate.py...", end=" ", flush=True)
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    result = subprocess.run(
        [sys.executable, os.path.join(ROOT, "generate.py"),
         f"data/class{cls}/{slug}.json"],
        cwd=ROOT, capture_output=True, text=True,
        encoding="utf-8", env=env
    )
    if result.returncode == 0:
        print("OK")
        for line in result.stdout.strip().splitlines():
            print(f"    {line}")
    else:
        print("FAILED")
        print(result.stderr[:500])
        return None

    return content

# ── Main ──────────────────────────────────────────────────────────

def main():
    if "--class" not in sys.argv:
        print("Usage: python batch_generate.py --class 7 [--resume]")
        sys.exit(1)

    idx = sys.argv.index("--class")
    cls_arg = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else ""
    resume  = "--resume" in sys.argv

    if cls_arg == "7":
        chapters = CLASS7_CHAPTERS
    else:
        print(f"ERROR: --class {cls_arg} not supported yet (only 7).")
        sys.exit(1)

    api_key = get_api_key()

    print(f"\nRISHI Batch Generator — Class {cls_arg}")
    print(f"Chapters: {len(chapters)} | Resume: {resume}")
    print(f"Model: gemini-2.5-flash")

    all_flags = {}
    failed    = []
    succeeded = []
    skipped   = []

    for chapter in chapters:
        if resume and already_built(chapter):
            print(f"\n  [SKIP] {chapter['chapter_name']} — already built")
            skipped.append(chapter["chapter_name"])
            continue

        content = generate_chapter(chapter, api_key)
        if content is None:
            failed.append(chapter["chapter_name"])
        else:
            succeeded.append(chapter["chapter_name"])
            print("  [Verifying answers]...", end=" ", flush=True)
            flags = verify_answers(content, chapter, api_key)
            if flags:
                all_flags[chapter["chapter_name"]] = flags
                print(f"  {len(flags)} item(s) flagged")
            else:
                print("  All OK")

        # Wait between chapters to avoid rate limits
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
        print("\n  Fix flagged items in the JSON before pushing.")
    else:
        print("\n  All answers verified — nothing flagged.")

    if succeeded or skipped:
        print(f"\n  Next steps:")
        print("    cd D:\\rishi")
        print("    git add .")
        print('    git commit -m "Class 7 all chapters generated"')
        print("    git push")

if __name__ == "__main__":
    main()
