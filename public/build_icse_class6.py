#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RISHI -- ICSE Class 6 Master Builder  (Parallel)
Generates all 28 ICSE Class 6 chapters via OpenAI.
Textbook: Selina Concise Mathematics Class 6 (ICSE).
Runs up to 5 chapters in parallel for ~5x speed.

Usage:
  python build_icse_class6.py --all --skip-exam
  python build_icse_class6.py --all
  python build_icse_class6.py --chapter fractions --skip-exam
  python build_icse_class6.py --list
  python build_icse_class6.py --estimate

Flags:
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

# Force UTF-8 stdout/stderr on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# -- AUTO-INSTALL ---------------------------------------------------------
def ensure_packages():
    for pkg in ['openai']:
        try:
            __import__(pkg)
        except ImportError:
            print(f"Installing {pkg}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg, '--quiet'])
ensure_packages()
from openai import OpenAI

# -- PATHS ----------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()

EXPLAIN_TEMPLATE  = SCRIPT_DIR / 'explain'  / 'class7' / 'arithmetic' / 'working-with-fractions.html'
PRACTICE_TEMPLATE = SCRIPT_DIR / 'practice' / 'class8' / 'algebra'    / 'factorisation.html'

OPENAI_MODEL = 'gpt-4.1-mini'

_print_lock = threading.Lock()

# -- CHAPTER MANIFEST (Selina Concise Mathematics Class 6, ICSE) ----------
CHAPTERS = [
    # -- ARITHMETIC -------------------------------------------------------
    {'id':1,  'ch':'ch01', 'slug':'number-system',                'name':'Number System',
     'topic':'arithmetic', 'emoji':'🔢',
     'concepts':'Indian and International numeration systems; place value up to crores; '
                'reading and writing large numbers; face value vs place value; '
                'expanded form; predecessor and successor; '
                'comparing and ordering numbers; rounding to nearest 10/100/1000'},

    {'id':2,  'ch':'ch02', 'slug':'estimation',                   'name':'Estimation',
     'topic':'arithmetic', 'emoji':'~',
     'concepts':'Rounding off to nearest 10, 100, 1000; '
                'estimating sums, differences, products, quotients; '
                'estimating in real-life contexts (shopping, distances); '
                'checking reasonableness of answers; '
                'BODMAS rule with estimation'},

    {'id':3,  'ch':'ch03', 'slug':'playing-with-numbers',         'name':'Playing with Numbers',
     'topic':'arithmetic', 'emoji':'🎲',
     'concepts':'Factors and multiples; prime and composite numbers; '
                'prime factorisation (factor tree, division method); '
                'divisibility rules for 2, 3, 4, 5, 6, 8, 9, 10, 11; '
                'perfect numbers; twin primes; co-prime numbers; '
                'even and odd numbers'},

    {'id':4,  'ch':'ch04', 'slug':'natural-numbers-whole-numbers', 'name':'Natural Numbers and Whole Numbers',
     'topic':'arithmetic', 'emoji':'1',
     'concepts':'Natural numbers (N) and whole numbers (W) and their difference; '
                'properties: closure, commutativity, associativity, distributivity; '
                'identity elements for addition and multiplication; '
                'patterns in whole numbers; '
                'number patterns on number grids; '
                'four fundamental operations on whole numbers'},

    {'id':5,  'ch':'ch05', 'slug':'negative-numbers-integers',    'name':'Negative Numbers and Integers',
     'topic':'arithmetic', 'emoji':'−',
     'concepts':'Need for negative numbers; integers: positive, negative, zero; '
                'ordering integers on a number line; '
                'absolute value; '
                'addition and subtraction of integers (with rules); '
                'multiplication and division of integers; '
                'real-life applications: temperature, sea level, bank account'},

    {'id':6,  'ch':'ch06', 'slug':'number-line',                  'name':'Number Line',
     'topic':'arithmetic', 'emoji':'←→',
     'concepts':'Representing integers, fractions, and decimals on number line; '
                'addition and subtraction on number line; '
                'finding distances between numbers; '
                'ordering rational numbers using number line; '
                'mid-point of two numbers on number line'},

    {'id':7,  'ch':'ch07', 'slug':'hcf-and-lcm',                  'name':'HCF and LCM',
     'topic':'arithmetic', 'emoji':'H',
     'concepts':'HCF by listing factors, prime factorisation, division (Euclid) method; '
                'LCM by listing multiples, prime factorisation, division method; '
                'relationship: HCF x LCM = product of two numbers; '
                'word problems: largest tile, bells ringing together, grouping; '
                'HCF and LCM of more than two numbers'},

    {'id':8,  'ch':'ch08', 'slug':'ratio',                        'name':'Ratio',
     'topic':'arithmetic', 'emoji':':',
     'concepts':'Concept of ratio; simplest form (HCF method); '
                'equivalent ratios; comparing ratios; '
                'dividing a quantity in a given ratio; '
                'word problems on sharing (money, land, ingredients); '
                'ratio in recipes and mixtures'},

    {'id':9,  'ch':'ch09', 'slug':'proportion',                   'name':'Proportion',
     'topic':'arithmetic', 'emoji':'=',
     'concepts':'Proportion: a:b = c:d; four quantities in proportion; '
                'checking if four numbers are in proportion; '
                'mean proportion; third proportional; fourth proportional; '
                'direct proportion: more-more, less-less; '
                'word problems involving proportion'},

    {'id':10, 'ch':'ch10', 'slug':'unitary-method',               'name':'Unitary Method',
     'topic':'arithmetic', 'emoji':'1',
     'concepts':'Unitary method: find value of one unit then scale; '
                'direct variation problems: cost, speed, work; '
                'word problems: buying items, earning wages, filling tanks; '
                'reverse unitary method; '
                'Indian context: rupees, kilograms, litres, metres'},

    {'id':11, 'ch':'ch11', 'slug':'fractions',                    'name':'Fractions',
     'topic':'arithmetic', 'emoji':'½',
     'concepts':'Proper, improper, mixed fractions; equivalent fractions; '
                'simplification (lowest terms); '
                'comparison using LCM; '
                'addition and subtraction with same and different denominators; '
                'multiplication of fractions; division by a fraction; '
                'word problems on fractions'},

    {'id':12, 'ch':'ch12', 'slug':'decimal-fractions',            'name':'Decimal Fractions',
     'topic':'arithmetic', 'emoji':'.',
     'concepts':'Place value in decimals; converting fractions to decimals and back; '
                'comparing decimals; addition and subtraction; '
                'multiplication of decimals by 10, 100, 1000 and by a decimal; '
                'division of decimals; '
                'word problems on money, measurement; '
                'recurring/terminating decimals (introduction)'},

    {'id':13, 'ch':'ch13', 'slug':'percent-and-percentage',       'name':'Percent and Percentage',
     'topic':'arithmetic', 'emoji':'%',
     'concepts':'Percentage as fraction out of 100; '
                'converting fractions and decimals to percent and back; '
                'finding a percent of a quantity; '
                'finding what percent one number is of another; '
                'percentage increase and decrease; '
                'applications: discount, profit, loss (basic); '
                'word problems in Indian contexts'},

    {'id':14, 'ch':'ch14', 'slug':'speed-distance-time',          'name':'Speed, Distance and Time',
     'topic':'arithmetic', 'emoji':'🚀',
     'concepts':'Relationship: Distance = Speed x Time; '
                'finding distance, speed, or time given the other two; '
                'unit conversion: km/h to m/s (divide by 3.6); '
                'average speed; '
                'word problems: journeys, trains, cyclists; '
                'Indian contexts: road trips, auto-rickshaw, cricket ball speed'},

    # -- ALGEBRA ----------------------------------------------------------
    {'id':15, 'ch':'ch15', 'slug':'algebraic-expressions',        'name':'Algebraic Expressions',
     'topic':'algebra', 'emoji':'x',
     'concepts':'Variables and constants; terms, coefficients; '
                'like and unlike terms; monomials, binomials, polynomials; '
                'addition and subtraction of algebraic expressions; '
                'value of an expression for given variable values; '
                'perimeter and area using algebraic expressions'},

    {'id':16, 'ch':'ch16', 'slug':'substitution',                 'name':'Substitution',
     'topic':'algebra', 'emoji':'→',
     'concepts':'Evaluating algebraic expressions by substituting given values; '
                'use of brackets (BODMAS); '
                'simplifying expressions then substituting; '
                'finding the value of expressions like a+b, a-b, 2a+3b; '
                'substitution in formulae: area, perimeter, speed; '
                'checking if a value satisfies an equation'},

    {'id':17, 'ch':'ch17', 'slug':'framing-algebraic-expressions', 'name':'Framing Algebraic Expressions',
     'topic':'algebra', 'emoji':'✍',
     'concepts':'Translating word statements into algebraic expressions; '
                'key phrases: "sum of", "difference of", "product of", "quotient"; '
                '"5 more than x" = x+5; "3 times y" = 3y; '
                'forming expressions for perimeter, area problems; '
                'framing two-step expressions from word problems; '
                'Indian context word problems'},

    {'id':18, 'ch':'ch18', 'slug':'simple-linear-equations',      'name':'Simple (Linear) Equations',
     'topic':'algebra', 'emoji':'=',
     'concepts':'Equation vs expression; LHS = RHS; '
                'solving one-variable linear equations by transposition method; '
                'cross-multiplication for fractional equations; '
                'verification of solution; '
                'word problems: age, money, consecutive numbers, geometry; '
                'forming and solving equations from real-life situations'},

    # -- GEOMETRY ---------------------------------------------------------
    {'id':19, 'ch':'ch19', 'slug':'angles',                       'name':'Angles',
     'topic':'geometry', 'emoji':'∠',
     'concepts':'Types of angles: acute, right, obtuse, straight, reflex, complete; '
                'measuring angles with protractor; '
                'constructing angles with compass and protractor; '
                'complementary and supplementary angles; '
                'adjacent, vertically opposite angles; '
                'angles at a point (sum = 360°); '
                'linear pair'},

    {'id':20, 'ch':'ch20', 'slug':'properties-of-angles-lines',   'name':'Properties of Angles and Lines',
     'topic':'geometry', 'emoji':'||',
     'concepts':'Parallel lines and transversal; '
                'corresponding angles (equal), alternate interior angles (equal), '
                'co-interior angles (supplementary); '
                'properties of parallel lines; '
                'conditions for lines to be parallel; '
                'perpendicular lines; '
                'practical applications in geometry problems'},

    {'id':21, 'ch':'ch21', 'slug':'triangle-properties',          'name':'Triangle and Its Properties',
     'topic':'geometry', 'emoji':'△',
     'concepts':'Types of triangles by sides (scalene, isosceles, equilateral) and angles (acute, right, obtuse); '
                'angle sum property: all angles add to 180°; '
                'exterior angle = sum of two non-adjacent interior angles; '
                'triangle inequality: sum of two sides > third side; '
                'median, altitude, perpendicular bisector (introduction); '
                'Pythagoras theorem (introduction for right triangles)'},

    {'id':22, 'ch':'ch22', 'slug':'quadrilateral',                'name':'Quadrilateral',
     'topic':'geometry', 'emoji':'▭',
     'concepts':'Definition and types: square, rectangle, rhombus, parallelogram, trapezium, kite; '
                'properties of each type (sides, angles, diagonals); '
                'angle sum of quadrilateral = 360°; '
                'identifying quadrilaterals from given properties; '
                'perimeter and area of square, rectangle; '
                'diagonal properties'},

    {'id':23, 'ch':'ch23', 'slug':'polygons',                     'name':'Polygons',
     'topic':'geometry', 'emoji':'⬡',
     'concepts':'Regular and irregular polygons; names: triangle to decagon; '
                'interior angle sum of polygon = (n-2) x 180°; '
                'each interior angle of regular polygon = (n-2)x180/n; '
                'exterior angle sum = 360°; '
                'diagonals in a polygon = n(n-3)/2; '
                'drawing polygons with given measurements'},

    {'id':24, 'ch':'ch24', 'slug':'the-circle',                   'name':'The Circle',
     'topic':'geometry', 'emoji':'⭕',
     'concepts':'Parts of a circle: centre, radius, diameter, chord, arc, sector, segment; '
                'diameter = 2 x radius; '
                'circumference = 2πr = πd; '
                'arc length and sector (basic); '
                'concentric circles; '
                'drawing circles with compass; '
                'practical problems on circumference'},

    {'id':25, 'ch':'ch25', 'slug':'symmetry',                     'name':'Symmetry (Reflection)',
     'topic':'geometry', 'emoji':'⟺',
     'concepts':'Line of symmetry (axis of symmetry); '
                'number of lines of symmetry in regular polygons, letters, everyday shapes; '
                'reflection symmetry in figures; '
                'drawing the mirror image of a given figure; '
                'completing symmetric figures given half; '
                'rotational symmetry (introduction): order and angle of rotation'},

    {'id':26, 'ch':'ch26', 'slug':'recognition-of-solids',        'name':'Recognition of Solids',
     'topic':'geometry', 'emoji':'🎲',
     'concepts':'3D shapes: cube, cuboid, cone, cylinder, sphere, prism, pyramid; '
                'faces, edges, vertices of each solid; '
                "Euler's formula: F + V - E = 2; "
                'nets of 3D solids (cube, cuboid, cylinder, cone); '
                'difference between prisms and pyramids; '
                'practical examples of solids in daily life'},

    # -- MENSURATION ------------------------------------------------------
    {'id':27, 'ch':'ch27', 'slug':'perimeter-and-area',           'name':'Perimeter and Area',
     'topic':'mensuration', 'emoji':'📐',
     'concepts':'Perimeter of triangle, quadrilateral, polygon; '
                'area of rectangle: l x b; area of square: s²; '
                'area of triangle: (1/2) x base x height; '
                'area of parallelogram: base x height; '
                'converting units: cm² to m², etc.; '
                'word problems: fencing, carpeting, tiling; '
                'path inside/outside a rectangle'},

    # -- DATA HANDLING ----------------------------------------------------
    {'id':28, 'ch':'ch28', 'slug':'data-handling',                'name':'Data Handling',
     'topic':'data-handling', 'emoji':'📊',
     'concepts':'Collecting and organising data; frequency tables; tally marks; '
                'pictograph: reading and drawing; '
                'bar graph: reading and drawing (horizontal and vertical); '
                'double bar graph; '
                'mean (average) of data; '
                'range; mode of a data set; '
                'word problems on average, range, mode; '
                'Indian contexts: marks, runs, temperature'},
]

TOTAL = len(CHAPTERS)

# -- OUTPUT PATH FUNCTIONS ------------------------------------------------
def explain_out(ch):
    return SCRIPT_DIR / 'explain' / 'icse' / 'class6' / ch['topic'] / f"{ch['slug']}.html"

def practice_out(ch):
    return SCRIPT_DIR / 'practice' / 'icse' / 'class6' / ch['topic'] / f"{ch['slug']}.html"

def exam_out(ch):
    return SCRIPT_DIR / 'data' / 'icse' / 'class6' / ch['ch'] / f"{ch['ch']}-exam.json"

# -- UTILITIES ------------------------------------------------------------
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
        fail("OPENAI_API_KEY not set.")
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

# ==========================================================================
# VISUAL ANIMATION SVG HELPERS
# ==========================================================================
def _q(s):
    return s.replace('"', '\\"')

def _ans_box(text, qid):
    return (f'<g id="{qid}ans" opacity="0">'
            f'<rect x="110" y="148" width="200" height="26" rx="8" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2"/>'
            f'<text x="210" y="165" text-anchor="middle" font-family="Share Tech Mono" font-size="12" font-weight="bold" fill="#7a8c6e">{text}</text>'
            f'</g>')

def anim_example_generic(prefix='q', topic=''):
    qid = f'{prefix}1'
    s0 = (f'<g id="{qid}s0" opacity="0">'
          f'<rect x="30" y="20" width="360" height="44" rx="10" fill="#f5e6c8" stroke="#c8922a" stroke-width="2"/>'
          f'<text x="210" y="38" text-anchor="middle" font-size="13" fill="#5a4a30" font-weight="800">Given Information</text>'
          f'<text x="210" y="56" text-anchor="middle" font-size="11" fill="#8a7a5a">Write down what you know</text>'
          f'</g>')
    s1 = (f'<g id="{qid}s1" opacity="0">'
          f'<rect x="30" y="75" width="360" height="44" rx="10" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2"/>'
          f'<text x="210" y="93" text-anchor="middle" font-size="13" fill="#5a4a30" font-weight="800">Apply the Rule</text>'
          f'<text x="210" y="111" text-anchor="middle" font-size="11" fill="#8a7a5a">Show the working step</text>'
          f'</g>')
    s2 = (f'<g id="{qid}s2" opacity="0">'
          f'<rect x="60" y="128" width="300" height="32" rx="10" fill="#eef2eb" stroke="#7a8c6e" stroke-width="2.5"/>'
          f'<text x="210" y="149" text-anchor="middle" font-size="13" fill="#7a8c6e" font-weight="900">Result = answer</text>'
          f'</g>')
    ans = _ans_box('answer', qid)
    return _q(s0 + s1 + s2 + ans)

def anim_example_for_chapter(ch, prefix='q'):
    return anim_example_generic(prefix, ch.get('topic', ''))

# ==========================================================================
# EXPLAIN GENERATION
# ==========================================================================
EXPLAIN_SYS = """You create explain page content for RISHI, an ICSE Class 6 maths tutoring app for Indian students aged 11-12.
Textbook: Selina Concise Mathematics Class 6 (ICSE).
Tutor character: RISHIKA only (never Rekha).
OUTPUT: valid JSON only, no markdown, no extra text.
RULES:
- Very simple language suitable for 11-12 year olds; Indian context (rupees, cricket, mithai, school, etc.)
- ICSE/Selina Class 6 terminology and notation
- q/cq: display text. Use HTML entities (&times; &divide; &sup2; &minus; &frac12; &rarr; &le; &ge; &radic;) and <span class='hl'>X</span> or <span class='ans-tag'>X</span>
- qs/cqs/s fields: speech text only -- spell out all symbols
- anim_svg: SVG viewBox 0 0 420 178. MUST use VISUAL OBJECTS (shapes, number lines, bars, grids, geometric figures, boxes) NOT plain text labels.
- Each question: 3 step groups (id=QIDsN, opacity=0) + 1 answer group (id=QIDans, opacity=0). JavaScript fades them in with voice.
- NO smart apostrophes -- use straight apostrophe (') only"""

def build_explain_user(ch):
    anim_ex = anim_example_for_chapter(ch, 'q')
    return f"""Chapter: {ch['name']} | Topic: {ch['topic']}
Concepts: {ch['concepts']}

Generate EXACTLY 10 questions (id q1..q10), easy to medium, each on a different concept.
Keep language very simple for Class 6 students (age 11-12).
The anim_svg for EVERY question must show VISUAL objects matching the chapter topic.
For number/arithmetic: use number lines, boxes showing steps, grids, fraction bars.
For geometry: draw labelled shapes with angles and measurements.
For data: draw bar graphs, tally tables.

VISUAL anim_svg example for q1 (follow this style for ALL questions):
"anim_svg": "{anim_ex}"

Full JSON structure to output:
{{
  "title": "{ch['name']}",
  "topbar_label": "{ch['emoji']} {ch['name']}",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika! Today we learn <span class=\\"hl\\">{ch['name']}</span>! {ch['emoji']} Let&#39;s start!",
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
      "anim_svg": "(visual SVG adapted for this question)"
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

# ==========================================================================
# PRACTICE GENERATION
# ==========================================================================
PRACTICE_SYS = """You create PRACTICE problems for RISHI ICSE Class 6 maths app.
Textbook: Selina Concise Mathematics Class 6 (ICSE).
Tutor character: RISHIKA only. OUTPUT: valid JSON only.
Practice is slightly harder than explain -- student already knows the concept.
Keep language very simple for 11-12 year olds. Mix computation + 2-3 Indian-context word problems.
anim_svg: SVG viewBox 0 0 420 178. MUST use VISUAL OBJECTS -- NOT plain text labels.
NO smart apostrophes -- use straight apostrophe (') only."""

def build_practice_user(ch):
    anim_ex = anim_example_for_chapter(ch, 'p')
    return f"""Chapter: {ch['name']} | Topic: {ch['topic']}
Concepts: {ch['concepts']}

Generate EXACTLY 10 practice problems (id p1..p10). Mix: 7-8 skill + 2-3 word problems.
Keep difficulty appropriate for Class 6 (age 11-12).
The anim_svg for EVERY question must show VISUAL objects.

VISUAL anim_svg example for p1:
"anim_svg": "{anim_ex}"

Full JSON structure:
{{
  "title": "{ch['name']}",
  "topbar_label": "{ch['emoji']} {ch['name']}",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika! Let&#39;s practice <span class=\\"hl\\">{ch['name']}</span>! {ch['emoji']} Go!",
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
      "anim_svg": "(visual SVG adapted for this question)"
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

# ==========================================================================
# EXAM JSON GENERATION
# ==========================================================================
EXAM_SYS = """You generate ICSE exam questions for Class 6 mathematics.
Textbook: Selina Concise Mathematics Class 6.
OUTPUT: valid JSON only. No markdown.
- Math must be 100% accurate for Class 6 (age 11-12)
- Use Indian number system where relevant
- Distractors must be plausible (common student mistakes)
- Keep difficulty appropriate: easy=recall/simple computation, medium=application, hard=multi-step"""

def gen_sec_A(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 6, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 20 conceptual MCQs for Section A (1 mark each). Difficulty: 14 easy, 6 medium. Class 6 level.
Output JSON:
{{"questions":[{{"id":"icse_6_{ch['ch']}_A_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","difficulty":"easy","explanation":"..."}}]}}
IDs: icse_6_{ch['ch']}_A_001 to icse_6_{ch['ch']}_A_020"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 18: raise ValueError(f"Sec A: got {len(qs)}/20")
    return qs[:20]

def gen_sec_B(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 6, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 10 application/word-problem MCQs for Section B (2 marks each). All medium. Indian real-life contexts. Class 6 level.
Output JSON:
{{"questions":[{{"id":"icse_6_{ch['ch']}_B_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"c","difficulty":"medium","explanation":"..."}}]}}
IDs: icse_6_{ch['ch']}_B_001 to icse_6_{ch['ch']}_B_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 8: raise ValueError(f"Sec B: got {len(qs)}/10")
    return qs[:10]

def gen_sec_C(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 6, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 6 HOTS MCQs for Section C (3 marks each). All hard. Multi-step reasoning. Class 6 level.
Output JSON:
{{"questions":[{{"id":"icse_6_{ch['ch']}_C_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","difficulty":"hard","explanation":"..."}}]}}
IDs: icse_6_{ch['ch']}_C_001 to icse_6_{ch['ch']}_C_006"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 5: raise ValueError(f"Sec C: got {len(qs)}/6")
    return qs[:6]

def gen_sec_D(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 6, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 10 direct-input questions for Section D (3 marks each). Medium-hard. Class 6 level.
Output JSON:
{{"questions":[{{"id":"icse_6_{ch['ch']}_D_001","text":"...","correct_answer":"...","answer_type":"text","accepted_forms":["...","..."],"difficulty":"medium","explanation":"..."}}]}}
IDs: icse_6_{ch['ch']}_D_001 to icse_6_{ch['ch']}_D_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 8: raise ValueError(f"Sec D: got {len(qs)}/10")
    return qs[:10]

def gen_sec_E(client, ch):
    prompt = f"""Chapter: {ch['name']} (ICSE Class 6, Selina) | Concepts: {ch['concepts']}
Generate EXACTLY 2 case study questions for Section E. Each has 3 subparts (2 marks each). Indian real-life contexts. Class 6 level (age 11-12).
Output JSON:
{{"questions":[{{"id":"icse_6_{ch['ch']}_E_case1","case_text":"scenario paragraph","subparts":[{{"id":"icse_6_{ch['ch']}_E_case1_q1","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","marks":2,"explanation":"..."}},{{"id":"icse_6_{ch['ch']}_E_case1_q2","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","marks":2,"explanation":"..."}},{{"id":"icse_6_{ch['ch']}_E_case1_q3","text":"...","type":"direct_input","correct_answer":"...","accepted_forms":["..."],"marks":2,"explanation":"..."}}]}}]}}
Generate 2 case studies (case1 and case2) with 3 subparts each."""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions', [])
    if len(qs) < 2: raise ValueError(f"Sec E: got {len(qs)}/2 case studies")
    return qs[:2]

def gen_exam(client, ch):
    with _print_lock: log(f"  [{ch['slug']}] Exam Sec A", 'WORK')
    sec_a = gen_sec_A(client, ch)
    with _print_lock: log(f"  [{ch['slug']}] Exam Sec B", 'WORK')
    sec_b = gen_sec_B(client, ch)
    with _print_lock: log(f"  [{ch['slug']}] Exam Sec C", 'WORK')
    sec_c = gen_sec_C(client, ch)
    with _print_lock: log(f"  [{ch['slug']}] Exam Sec D", 'WORK')
    sec_d = gen_sec_D(client, ch)
    with _print_lock: log(f"  [{ch['slug']}] Exam Sec E", 'WORK')
    sec_e = gen_sec_E(client, ch)
    marks = (len(sec_a)*1 + len(sec_b)*2 + len(sec_c)*3 + len(sec_d)*3 +
             sum(sum(sp.get('marks', 2) for sp in q.get('subparts', [])) for q in sec_e))
    return {
        "meta": {"board":"icse","class":6,"chapter_id":ch['ch'],"chapter_name":ch['name'],
                 "topic_group":ch['topic'],"textbook":"Selina Concise Mathematics Class 6",
                 "total_marks":marks,"generated":datetime.now().strftime("%Y-%m"),"version":1},
        "sections": {
            "A":{"type":"mcq",          "label":"Conceptual",   "marks_per_q":1,"questions":sec_a},
            "B":{"type":"mcq",          "label":"Application",  "marks_per_q":2,"questions":sec_b},
            "C":{"type":"mcq",          "label":"Higher Order", "marks_per_q":3,"questions":sec_c},
            "D":{"type":"direct_input", "label":"Numerical",    "marks_per_q":3,"questions":sec_d},
            "E":{"type":"case_study",   "label":"Case Study",   "marks_per_q":2,"questions":sec_e},
        }
    }

# ==========================================================================
# TEMPLATE INJECTION
# ==========================================================================
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
    out = re.sub(r'<meta name="rishi-board" content="[^"]*">',
                 '<meta name="rishi-board" content="icse">', out)
    out = re.sub(r'<meta name="rishi-class" content="\d+">',
                 '<meta name="rishi-class" content="6">', out)
    out = re.sub(r'<title>RISHI[^<]*</title>',
                 f'<title>RISHI -- {ai_data["title"]}</title>', out)
    out = re.sub(r'<title>Practice[^<]*</title>',
                 f'<title>Practice -- {ai_data["title"]} | RISHI</title>', out)
    out = re.sub(r'(<div class="lp-chapter">)Chapter \d+(</div>)',
                 f'\\g<1>Chapter {ch["id"]}\\g<2>', out, count=1)
    out = re.sub(r'(<div class="lp-title">)[^<]*(</div>)',
                 f'\\g<1>{ch["name"]}\\g<2>', out, count=1)
    out = re.sub(r'(<div class="topbar-center">)[^<]*(</div>)',
                 lambda m: m.group(1) + ai_data['topbar_label'] + m.group(2), out, count=1)
    out = re.sub(r'(<div class="rishika-text" id="introText">)(.*?)(</div>)',
                 lambda m: m.group(1) + '\n        ' + ai_data['intro'] + '\n      ' + m.group(3),
                 out, flags=re.DOTALL, count=1)
    out, n = re.subn(r'var QB=\[.*?^\];', build_qb(ai_data['questions']),
                     out, count=1, flags=re.DOTALL | re.MULTILINE)
    if n == 0:
        with _print_lock: log(f"QB block not replaced for {ch['slug']}", 'WARN')
    out, _ = re.subn(r'var svgs=\{[\s\S]*?\n\};', build_svgs(ai_data['questions']), out, count=1)
    icse_id = f"'ic6_{ch['id']}'"
    out = re.sub(r'var CHAP_ID=[^;]+;', f"var CHAP_ID={icse_id};", out, count=1)
    out = re.sub(r'rishiCheckPlan\([^)]+\);', '', out, count=1)
    out = re.sub(
        r'(rishiIsExplainDone|rishiMarkExplainDone)\([^)]+\)',
        lambda m: f"{m.group(1)}({icse_id})", out)
    out = out.replace('initVoices(function(){startLesson();});', 'initVoices(function(){});')
    out = out.replace(
        'window.addEventListener("beforeunload",function(){stopAllAudio();});',
        'window.addEventListener("beforeunload",function(){stopAllAudio();});window.addEventListener("pagehide",function(){stopAllAudio();});')
    out = out.replace(
        '"heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen"',
        '"heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen","moira","tessa","fiona"')
    out = out.replace(
        'id="rawAnswer" class="math-raw" rows="2" placeholder=',
        'id="rawAnswer" class="math-raw" rows="2" autocomplete="off" placeholder=')
    icse_id_str = f"'ic6_{ch['id']}'"
    practice_gate = f"if(!rishiIsPracticeDone({icse_id_str})){{alert('Complete Practice with 5 in a row first!');return;}}"
    out = re.sub(
        r'(function goExam\(\)\{if\(!completed\)\{[^}]+\})(location\.href=)',
        lambda m: m.group(1) + practice_gate + m.group(2), out, count=1)
    out = re.sub(
        r'location\.href="/practice/class[0-9]+/[^"]+\.html"',
        f'location.href="/practice/icse/class6/{ch["topic"]}/{ch["slug"]}.html"', out, count=1)
    out = re.sub(
        r'location\.href="/exam\.html\?ch=[^"]+"',
        f'location.href="/exam.html?ch=ic6-{ch["id"]:02d}"', out, count=1)
    out = re.sub(r'(completed=false,)(breakSecs)', r'\1confirmShown=false,\2', out, count=1)
    out = re.sub(r'(function goNext\(\)\{)(idx\+\+)', r'\1confirmShown=false;\2', out, count=1)
    out = re.sub(r"You&#39;ve mastered [^<]+!", f"You&#39;ve mastered {ch['name']}!", out, count=1)
    out = out.replace(
        'function makeAnimPlay(id,steps,ansLabel){return function(done){setStatus("Solving step by step...");var delay=600;steps.forEach(function(_,i){var d=delay+i*2800;(function(ii,dd){at(dd,function(){fade(id+"s"+ii,1);});})( i,d);});at(delay+steps.length*2800,function(){fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);});}; }',
        'function makeAnimPlay(id,steps,ansLabel){var gen=0;return function(done){var myGen=++gen;setStatus("Solving step by step...");function playStep(i){if(myGen!==gen)return;if(i>=steps.length){at(400,function(){if(myGen!==gen)return;fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);});return;}at(i===0?600:400,function(){if(myGen!==gen)return;fade(id+"s"+i,1);say(steps[i].s,function(){playStep(i+1);});});}playStep(0);}; }')
    out = out.replace(
        "setTimeout(function(){d.classList.add(\"vis\");},40);setTimeout(nextStep,3500);stepIdx++;}",
        "setTimeout(function(){d.classList.add(\"vis\");},40);stepIdx++;say(s.s||s.t.replace(/<[^>]*>/g,\"\"),function(){if(myGen===nsGen)nextStep();});}")
    out = out.replace(
        "function nextStep(){var q=session[idx];",
        "var nsGen=0;function nextStep(){var myGen=++nsGen;var q=session[idx];")
    out = out.replace("location.href='/syllabus.html'", "location.href='/syllabus.html?board=icse&class=6'")
    return out

# ==========================================================================
# CHAPTER BUILD  (runs in a thread)
# ==========================================================================
def build_chapter(ch, do_explain, do_practice, do_exam):
    client  = get_client()
    t0      = time.time()
    ex_tmpl = EXPLAIN_TEMPLATE.read_text(encoding='utf-8')
    pr_tmpl = PRACTICE_TEMPLATE.read_text(encoding='utf-8')

    if do_explain:
        with _print_lock: log(f"[{ch['slug']}] explain ...", 'WORK')
        data = gen_explain(client, ch)
        out  = explain_out(ch)
        backup_if_exists(out)
        out.write_text(inject(ex_tmpl, ch, data), encoding='utf-8')

    if do_practice:
        with _print_lock: log(f"[{ch['slug']}] practice ...", 'WORK')
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

# ==========================================================================
# MAIN
# ==========================================================================
def main():
    parser = argparse.ArgumentParser(description='RISHI ICSE Class 6 Master Builder (Parallel)')
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument('--all',      action='store_true')
    g.add_argument('--chapter',  metavar='SLUG')
    g.add_argument('--list',     action='store_true')
    g.add_argument('--estimate', action='store_true')
    parser.add_argument('--skip-explain',  action='store_true')
    parser.add_argument('--skip-practice', action='store_true')
    parser.add_argument('--skip-exam',     action='store_true')
    parser.add_argument('--workers', type=int, default=5, metavar='N')
    args = parser.parse_args()

    print()
    print('=' * 55)
    print('  RISHI ICSE Class 6 Master Builder  [Parallel]')
    print('  Selina Concise Mathematics Class 6')
    print('=' * 55)

    if args.list:
        print()
        for c in CHAPTERS:
            print(f"  {c['id']:>2}. {c['slug']:<42} [{c['topic']}]")
        return

    if args.estimate:
        n = 1 if args.chapter else len(CHAPTERS)
        per = ((0 if args.skip_explain else 1) + (0 if args.skip_practice else 1) +
               (0 if args.skip_exam else 5))
        calls = n * per
        workers = min(args.workers, n)
        par_min = max(1, (n // workers) + (1 if n % workers else 0)) * per * 7
        print(f"\n  Chapters  : {n}")
        print(f"  API calls : ~{calls}")
        print(f"  Workers   : {workers}")
        print(f"  Est. cost : ~${calls*0.004:.2f} USD")
        print(f"  Est. time : ~{par_min} min (parallel)")
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
        future_to_ch = {executor.submit(build_chapter, ch, do_e, do_p, do_x): ch for ch in chapters}
        for future in as_completed(future_to_ch):
            ch = future_to_ch[future]
            try:
                future.result()
            except Exception as e:
                with _print_lock: log(f"FAILED {ch['slug']}: {e}", 'ERR')
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
            print(f"  python build_icse_class6.py --chapter {s} --skip-exam")

if __name__ == '__main__':
    main()
