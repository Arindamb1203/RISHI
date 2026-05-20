#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RISHI — ICSE Class 7 Master Builder
Generates all 22 ICSE Class 7 chapters via OpenAI.
Textbook: Selina Concise Mathematics Class 7

Usage:
  python build_icse_class7.py --all
  python build_icse_class7.py --chapter integers
  python build_icse_class7.py --list
  python build_icse_class7.py --estimate

Flags (combine with above):
  --skip-explain    Skip explain page generation
  --skip-practice   Skip practice page generation
  --skip-exam       Skip exam JSON generation

Run from: D:\\rishi\\public\\
"""

import os, sys, json, re, time, argparse, subprocess, shutil, html
from pathlib import Path
from datetime import datetime

# ── AUTO-INSTALL ─────────────────────────────────────────────────
def ensure_packages():
    for pkg in ['openai']:
        try:
            __import__(pkg)
        except ImportError:
            print(f"Installing {pkg}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg, '--quiet'])
ensure_packages()
from openai import OpenAI

# ── PATHS ─────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT  = SCRIPT_DIR.parent

EXPLAIN_TEMPLATE  = SCRIPT_DIR / 'explain'  / 'class7' / 'arithmetic' / 'working-with-fractions.html'
PRACTICE_TEMPLATE = SCRIPT_DIR / 'practice' / 'class8' / 'algebra'    / 'factorisation.html'

OPENAI_MODEL = 'gpt-4.1-mini'

# ── CHAPTER MANIFEST (Selina Concise Mathematics Class 7, ICSE) ───
CHAPTERS = [
    # ── ARITHMETIC ──────────────────────────────────────────────
    {'id':1,  'ch':'ch01', 'slug':'integers',               'name':'Integers',
     'topic':'arithmetic', 'emoji':'➕',
     'concepts':'Addition, subtraction, multiplication and division of integers; '
                'properties (closure, commutative, associative, distributive); '
                'absolute value; ordering on number line; BODMAS with integers'},

    {'id':2,  'ch':'ch02', 'slug':'rational-numbers',        'name':'Rational Numbers',
     'topic':'arithmetic', 'emoji':'🔢',
     'concepts':'Definition and representation on number line; standard form; '
                'comparison of rational numbers; operations (+,-,*,/) with rational '
                'numbers; properties; rational numbers between two rationals'},

    {'id':3,  'ch':'ch03', 'slug':'fractions',               'name':'Fractions',
     'topic':'arithmetic', 'emoji':'1/2',
     'concepts':'Types of fractions (proper, improper, mixed); equivalent fractions; '
                'lowest terms; comparison; addition, subtraction, multiplication, '
                'division of fractions; fraction of a quantity; word problems'},

    {'id':4,  'ch':'ch04', 'slug':'decimal-fractions',       'name':'Decimal Fractions',
     'topic':'arithmetic', 'emoji':'.',
     'concepts':'Place value in decimals; converting fractions to decimals and back; '
                'operations (+,-,*,/) with decimals; rounding off; significant figures; '
                'word problems involving money and measurement'},

    {'id':5,  'ch':'ch05', 'slug':'exponents',               'name':'Exponents',
     'topic':'arithmetic', 'emoji':'⬆️',
     'concepts':'Laws of exponents: a^m x a^n = a^(m+n), a^m / a^n = a^(m-n), '
                '(a^m)^n = a^(mn), a^0 = 1, a^1 = a, (ab)^n = a^n b^n; '
                'negative exponents; scientific notation; standard form'},

    {'id':6,  'ch':'ch06', 'slug':'ratio-and-proportion',    'name':'Ratio and Proportion',
     'topic':'arithmetic', 'emoji':'⚖️',
     'concepts':'Ratio, equivalent ratios, simplest form; proportion; '
                'continued proportion; mean proportional; fourth proportional; '
                'word problems; comparison of ratios'},

    {'id':7,  'ch':'ch07', 'slug':'unitary-method',          'name':'Unitary Method',
     'topic':'arithmetic', 'emoji':'1️⃣',
     'concepts':'Direct variation (more-more, less-less); inverse variation '
                '(more-less, less-more); applying unitary method to real-life '
                'problems involving speed, wages, work, pipes'},

    {'id':8,  'ch':'ch08', 'slug':'percent-and-percentage',  'name':'Percent and Percentage',
     'topic':'arithmetic', 'emoji':'%',
     'concepts':'Percent as fraction and decimal; percentage of a quantity; '
                'expressing one quantity as percent of another; percentage increase '
                'and decrease; finding original value; word problems'},

    {'id':9,  'ch':'ch09', 'slug':'profit-loss-discount',    'name':'Profit, Loss and Discount',
     'topic':'arithmetic', 'emoji':'💰',
     'concepts':'Cost price, selling price, profit and loss; profit% and loss% '
                'on CP; marked price, discount, discount%; finding SP/CP/MP; '
                'successive discounts; VAT (value added tax) basics'},

    {'id':10, 'ch':'ch10', 'slug':'simple-interest',         'name':'Simple Interest',
     'topic':'arithmetic', 'emoji':'🏦',
     'concepts':'Principal, rate, time, simple interest (SI = PTR/100); '
                'finding amount; finding P, T or R when SI is given; '
                'word problems; comparison of interest amounts'},

    {'id':11, 'ch':'ch11', 'slug':'set-concepts',            'name':'Set Concepts',
     'topic':'arithmetic', 'emoji':'🔵',
     'concepts':'Set definition and notation; roster and set-builder form; '
                'types of sets (empty, singleton, finite, infinite, universal, equal, '
                'equivalent); Venn diagrams; union (∪), intersection (∩), complement, '
                'difference (A-B); cardinal number; De Morgan\'s laws (basic)'},

    # ── ALGEBRA ─────────────────────────────────────────────────
    {'id':12, 'ch':'ch12', 'slug':'fundamental-concepts',    'name':'Fundamental Concepts',
     'topic':'algebra',    'emoji':'🔤',
     'concepts':'Variables and constants; algebraic expressions; terms, coefficient, '
                'degree; like and unlike terms; addition and subtraction of expressions; '
                'algebraic identities: (a+b)^2, (a-b)^2, (a+b)(a-b); substitution; '
                'value of an expression'},

    {'id':13, 'ch':'ch13', 'slug':'simple-linear-equations', 'name':'Simple Linear Equations',
     'topic':'algebra',    'emoji':'=',
     'concepts':'Equation vs expression; LHS and RHS; solution/root; '
                'solving equations using transposition and balancing method; '
                'equations with fractions; word problems (age, number, geometry)'},

    # ── GEOMETRY ────────────────────────────────────────────────
    {'id':14, 'ch':'ch14', 'slug':'lines-and-angles',        'name':'Lines and Angles',
     'topic':'geometry',   'emoji':'📐',
     'concepts':'Types of angles; adjacent, complementary, supplementary, '
                'vertically opposite angles; transversal cutting parallel lines; '
                'corresponding angles, alternate interior angles, co-interior angles; '
                'conditions for parallel lines; angle sum property of a straight line'},

    {'id':15, 'ch':'ch15', 'slug':'triangles',               'name':'Triangles',
     'topic':'geometry',   'emoji':'🔺',
     'concepts':'Classification (scalene, isosceles, equilateral; acute, right, obtuse); '
                'angle sum property (180°); exterior angle theorem; '
                'inequalities in triangles (larger angle opposite longer side); '
                'sum of two sides > third side'},

    {'id':16, 'ch':'ch16', 'slug':'pythagoras-theorem',      'name':'Pythagoras Theorem',
     'topic':'geometry',   'emoji':'📏',
     'concepts':'Statement and proof of Pythagoras theorem; '
                'Pythagorean triplets (3-4-5, 5-12-13, 8-15-17, 7-24-25); '
                'converse of Pythagoras theorem; finding missing side; '
                'real-life applications (ladders, distance, height)'},

    {'id':17, 'ch':'ch17', 'slug':'symmetry',                'name':'Symmetry',
     'topic':'geometry',   'emoji':'🪞',
     'concepts':'Line symmetry (reflection symmetry); lines of symmetry of '
                'common shapes (equilateral triangle: 3, square: 4, rectangle: 2, '
                'circle: infinite); rotational symmetry; order of rotation and '
                'angle of rotation; figures with both types'},

    {'id':18, 'ch':'ch18', 'slug':'recognition-of-solids',   'name':'Recognition of Solids',
     'topic':'geometry',   'emoji':'🧊',
     'concepts':'3D solids: cube, cuboid, cylinder, cone, sphere, prism, pyramid; '
                'faces, edges, vertices; Euler\'s formula (F + V - E = 2); '
                'nets of solids; cross-sections; real-life identification'},

    {'id':19, 'ch':'ch19', 'slug':'congruent-triangles',     'name':'Congruent Triangles',
     'topic':'geometry',   'emoji':'🔄',
     'concepts':'Congruence of plane figures; congruence criteria: SSS, SAS, ASA (AAS), '
                'RHS; CPCT (corresponding parts of congruent triangles); '
                'proving triangles congruent; applications in proofs'},

    # ── MENSURATION ─────────────────────────────────────────────
    {'id':20, 'ch':'ch20', 'slug':'mensuration',             'name':'Mensuration',
     'topic':'mensuration','emoji':'📐',
     'concepts':'Perimeter and area: rectangle (2(l+b), l*b), square (4s, s^2), '
                'triangle (sum of sides, half*b*h), parallelogram (2(a+b), b*h), '
                'rhombus, trapezium (half*(a+b)*h); '
                'circumference (2πr) and area (πr^2) of circle; '
                'area of combined (composite) figures; unit conversion'},

    # ── DATA HANDLING ────────────────────────────────────────────
    {'id':21, 'ch':'ch21', 'slug':'data-handling',           'name':'Data Handling',
     'topic':'data-handling','emoji':'📊',
     'concepts':'Raw data, array, frequency distribution; tally marks; '
                'bar graphs (horizontal and vertical); pie charts (calculating '
                'angles); mean (arithmetic average); median; mode; range; '
                'reading and interpreting data from graphs'},

    {'id':22, 'ch':'ch22', 'slug':'probability',             'name':'Probability',
     'topic':'data-handling','emoji':'🎲',
     'concepts':'Random experiment; sample space; outcomes; events; '
                'P(E) = number of favourable outcomes / total outcomes; '
                'probability scale (0 to 1); certain, impossible, equally likely events; '
                'simple probability problems (coins, dice, cards, coloured balls)'},
]

# ── OUTPUT PATH FUNCTIONS ─────────────────────────────────────────
def explain_out(ch):
    return SCRIPT_DIR / 'explain' / 'icse' / 'class7' / ch['topic'] / f"{ch['slug']}.html"

def practice_out(ch):
    return SCRIPT_DIR / 'practice' / 'icse' / 'class7' / ch['topic'] / f"{ch['slug']}.html"

def exam_out(ch):
    return SCRIPT_DIR / 'data' / 'icse' / 'class7' / ch['ch'] / f"{ch['ch']}-exam.json"

# ── UTILITIES ─────────────────────────────────────────────────────
def log(msg, level='INFO'):
    icons = {'INFO':'  ','OK':'OK','WARN':'!!','ERR':'XX','WORK':'..'}
    print(f"[{icons.get(level,'  ')}] {msg}", flush=True)

def fail(msg):
    log(msg, 'ERR')
    sys.exit(1)

def backup_if_exists(path):
    if path.exists():
        shutil.copy2(path, str(path) + '.bak')

def validate_setup():
    if not EXPLAIN_TEMPLATE.exists():
        fail(f"Explain template missing:\n    {EXPLAIN_TEMPLATE}")
    if not PRACTICE_TEMPLATE.exists():
        fail(f"Practice template missing:\n    {PRACTICE_TEMPLATE}")
    for ch in CHAPTERS:
        explain_out(ch).parent.mkdir(parents=True, exist_ok=True)
        practice_out(ch).parent.mkdir(parents=True, exist_ok=True)
        exam_out(ch).parent.mkdir(parents=True, exist_ok=True)
    log("Output folders ready", 'OK')

def get_client():
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        fail("OPENAI_API_KEY not set.\n"
             "  In PowerShell run:\n"
             "    $env:OPENAI_API_KEY='sk-...'")
    return OpenAI(api_key=key)

def call_openai(client, system_prompt, user_prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model=OPENAI_MODEL,
                response_format={'type':'json_object'},
                messages=[
                    {'role':'system','content':system_prompt},
                    {'role':'user',  'content':user_prompt},
                ],
                temperature=0.4,
            )
            return json.loads(resp.choices[0].message.content)
        except Exception as e:
            log(f"OpenAI attempt {attempt+1} failed: {e}", 'WARN')
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                raise

# ═══════════════════════════════════════════════════════════════
# VISUAL ANIMATION SVG EXAMPLES  (per chapter/topic)
# ═══════════════════════════════════════════════════════════════
def _q(s):
    """Escape double quotes for embedding SVG inside a JSON string in a Python prompt."""
    return s.replace('"', '\\"')

def _number_line_ticks(v_min, v_max, scale=18, cx=210, y=95):
    """Return SVG tick marks + labels for a number line."""
    out = []
    for v in range(v_min, v_max + 1):
        x = cx + v * scale
        if x < 25 or x > 400: continue
        if v == 0:
            out.append(f'<line x1="{x}" y1="87" x2="{x}" y2="103" stroke="#5a4a30" stroke-width="2.5"/>')
            out.append(f'<text x="{x}" y="116" text-anchor="middle" font-size="10" fill="#5a4a30" font-weight="800">0</text>')
        else:
            out.append(f'<line x1="{x}" y1="90" x2="{x}" y2="100" stroke="#5a4a30" stroke-width="1.5"/>')
            out.append(f'<text x="{x}" y="113" text-anchor="middle" font-size="9" fill="#8a7a5a">{v}</text>')
    return ''.join(out)

def _number_line_base(v_min=-8, v_max=8, scale=18, cx=210, y=95):
    """Return SVG for number line axis + ticks."""
    x1 = max(20, cx + v_min * scale - 5)
    x2 = min(400, cx + v_max * scale + 5)
    return (f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="#5a4a30" stroke-width="2"/>'
            f'<polygon points="{x2},{y-4} {x2+8},{y} {x2},{y+4}" fill="#5a4a30"/>'
            + _number_line_ticks(v_min, v_max, scale, cx, y))

def _circle_at(v, label, color, scale=18, cx=210, cy=95, r=11):
    x = cx + v * scale
    return (f'<circle cx="{x}" cy="{cy}" r="{r}" fill="{color}" stroke="white" stroke-width="2.5"/>'
            f'<text x="{x}" y="{cy+4}" text-anchor="middle" font-size="10" fill="white" font-weight="900">{label}</text>')

def _arc_arrow(x1, x2, y=95, arc_height=40, color="#b85c2a"):
    """Curved arc arrow from x1 to x2 above the number line."""
    mid_x = (x1 + x2) / 2
    mid_y = y - arc_height
    # arrowhead at x2
    arr = f'<polygon points="{x2},{y-10} {x2-6},{y-20} {x2+6},{y-20}" fill="{color}"/>'
    return (f'<path d="M {x1} {y-10} Q {mid_x} {mid_y} {x2} {y-10}" '
            f'stroke="{color}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
            + arr)

def _ans_box(text, qid):
    return (f'<g id="{qid}ans" opacity="0">'
            f'<rect x="110" y="148" width="200" height="26" rx="8" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2"/>'
            f'<text x="210" y="165" text-anchor="middle" font-family="Share Tech Mono" font-size="12" font-weight="bold" fill="#7a8c6e">{text}</text>'
            f'</g>')

def anim_example_integers(prefix='q'):
    """Number line example: 7 + (−3) = 4  (for both explain q1 and practice p1)."""
    qid = f'{prefix}1'
    scale, cx, cy = 18, 210, 95
    base = _number_line_base(-8, 8, scale, cx, cy)
    x7  = cx + 7  * scale   # 336
    x4  = cx + 4  * scale   # 282
    mid = (x7 + x4) / 2     # 309

    s0 = (f'<g id="{qid}s0" opacity="0">'
          + base
          + _circle_at(7, '+7', '#c8922a', scale, cx, cy)
          + f'<text x="210" y="38" text-anchor="middle" font-size="12" fill="#5a4a30" font-weight="800">Find: 7 + (&minus;3)</text>'
          + f'<text x="210" y="57" text-anchor="middle" font-size="10" fill="#8a7a5a">Mark +7 on the number line</text>'
          + f'</g>')

    s1 = (f'<g id="{qid}s1" opacity="0">'
          + _arc_arrow(x7, x4, cy, 38)
          + f'<text x="{mid}" y="{cy-44}" text-anchor="middle" font-size="13" fill="#b85c2a" font-weight="900">&minus;3</text>'
          + f'<text x="210" y="148" text-anchor="middle" font-size="11" fill="#b85c2a" font-weight="700">Move 3 steps LEFT (subtract 3)</text>'
          + f'</g>')

    s2 = (f'<g id="{qid}s2" opacity="0">'
          + _circle_at(4, '4', '#7a8c6e', scale, cx, cy)
          + f'<text x="210" y="165" text-anchor="middle" font-size="12" fill="#7a8c6e" font-weight="800">Land on +4 &#10003;</text>'
          + f'</g>')

    ans = _ans_box('7 + (&minus;3) = 4', qid)
    return _q(s0 + s1 + s2 + ans)

def anim_example_generic(prefix='q', topic=''):
    """Improved generic visual example — large styled formula boxes with colored shapes."""
    qid = f'{prefix}1'
    # Three colored number/shape tiles showing a worked example
    s0 = (f'<g id="{qid}s0" opacity="0">'
          f'<rect x="30" y="20" width="360" height="44" rx="10" fill="#f5e6c8" stroke="#c8922a" stroke-width="2"/>'
          f'<text x="210" y="38" text-anchor="middle" font-size="13" fill="#5a4a30" font-weight="800">Given Information</text>'
          f'<text x="210" y="56" text-anchor="middle" font-size="11" fill="#8a7a5a">Write down what you know</text>'
          f'</g>')
    s1 = (f'<g id="{qid}s1" opacity="0">'
          f'<rect x="30" y="75" width="360" height="44" rx="10" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2"/>'
          f'<text x="210" y="93" text-anchor="middle" font-size="13" fill="#5a4a30" font-weight="800">Apply the Formula / Rule</text>'
          f'<text x="210" y="111" text-anchor="middle" font-size="11" fill="#8a7a5a">Show the working step</text>'
          f'</g>')
    s2 = (f'<g id="{qid}s2" opacity="0">'
          f'<rect x="60" y="128" width="300" height="32" rx="10" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2.5"/>'
          f'<text x="210" y="149" text-anchor="middle" font-size="13" fill="#7a8c6e" font-weight="900">Result = answer</text>'
          f'</g>')
    ans = _ans_box('answer', qid)
    return _q(s0 + s1 + s2 + ans)

def anim_example_for_chapter(ch, prefix='q'):
    """Return the best visual anim_svg example for this chapter."""
    ch_id = ch['id']
    topic = ch.get('topic', '')
    if ch_id == 1:   # Integers
        return anim_example_integers(prefix)
    elif ch_id == 2: # Rational Numbers — number line
        return anim_example_integers(prefix)  # same number line visual
    else:
        return anim_example_generic(prefix, topic)

# ═══════════════════════════════════════════════════════════════
# EXPLAIN GENERATION
# ═══════════════════════════════════════════════════════════════
EXPLAIN_SYS = """You create explain page content for RISHI, an ICSE Class 7 maths tutoring app for Indian students aged 12-13.
Textbook: Selina Concise Mathematics Class 7 (ICSE).
Tutor character: RISHIKA only (never Rekha).
OUTPUT: valid JSON only, no markdown, no extra text.
RULES:
- Simple language, Indian context (rupees, cricket, mithai, school, etc.)
- ICSE/Selina terminology and notation
- q/cq: display text. Use HTML entities (&times; &divide; &sup2; &minus; &frac12; &rarr;) and <span class='hl'>X</span> or <span class='ans-tag'>X</span>
- qs/cqs/s fields: speech text only — spell out all symbols
- anim_svg: SVG viewBox 0 0 420 178. MUST use VISUAL OBJECTS (shapes, lines, circles, arrows, number lines, bars, grids) NOT plain text labels. See the visual example below.
- For Integers/Rationals: draw a number line (horizontal line at y=95, ticks with labels, colored circles at number positions, arc arrows for add/subtract operations)
- Each question: 3 step groups (id=QIDsN, opacity=0) + 1 answer group (id=QIDans, opacity=0). JavaScript fades them in with voice.
- NO smart apostrophes — use straight apostrophe (') only"""

def build_explain_user(ch):
    anim_ex = anim_example_for_chapter(ch, 'q')
    return f"""Chapter: {ch['name']} | Topic: {ch['topic']}
Concepts: {ch['concepts']}

Generate EXACTLY 10 questions (id q1..q10), easy to medium, each on a different concept.
The anim_svg for EVERY question must show VISUAL objects matching the chapter topic.
For Integers: use a number line with circles at positions and arc arrows for operations — adapt the numbers for each actual question.

VISUAL anim_svg example for q1 (follow this style for ALL questions, adapting numbers/shapes):
"anim_svg": "{anim_ex}"

Full JSON structure to output:
{{
  "title": "{ch['name']}",
  "topbar_label": "{ch['emoji']} {ch['name']}",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika! Today we explore <span class=\\"hl\\">{ch['name']}</span>! {ch['emoji']} Let&#39;s begin!",
  "questions": [
    {{
      "id": "q1",
      "q": "display question",
      "qs": "speech question",
      "anim": "q1",
      "steps": [{{"t":"step 1 display","s":"step 1 speech"}},{{"t":"step 2 display","s":"step 2 speech"}},{{"t":"step 3 display","s":"step 3 speech"}}],
      "cq": "follow-up display",
      "cqs": "follow-up speech",
      "ans": ["answer1","answer2"],
      "nudges": ["hint1","hint2","direct hint"],
      "anim_svg": "(visual SVG matching the example style above, adapted for this question's numbers)"
    }}
  ]
}}"""

def gen_explain(client, ch):
    data = call_openai(client, EXPLAIN_SYS, build_explain_user(ch))
    if len(data.get('questions', [])) < 8:
        raise ValueError(f"Only {len(data.get('questions',[]))} explain questions returned")
    for q in data.get('questions', []):
        if len(q.get('steps', [])) > 3:
            q['steps'] = q['steps'][:3]
        q['ans'] = [html.unescape(a) for a in q.get('ans', [])]
    return data

# ═══════════════════════════════════════════════════════════════
# PRACTICE GENERATION
# ═══════════════════════════════════════════════════════════════
PRACTICE_SYS = """You create PRACTICE problems for RISHI ICSE Class 7 maths app.
Textbook: Selina Concise Mathematics Class 7 (ICSE).
Tutor character: RISHIKA only. OUTPUT: valid JSON only.
Practice is harder than explain — student already knows the concept.
Mix computation + 2-3 Indian-context word problems.
anim_svg: SVG viewBox 0 0 420 178. MUST use VISUAL OBJECTS (number lines, circles, arrows, bars, shapes) — NOT plain text labels.
For Integers/Rationals: number line with colored circles at positions and arc arrows for operations.
NO smart apostrophes — use straight apostrophe (') only."""

def build_practice_user(ch):
    anim_ex = anim_example_for_chapter(ch, 'p')
    return f"""Chapter: {ch['name']} | Topic: {ch['topic']}
Concepts: {ch['concepts']}

Generate EXACTLY 10 practice problems (id p1..p10). Mix: 7-8 skill + 2-3 word problems.
The anim_svg for EVERY question must show VISUAL objects. For Integers: number line with circles and arc arrows. Adapt the numbers for each actual question.

VISUAL anim_svg example for p1:
"anim_svg": "{anim_ex}"

Full JSON structure:
{{
  "title": "{ch['name']}",
  "topbar_label": "{ch['emoji']} {ch['name']}",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika! Let&#39;s practice <span class=\\"hl\\">{ch['name']}</span>! {ch['emoji']} Let&#39;s go!",
  "questions": [
    {{
      "id": "p1",
      "q": "display question",
      "qs": "speech question",
      "anim": "p1",
      "steps": [{{"t":"step 1 display","s":"step 1 speech"}},{{"t":"step 2 display","s":"step 2 speech"}},{{"t":"step 3 display","s":"step 3 speech"}}],
      "cq": "follow-up display",
      "cqs": "follow-up speech",
      "ans": ["answer1","answer2"],
      "nudges": ["hint1","hint2","direct hint"],
      "anim_svg": "(visual SVG matching the example style above, adapted for this question's numbers)"
    }}
  ]
}}"""

def gen_practice(client, ch):
    data = call_openai(client, PRACTICE_SYS, build_practice_user(ch))
    if len(data.get('questions', [])) < 8:
        raise ValueError(f"Only {len(data.get('questions',[]))} practice questions returned")
    for q in data.get('questions', []):
        if len(q.get('steps', [])) > 3:
            q['steps'] = q['steps'][:3]
        q['ans'] = [html.unescape(a) for a in q.get('ans', [])]
    return data

# ═══════════════════════════════════════════════════════════════
# EXAM JSON GENERATION
# ═══════════════════════════════════════════════════════════════
EXAM_SYS = """You generate ICSE exam questions for Class 7 mathematics.
Textbook: Selina Concise Mathematics Class 7.
OUTPUT: valid JSON only. No markdown.
- Math must be 100% accurate for Class 7 (age 12-13)
- Use Indian number system (lakhs, crores) where relevant
- Distractors must be plausible (common student mistakes)
- Difficulty: easy=recall/simple computation, medium=application, hard=multi-step/HOTS"""

def gen_sec_A(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 7, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 20 conceptual MCQs for Section A (1 mark each). Difficulty: 14 easy, 6 medium.
Output JSON:
{{"questions":[{{"id":"icse_7_{ch['ch']}_A_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","difficulty":"easy","explanation":"..."}}]}}
IDs: icse_7_{ch['ch']}_A_001 to icse_7_{ch['ch']}_A_020"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 18: raise ValueError(f"Sec A: got {len(qs)}/20")
    return qs[:20]

def gen_sec_B(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 7, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 10 application/word-problem MCQs for Section B (2 marks each). All medium. Indian real-life contexts.
Output JSON:
{{"questions":[{{"id":"icse_7_{ch['ch']}_B_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"c","difficulty":"medium","explanation":"..."}}]}}
IDs: icse_7_{ch['ch']}_B_001 to icse_7_{ch['ch']}_B_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 8: raise ValueError(f"Sec B: got {len(qs)}/10")
    return qs[:10]

def gen_sec_C(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 7, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 6 HOTS MCQs for Section C (3 marks each). All hard. Multi-step reasoning required.
Output JSON:
{{"questions":[{{"id":"icse_7_{ch['ch']}_C_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","difficulty":"hard","explanation":"..."}}]}}
IDs: icse_7_{ch['ch']}_C_001 to icse_7_{ch['ch']}_C_006"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 5: raise ValueError(f"Sec C: got {len(qs)}/6")
    return qs[:6]

def gen_sec_D(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 7, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 10 direct-input (short answer) questions for Section D (3 marks each). Medium-hard. Student types answer.
Output JSON:
{{"questions":[{{"id":"icse_7_{ch['ch']}_D_001","text":"...","correct_answer":"...","answer_type":"text","accepted_forms":["...","..."],"difficulty":"medium","explanation":"..."}}]}}
IDs: icse_7_{ch['ch']}_D_001 to icse_7_{ch['ch']}_D_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 8: raise ValueError(f"Sec D: got {len(qs)}/10")
    return qs[:10]

def gen_sec_E(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 7, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 2 case study questions for Section E. Each has 3 subparts (2 marks each). Indian real-life contexts.
Output JSON:
{{"questions":[{{"id":"icse_7_{ch['ch']}_E_case1","case_text":"scenario paragraph","subparts":[{{"id":"icse_7_{ch['ch']}_E_case1_q1","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","marks":2,"explanation":"..."}},{{"id":"icse_7_{ch['ch']}_E_case1_q2","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","marks":2,"explanation":"..."}},{{"id":"icse_7_{ch['ch']}_E_case1_q3","text":"...","type":"direct_input","correct_answer":"...","accepted_forms":["..."],"marks":2,"explanation":"..."}}]}}]}}
Generate 2 case studies (case1 and case2) with 3 subparts each."""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 2: raise ValueError(f"Sec E: got {len(qs)}/2 case studies")
    return qs[:2]

def gen_exam(client, ch):
    log("  Sec A -- 20 Conceptual MCQs", 'WORK')
    sec_a = gen_sec_A(client, ch)
    log("  Sec B -- 10 Application MCQs", 'WORK')
    sec_b = gen_sec_B(client, ch)
    log("  Sec C -- 6 Higher Order MCQs", 'WORK')
    sec_c = gen_sec_C(client, ch)
    log("  Sec D -- 10 Direct Input", 'WORK')
    sec_d = gen_sec_D(client, ch)
    log("  Sec E -- 2 Case Studies", 'WORK')
    sec_e = gen_sec_E(client, ch)

    marks = (len(sec_a)*1 + len(sec_b)*2 + len(sec_c)*3 + len(sec_d)*3 +
             sum(sum(sp.get('marks', 2) for sp in q.get('subparts', [])) for q in sec_e))

    return {
        "meta": {
            "board": "icse", "class": 7,
            "chapter_id": ch['ch'], "chapter_name": ch['name'],
            "topic_group": ch['topic'],
            "textbook": "Selina Concise Mathematics Class 7",
            "total_marks": marks,
            "generated": datetime.now().strftime("%Y-%m"),
            "version": 1
        },
        "sections": {
            "A": {"type":"mcq",          "label":"Conceptual",   "marks_per_q":1, "questions":sec_a},
            "B": {"type":"mcq",          "label":"Application",  "marks_per_q":2, "questions":sec_b},
            "C": {"type":"mcq",          "label":"Higher Order", "marks_per_q":3, "questions":sec_c},
            "D": {"type":"direct_input", "label":"Numerical",    "marks_per_q":3, "questions":sec_d},
            "E": {"type":"case_study",   "label":"Case Study",   "marks_per_q":2, "questions":sec_e},
        }
    }

# ═══════════════════════════════════════════════════════════════
# TEMPLATE INJECTION
# ═══════════════════════════════════════════════════════════════
def build_qb(questions):
    items = []
    for q in questions:
        s  = '{\n'
        s += f'id:{json.dumps(q["id"])},\n'
        s += f'q:{json.dumps(q["q"],ensure_ascii=False)},\n'
        s += f'qs:{json.dumps(q["qs"],ensure_ascii=False)},\n'
        s += f'anim:{json.dumps(q["anim"])},\n'
        s += f'steps:{json.dumps(q["steps"],ensure_ascii=False)},\n'
        s += f'cq:{json.dumps(q["cq"],ensure_ascii=False)},\n'
        s += f'cqs:{json.dumps(q["cqs"],ensure_ascii=False)},\n'
        s += f'ans:{json.dumps(q["ans"],ensure_ascii=False)},\n'
        s += f'nudges:{json.dumps(q["nudges"],ensure_ascii=False)},\n'
        s += f'anim_svg:{json.dumps(q["anim_svg"],ensure_ascii=False)}\n'
        s += '}'
        items.append(s)
    return 'var QB=[\n' + ',\n'.join(items) + '\n];'

def build_svgs(questions):
    entries = [f'{json.dumps(q["anim"])}:base+{json.dumps(q["anim_svg"],ensure_ascii=False)}'
               for q in questions]
    return 'var svgs={\n' + ',\n'.join(entries) + '\n};'

def inject(template, ch, ai_data):
    out = template
    # Board + class
    out = re.sub(r'<meta name="rishi-board" content="[^"]*">',
                 '<meta name="rishi-board" content="icse">', out)
    out = re.sub(r'<meta name="rishi-class" content="\d+">',
                 '<meta name="rishi-class" content="7">', out)
    # Title + topbar
    out = re.sub(r'<title>RISHI[^<]*</title>',
                 f'<title>RISHI — {ai_data["title"]}</title>', out)
    # Practice template title format: "Practice – Factorisation | RISHI"
    out = re.sub(r'<title>Practice[^<]*</title>',
                 f'<title>Practice – {ai_data["title"]} | RISHI</title>', out)
    # Left panel chapter number and name (practice template only)
    out = re.sub(r'(<div class="lp-chapter">)Chapter \d+(</div>)',
                 f'\\g<1>Chapter {ch["id"]}\\g<2>', out, count=1)
    out = re.sub(r'(<div class="lp-title">)[^<]*(</div>)',
                 f'\\g<1>{ch["name"]}\\g<2>', out, count=1)
    out = re.sub(r'(<div class="topbar-center">)[^<]*(</div>)',
                 lambda m: m.group(1) + ai_data['topbar_label'] + m.group(2),
                 out, count=1)
    # Intro text
    out = re.sub(r'(<div class="rishika-text" id="introText">)(.*?)(</div>)',
                 lambda m: m.group(1) + '\n        ' + ai_data['intro'] + '\n      ' + m.group(3),
                 out, flags=re.DOTALL, count=1)
    # QB block
    out, n = re.subn(r'var QB=\[.*?^\];', build_qb(ai_data['questions']),
                     out, count=1, flags=re.DOTALL | re.MULTILINE)
    if n == 0: log("QB block not replaced -- check template", 'WARN')
    # svgs block ([\s\S]*? handles semicolons inside SVG content)
    out, _ = re.subn(r'var svgs=\{[\s\S]*?\n\};', build_svgs(ai_data['questions']),
                     out, count=1)
    # CHAP_ID (practice pages) — board-qualified string avoids collision with CBSE practice keys
    out = re.sub(r'var CHAP_ID=\d+;', f"var CHAP_ID='ic7_{ch['id']}';", out, count=1)
    # ICSE pages are not gated by the CBSE parent-plan system
    # Match both literal rishiCheckPlan(1) and template's rishiCheckPlan(CHAP_ID)
    out = re.sub(r'rishiCheckPlan\([^)]+\);', '', out, count=1)
    # Use board-qualified string IDs to avoid localStorage collision with CBSE chapters
    # e.g. integers (id=1) uses 'ic7_1', not 1 — so "rishi_explain_done_ic7_1" is unique
    icse_id = f"'ic7_{ch['id']}'"
    out = re.sub(
        r'(rishiIsExplainDone|rishiMarkExplainDone)\(\d+\)',
        lambda m: f"{m.group(1)}({icse_id})",
        out
    )
    # Don't auto-start lesson on page load — wait for user click (enables browser audio)
    out = out.replace(
        'initVoices(function(){startLesson();});',
        'initVoices(function(){});'
    )
    # pagehide fires on mobile/Safari when tab is backgrounded — beforeunload alone misses it
    out = out.replace(
        'window.addEventListener("beforeunload",function(){stopAllAudio();});',
        'window.addEventListener("beforeunload",function(){stopAllAudio();});window.addEventListener("pagehide",function(){stopAllAudio();});'
    )
    # Add macOS system voices to pickVoice keyword list
    out = out.replace(
        '"heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen"',
        '"heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen","moira","tessa","fiona"'
    )
    # Add autocomplete="off" so mobile keyboards don't suggest answers
    out = out.replace(
        'id="rawAnswer" class="math-raw" rows="2" placeholder=',
        'id="rawAnswer" class="math-raw" rows="2" autocomplete="off" placeholder='
    )
    # goExam gate: require practice 5-streak before exam (explain-only completes explain, not practice)
    icse_id_str = f"'ic7_{ch['id']}'"
    practice_gate = f"if(!rishiIsPracticeDone({icse_id_str})){{alert('Complete Practice with 5 in a row first!');return;}}"
    out = re.sub(
        r'(function goExam\(\)\{if\(!completed\)\{[^}]+\})(location\.href=)',
        lambda m: m.group(1) + practice_gate + m.group(2),
        out, count=1
    )
    # goPractice URL
    out = re.sub(
        r'location\.href="/practice/class7/[^"]+\.html"',
        f'location.href="/practice/icse/class7/{ch["topic"]}/{ch["slug"]}.html"',
        out, count=1
    )
    # goExam URL
    out = re.sub(
        r'location\.href="/exam\.html\?ch=c7-[^"]+"',
        f'location.href="/exam.html?ch=ic7-{ch["id"]:02d}"',
        out, count=1
    )
    # Fix confirmShown: not declared → follow-up question silently skipped after q1
    out = re.sub(
        r'(completed=false,)(breakSecs)',
        r'\1confirmShown=false,\2',
        out, count=1
    )
    # Fix confirmShown: not reset between questions → goNext never clears it
    out = re.sub(
        r'(function goNext\(\)\{)(idx\+\+)',
        r'\1confirmShown=false;\2',
        out, count=1
    )
    # Fix completion message (template hardcodes "Working with Fractions")
    out = re.sub(
        r"You&#39;ve mastered [^<]+!",
        f"You&#39;ve mastered {ch['name']}!",
        out, count=1
    )
    # Replace makeAnimPlay with TTS-chained version. CBSE template uses fixed timers
    # with no say() in animation. ICSE needs each step to wait for TTS to complete
    # (onEnd callback) before the next step fades in. Generation counter invalidates
    # stale callbacks when the user hits Replay before the sequence finishes.
    out = out.replace(
        'function makeAnimPlay(id,steps,ansLabel){return function(done){setStatus("Solving step by step...");var delay=600;steps.forEach(function(_,i){var d=delay+i*2800;(function(ii,dd){at(dd,function(){fade(id+"s"+ii,1);});})( i,d);});at(delay+steps.length*2800,function(){fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);});}; }',
        'function makeAnimPlay(id,steps,ansLabel){var gen=0;return function(done){var myGen=++gen;setStatus("Solving step by step...");function playStep(i){if(myGen!==gen)return;if(i>=steps.length){at(400,function(){if(myGen!==gen)return;fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);});return;}at(i===0?600:400,function(){if(myGen!==gen)return;fade(id+"s"+i,1);say(steps[i].s,function(){playStep(i+1);});});}playStep(0);}; }'
    )
    # nextStep: replace fixed 3.5s timer with TTS-chained auto-advance
    out = out.replace(
        "setTimeout(function(){d.classList.add(\"vis\");},40);setTimeout(nextStep,3500);stepIdx++;}",
        "setTimeout(function(){d.classList.add(\"vis\");},40);stepIdx++;say(s.s||s.t.replace(/<[^>]*>/g,\"\"),function(){if(myGen===nsGen)nextStep();});}"
    )
    out = out.replace(
        "function nextStep(){var q=session[idx];",
        "var nsGen=0;function nextStep(){var myGen=++nsGen;var q=session[idx];"
    )
    # Back button — point to ICSE syllabus, not CBSE
    out = out.replace(
        "location.href='/syllabus.html'",
        "location.href='/syllabus.html?board=icse&class=7'"
    )
    return out

# ═══════════════════════════════════════════════════════════════
# CHAPTER BUILD
# ═══════════════════════════════════════════════════════════════
def build_chapter(client, ch, do_explain, do_practice, do_exam):
    print()
    log(f"Ch {ch['id']:>2}/22 -- {ch['name']}", 'WORK')
    t0 = time.time()
    ex_tmpl = EXPLAIN_TEMPLATE.read_text(encoding='utf-8')
    pr_tmpl = PRACTICE_TEMPLATE.read_text(encoding='utf-8')

    if do_explain:
        log("Generating explain...", 'WORK')
        data = gen_explain(client, ch)
        out  = explain_out(ch)
        backup_if_exists(out)
        out.write_text(inject(ex_tmpl, ch, data), encoding='utf-8')
        log(f"explain/icse/class7/{ch['topic']}/{ch['slug']}.html", 'OK')

    if do_practice:
        log("Generating practice...", 'WORK')
        data = gen_practice(client, ch)
        out  = practice_out(ch)
        backup_if_exists(out)
        out.write_text(inject(pr_tmpl, ch, data), encoding='utf-8')
        log(f"practice/icse/class7/{ch['topic']}/{ch['slug']}.html", 'OK')

    if do_exam:
        log("Generating exam (5 sections)...", 'WORK')
        data = gen_exam(client, ch)
        out  = exam_out(ch)
        backup_if_exists(out)
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        n = sum(len(s['questions']) for s in data['sections'].values())
        log(f"data/icse/class7/{ch['ch']}/{ch['ch']}-exam.json ({n} questions, {data['meta']['total_marks']} marks)", 'OK')

    log(f"Done in {time.time()-t0:.1f}s", 'OK')

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    parser = argparse.ArgumentParser(description='RISHI ICSE Class 7 Master Builder')
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--all',      action='store_true')
    g.add_argument('--chapter',  metavar='SLUG')
    g.add_argument('--list',     action='store_true')
    g.add_argument('--estimate', action='store_true')
    parser.add_argument('--skip-explain',  action='store_true')
    parser.add_argument('--skip-practice', action='store_true')
    parser.add_argument('--skip-exam',     action='store_true')
    args = parser.parse_args()

    print()
    print('=' * 55)
    print('  RISHI ICSE Class 7 Master Builder')
    print('  Selina Concise Mathematics Class 7')
    print('=' * 55)

    if args.list:
        print()
        for c in CHAPTERS:
            print(f"  {c['id']:>2}. {c['slug']:<35} [{c['topic']}]")
        return

    if args.estimate:
        n = 1 if args.chapter else len(CHAPTERS)
        per = ((0 if args.skip_explain  else 1) +
               (0 if args.skip_practice else 1) +
               (0 if args.skip_exam     else 5))
        calls = n * per
        print(f"\n  Chapters : {n}")
        print(f"  API calls: ~{calls}")
        print(f"  Est. cost: ~${calls*0.004:.2f} USD")
        print(f"  Est. time: ~{calls*20//60} min {calls*20%60} sec")
        return

    validate_setup()
    client = get_client()
    log(f"Model: {OPENAI_MODEL}", 'OK')

    chapters = ([c for c in CHAPTERS if c['slug'] == args.chapter]
                if args.chapter else CHAPTERS)
    if args.chapter and not chapters:
        fail(f"Unknown slug: {args.chapter}\nRun --list to see valid slugs.")

    do_e = not args.skip_explain
    do_p = not args.skip_practice
    do_x = not args.skip_exam

    failures = []
    t0 = time.time()
    for ch in chapters:
        try:
            build_chapter(client, ch, do_e, do_p, do_x)
        except Exception as e:
            log(f"FAILED {ch['slug']}: {e}", 'ERR')
            failures.append(ch['slug'])

    elapsed = time.time() - t0

    print()
    print('=' * 55)
    print(f"  BUILD COMPLETE -- {elapsed/60:.1f} minutes")
    print('=' * 55)
    log(f"Success: {len(chapters)-len(failures)}/{len(chapters)}", 'OK')

    if failures:
        print()
        log("Failed chapters -- rerun individually:", 'ERR')
        for s in failures:
            print(f"  python build_icse_class7.py --chapter {s}")

    print()
    print("NEXT STEPS:")
    print("  cd D:\\rishi")
    print("  git add .")
    print('  git commit -m "ICSE Class 7: AI-generated content"')
    print("  git push")
    print()

if __name__ == '__main__':
    main()
