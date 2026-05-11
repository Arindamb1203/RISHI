#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
═══════════════════════════════════════════════════════════════
  RISHI — Class 6 Master Builder
  Generates ALL Class 6 content via OpenAI in one execution.
  
  Usage:
    python build_class6.py --all                    # Build all 10 chapters
    python build_class6.py --chapter prime-time     # Build/rebuild one chapter
    python build_class6.py --list                   # Show chapter list
    python build_class6.py --estimate               # Show cost estimate only
    
  Requirements:
    - OPENAI_API_KEY in environment variables
    - Run from D:\\rishi\\public\\ directory
    - Templates must exist at:
        explain/class7/working-with-fractions.html
        practice/class8/factorisation.html
═══════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import re
import time
import argparse
import subprocess
from pathlib import Path

# ═══════════════════════════════════════════════════════════════
# AUTO-INSTALL DEPENDENCIES
# ═══════════════════════════════════════════════════════════════
def ensure_packages():
    """Install required packages if missing."""
    required = ['openai']
    for pkg in required:
        try:
            __import__(pkg)
        except ImportError:
            print(f"📦 Installing {pkg}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg, '--quiet'])
            print(f"✅ {pkg} installed")

ensure_packages()

from openai import OpenAI

# ═══════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════
SCRIPT_DIR = Path(__file__).parent.resolve()  # D:\rishi\public\
REPO_ROOT = SCRIPT_DIR.parent                  # D:\rishi\

EXPLAIN_TEMPLATE = SCRIPT_DIR / 'explain' / 'class7' / 'working-with-fractions.html'
PRACTICE_TEMPLATE = SCRIPT_DIR / 'practice' / 'class8' / 'factorisation.html'

OUT_EXPLAIN = SCRIPT_DIR / 'explain' / 'class6'
OUT_PRACTICE = SCRIPT_DIR / 'practice' / 'class6'
OUT_DATA = SCRIPT_DIR / 'data' / 'cbse' / 'class6'

OPENAI_MODEL = 'gpt-4.1-mini'

# ═══════════════════════════════════════════════════════════════
# CLASS 6 CHAPTER MANIFEST (NCERT Ganita Prakash 2025-26)
# ═══════════════════════════════════════════════════════════════
CHAPTERS = [
    {
        'id': 1, 'slug': 'patterns-in-maths', 'name': 'Patterns in Mathematics',
        'topic': 'arithmetic', 'emoji': '🔢', 'exam_id': 'c6-01',
        'concepts': 'Number patterns, sequences (counting numbers, odd, even, square, triangular), visual patterns, recognising and extending patterns, simple rules from patterns'
    },
    {
        'id': 2, 'slug': 'lines-and-angles', 'name': 'Lines and Angles',
        'topic': 'geometry', 'emoji': '📐', 'exam_id': 'c6-02',
        'concepts': 'Points, lines, line segments, rays, angles (acute, right, obtuse, straight, reflex), measuring angles in degrees, parallel and intersecting lines, perpendicular lines'
    },
    {
        'id': 3, 'slug': 'number-play', 'name': 'Number Play',
        'topic': 'arithmetic', 'emoji': '🎲', 'exam_id': 'c6-03',
        'concepts': 'Playing with numbers, supercells, picking numbers using rules, digit sums, number puzzles, Collatz-like sequences, palindromes, magic squares basics'
    },
    {
        'id': 4, 'slug': 'data-handling-and-presentation', 'name': 'Data Handling and Presentation',
        'topic': 'data-handling', 'emoji': '📊', 'exam_id': 'c6-04',
        'concepts': 'Collecting data, organising in tally marks and tables, pictographs, bar graphs, reading and interpreting graphs, simple frequency tables'
    },
    {
        'id': 5, 'slug': 'prime-time', 'name': 'Prime Time',
        'topic': 'arithmetic', 'emoji': '⭐', 'exam_id': 'c6-05',
        'concepts': 'Factors and multiples, prime and composite numbers, prime factorisation, HCF and LCM (introductory), divisibility rules for 2, 3, 4, 5, 6, 9, 10, co-primes'
    },
    {
        'id': 6, 'slug': 'perimeter-and-area', 'name': 'Perimeter and Area',
        'topic': 'mensuration', 'emoji': '🔲', 'exam_id': 'c6-06',
        'concepts': 'Perimeter of rectangle, square, triangle, regular polygons; area of squares and rectangles by counting unit squares; area formulas; area of irregular shapes by decomposition'
    },
    {
        'id': 7, 'slug': 'fractions', 'name': 'Fractions',
        'topic': 'arithmetic', 'emoji': '½', 'exam_id': 'c6-07',
        'concepts': 'Fraction as part of whole, equivalent fractions, simplest form, comparing fractions, addition and subtraction of like and unlike fractions, mixed numbers, fraction of a collection'
    },
    {
        'id': 8, 'slug': 'playing-with-constructions', 'name': 'Playing with Constructions',
        'topic': 'geometry', 'emoji': '📏', 'exam_id': 'c6-08',
        'concepts': 'Using ruler and compass; drawing line segments of given length; constructing perpendicular bisectors, angle bisectors; constructing angles of 60°, 90°, 120°; basic shape construction (squares, equilateral triangles, regular hexagons)'
    },
    {
        'id': 9, 'slug': 'symmetry', 'name': 'Symmetry',
        'topic': 'geometry', 'emoji': '🪞', 'exam_id': 'c6-09',
        'concepts': 'Line/reflection symmetry, lines of symmetry of common shapes (square, rectangle, circle, regular polygons), rotational symmetry, order of rotational symmetry, symmetry in everyday objects'
    },
    {
        'id': 10, 'slug': 'other-side-of-zero', 'name': 'The Other Side of Zero',
        'topic': 'arithmetic', 'emoji': '⚖️', 'exam_id': 'c6-10',
        'concepts': 'Introduction to negative numbers, the integer number line, comparing integers, addition and subtraction of integers, real-life contexts (temperature, debt, elevation), opposites of integers'
    },
]

# ═══════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════
def log(msg, level='INFO'):
    icons = {'INFO': 'ℹ️ ', 'OK': '✅', 'WARN': '⚠️ ', 'ERR': '❌', 'WORK': '⚙️ '}
    print(f"{icons.get(level, '  ')} {msg}")

def fail(msg):
    log(msg, 'ERR')
    sys.exit(1)

def get_client():
    """Get OpenAI client. Validates API key."""
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        fail("OPENAI_API_KEY environment variable not set.\n"
             "   Set it in Windows: setx OPENAI_API_KEY \"your-key-here\"\n"
             "   Then RESTART your terminal.")
    return OpenAI(api_key=key)

def validate_setup():
    """Check templates exist and folders are creatable."""
    if not EXPLAIN_TEMPLATE.exists():
        fail(f"Explain template not found: {EXPLAIN_TEMPLATE}\n"
             f"   Run script from D:\\rishi\\public\\ directory.")
    if not PRACTICE_TEMPLATE.exists():
        fail(f"Practice template not found: {PRACTICE_TEMPLATE}")
    
    OUT_EXPLAIN.mkdir(parents=True, exist_ok=True)
    OUT_PRACTICE.mkdir(parents=True, exist_ok=True)
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    log(f"Output folders ready in {SCRIPT_DIR}", 'OK')

def read_template(path):
    return path.read_text(encoding='utf-8')

# ═══════════════════════════════════════════════════════════════
# OPENAI GENERATION
# ═══════════════════════════════════════════════════════════════
def call_openai(client, system_prompt, user_prompt, max_retries=3):
    """Call OpenAI with JSON mode and retries."""
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model=OPENAI_MODEL,
                response_format={'type': 'json_object'},
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt},
                ],
                temperature=0.4,
            )
            content = resp.choices[0].message.content
            return json.loads(content)
        except json.JSONDecodeError as e:
            log(f"JSON parse error (attempt {attempt+1}): {e}", 'WARN')
            if attempt == max_retries - 1:
                raise
            time.sleep(2)
        except Exception as e:
            log(f"OpenAI error (attempt {attempt+1}): {e}", 'WARN')
            if attempt == max_retries - 1:
                raise
            time.sleep(3)

# ── EXPLAIN PAGE GENERATION ──────────────────────────────────────
EXPLAIN_SYSTEM = """You are an expert NCERT Class 6 mathematics teacher creating educational content for the RISHI tutoring app. You create content for "Rishika", a friendly AI tutor character.

CRITICAL RULES:
- Output MUST be valid JSON exactly matching the schema given.
- All math must be ACCURATE and age-appropriate for Class 6 (age 11-12).
- Use SIMPLE language. Indian context (rupees, pizza, cricket, sweets, etc.).
- Use CBSE/NCERT terminology and notation.
- Speech text (qs, cqs, s) should be naturally readable aloud — spell out symbols (e.g., "5 plus 3" not "5+3").
- Display text (q, t, cq) can use HTML entities (&times;, &divide;, &sup2;, &minus;) and span tags like <span class='hl'>X</span> or <span class='ans-tag'>X</span>.
- anim_svg: simple inline SVG snippets following EXACT pattern shown in the example. Include 3 step layers (q1s0, q1s1, q1s2) and 1 answer layer (q1ans). Keep text VERY short.
- The character is "Rishika" — never "Rekha"."""

EXPLAIN_SCHEMA_EXAMPLE = '''{
  "title": "Working with Fractions",
  "topbar_label": "½ Working with Fractions",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika, and today we&#39;re going to master fractions together! 🍕 From pizza slices to recipe measurements, fractions are everywhere — let&#39;s unlock their secrets!",
  "questions": [
    {
      "id": "q1",
      "q": "What is a proper fraction? Give an example.",
      "qs": "What is a proper fraction? Give an example.",
      "anim": "q1",
      "steps": [
        {"t": "A fraction has two parts: numerator (top) and denominator (bottom).", "s": "A fraction has two parts: the numerator on top and the denominator on the bottom."},
        {"t": "A PROPER fraction: numerator is LESS than denominator.", "s": "A proper fraction is one where the numerator is less than the denominator."},
        {"t": "Example: 3/5. Here 3 (top) < 5 (bottom). So 3/5 is proper.", "s": "For example, 3 over 5. Since 3 is less than 5, it is a proper fraction."}
      ],
      "cq": "Is 7/9 a proper fraction?",
      "cqs": "Is 7 over 9 a proper fraction?",
      "ans": ["yes", "Yes", "YES"],
      "nudges": ["Compare top and bottom.", "7 is the numerator, 9 is the denominator. Which is bigger?", "7 < 9, so yes it is proper!"],
      "anim_svg": "<g id=\\"q1s0\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"28\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Fraction = numerator (top) / denominator (bottom)</text></g><g id=\\"q1s1\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"68\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Proper fraction: numerator &lt; denominator</text></g><g id=\\"q1s2\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"108\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Example: 3/5 (3 &lt; 5) → proper</text></g><g id=\\"q1ans\\" opacity=\\"0\\"><rect x=\\"40\\" y=\\"148\\" width=\\"320\\" height=\\"24\\" rx=\\"7\\" fill=\\"#eef2eb\\" stroke=\\"#6b4c2a\\" stroke-width=\\"1.5\\"/><text x=\\"210\\" y=\\"163\\" text-anchor=\\"middle\\" font-family=\\"Share Tech Mono\\" font-size=\\"12\\" font-weight=\\"bold\\" fill=\\"#7a8c6e\\">Yes, 7/9 is a proper fraction</text></g>"
    }
  ]
}'''

def gen_explain_content(client, ch):
    user_prompt = f"""Generate explain page content for this Class 6 chapter:

Chapter: {ch['name']}
Topic: {ch['topic']}
Key concepts to teach: {ch['concepts']}

Create EXACTLY 10 questions (id q1 to q10) progressing from EASY to MEDIUM difficulty.
Each question must teach a different sub-concept covering all key concepts above.
Use the SCHEMA below. Output ONLY valid JSON matching this structure (no extra text):

{EXPLAIN_SCHEMA_EXAMPLE}

Now generate for "{ch['name']}". The "topbar_label" must start with "{ch['emoji']} " then the chapter name.
The "intro" must mention Rishika and be warm, age-appropriate for Class 6, and reference the chapter topic with an emoji.
"""
    data = call_openai(client, EXPLAIN_SYSTEM, user_prompt)
    return data

# ── PRACTICE PAGE GENERATION ─────────────────────────────────────
PRACTICE_SYSTEM = """You are creating PRACTICE problems (not explanations) for NCERT Class 6 mathematics in the RISHI tutoring app.

CRITICAL RULES:
- Output MUST be valid JSON exactly matching the given schema.
- Practice questions are SLIGHTLY HARDER than explain questions — student already learned concepts.
- Mix straightforward computation with 1-2 word problems / real-life applications.
- All math accurate and age-appropriate for Class 6 (age 11-12).
- Use Indian context.
- The character is "Rishika"."""

PRACTICE_SCHEMA_EXAMPLE = '''{
  "title": "Factorisation",
  "topbar_label": "🧮 Factorisation",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! 😊 I am Rishika! Today we crack <span class=\\"hl\\">Factorisation</span> together! Let us begin! 🌟",
  "questions": [
    {
      "id": "p1",
      "q": "Factorise: <span class='hl'>4x + 8</span>",
      "qs": "Factorise 4x plus 8.",
      "anim": "p1",
      "steps": [
        {"t": "Find HCF of 4 and 8. HCF = <span class='ans-tag'>4</span>", "s": "Find the HCF of 4 and 8. The HCF is 4."},
        {"t": "Divide each term: 4x ÷ 4 = x, 8 ÷ 4 = 2", "s": "Divide each term by 4."},
        {"t": "Answer: <span class='ans-tag'>4(x + 2)</span>", "s": "So the factorised form is 4 times x plus 2."}
      ],
      "cq": "Factorise: 6x + 9",
      "cqs": "Factorise 6x plus 9.",
      "ans": ["3(2x+3)", "3(2x + 3)", "3 times 2x plus 3"],
      "nudges": ["HCF of 6 and 9 is 3. Take it outside.", "3 × what gives 6x? 3 × what gives 9?", "Answer is 3(2x + 3)!"],
      "anim_svg": "<g id=\\"p1s0\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"28\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Find HCF of coefficients</text></g><g id=\\"p1s1\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"68\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Divide each term by HCF</text></g><g id=\\"p1s2\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"108\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Write HCF outside, rest inside brackets</text></g><g id=\\"p1ans\\" opacity=\\"0\\"><rect x=\\"40\\" y=\\"148\\" width=\\"320\\" height=\\"24\\" rx=\\"7\\" fill=\\"#eef2eb\\" stroke=\\"#6b4c2a\\" stroke-width=\\"1.5\\"/><text x=\\"210\\" y=\\"163\\" text-anchor=\\"middle\\" font-family=\\"Share Tech Mono\\" font-size=\\"12\\" font-weight=\\"bold\\" fill=\\"#7a8c6e\\">3(2x + 3)</text></g>"
    }
  ]
}'''

def gen_practice_content(client, ch):
    user_prompt = f"""Generate practice page content for this Class 6 chapter:

Chapter: {ch['name']}
Topic: {ch['topic']}
Key concepts: {ch['concepts']}

Create EXACTLY 10 PRACTICE questions (ids p1 to p10).
Practice questions should TEST understanding, not teach. Mix:
- 6-7 direct skill questions (slightly harder than explain page)
- 2-3 word problems with Indian real-life context

Use the SCHEMA below. Output ONLY valid JSON:

{PRACTICE_SCHEMA_EXAMPLE}

Now generate for "{ch['name']}". The "topbar_label" must start with "{ch['emoji']} ".
"""
    data = call_openai(client, PRACTICE_SYSTEM, user_prompt)
    return data

# ── EXAM JSON GENERATION ─────────────────────────────────────────
EXAM_SYSTEM = """You generate multiple-choice exam questions for NCERT Class 6 mathematics.

CRITICAL RULES:
- Output MUST be valid JSON exactly matching schema.
- 15 MCQs total, mix of difficulties: 5 easy, 7 medium, 3 hard.
- Each question has EXACTLY 4 options.
- "correct" is 0-indexed (0, 1, 2, or 3).
- Distractors must be plausible (common mistakes), not random.
- Math accurate. Indian context where natural."""

def gen_exam_questions(client, ch):
    user_prompt = f"""Generate 15 multiple-choice exam questions for Class 6 chapter "{ch['name']}".

Topic: {ch['topic']}
Concepts: {ch['concepts']}

Output ONLY valid JSON in this exact schema:

{{
  "chapter_id": "{ch['exam_id']}",
  "chapter_name": "{ch['name']}",
  "class": 6,
  "board": "cbse",
  "questions": [
    {{
      "id": "{ch['exam_id']}-q01",
      "q": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of correct answer",
      "difficulty": "easy"
    }}
  ]
}}

Make 15 questions total (id q01 to q15). Difficulty distribution: q01-q05 easy, q06-q12 medium, q13-q15 hard."""
    data = call_openai(client, EXAM_SYSTEM, user_prompt)
    return data

# ═══════════════════════════════════════════════════════════════
# TEMPLATE INJECTION
# ═══════════════════════════════════════════════════════════════
def js_string_escape(s):
    """Escape a string for safe JS string literal."""
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

def build_qb_block(questions):
    """Convert questions list to JS QB array literal."""
    items = []
    for q in questions:
        item = '{\n'
        item += f'id:"{q["id"]}",\n'
        item += f'q:{json.dumps(q["q"], ensure_ascii=False)},\n'
        item += f'qs:{json.dumps(q["qs"], ensure_ascii=False)},\n'
        item += f'anim:"{q["anim"]}",\n'
        item += f'steps:{json.dumps(q["steps"], ensure_ascii=False)},\n'
        item += f'cq:{json.dumps(q["cq"], ensure_ascii=False)},\n'
        item += f'cqs:{json.dumps(q["cqs"], ensure_ascii=False)},\n'
        item += f'ans:{json.dumps(q["ans"], ensure_ascii=False)},\n'
        item += f'nudges:{json.dumps(q["nudges"], ensure_ascii=False)},\n'
        item += f'anim_svg:{json.dumps(q["anim_svg"], ensure_ascii=False)}\n'
        item += '}'
        items.append(item)
    return 'var QB=[\n' + ',\n'.join(items) + '\n];'

def build_svgs_block(questions):
    """Build the var svgs={...} block for getAnimSVG function."""
    entries = []
    for q in questions:
        entries.append(f'{json.dumps(q["anim"])}:base+{json.dumps(q["anim_svg"], ensure_ascii=False)}')
    return 'var svgs={\n' + ',\n'.join(entries) + '\n};'

def inject_into_template(template, ch, ai_data, page_kind):
    """Replace the variable blocks in template with chapter-specific content."""
    out = template
    
    # 1. Replace <meta name="rishi-class" content="X">
    out = re.sub(
        r'<meta name="rishi-class" content="\d+">',
        '<meta name="rishi-class" content="6">',
        out
    )
    
    # 2. Replace <title>RISHI — XXX</title>
    out = re.sub(
        r'<title>RISHI[^<]*</title>',
        f'<title>RISHI — {ai_data["title"]}</title>',
        out
    )
    
    # 3. Replace topbar-center text
    out = re.sub(
        r'(<div class="topbar-center">)[^<]*(</div>)',
        lambda m: m.group(1) + ai_data['topbar_label'] + m.group(2),
        out, count=1
    )
    
    # 4. Replace intro text in rishika-text id="introText"
    intro_pattern = re.compile(
        r'(<div class="rishika-text" id="introText">)(.*?)(</div>)',
        re.DOTALL
    )
    out = intro_pattern.sub(
        lambda m: m.group(1) + '\n        ' + ai_data['intro'] + '\n      ' + m.group(3),
        out, count=1
    )
    
    # 5. Replace var QB=[...]; block
    new_qb = build_qb_block(ai_data['questions'])
    qb_pattern = re.compile(r'var QB=\[.*?^\];', re.DOTALL | re.MULTILINE)
    out, n = qb_pattern.subn(new_qb, out, count=1)
    if n == 0:
        log(f"WARNING: Could not find QB block in {page_kind} template", 'WARN')
    
    # 6. Replace var svgs={...}; block inside getAnimSVG
    new_svgs = build_svgs_block(ai_data['questions'])
    # Match: var svgs={\n...\n};
    svgs_pattern = re.compile(r'var svgs=\{[^;]*?\n\};', re.DOTALL)
    out, n = svgs_pattern.subn(new_svgs, out, count=1)
    if n == 0:
        log(f"Note: svgs block not replaced in {page_kind} (anim_svg in QB still works)", 'WARN')
    
    return out

# ═══════════════════════════════════════════════════════════════
# CHAPTER BUILD
# ═══════════════════════════════════════════════════════════════
def build_chapter(client, ch, do_explain=True, do_practice=True, do_exam=True):
    """Build all 3 files for one chapter."""
    log(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'INFO')
    log(f"Chapter {ch['id']}: {ch['name']}", 'WORK')
    
    # Read templates fresh each chapter
    explain_tmpl = read_template(EXPLAIN_TEMPLATE)
    practice_tmpl = read_template(PRACTICE_TEMPLATE)
    
    # Generate explain
    if do_explain:
        log("Generating explain content via OpenAI...", 'WORK')
        t0 = time.time()
        explain_data = gen_explain_content(client, ch)
        log(f"Got {len(explain_data.get('questions', []))} questions in {time.time()-t0:.1f}s", 'OK')
        
        explain_html = inject_into_template(explain_tmpl, ch, explain_data, 'explain')
        out_path = OUT_EXPLAIN / f"{ch['slug']}.html"
        out_path.write_text(explain_html, encoding='utf-8')
        log(f"Wrote {out_path.relative_to(REPO_ROOT)}", 'OK')
    
    # Generate practice
    if do_practice:
        log("Generating practice content via OpenAI...", 'WORK')
        t0 = time.time()
        practice_data = gen_practice_content(client, ch)
        log(f"Got {len(practice_data.get('questions', []))} questions in {time.time()-t0:.1f}s", 'OK')
        
        practice_html = inject_into_template(practice_tmpl, ch, practice_data, 'practice')
        out_path = OUT_PRACTICE / f"{ch['slug']}.html"
        out_path.write_text(practice_html, encoding='utf-8')
        log(f"Wrote {out_path.relative_to(REPO_ROOT)}", 'OK')
    
    # Generate exam JSON
    if do_exam:
        log("Generating exam questions via OpenAI...", 'WORK')
        t0 = time.time()
        exam_data = gen_exam_questions(client, ch)
        log(f"Got {len(exam_data.get('questions', []))} MCQs in {time.time()-t0:.1f}s", 'OK')
        
        out_path = OUT_DATA / f"{ch['exam_id']}.json"
        out_path.write_text(
            json.dumps(exam_data, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
        log(f"Wrote {out_path.relative_to(REPO_ROOT)}", 'OK')

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    parser = argparse.ArgumentParser(
        description='RISHI Class 6 master builder',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--all', action='store_true', help='Build all 10 chapters')
    g.add_argument('--chapter', metavar='SLUG', help='Build/rebuild one chapter by slug')
    g.add_argument('--list', action='store_true', help='List all chapter slugs')
    g.add_argument('--estimate', action='store_true', help='Show cost estimate only')
    
    parser.add_argument('--skip-explain', action='store_true', help='Skip explain page generation')
    parser.add_argument('--skip-practice', action='store_true', help='Skip practice page generation')
    parser.add_argument('--skip-exam', action='store_true', help='Skip exam JSON generation')
    
    args = parser.parse_args()
    
    print()
    print("═" * 60)
    print("  RISHI — Class 6 Master Builder")
    print("═" * 60)
    print()
    
    if args.list:
        print("Class 6 chapters:\n")
        for ch in CHAPTERS:
            print(f"  {ch['id']:>2}. {ch['slug']:<35} {ch['name']}")
        return
    
    if args.estimate:
        n = 1 if args.chapter else len(CHAPTERS)
        calls = n * 3
        cost = calls * 0.002
        print(f"Estimate for {n} chapter(s):")
        print(f"  • OpenAI API calls: ~{calls} (gpt-4.1-mini)")
        print(f"  • Estimated cost: ~${cost:.3f} USD")
        print(f"  • Estimated time: ~{n * 1.5:.1f} minutes")
        return
    
    validate_setup()
    client = get_client()
    log(f"Using model: {OPENAI_MODEL}", 'OK')
    
    do_explain = not args.skip_explain
    do_practice = not args.skip_practice
    do_exam = not args.skip_exam
    
    # Determine chapters to build
    if args.chapter:
        target = [c for c in CHAPTERS if c['slug'] == args.chapter]
        if not target:
            fail(f"Unknown chapter: {args.chapter}\n   Run --list to see slugs.")
        chapters = target
    else:
        chapters = CHAPTERS
    
    log(f"Building {len(chapters)} chapter(s)", 'INFO')
    print()
    
    t_start = time.time()
    failures = []
    for ch in chapters:
        try:
            build_chapter(client, ch, do_explain, do_practice, do_exam)
        except Exception as e:
            log(f"FAILED chapter {ch['slug']}: {e}", 'ERR')
            failures.append((ch['slug'], str(e)))
    
    elapsed = time.time() - t_start
    print()
    print("═" * 60)
    print(f"  BUILD COMPLETE — {elapsed/60:.1f} minutes")
    print("═" * 60)
    
    success = len(chapters) - len(failures)
    log(f"Successful: {success}/{len(chapters)} chapters", 'OK' if not failures else 'WARN')
    
    if failures:
        print()
        log("Failed chapters (rerun with --chapter <slug>):", 'ERR')
        for slug, err in failures:
            print(f"   • {slug}: {err}")
    
    print()
    print("NEXT STEPS:")
    print("  1. Review a few generated files for quality.")
    print("  2. From D:\\rishi  run:")
    print("       git add .")
    print("       git commit -m \"Class 6 content batch\"")
    print("       git push")
    print("  3. Send Arindam's portal files to Claude for portal wiring:")
    print("       syllabus.html, parent.html, admin.html,")
    print("       topic-exam.html, sampurna-pariksha.html")
    print("  4. After portals wired: Admin panel → Class 6 → generate KV banks.")
    print()

if __name__ == '__main__':
    main()
