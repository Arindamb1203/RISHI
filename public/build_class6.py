#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RISHI — Class 6 Master Builder v2
Generates ALL Class 6 content via OpenAI in one execution.

Usage:
  python build_class6.py --all                    # Build all 10 chapters
  python build_class6.py --chapter prime-time     # Build/rebuild one chapter
  python build_class6.py --list                   # Show chapter slugs
  python build_class6.py --estimate               # Cost + time estimate

Flags (combine with above):
  --skip-explain    Skip explain page generation
  --skip-practice   Skip practice page generation
  --skip-exam       Skip exam JSON generation

Run from: D:\\rishi\\public\\
"""

import os, sys, json, re, time, argparse, subprocess, shutil
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

# ── PATHS (confirmed from actual file tree) ───────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT  = SCRIPT_DIR.parent

EXPLAIN_TEMPLATE  = SCRIPT_DIR / 'explain'  / 'class7' / 'arithmetic' / 'working-with-fractions.html'
PRACTICE_TEMPLATE = SCRIPT_DIR / 'practice' / 'class8' / 'algebra'    / 'factorisation.html'

OPENAI_MODEL = 'gpt-4.1-mini'

# ── CHAPTER MANIFEST (NCERT Ganita Prakash Class 6, 2025-26) ─────
CHAPTERS = [
    {'id':1,'ch':'ch01','slug':'patterns-in-mathematics','name':'Patterns in Mathematics',
     'topic':'arithmetic','emoji':'🔢',
     'concepts':'Number sequences (counting, odd, even, square, triangular, Fibonacci), visual patterns, extending patterns, finding rules, number patterns in tables'},
    {'id':2,'ch':'ch02','slug':'lines-and-angles','name':'Lines and Angles',
     'topic':'geometry','emoji':'📐',
     'concepts':'Points, lines, line segments, rays; acute, right, obtuse, straight, reflex angles; measuring angles; complementary and supplementary angles; vertically opposite angles; parallel lines and transversal'},
    {'id':3,'ch':'ch03','slug':'number-play','name':'Number Play',
     'topic':'arithmetic','emoji':'🎲',
     'concepts':'Supercells, number puzzles, choosing numbers by rules, palindrome numbers, digit sums and divisibility, magic squares, Collatz sequence basics'},
    {'id':4,'ch':'ch04','slug':'data-handling-and-presentation','name':'Data Handling and Presentation',
     'topic':'data-handling','emoji':'📊',
     'concepts':'Collecting and organising data, tally marks, frequency tables, pictographs, bar graphs (horizontal and vertical), reading and interpreting graphs, mean of data'},
    {'id':5,'ch':'ch05','slug':'prime-time','name':'Prime Time',
     'topic':'arithmetic','emoji':'⭐',
     'concepts':'Factors and multiples, prime and composite numbers, prime factorisation (factor tree and division), HCF, LCM, divisibility rules (2,3,4,5,6,7,8,9,10,11), co-prime numbers'},
    {'id':6,'ch':'ch06','slug':'perimeter-and-area','name':'Perimeter and Area',
     'topic':'mensuration','emoji':'🔲',
     'concepts':'Perimeter of rectangle (2(l+b)), square (4s), triangle; area of square (s2), rectangle (l x b); unit squares; area of irregular shapes; real-life problems'},
    {'id':7,'ch':'ch07','slug':'fractions','name':'Fractions',
     'topic':'arithmetic','emoji':'1/2',
     'concepts':'Fraction as part of whole and collection, proper/improper/mixed fractions, equivalent fractions, simplest form, comparing fractions, addition and subtraction of like and unlike fractions, fraction of a quantity'},
    {'id':8,'ch':'ch08','slug':'playing-with-constructions','name':'Playing with Constructions',
     'topic':'geometry','emoji':'📏',
     'concepts':'Ruler and compass; line segment; perpendicular bisector; angle bisector; constructing 60, 90, 120 degree angles; equilateral triangle; square; regular hexagon'},
    {'id':9,'ch':'ch09','slug':'symmetry','name':'Symmetry',
     'topic':'geometry','emoji':'🪞',
     'concepts':'Line and reflection symmetry, lines of symmetry of regular shapes (square:4, rectangle:2, equilateral triangle:3, circle:infinite), rotational symmetry, order and angle of rotation'},
    {'id':10,'ch':'ch10','slug':'the-other-side-of-zero','name':'The Other Side of Zero',
     'topic':'arithmetic','emoji':'⚖️',
     'concepts':'Negative integers, number line with negatives, comparing and ordering integers, absolute value, addition and subtraction of integers, real-life contexts (temperature, debt, elevation)'},
]

# ── OUTPUT PATH FUNCTIONS ─────────────────────────────────────────
def explain_out(ch):
    return SCRIPT_DIR / 'explain' / 'class6' / ch['topic'] / f"{ch['slug']}.html"

def practice_out(ch):
    return SCRIPT_DIR / 'practice' / 'class6' / ch['topic'] / f"{ch['slug']}.html"

def exam_out(ch):
    return SCRIPT_DIR / 'data' / 'cbse' / 'class6' / ch['ch'] / f"{ch['ch']}-exam.json"

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

# ── TREE WRITER ───────────────────────────────────────────────────
def write_tree():
    skip = {'.git','node_modules','__pycache__','.cloudflare'}
    lines = [f"RISHI File Tree — {datetime.now().strftime('%Y-%m-%d %H:%M')}", ""]
    for dp, dns, fns in os.walk(REPO_ROOT):
        dns[:] = sorted(d for d in dns if d not in skip)
        rel   = Path(dp).relative_to(REPO_ROOT)
        depth = len(rel.parts)
        if depth > 7:
            continue
        indent = '  ' * depth
        folder = Path(dp).name if depth > 0 else 'RISHI'
        lines.append(f"{indent}+--- {folder}/")
        for fn in sorted(fns):
            lines.append(f"{indent}    {fn}")
    (REPO_ROOT / 'tree.txt').write_text('\n'.join(lines), encoding='utf-8')
    log("tree.txt updated at D:\\rishi\\tree.txt", 'OK')

# ═══════════════════════════════════════════════════════════════
# EXPLAIN GENERATION
# ═══════════════════════════════════════════════════════════════
EXPLAIN_SYS = """You create explain page content for RISHI, an NCERT Class 6 maths tutoring app for Indian students aged 11-12.
Tutor character: RISHIKA only (never Rekha).
OUTPUT: valid JSON only, no markdown, no extra text.
RULES:
- Simple language, Indian context (rupees, cricket, mithai, school, etc.)
- CBSE/NCERT terminology
- q/cq: display text. Use HTML entities (&times; &divide; &sup2; &minus; &frac12; &rarr;) and <span class='hl'>X</span> or <span class='ans-tag'>X</span>
- qs/cqs/s fields: speech text only — spell out all symbols
- anim_svg: follow EXACT pattern shown in schema — 3 step layers + 1 ans layer
- NO smart apostrophes — use straight apostrophe (') only"""

EXPLAIN_USER = """Chapter: {name} | Topic: {topic}
Concepts: {concepts}

Generate EXACTLY 10 questions (id q1..q10), easy to medium, each on a different concept.

JSON structure to output:
{{
  "title": "{name}",
  "topbar_label": "{emoji} {name}",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika! Today we explore <span class=\\"hl\\">{name}</span>! {emoji} Let&#39;s begin!",
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
      "anim_svg": "<g id=\\"q1s0\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"28\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Step 1 key point</text></g><g id=\\"q1s1\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"68\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Step 2 key point</text></g><g id=\\"q1s2\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"108\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Step 3 key point</text></g><g id=\\"q1ans\\" opacity=\\"0\\"><rect x=\\"40\\" y=\\"148\\" width=\\"320\\" height=\\"24\\" rx=\\"7\\" fill=\\"#eef2eb\\" stroke=\\"#6b4c2a\\" stroke-width=\\"1.5\\"/><text x=\\"210\\" y=\\"163\\" text-anchor=\\"middle\\" font-family=\\"Share Tech Mono\\" font-size=\\"12\\" font-weight=\\"bold\\" fill=\\"#7a8c6e\\">answer text</text></g>"
    }}
  ]
}}"""

def gen_explain(client, ch):
    data = call_openai(client, EXPLAIN_SYS,
        EXPLAIN_USER.format(name=ch['name'],topic=ch['topic'],concepts=ch['concepts'],emoji=ch['emoji']))
    if len(data.get('questions',[])) < 8:
        raise ValueError(f"Only {len(data.get('questions',[]))} explain questions returned")
    return data

# ═══════════════════════════════════════════════════════════════
# PRACTICE GENERATION
# ═══════════════════════════════════════════════════════════════
PRACTICE_SYS = """You create PRACTICE problems for RISHI NCERT Class 6 maths app.
Tutor character: RISHIKA only. OUTPUT: valid JSON only.
Practice is harder than explain — student already knows the concept.
Mix computation + 2-3 Indian-context word problems.
NO smart apostrophes — use straight apostrophe (') only."""

PRACTICE_USER = """Chapter: {name} | Topic: {topic}
Concepts: {concepts}

Generate EXACTLY 10 practice problems (id p1..p10). Mix: 7-8 skill + 2-3 word problems.

JSON structure:
{{
  "title": "{name}",
  "topbar_label": "{emoji} {name}",
  "intro": "Hi <span class=\\"hl\\" id=\\"sName\\">there</span>! I&#39;m Rishika! Let&#39;s practice <span class=\\"hl\\">{name}</span>! {emoji} Let&#39;s go!",
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
      "anim_svg": "<g id=\\"p1s0\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"28\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Step 1 key point</text></g><g id=\\"p1s1\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"68\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Step 2 key point</text></g><g id=\\"p1s2\\" opacity=\\"0\\"><text x=\\"22\\" y=\\"108\\" font-size=\\"11\\" font-weight=\\"800\\" fill=\\"#5a4a30\\">Step 3 key point</text></g><g id=\\"p1ans\\" opacity=\\"0\\"><rect x=\\"40\\" y=\\"148\\" width=\\"320\\" height=\\"24\\" rx=\\"7\\" fill=\\"#eef2eb\\" stroke=\\"#6b4c2a\\" stroke-width=\\"1.5\\"/><text x=\\"210\\" y=\\"163\\" text-anchor=\\"middle\\" font-family=\\"Share Tech Mono\\" font-size=\\"12\\" font-weight=\\"bold\\" fill=\\"#7a8c6e\\">answer text</text></g>"
    }}
  ]
}}"""

def gen_practice(client, ch):
    data = call_openai(client, PRACTICE_SYS,
        PRACTICE_USER.format(name=ch['name'],topic=ch['topic'],concepts=ch['concepts'],emoji=ch['emoji']))
    if len(data.get('questions',[])) < 8:
        raise ValueError(f"Only {len(data.get('questions',[]))} practice questions returned")
    return data

# ═══════════════════════════════════════════════════════════════
# EXAM JSON GENERATION (exact schema from actual ch01-exam.json)
# ═══════════════════════════════════════════════════════════════
EXAM_SYS = """You generate CBSE exam questions for Class 6 mathematics.
OUTPUT: valid JSON only. No markdown.
- Math must be 100% accurate for Class 6 (age 11-12)
- Use Indian number system (lakhs, crores) where relevant
- Distractors must be plausible (common student mistakes)
- Difficulty: easy=recall/simple computation, medium=application, hard=multi-step/HOTS"""

def gen_sec_A(client, ch):
    prompt = f"""Chapter: {ch['name']} (Class 6 CBSE) | Concepts: {ch['concepts']}
Generate EXACTLY 20 conceptual MCQs for Section A (1 mark each). Difficulty: 14 easy, 6 medium.
Output JSON:
{{"questions":[{{"id":"cbse_6_{ch['ch']}_A_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","difficulty":"easy","explanation":"..."}}]}}
IDs: cbse_6_{ch['ch']}_A_001 to cbse_6_{ch['ch']}_A_020"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions',[])
    if len(qs) < 18: raise ValueError(f"Sec A: got {len(qs)}/20")
    return qs[:20]

def gen_sec_B(client, ch):
    prompt = f"""Chapter: {ch['name']} (Class 6 CBSE) | Concepts: {ch['concepts']}
Generate EXACTLY 10 application/word-problem MCQs for Section B (2 marks each). All medium. Indian real-life contexts.
Output JSON:
{{"questions":[{{"id":"cbse_6_{ch['ch']}_B_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"c","difficulty":"medium","explanation":"..."}}]}}
IDs: cbse_6_{ch['ch']}_B_001 to cbse_6_{ch['ch']}_B_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions',[])
    if len(qs) < 8: raise ValueError(f"Sec B: got {len(qs)}/10")
    return qs[:10]

def gen_sec_C(client, ch):
    prompt = f"""Chapter: {ch['name']} (Class 6 CBSE) | Concepts: {ch['concepts']}
Generate EXACTLY 6 HOTS MCQs for Section C (3 marks each). All hard. Multi-step reasoning required.
Output JSON:
{{"questions":[{{"id":"cbse_6_{ch['ch']}_C_001","text":"...","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","difficulty":"hard","explanation":"..."}}]}}
IDs: cbse_6_{ch['ch']}_C_001 to cbse_6_{ch['ch']}_C_006"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions',[])
    if len(qs) < 5: raise ValueError(f"Sec C: got {len(qs)}/6")
    return qs[:6]

def gen_sec_D(client, ch):
    prompt = f"""Chapter: {ch['name']} (Class 6 CBSE) | Concepts: {ch['concepts']}
Generate EXACTLY 10 direct-input (short answer) questions for Section D (3 marks each). Medium-hard. Student types answer.
Output JSON:
{{"questions":[{{"id":"cbse_6_{ch['ch']}_D_001","text":"...","correct_answer":"...","answer_type":"text","accepted_forms":["...","..."],"difficulty":"medium","explanation":"..."}}]}}
IDs: cbse_6_{ch['ch']}_D_001 to cbse_6_{ch['ch']}_D_010"""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions',[])
    if len(qs) < 8: raise ValueError(f"Sec D: got {len(qs)}/10")
    return qs[:10]

def gen_sec_E(client, ch):
    prompt = f"""Chapter: {ch['name']} (Class 6 CBSE) | Concepts: {ch['concepts']}
Generate EXACTLY 2 case study questions for Section E. Each has 3 subparts (2 marks each). Indian real-life contexts.
Output JSON:
{{"questions":[{{"id":"cbse_6_{ch['ch']}_E_case1","case_text":"scenario paragraph","subparts":[{{"id":"cbse_6_{ch['ch']}_E_case1_q1","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"a","marks":2,"explanation":"..."}},{{"id":"cbse_6_{ch['ch']}_E_case1_q2","text":"...","type":"mcq","options":{{"a":"...","b":"...","c":"...","d":"..."}},"correct":"b","marks":2,"explanation":"..."}},{{"id":"cbse_6_{ch['ch']}_E_case1_q3","text":"...","type":"direct_input","correct_answer":"...","accepted_forms":["..."],"marks":2,"explanation":"..."}}]}}]}}
Generate 2 case studies (case1 and case2) with 3 subparts each."""
    data = call_openai(client, EXAM_SYS, prompt)
    qs = data.get('questions',[])
    if len(qs) < 2: raise ValueError(f"Sec E: got {len(qs)}/2 case studies")
    return qs[:2]

def gen_exam(client, ch):
    log("  Sec A — 20 Conceptual MCQs", 'WORK')
    sec_a = gen_sec_A(client, ch)
    log("  Sec B — 10 Application MCQs", 'WORK')
    sec_b = gen_sec_B(client, ch)
    log("  Sec C — 6 Higher Order MCQs", 'WORK')
    sec_c = gen_sec_C(client, ch)
    log("  Sec D — 10 Direct Input", 'WORK')
    sec_d = gen_sec_D(client, ch)
    log("  Sec E — 2 Case Studies", 'WORK')
    sec_e = gen_sec_E(client, ch)

    marks = (len(sec_a)*1 + len(sec_b)*2 + len(sec_c)*3 + len(sec_d)*3 +
             sum(sum(sp.get('marks',2) for sp in q.get('subparts',[])) for q in sec_e))

    return {
        "meta": {
            "board": "cbse", "class": 6,
            "chapter_id": ch['ch'], "chapter_name": ch['name'],
            "topic_group": ch['topic'],
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
    entries = [f'{json.dumps(q["anim"])}:base+{json.dumps(q["anim_svg"],ensure_ascii=False)}' for q in questions]
    return 'var svgs={\n' + ',\n'.join(entries) + '\n};'

def inject(template, ch, ai_data):
    out = template
    out = re.sub(r'<meta name="rishi-class" content="\d+">', '<meta name="rishi-class" content="6">', out)
    out = re.sub(r'<title>RISHI[^<]*</title>', f'<title>RISHI \u2014 {ai_data["title"]}</title>', out)
    out = re.sub(r'(<div class="topbar-center">)[^<]*(</div>)',
                 lambda m: m.group(1)+ai_data['topbar_label']+m.group(2), out, count=1)
    out = re.sub(r'(<div class="rishika-text" id="introText">)(.*?)(</div>)',
                 lambda m: m.group(1)+'\n        '+ai_data['intro']+'\n      '+m.group(3),
                 out, flags=re.DOTALL, count=1)
    out, n = re.subn(r'var QB=\[.*?^\];', build_qb(ai_data['questions']),
                     out, count=1, flags=re.DOTALL|re.MULTILINE)
    if n == 0: log("QB block not replaced — check template", 'WARN')
    out, _ = re.subn(r'var svgs=\{[^;]*?\n\};', build_svgs(ai_data['questions']),
                     out, count=1, flags=re.DOTALL)
    return out

# ═══════════════════════════════════════════════════════════════
# CHAPTER BUILD
# ═══════════════════════════════════════════════════════════════
def build_chapter(client, ch, do_explain, do_practice, do_exam):
    print()
    log(f"Ch {ch['id']}/10 — {ch['name']}", 'WORK')
    t0 = time.time()
    ex_tmpl = EXPLAIN_TEMPLATE.read_text(encoding='utf-8')
    pr_tmpl = PRACTICE_TEMPLATE.read_text(encoding='utf-8')

    if do_explain:
        log("Generating explain...", 'WORK')
        data = gen_explain(client, ch)
        out  = explain_out(ch)
        backup_if_exists(out)
        out.write_text(inject(ex_tmpl, ch, data), encoding='utf-8')
        log(f"explain/class6/{ch['topic']}/{ch['slug']}.html", 'OK')

    if do_practice:
        log("Generating practice...", 'WORK')
        data = gen_practice(client, ch)
        out  = practice_out(ch)
        backup_if_exists(out)
        out.write_text(inject(pr_tmpl, ch, data), encoding='utf-8')
        log(f"practice/class6/{ch['topic']}/{ch['slug']}.html", 'OK')

    if do_exam:
        log("Generating exam (5 sections)...", 'WORK')
        data = gen_exam(client, ch)
        out  = exam_out(ch)
        backup_if_exists(out)
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        n = sum(len(s['questions']) for s in data['sections'].values())
        log(f"data/cbse/class6/{ch['ch']}/{ch['ch']}-exam.json ({n} questions, {data['meta']['total_marks']} marks)", 'OK')

    log(f"Done in {time.time()-t0:.1f}s", 'OK')

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
def main():
    parser = argparse.ArgumentParser(description='RISHI Class 6 Master Builder v2')
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
    print('='*55)
    print('  RISHI Class 6 Master Builder v2')
    print('='*55)

    if args.list:
        print()
        for c in CHAPTERS:
            print(f"  {c['id']:>2}. {c['slug']:<40} [{c['topic']}]")
        return

    if args.estimate:
        n = 1 if args.chapter else len(CHAPTERS)
        per = (0 if args.skip_explain else 1)+(0 if args.skip_practice else 1)+(0 if args.skip_exam else 5)
        calls = n * per
        print(f"\n  Chapters : {n}")
        print(f"  API calls: ~{calls}")
        print(f"  Est. cost: ~${calls*0.004:.2f} USD")
        print(f"  Est. time: ~{calls*20//60} min {calls*20%60} sec")
        return

    validate_setup()
    client = get_client()
    log(f"Model: {OPENAI_MODEL}", 'OK')

    chapters = [c for c in CHAPTERS if c['slug']==args.chapter] if args.chapter else CHAPTERS
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

    write_tree()
    elapsed = time.time()-t0

    print()
    print('='*55)
    print(f"  BUILD COMPLETE — {elapsed/60:.1f} minutes")
    print('='*55)
    log(f"Success: {len(chapters)-len(failures)}/{len(chapters)}", 'OK')

    if failures:
        print()
        log("Failed chapters — rerun individually:", 'ERR')
        for s in failures:
            print(f"  python build_class6.py --chapter {s}")

    print()
    print("NEXT STEPS:")
    print("  cd D:\\rishi")
    print("  git add .")
    print('  git commit -m "Class 6: AI-generated content"')
    print("  git push")
    print()
    print("  Then share these 5 files for portal wiring:")
    print("  syllabus.html, parent.html, admin.html,")
    print("  topic-exam.html, sampurna-pariksha.html")

if __name__ == '__main__':
    main()
