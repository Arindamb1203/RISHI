#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RISHI — ICSE Class 8 Master Builder  (Parallel)
Generates all 21 ICSE Class 8 chapters via OpenAI.
Textbook: Selina Concise Mathematics Class 8
Runs up to 5 chapters in parallel for ~5x speed.

Usage:
  python build_icse_class8.py --all --skip-exam
  python build_icse_class8.py --all
  python build_icse_class8.py --chapter rational-numbers --skip-exam
  python build_icse_class8.py --list
  python build_icse_class8.py --estimate

Flags (combine with above):
  --skip-explain    Skip explain page generation
  --skip-practice   Skip practice page generation
  --skip-exam       Skip exam JSON generation
  --workers N       Parallel workers (default 5)

Run from: D:\\rishi\\public\\
"""

import os, sys, json, re, time, argparse, subprocess, shutil, html, threading, io
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8 stdout/stderr on Windows (avoids cp1252 UnicodeEncodeError)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

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

# Use the same CBSE templates as Class 7 — inject() patches all ICSE specifics
EXPLAIN_TEMPLATE  = SCRIPT_DIR / 'explain'  / 'class7' / 'arithmetic' / 'working-with-fractions.html'
PRACTICE_TEMPLATE = SCRIPT_DIR / 'practice' / 'class8' / 'algebra'    / 'factorisation.html'

OPENAI_MODEL = 'gpt-4.1-mini'

_print_lock = threading.Lock()

# ── CHAPTER MANIFEST (Selina Concise Mathematics Class 8, ICSE) ───
CHAPTERS = [
    # ── ARITHMETIC ──────────────────────────────────────────────
    {'id':1,  'ch':'ch01', 'slug':'rational-numbers',        'name':'Rational Numbers',
     'topic':'arithmetic', 'emoji':'🔢',
     'concepts':'Rational numbers on number line; standard form; comparison; '
                'operations (+,-,×,÷) on rational numbers; properties (closure, '
                'commutative, associative, distributive); rational numbers between '
                'two rationals; absolute value'},

    {'id':2,  'ch':'ch02', 'slug':'exponents',               'name':'Exponents (Powers)',
     'topic':'arithmetic', 'emoji':'⬆️',
     'concepts':'Laws of exponents: a^m × a^n = a^(m+n), a^m ÷ a^n = a^(m-n), '
                '(a^m)^n = a^(mn), (ab)^n = a^n·b^n, a^0 = 1; negative exponents; '
                'rational exponents (a^(1/n)); standard/scientific notation; '
                'expressing large and small numbers'},

    {'id':3,  'ch':'ch03', 'slug':'squares-and-square-roots', 'name':'Squares and Square Roots',
     'topic':'arithmetic', 'emoji':'²',
     'concepts':'Perfect squares; properties of perfect squares; finding square root '
                'by prime factorisation and long division; Pythagorean triplets; '
                'square root of decimals and fractions; estimating square roots'},

    {'id':4,  'ch':'ch04', 'slug':'cubes-and-cube-roots',    'name':'Cubes and Cube Roots',
     'topic':'arithmetic', 'emoji':'³',
     'concepts':'Perfect cubes; properties of cubes; finding cube root by prime '
                'factorisation; cube roots of negative numbers; cube roots of '
                'fractions; real-life applications'},

    {'id':5,  'ch':'ch05', 'slug':'playing-with-numbers',    'name':'Playing with Numbers',
     'topic':'arithmetic', 'emoji':'🔢',
     'concepts':'Numbers in general form (e.g. 10a+b); divisibility tests: 2,3,4,5,6,7,8,9,10,11; '
                'letters for digits in number puzzles; cryptarithmetic; '
                'HCF and LCM of numbers using prime factorisation; '
                'relation between HCF, LCM and the numbers'},

    {'id':6,  'ch':'ch06', 'slug':'sets',                    'name':'Sets',
     'topic':'arithmetic', 'emoji':'🔵',
     'concepts':'Types of sets: empty, singleton, finite, infinite, universal, equal, equivalent; '
                'subsets, power set; Venn diagrams; operations: union (∪), intersection (∩), '
                'complement (A\'), difference (A-B); De Morgan\'s laws; '
                'cardinal number n(A∪B) = n(A)+n(B)-n(A∩B); word problems'},

    {'id':7,  'ch':'ch07', 'slug':'percent-and-percentage',  'name':'Percent and Percentage',
     'topic':'arithmetic', 'emoji':'%',
     'concepts':'Percent as fraction and decimal; percentage of a quantity; '
                'expressing one quantity as percent of another; percentage increase '
                'and decrease; finding original value given percentage change; '
                'word problems (income tax, sales tax, population growth)'},

    {'id':8,  'ch':'ch08', 'slug':'profit-loss-discount',    'name':'Profit, Loss and Discount',
     'topic':'arithmetic', 'emoji':'💰',
     'concepts':'Cost price, selling price, profit and loss; profit% and loss% on CP; '
                'overhead charges; marked price, discount, discount%; '
                'successive discounts; finding CP/SP/MP; '
                'VAT and GST basics; word problems'},

    {'id':9,  'ch':'ch09', 'slug':'compound-interest',       'name':'Compound Interest',
     'topic':'arithmetic', 'emoji':'🏦',
     'concepts':'Simple interest vs compound interest; CI formula: A = P(1 + r/100)^n; '
                'half-yearly and quarterly compounding; finding P, R or T; '
                'appreciation and depreciation; growth and decay problems; '
                'comparison of SI and CI'},

    {'id':10, 'ch':'ch10', 'slug':'direct-inverse-variation', 'name':'Direct and Inverse Variation',
     'topic':'arithmetic', 'emoji':'⚖️',
     'concepts':'Direct variation: y = kx, y₁/x₁ = y₂/x₂; inverse variation: xy = k; '
                'identifying type from table/graph; compound variation; '
                'time-work, speed-distance, unitary method applications; '
                'word problems involving 3+ quantities'},

    {'id':11, 'ch':'ch11', 'slug':'time-and-work',           'name':'Time and Work',
     'topic':'arithmetic', 'emoji':'⏱️',
     'concepts':'Work done = rate × time; if A does work in n days, rate = 1/n; '
                'combined work: add rates; pipes filling/emptying cisterns; '
                'A and B together then one leaves; '
                'efficiency and wage distribution problems'},

    {'id':12, 'ch':'ch12', 'slug':'distance-speed-time',     'name':'Distance, Speed and Time',
     'topic':'arithmetic', 'emoji':'🚂',
     'concepts':'Speed = Distance ÷ Time; average speed; '
                'relative speed (same direction and opposite direction); '
                'trains crossing platforms and each other; '
                'boats and streams (upstream/downstream); '
                'conversion of units (km/h to m/s); word problems'},

    # ── ALGEBRA ─────────────────────────────────────────────────
    {'id':13, 'ch':'ch13', 'slug':'linear-equations',        'name':'Linear Equations in One Variable',
     'topic':'algebra', 'emoji':'=',
     'concepts':'Solving linear equations with variables on both sides; '
                'equations with fractions (LCM method); cross-multiplication; '
                'word problems: age, number, geometry, ratio, profit/loss, '
                'time-work, mixture; forming equations from statements'},

    {'id':14, 'ch':'ch14', 'slug':'linear-inequations',      'name':'Linear Inequations',
     'topic':'algebra', 'emoji':'<',
     'concepts':'Inequalities: <, >, ≤, ≥; properties of inequalities; '
                'solving linear inequations on the number line; '
                'representing solution set; combined inequations; '
                'graphing on number line with open/closed circles; '
                'word problems involving inequations'},

    # ── GEOMETRY ────────────────────────────────────────────────
    {'id':15, 'ch':'ch15', 'slug':'polygons',                'name':'Polygons',
     'topic':'geometry', 'emoji':'⬡',
     'concepts':'Types of polygons: triangle, quadrilateral, pentagon, hexagon, etc.; '
                'regular and irregular polygons; convex and concave; '
                'angle sum of polygon: (n-2)×180°; exterior angle sum = 360°; '
                'each interior angle of regular polygon; diagonals'},

    {'id':16, 'ch':'ch16', 'slug':'understanding-shapes',    'name':'Understanding Shapes (Quadrilaterals)',
     'topic':'geometry', 'emoji':'▭',
     'concepts':'Properties of parallelogram, rectangle, rhombus, square, trapezium, kite; '
                'diagonals: bisect (parallelogram), equal (rectangle), perpendicular (rhombus/square), '
                'equal+perpendicular (square); angles; proofs using properties; '
                'identifying shapes from given conditions'},

    {'id':17, 'ch':'ch17', 'slug':'constructions',           'name':'Constructions of Quadrilaterals',
     'topic':'geometry', 'emoji':'📐',
     'concepts':'Constructing quadrilaterals given: 4 sides + 1 diagonal, 3 sides + 2 diagonals, '
                '4 sides + 1 angle, 3 sides + 2 included angles; '
                'constructing special quadrilaterals (parallelogram, rectangle, rhombus, square) '
                'with minimum given data; compass and ruler only'},

    {'id':18, 'ch':'ch18', 'slug':'representing-3d-in-2d',  'name':'Representing 3-D in 2-D',
     'topic':'geometry', 'emoji':'🧊',
     'concepts':'Views: front, side and top view of 3D shapes; '
                'isometric sketches; oblique sketches; nets of cube, cuboid, '
                'cylinder, cone, pyramid; Euler\'s formula F + V - E = 2; '
                'cross-sections of solids; mapping 3D to 2D representations'},

    # ── MENSURATION ─────────────────────────────────────────────
    {'id':19, 'ch':'ch19', 'slug':'area-trapezium-polygon',  'name':'Area of Trapezium and Polygon',
     'topic':'mensuration', 'emoji':'📐',
     'concepts':'Area of trapezium: ½(a+b)h; area of general polygon by dividing into triangles; '
                'area of regular polygon using formula; Heron\'s formula for scalene triangle; '
                'area of rhombus using diagonals: ½d₁d₂; composite figures; '
                'unit conversion (cm² to m²)'},

    {'id':20, 'ch':'ch20', 'slug':'volume-surface-area',     'name':'Volume and Surface Area of Solids',
     'topic':'mensuration', 'emoji':'🧊',
     'concepts':'Cube: V=a³, TSA=6a², LSA=4a²; '
                'cuboid: V=l×b×h, TSA=2(lb+bh+hl); '
                'cylinder: V=πr²h, CSA=2πrh, TSA=2πr(r+h); '
                'cone: V=⅓πr²h, CSA=πrl, TSA=πr(r+l); '
                'sphere: V=⁴⁄₃πr³, SA=4πr²; composite solids; '
                'converting units (cm³ to litres)'},

    # ── DATA HANDLING ────────────────────────────────────────────
    {'id':21, 'ch':'ch21', 'slug':'data-handling',           'name':'Data Handling',
     'topic':'data-handling', 'emoji':'📊',
     'concepts':'Frequency distribution table; class interval, class width, frequency; '
                'cumulative frequency; histogram; frequency polygon; ogive (cumulative frequency curve); '
                'mean, median, mode of grouped data; bar graph; pie chart '
                '(angle = frequency/total × 360°); reading and interpreting graphs'},
]

TOTAL = len(CHAPTERS)

# ── OUTPUT PATH FUNCTIONS ─────────────────────────────────────────
def explain_out(ch):
    return SCRIPT_DIR / 'explain' / 'icse' / 'class8' / ch['topic'] / f"{ch['slug']}.html"

def practice_out(ch):
    return SCRIPT_DIR / 'practice' / 'icse' / 'class8' / ch['topic'] / f"{ch['slug']}.html"

def exam_out(ch):
    return SCRIPT_DIR / 'data' / 'icse' / 'class8' / ch['ch'] / f"{ch['ch']}-exam.json"

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
            with _print_lock:
                log(f"OpenAI attempt {attempt+1} failed: {e}", 'WARN')
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                raise

# ═══════════════════════════════════════════════════════════════
# VISUAL ANIMATION SVG HELPERS
# ═══════════════════════════════════════════════════════════════
def _q(s):
    return s.replace('"', '\\"')

def _number_line_ticks(v_min, v_max, scale=18, cx=210, y=95):
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
    mid_x = (x1 + x2) / 2
    mid_y = y - arc_height
    arr = f'<polygon points="{x2},{y-10} {x2-6},{y-20} {x2+6},{y-20}" fill="{color}"/>'
    return (f'<path d="M {x1} {y-10} Q {mid_x} {mid_y} {x2} {y-10}" '
            f'stroke="{color}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
            + arr)

def _ans_box(text, qid):
    return (f'<g id="{qid}ans" opacity="0">'
            f'<rect x="110" y="148" width="200" height="26" rx="8" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2"/>'
            f'<text x="210" y="165" text-anchor="middle" font-family="Share Tech Mono" font-size="12" font-weight="bold" fill="#7a8c6e">{text}</text>'
            f'</g>')

def anim_example_number_line(prefix='q'):
    qid = f'{prefix}1'
    scale, cx, cy = 18, 210, 95
    base = _number_line_base(-8, 8, scale, cx, cy)
    x4 = cx + 4 * scale
    x_neg2 = cx + (-2) * scale
    mid = (x4 + x_neg2) / 2
    s0 = (f'<g id="{qid}s0" opacity="0">'
          + base
          + _circle_at(4, '4', '#c8922a', scale, cx, cy)
          + f'<text x="210" y="38" text-anchor="middle" font-size="12" fill="#5a4a30" font-weight="800">Find: 4 &divide; (&minus;2)</text>'
          + f'<text x="210" y="57" text-anchor="middle" font-size="10" fill="#8a7a5a">Mark +4 on the number line</text>'
          + f'</g>')
    s1 = (f'<g id="{qid}s1" opacity="0">'
          + _arc_arrow(x4, x_neg2, cy, 38)
          + f'<text x="{mid}" y="{cy-44}" text-anchor="middle" font-size="13" fill="#b85c2a" font-weight="900">&divide; (&minus;2) = &minus;2 steps</text>'
          + f'</g>')
    s2 = (f'<g id="{qid}s2" opacity="0">'
          + _circle_at(-2, '-2', '#7a8c6e', scale, cx, cy)
          + f'<text x="210" y="165" text-anchor="middle" font-size="12" fill="#7a8c6e" font-weight="800">Result = &minus;2 &#10003;</text>'
          + f'</g>')
    ans = _ans_box('4 &divide; (&minus;2) = &minus;2', qid)
    return _q(s0 + s1 + s2 + ans)

def anim_example_generic(prefix='q', topic=''):
    qid = f'{prefix}1'
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
    if ch['id'] in (1,):  # Rational Numbers — number line
        return anim_example_number_line(prefix)
    else:
        return anim_example_generic(prefix, ch.get('topic', ''))

# ═══════════════════════════════════════════════════════════════
# EXPLAIN GENERATION
# ═══════════════════════════════════════════════════════════════
EXPLAIN_SYS = """You create explain page content for RISHI, an ICSE Class 8 maths tutoring app for Indian students aged 13-14.
Textbook: Selina Concise Mathematics Class 8 (ICSE).
Tutor character: RISHIKA only (never Rekha).
OUTPUT: valid JSON only, no markdown, no extra text.
RULES:
- Simple language, Indian context (rupees, cricket, mithai, school, etc.)
- ICSE/Selina Class 8 terminology and notation
- q/cq: display text. Use HTML entities (&times; &divide; &sup2; &sup3; &minus; &frac12; &rarr; &le; &ge;) and <span class='hl'>X</span> or <span class='ans-tag'>X</span>
- qs/cqs/s fields: speech text only — spell out all symbols
- anim_svg: SVG viewBox 0 0 420 178. MUST use VISUAL OBJECTS (shapes, lines, circles, arrows, number lines, bars, grids, geometric figures) NOT plain text labels.
- Each question: 3 step groups (id=QIDsN, opacity=0) + 1 answer group (id=QIDans, opacity=0). JavaScript fades them in with voice.
- NO smart apostrophes — use straight apostrophe (') only"""

def build_explain_user(ch):
    anim_ex = anim_example_for_chapter(ch, 'q')
    return f"""Chapter: {ch['name']} | Topic: {ch['topic']}
Concepts: {ch['concepts']}

Generate EXACTLY 10 questions (id q1..q10), easy to medium, each on a different concept.
The anim_svg for EVERY question must show VISUAL objects matching the chapter topic.
For Rational Numbers: use a number line with circles at positions and arc arrows.
For geometry chapters: draw the relevant shapes (polygons, quadrilaterals, solids).
For mensuration: draw the shape with labelled dimensions.
For algebra: use boxes and arrows showing steps.

VISUAL anim_svg example for q1 (follow this style for ALL questions, adapting to each chapter's topic):
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
      "anim_svg": "(visual SVG matching the example style above, adapted for this question)"
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
PRACTICE_SYS = """You create PRACTICE problems for RISHI ICSE Class 8 maths app.
Textbook: Selina Concise Mathematics Class 8 (ICSE).
Tutor character: RISHIKA only. OUTPUT: valid JSON only.
Practice is harder than explain — student already knows the concept.
Mix computation + 2-3 Indian-context word problems.
anim_svg: SVG viewBox 0 0 420 178. MUST use VISUAL OBJECTS (number lines, circles, arrows, bars, shapes, grids) — NOT plain text labels.
NO smart apostrophes — use straight apostrophe (') only."""

def build_practice_user(ch):
    anim_ex = anim_example_for_chapter(ch, 'p')
    return f"""Chapter: {ch['name']} | Topic: {ch['topic']}
Concepts: {ch['concepts']}

Generate EXACTLY 10 practice problems (id p1..p10). Mix: 7-8 skill + 2-3 word problems.
The anim_svg for EVERY question must show VISUAL objects.
For geometry: draw the shape. For mensuration: draw with dimensions. For algebra: show working steps visually.

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
      "anim_svg": "(visual SVG matching the example style above, adapted for this question)"
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
EXAM_SYS = """You generate ICSE exam questions for Class 8 mathematics.
Textbook: Selina Concise Mathematics Class 8.
OUTPUT: valid JSON only. No markdown.
- Math must be 100% accurate for Class 8 (age 13-14)
- Use Indian number system (lakhs, crores) where relevant
- Distractors must be plausible (common student mistakes)
- Difficulty: easy=recall/simple computation, medium=application, hard=multi-step/HOTS"""

def gen_sec_A(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 8, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 20 conceptual MCQs for Section A (1 mark each). Difficulty: 14 easy, 6 medium.
Output JSON:
{{"questions":[{{"id":"icse_8_{ch['ch']}_A_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","difficulty":"easy","explanation":"..."}}]}}
IDs: icse_8_{ch['ch']}_A_001 to icse_8_{ch['ch']}_A_020"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 18: raise ValueError(f"Sec A: got {len(qs)}/20")
    return qs[:20]

def gen_sec_B(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 8, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 10 application/word-problem MCQs for Section B (2 marks each). All medium. Indian real-life contexts.
Output JSON:
{{"questions":[{{"id":"icse_8_{ch['ch']}_B_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"c","difficulty":"medium","explanation":"..."}}]}}
IDs: icse_8_{ch['ch']}_B_001 to icse_8_{ch['ch']}_B_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 8: raise ValueError(f"Sec B: got {len(qs)}/10")
    return qs[:10]

def gen_sec_C(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 8, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 6 HOTS MCQs for Section C (3 marks each). All hard. Multi-step reasoning required.
Output JSON:
{{"questions":[{{"id":"icse_8_{ch['ch']}_C_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","difficulty":"hard","explanation":"..."}}]}}
IDs: icse_8_{ch['ch']}_C_001 to icse_8_{ch['ch']}_C_006"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 5: raise ValueError(f"Sec C: got {len(qs)}/6")
    return qs[:6]

def gen_sec_D(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 8, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 10 direct-input (short answer) questions for Section D (3 marks each). Medium-hard. Student types answer.
Output JSON:
{{"questions":[{{"id":"icse_8_{ch['ch']}_D_001","text":"...","correct_answer":"...","answer_type":"text","accepted_forms":["...","..."],"difficulty":"medium","explanation":"..."}}]}}
IDs: icse_8_{ch['ch']}_D_001 to icse_8_{ch['ch']}_D_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 8: raise ValueError(f"Sec D: got {len(qs)}/10")
    return qs[:10]

def gen_sec_E(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 8, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 2 case study questions for Section E. Each has 3 subparts (2 marks each). Indian real-life contexts.
Output JSON:
{{"questions":[{{"id":"icse_8_{ch['ch']}_E_case1","case_text":"scenario paragraph","subparts":[{{"id":"icse_8_{ch['ch']}_E_case1_q1","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","marks":2,"explanation":"..."}},{{"id":"icse_8_{ch['ch']}_E_case1_q2","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","marks":2,"explanation":"..."}},{{"id":"icse_8_{ch['ch']}_E_case1_q3","text":"...","type":"direct_input","correct_answer":"...","accepted_forms":["..."],"marks":2,"explanation":"..."}}]}}]}}
Generate 2 case studies (case1 and case2) with 3 subparts each."""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 2: raise ValueError(f"Sec E: got {len(qs)}/2 case studies")
    return qs[:2]

def gen_exam(client, ch):
    with _print_lock:
        log(f"  [{ch['slug']}] Exam Sec A", 'WORK')
    sec_a = gen_sec_A(client, ch)
    with _print_lock:
        log(f"  [{ch['slug']}] Exam Sec B", 'WORK')
    sec_b = gen_sec_B(client, ch)
    with _print_lock:
        log(f"  [{ch['slug']}] Exam Sec C", 'WORK')
    sec_c = gen_sec_C(client, ch)
    with _print_lock:
        log(f"  [{ch['slug']}] Exam Sec D", 'WORK')
    sec_d = gen_sec_D(client, ch)
    with _print_lock:
        log(f"  [{ch['slug']}] Exam Sec E", 'WORK')
    sec_e = gen_sec_E(client, ch)

    marks = (len(sec_a)*1 + len(sec_b)*2 + len(sec_c)*3 + len(sec_d)*3 +
             sum(sum(sp.get('marks', 2) for sp in q.get('subparts', [])) for q in sec_e))
    return {
        "meta": {
            "board": "icse", "class": 8,
            "chapter_id": ch['ch'], "chapter_name": ch['name'],
            "topic_group": ch['topic'],
            "textbook": "Selina Concise Mathematics Class 8",
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
                 '<meta name="rishi-class" content="8">', out)
    # Title
    out = re.sub(r'<title>RISHI[^<]*</title>',
                 f'<title>RISHI — {ai_data["title"]}</title>', out)
    out = re.sub(r'<title>Practice[^<]*</title>',
                 f'<title>Practice – {ai_data["title"]} | RISHI</title>', out)
    # Chapter number and name (practice template left panel)
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
    if n == 0:
        with _print_lock:
            log(f"QB block not replaced for {ch['slug']} -- check template", 'WARN')
    # svgs block
    out, _ = re.subn(r'var svgs=\{[\s\S]*?\n\};', build_svgs(ai_data['questions']),
                     out, count=1)
    # CHAP_ID — board-qualified string avoids collision with CBSE keys
    icse_id = f"'ic8_{ch['id']}'"
    out = re.sub(r'var CHAP_ID=[^;]+;', f"var CHAP_ID={icse_id};", out, count=1)
    # Remove CBSE plan gate
    out = re.sub(r'rishiCheckPlan\([^)]+\);', '', out, count=1)
    # Explain done / mark done — board-qualified IDs
    out = re.sub(
        r'(rishiIsExplainDone|rishiMarkExplainDone)\([^)]+\)',
        lambda m: f"{m.group(1)}({icse_id})",
        out
    )
    # Don't auto-start on page load
    out = out.replace(
        'initVoices(function(){startLesson();});',
        'initVoices(function(){});'
    )
    # pagehide for mobile/Safari
    out = out.replace(
        'window.addEventListener("beforeunload",function(){stopAllAudio();});',
        'window.addEventListener("beforeunload",function(){stopAllAudio();});window.addEventListener("pagehide",function(){stopAllAudio();});'
    )
    # macOS voices
    out = out.replace(
        '"heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen"',
        '"heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen","moira","tessa","fiona"'
    )
    # autocomplete off
    out = out.replace(
        'id="rawAnswer" class="math-raw" rows="2" placeholder=',
        'id="rawAnswer" class="math-raw" rows="2" autocomplete="off" placeholder='
    )
    # goExam: require practice 5-streak
    icse_id_str = f"'ic8_{ch['id']}'"
    practice_gate = f"if(!rishiIsPracticeDone({icse_id_str})){{alert('Complete Practice with 5 in a row first!');return;}}"
    out = re.sub(
        r'(function goExam\(\)\{if\(!completed\)\{[^}]+\})(location\.href=)',
        lambda m: m.group(1) + practice_gate + m.group(2),
        out, count=1
    )
    # Practice URL (in explain page)
    out = re.sub(
        r'location\.href="/practice/class[0-9]+/[^"]+\.html"',
        f'location.href="/practice/icse/class8/{ch["topic"]}/{ch["slug"]}.html"',
        out, count=1
    )
    # Exam URL (in practice page)
    out = re.sub(
        r'location\.href="/exam\.html\?ch=[^"]+"',
        f'location.href="/exam.html?ch=ic8-{ch["id"]:02d}"',
        out, count=1
    )
    # Fix confirmShown declaration
    out = re.sub(
        r'(completed=false,)(breakSecs)',
        r'\1confirmShown=false,\2',
        out, count=1
    )
    # Fix confirmShown reset in goNext
    out = re.sub(
        r'(function goNext\(\)\{)(idx\+\+)',
        r'\1confirmShown=false;\2',
        out, count=1
    )
    # Fix completion message
    out = re.sub(
        r"You&#39;ve mastered [^<]+!",
        f"You&#39;ve mastered {ch['name']}!",
        out, count=1
    )
    # TTS-chained makeAnimPlay
    out = out.replace(
        'function makeAnimPlay(id,steps,ansLabel){return function(done){setStatus("Solving step by step...");var delay=600;steps.forEach(function(_,i){var d=delay+i*2800;(function(ii,dd){at(dd,function(){fade(id+"s"+ii,1);});})( i,d);});at(delay+steps.length*2800,function(){fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);});}; }',
        'function makeAnimPlay(id,steps,ansLabel){var gen=0;return function(done){var myGen=++gen;setStatus("Solving step by step...");function playStep(i){if(myGen!==gen)return;if(i>=steps.length){at(400,function(){if(myGen!==gen)return;fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);});return;}at(i===0?600:400,function(){if(myGen!==gen)return;fade(id+"s"+i,1);say(steps[i].s,function(){playStep(i+1);});});}playStep(0);}; }'
    )
    # TTS-chained nextStep
    out = out.replace(
        "setTimeout(function(){d.classList.add(\"vis\");},40);setTimeout(nextStep,3500);stepIdx++;}",
        "setTimeout(function(){d.classList.add(\"vis\");},40);stepIdx++;say(s.s||s.t.replace(/<[^>]*>/g,\"\"),function(){if(myGen===nsGen)nextStep();});}"
    )
    out = out.replace(
        "function nextStep(){var q=session[idx];",
        "var nsGen=0;function nextStep(){var myGen=++nsGen;var q=session[idx];"
    )
    # Back button → ICSE Class 8 syllabus
    out = out.replace(
        "location.href='/syllabus.html'",
        "location.href='/syllabus.html?board=icse&class=8'"
    )
    return out

# ═══════════════════════════════════════════════════════════════
# CHAPTER BUILD  (runs in a thread)
# ═══════════════════════════════════════════════════════════════
def build_chapter(ch, do_explain, do_practice, do_exam):
    client  = get_client()
    t0      = time.time()
    ex_tmpl = EXPLAIN_TEMPLATE.read_text(encoding='utf-8')
    pr_tmpl = PRACTICE_TEMPLATE.read_text(encoding='utf-8')

    if do_explain:
        with _print_lock:
            log(f"[{ch['slug']}] explain ...", 'WORK')
        data = gen_explain(client, ch)
        out  = explain_out(ch)
        backup_if_exists(out)
        out.write_text(inject(ex_tmpl, ch, data), encoding='utf-8')

    if do_practice:
        with _print_lock:
            log(f"[{ch['slug']}] practice ...", 'WORK')
        data = gen_practice(client, ch)
        out  = practice_out(ch)
        backup_if_exists(out)
        out.write_text(inject(pr_tmpl, ch, data), encoding='utf-8')

    if do_exam:
        data = gen_exam(client, ch)
        out  = exam_out(ch)
        backup_if_exists(out)
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

    elapsed = time.time() - t0
    with _print_lock:
        print(f"\n{'-'*55}", flush=True)
        print(f"  [DONE] Ch {ch['id']:>2}/{TOTAL}  {ch['name']}  ({elapsed:.0f}s)", flush=True)
        print(f"{'-'*55}\n", flush=True)

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    parser = argparse.ArgumentParser(description='RISHI ICSE Class 8 Master Builder (Parallel)')
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--all',      action='store_true')
    g.add_argument('--chapter',  metavar='SLUG')
    g.add_argument('--list',     action='store_true')
    g.add_argument('--estimate', action='store_true')
    parser.add_argument('--skip-explain',  action='store_true')
    parser.add_argument('--skip-practice', action='store_true')
    parser.add_argument('--skip-exam',     action='store_true')
    parser.add_argument('--workers', type=int, default=5, metavar='N',
                        help='Parallel workers (default 5)')
    args = parser.parse_args()

    print()
    print('=' * 55)
    print('  RISHI ICSE Class 8 Master Builder  [Parallel]')
    print('  Selina Concise Mathematics Class 8')
    print('=' * 55)

    if args.list:
        print()
        for c in CHAPTERS:
            print(f"  {c['id']:>2}. {c['slug']:<38} [{c['topic']}]")
        return

    if args.estimate:
        n = 1 if args.chapter else len(CHAPTERS)
        per = ((0 if args.skip_explain  else 1) +
               (0 if args.skip_practice else 1) +
               (0 if args.skip_exam     else 5))
        calls = n * per
        workers = min(args.workers, n)
        seq_min = calls * 7
        par_min = max(1, (n // workers) + (1 if n % workers else 0)) * per * 7
        print(f"\n  Chapters  : {n}")
        print(f"  API calls : ~{calls}")
        print(f"  Workers   : {workers}")
        print(f"  Est. cost : ~${calls*0.004:.2f} USD")
        print(f"  Est. time : ~{par_min} min (parallel) vs ~{seq_min} min (sequential)")
        return

    validate_setup()
    log(f"Model: {OPENAI_MODEL}", 'OK')

    chapters = ([c for c in CHAPTERS if c['slug'] == args.chapter]
                if args.chapter else CHAPTERS)
    if args.chapter and not chapters:
        fail(f"Unknown slug: {args.chapter}\nRun --list to see valid slugs.")

    do_e = not args.skip_explain
    do_p = not args.skip_practice
    do_x = not args.skip_exam
    workers = min(args.workers, len(chapters))

    log(f"Building {len(chapters)} chapters with {workers} parallel workers", 'OK')
    log(f"Explain:{do_e}  Practice:{do_p}  Exam:{do_x}", 'OK')

    failures = []
    t0 = time.time()

    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_ch = {executor.submit(build_chapter, ch, do_e, do_p, do_x): ch
                        for ch in chapters}
        for future in as_completed(future_to_ch):
            ch = future_to_ch[future]
            try:
                future.result()
            except Exception as e:
                with _print_lock:
                    log(f"FAILED {ch['slug']}: {e}", 'ERR')
                failures.append(ch['slug'])

    elapsed = time.time() - t0
    print()
    print('=' * 55)
    print(f"  BUILD COMPLETE — {elapsed/60:.1f} minutes")
    print('=' * 55)
    log(f"Success: {len(chapters)-len(failures)}/{len(chapters)}", 'OK')

    if failures:
        print()
        log("Failed chapters — rerun individually:", 'ERR')
        for s in failures:
            print(f"  python build_icse_class8.py --chapter {s} --skip-exam")

if __name__ == '__main__':
    main()
