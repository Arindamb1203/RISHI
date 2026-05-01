"""
RISHI — generate.py
Generates a complete chapter from a content JSON file.
Outputs: explain HTML, practice HTML, and updates syllabus/parent/admin.

Usage (run from D:\\rishi\\public):
  python generate.py chapters/class9/polynomials.json

What it does:
  1. Reads chapter content from JSON
  2. Generates explain/classX/topic/chapter.html
  3. Generates practice/classX/topic/chapter.html
  4. Updates syllabus.html (built:true)
  5. Updates parent.html (explainBuilt)
  6. Updates admin.html (built:true)
"""

import os, sys, json, re

ROOT = os.path.dirname(os.path.abspath(__file__))

if len(sys.argv) < 2:
    print("Usage: python generate.py chapters/class9/polynomials.json")
    sys.exit(1)

content_file = sys.argv[1]
if not os.path.isabs(content_file):
    content_file = os.path.join(ROOT, content_file)

if not os.path.exists(content_file):
    print(f"ERROR: Content file not found: {content_file}")
    sys.exit(1)

with open(content_file, 'r', encoding='utf-8') as f:
    C = json.load(f)

# ── Validate required fields ──────────────────────────────────────────────────
required = ['chapter_slug', 'chapter_name', 'chapter_emoji', 'class_num', 'board',
            'topic', 'chap_id', 'intro_text', 'explain_questions', 'practice_questions']
for r in required:
    if r not in C:
        print(f"ERROR: Missing required field '{r}' in content JSON")
        sys.exit(1)

SLUG     = C['chapter_slug']       # e.g. polynomials
NAME     = C['chapter_name']       # e.g. Polynomials
EMOJI    = C['chapter_emoji']      # e.g. 🔣
CLASS    = str(C['class_num'])     # e.g. 9
BOARD    = C['board']              # e.g. cbse
TOPIC    = C['topic']              # e.g. algebra
CHAP_ID  = int(C['chap_id'])       # e.g. 2
INTRO    = C['intro_text']         # Rishika's intro speech
EXQ      = C['explain_questions']  # list of explain questions
PRQ      = C['practice_questions'] # list of practice questions
PRACTICE_PATH = f"/practice/class{CLASS}/{TOPIC}/{SLUG}.html"
EXAM_KEY = C.get('exam_key', f"c{CLASS}-{str(CHAP_ID).zfill(2)}")

# ── Output paths ──────────────────────────────────────────────────────────────
explain_dir  = os.path.join(ROOT, 'explain',  f'class{CLASS}', TOPIC)
practice_dir = os.path.join(ROOT, 'practice', f'class{CLASS}', TOPIC)
os.makedirs(explain_dir,  exist_ok=True)
os.makedirs(practice_dir, exist_ok=True)

explain_out  = os.path.join(explain_dir,  f'{SLUG}.html')
practice_out = os.path.join(practice_dir, f'{SLUG}.html')

# ── EXPLAIN PAGE GENERATOR ────────────────────────────────────────────────────
def build_explain_qb_js(questions):
    lines = ['var QB=[']
    for i, q in enumerate(questions):
        steps_js = json.dumps(q['steps'], ensure_ascii=False)
        nudges_js = json.dumps(q['nudges'], ensure_ascii=False)
        ans_js = json.dumps(q['answers'], ensure_ascii=False)
        anim_svg = json.dumps(q.get('anim_svg', ''), ensure_ascii=False)
        comma = '' if i == len(questions)-1 else ','
        lines.append(f"""{{
id:{json.dumps(q["id"])},
q:{json.dumps(q["question"])},
qs:{json.dumps(q["question_spoken"])},
anim:{json.dumps(q["id"])},
steps:{steps_js},
cq:{json.dumps(q["confirm_question"])},
cqs:{json.dumps(q["confirm_question_spoken"])},
ans:{ans_js},
nudges:{nudges_js},
anim_svg:{anim_svg}
}}{comma}""")
    lines.append('];')
    return '\n'.join(lines)

def build_anim_svgs_js(questions):
    lines = ['function getAnimSVG(t){', 'var base=\'<svg viewBox="0 0 420 178" xmlns="http://www.w3.org/2000/svg" style="font-family:Nunito,sans-serif;background:#fffdf8"><rect width="420" height="178" fill="#fffdf8"/>\';', 'var svgs={']
    for i, q in enumerate(questions):
        svg = q.get('anim_svg', '')
        comma = '' if i == len(questions)-1 else ','
        lines.append(f'{json.dumps(q["id"])}:base+{json.dumps(svg)}{comma}')
    lines.append('};')
    lines.append('return svgs[t]||\'<svg viewBox="0 0 420 178"><text x="210" y="89" text-anchor="middle" font-family="Nunito" font-size="14" fill="#5a4a30">Loading...</text></svg>\';')
    lines.append('}')
    return '\n'.join(lines)

explain_qb_js   = build_explain_qb_js(EXQ)
anim_svgs_js    = build_anim_svgs_js(EXQ)
celebrate_text  = C.get('complete_message', f'You have mastered {NAME}! Keep going! &#128170;')

EXPLAIN_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="rishi-board" content="{BOARD}">
<meta name="rishi-class" content="{CLASS}">
<title>RISHI — {NAME}</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Nunito:wght@400;600;700;800;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<style>
:root{{--cream:#fdf6ec;--warm-white:#fffdf8;--gold:#c8922a;--gold-light:#e8b84b;--gold-pale:#f5e6c8;--amber:#d4870a;--sage:#7a8c6e;--sage-light:#a8b89a;--rust:#b85c2a;--charcoal:#2a2218;--mid:#5a4a30;--soft:#8a7a5a;--inactive:#c8b89a;--border-dark:#6b4c2a;}}
*{{box-sizing:border-box;margin:0;padding:0;}}
body{{background:var(--cream);font-family:Nunito,sans-serif;min-height:100vh;color:var(--charcoal);}}
body::before{{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--gold-pale) 1px,transparent 1px),linear-gradient(90deg,var(--gold-pale) 1px,transparent 1px);background-size:40px 40px;opacity:.3;z-index:0;pointer-events:none;}}
.topbar{{position:sticky;top:0;z-index:100;background:rgba(253,246,236,.97);border-bottom:2px solid var(--border-dark);backdrop-filter:blur(8px);padding:10px 18px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}}
.logo-sm{{font-family:'Orbitron',sans-serif;font-size:17px;font-weight:900;letter-spacing:4px;background:linear-gradient(135deg,var(--amber),var(--gold-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}}
.topbar-center{{font-family:'Orbitron',sans-serif;font-size:10px;letter-spacing:2px;color:var(--amber);text-transform:uppercase;}}
.topbar-right{{display:flex;gap:8px;}}
.btn-topbar{{font-family:Nunito,sans-serif;font-size:12px;font-weight:900;padding:6px 14px;border-radius:20px;border:2px solid var(--border-dark);background:var(--warm-white);color:var(--mid);cursor:pointer;}}
.btn-topbar.back{{background:var(--gold-pale);}}
.prog-wrap{{position:relative;z-index:10;padding:8px 18px;background:rgba(255,253,248,.9);border-bottom:1.5px solid var(--gold-pale);}}
.prog-info{{display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:var(--mid);margin-bottom:5px;}}
.prog-bar{{height:6px;background:var(--gold-pale);border-radius:4px;overflow:hidden;}}
.prog-fill{{height:100%;background:linear-gradient(90deg,var(--sage),var(--gold));border-radius:4px;transition:width .5s ease;}}
.main{{position:relative;z-index:10;max-width:820px;margin:0 auto;padding:14px 14px 120px;}}
.rishika-wrap{{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;}}
.rishika-avatar{{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--sage),var(--sage-light));border:2px solid var(--border-dark);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}}
.rishika-bubble{{background:rgba(255,253,248,.97);border:2px solid var(--border-dark);border-radius:0 16px 16px 16px;padding:12px 16px;flex:1;box-shadow:0 4px 20px rgba(107,76,42,.1);}}
.rishika-name{{font-size:10px;font-weight:900;color:var(--sage);letter-spacing:2px;text-transform:uppercase;margin-bottom:5px;}}
.rishika-text{{font-size:14px;font-weight:700;color:var(--charcoal);line-height:1.6;}}
.hl{{color:var(--amber);font-weight:900;}}
.btn-speak{{display:inline-flex;align-items:center;gap:6px;font-family:Nunito,sans-serif;font-size:11px;font-weight:900;padding:5px 11px;border-radius:20px;border:2px solid var(--sage);background:#eef2eb;color:var(--sage);cursor:pointer;margin-top:8px;}}
.q-card{{background:rgba(255,253,248,.97);border:2px solid var(--border-dark);border-radius:16px;padding:16px 18px;margin-bottom:12px;box-shadow:0 4px 20px rgba(107,76,42,.1);}}
.q-label{{font-family:'Orbitron',sans-serif;font-size:10px;letter-spacing:3px;color:var(--amber);text-transform:uppercase;margin-bottom:8px;}}
.q-text{{font-size:15px;font-weight:800;color:var(--charcoal);line-height:1.6;margin-bottom:10px;}}
.step{{display:flex;gap:10px;margin-bottom:12px;opacity:0;transform:translateY(6px);transition:all .4s ease;}}
.step.vis{{opacity:1;transform:translateY(0);}}
.step-num{{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--amber),var(--gold-light));color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid var(--border-dark);}}
.step-body{{flex:1;font-size:13px;font-weight:700;color:var(--mid);line-height:1.6;padding-top:2px;}}
.anim-panel{{background:#fffdf8;border:2px solid var(--border-dark);border-radius:14px;margin-bottom:12px;overflow:hidden;}}
.anim-header{{background:linear-gradient(135deg,var(--charcoal),#3d2e1a);padding:7px 14px;display:flex;align-items:center;justify-content:space-between;}}
.anim-header-lbl{{font-family:'Orbitron',sans-serif;font-size:9px;letter-spacing:2px;color:var(--gold-light);text-transform:uppercase;}}
.anim-replay{{font-size:10px;font-weight:900;color:var(--gold-pale);background:none;border:1px solid var(--gold-pale);border-radius:20px;padding:2px 9px;cursor:pointer;display:none;}}
.anim-canvas{{width:100%;max-height:195px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fffdf8;}}
.anim-canvas svg{{width:100%;max-height:195px;}}
.anim-status{{padding:6px 14px;font-size:12px;font-weight:800;color:var(--mid);text-align:center;min-height:26px;border-top:1px solid var(--gold-pale);}}
.anim-play-btn{{width:100%;padding:10px;font-family:Nunito,sans-serif;font-size:14px;font-weight:900;background:linear-gradient(135deg,var(--amber),var(--gold-light));color:#fff;border:none;cursor:pointer;}}
.anim-play-btn:disabled{{background:var(--gold-pale);color:var(--inactive);cursor:not-allowed;}}
.steps-btn{{width:100%;padding:10px;font-family:Nunito,sans-serif;font-size:14px;font-weight:900;background:linear-gradient(135deg,var(--sage),var(--sage-light));color:#fff;border:none;cursor:pointer;display:none;border-top:1px solid var(--gold-pale);}}
.confirm-wrap{{margin-top:12px;background:linear-gradient(135deg,#eef2eb,#f5fbf2);border:2px solid var(--border-dark);border-radius:14px;padding:16px 18px;}}
.confirm-title{{font-size:11px;font-weight:900;color:var(--sage);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}}
.confirm-q{{font-size:14px;font-weight:800;color:var(--charcoal);margin-bottom:12px;line-height:1.5;}}
.result-box{{font-size:12px;font-weight:800;padding:9px 13px;border-radius:9px;display:none;line-height:1.4;}}
.result-box.ok{{background:#eef2eb;border:2px solid var(--sage);color:var(--sage);display:block;}}
.result-box.no{{background:#fff5f0;border:2px solid var(--rust);color:var(--rust);display:block;}}
.nudge{{font-size:12px;font-weight:700;color:var(--mid);margin-top:7px;font-style:italic;display:none;}}
.nudge.show{{display:block;}}
.btn-next{{font-family:Nunito,sans-serif;font-size:14px;font-weight:900;padding:11px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--amber),var(--gold-light));color:#fff;cursor:pointer;display:none;margin-top:10px;width:100%;}}
.btn-next.show{{display:block;}}
.bottom-nav{{position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(253,246,236,.97);border-top:2px solid var(--border-dark);padding:10px 18px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;align-items:center;}}
.btn-nav{{font-family:Nunito,sans-serif;font-size:13px;font-weight:900;padding:10px 20px;border-radius:12px;border:2px solid var(--border-dark);cursor:pointer;}}
.btn-nav.practice{{background:linear-gradient(135deg,var(--sage),var(--sage-light));color:#fff;border-color:var(--sage);}}
.btn-nav.exam{{background:linear-gradient(135deg,var(--amber),var(--gold-light));color:#fff;border-color:var(--amber);}}
.btn-nav.locked{{background:var(--gold-pale);color:var(--inactive);cursor:not-allowed;border-color:var(--inactive);}}
.lock-tip{{font-size:10px;font-weight:700;color:var(--rust);width:100%;text-align:center;}}
.overlay{{display:none;position:fixed;inset:0;background:rgba(42,34,24,.92);z-index:1000;flex-direction:column;align-items:center;justify-content:center;backdrop-filter:blur(6px);}}
.overlay.show{{display:flex;}}
.break-box{{background:var(--warm-white);border:2px solid var(--border-dark);border-radius:22px;padding:28px 32px;max-width:380px;width:90%;text-align:center;}}
.break-title{{font-family:'Orbitron',sans-serif;font-size:14px;font-weight:900;color:var(--amber);letter-spacing:3px;margin-bottom:5px;}}
.break-sub{{font-size:12px;font-weight:700;color:var(--soft);margin-bottom:16px;}}
.break-opts{{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;}}
.break-opt{{font-family:Nunito,sans-serif;font-size:14px;font-weight:800;padding:11px;border-radius:11px;border:2px solid var(--border-dark);background:var(--warm-white);color:var(--mid);cursor:pointer;}}
.timer-screen{{display:none;position:fixed;inset:0;background:#1a1208;z-index:1001;flex-direction:column;align-items:center;justify-content:center;}}
.timer-screen.show{{display:flex;}}
.timer-reason{{font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:4px;color:var(--gold-light);margin-bottom:16px;text-transform:uppercase;}}
.timer-num{{font-family:'Orbitron',sans-serif;font-size:68px;font-weight:900;color:var(--gold-light);letter-spacing:6px;margin-bottom:30px;}}
.btn-end{{font-family:Nunito,sans-serif;font-size:16px;font-weight:900;padding:13px 32px;border-radius:13px;border:2px solid var(--gold-light);background:transparent;color:var(--gold-light);cursor:pointer;}}
.done-banner{{background:linear-gradient(135deg,#eef2eb,#f5fbf2);border:2px solid var(--border-dark);border-radius:14px;padding:14px 18px;text-align:center;margin-bottom:14px;display:none;}}
.done-banner.show{{display:block;}}
.done-banner .dt{{font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:2px;color:var(--sage);margin-bottom:4px;}}
.done-banner .ds{{font-size:13px;font-weight:700;color:var(--mid);}}
.math-raw{{width:100%;padding:10px 13px;border-radius:10px;border:2px solid var(--border-dark);background:var(--warm-white);color:var(--charcoal);font-size:1rem;font-family:'Share Tech Mono',monospace;resize:none;outline:none;min-height:48px;line-height:1.6;transition:border-color .2s;}}
.math-raw:focus{{border-color:var(--amber);}}
.math-raw::placeholder{{color:var(--inactive);font-family:Nunito,sans-serif;}}
.math-preview-label{{font-size:0.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--soft);margin:.5rem 0 .25rem;}}
.math-preview{{min-height:44px;padding:.6rem 1rem;background:#f9f4ec;border-radius:8px;border:1.5px solid var(--gold-pale);font-size:1.1rem;color:var(--charcoal);overflow-x:auto;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}}
.sugg-chips{{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:10px;}}
.schip{{border:1.5px solid #1a6aaa;border-radius:20px;padding:.25rem .75rem;font-size:.78rem;cursor:pointer;background:#eef6ff;color:#0a5a9a;font-family:Nunito,sans-serif;font-weight:800;}}
#rWrap{{position:fixed;bottom:68px;left:10px;z-index:200;width:82px;pointer-events:none;}}
#rChar{{width:82px;filter:drop-shadow(0 4px 10px rgba(107,76,42,.3));}}
@keyframes rIn{{from{{transform:translateY(50px);opacity:0}}to{{transform:translateY(0);opacity:1}}}}
@keyframes rBounce{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(-9px)}}}}
@media(max-width:600px){{.main{{padding:10px 10px 120px;}}}}
</style>
<script src="/rishi-sync.js"></script>
<script src="/rishi-core.js"></script>
<script src="/rishi-presence.js"></script>
</head>
<body>
<div class="topbar">
  <div class="logo-sm">RISHI</div>
  <div class="topbar-center">{EMOJI} {NAME}</div>
  <div class="topbar-right">
    <button class="btn-topbar" onclick="openBreak()">&#9749; Break</button>
    <button class="btn-topbar back" onclick="location.href='/syllabus.html'">&#8592; Syllabus</button>
  </div>
</div>
<div class="prog-wrap">
  <div class="prog-info"><span id="progLabel">Question 1 of 10</span><span id="progPct">0%</span></div>
  <div class="prog-bar"><div class="prog-fill" id="progFill" style="width:0%"></div></div>
</div>
<div class="main">
  <div class="done-banner" id="doneBanner">
    <div class="dt">&#10003; Explanation Completed!</div>
    <div class="ds">Practice and Exam now unlocked.</div>
  </div>
  <div class="rishika-wrap">
    <div class="rishika-avatar">&#128105;&#8205;&#127979;</div>
    <div class="rishika-bubble">
      <div class="rishika-name">Rishika</div>
      <div class="rishika-text" id="introText">{INTRO}</div>
      <button class="btn-speak" onclick="startLesson()" id="startBtn">&#9654; Start Lesson</button>
    </div>
  </div>
  <div id="qArea"></div>
</div>
<div class="bottom-nav">
  <div class="lock-tip" id="lockTip">&#9757; Complete explanations to unlock Practice and Exam</div>
  <button class="btn-nav practice locked" id="btnPractice" onclick="goPractice()">&#9999;&#65039; Practice</button>
  <button class="btn-nav exam locked" id="btnExam" onclick="goExam()">&#128221; Exam</button>
</div>
<div class="overlay" id="breakOv">
  <div class="break-box">
    <div class="break-title">Break</div>
    <div class="break-sub">Choose &mdash; timer starts</div>
    <div class="break-opts">
      <button class="break-opt" onclick="startBreak('Water')">&#128167; Water</button>
      <button class="break-opt" onclick="startBreak('Washroom')">&#128701; Washroom</button>
      <button class="break-opt" onclick="startBreak('Physical')">&#127939; Physical</button>
    </div>
    <button class="break-opt" style="color:var(--soft)" onclick="closeBreak()">Cancel</button>
  </div>
</div>
<div class="timer-screen" id="timerScreen">
  <div class="timer-reason" id="timerLbl">Break</div>
  <div class="timer-num" id="timerNum">00:00</div>
  <button class="btn-end" onclick="endBreak()">&#10003; End Break</button>
</div>
<div id="rWrap">
<svg id="rChar" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="68" rx="36" ry="28" fill="#5a8a60" stroke="#3d6b42" stroke-width="2"/>
  <ellipse cx="50" cy="66" rx="22" ry="16" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5"/>
  <line x1="50" y1="50" x2="50" y2="82" stroke="#5a8a60" stroke-width="1.5"/>
  <line x1="28" y1="66" x2="72" y2="66" stroke="#5a8a60" stroke-width="1.5"/>
  <ellipse cx="20" cy="82" rx="10" ry="7" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(-20,20,82)"/>
  <ellipse cx="80" cy="82" rx="10" ry="7" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(20,80,82)"/>
  <ellipse cx="22" cy="58" rx="9" ry="6" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(20,22,58)"/>
  <ellipse cx="78" cy="58" rx="9" ry="6" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(-20,78,58)"/>
  <ellipse cx="50" cy="42" rx="10" ry="14" fill="#8fba6a" stroke="#5a8a60" stroke-width="1.5"/>
  <ellipse cx="50" cy="28" rx="18" ry="16" fill="#8fba6a" stroke="#5a8a60" stroke-width="2"/>
  <ellipse cx="43" cy="24" rx="5" ry="5.5" fill="white"/><ellipse cx="57" cy="24" rx="5" ry="5.5" fill="white"/>
  <ellipse cx="43" cy="25" rx="3" ry="3.5" fill="#1a3a1a"/><ellipse cx="57" cy="25" rx="3" ry="3.5" fill="#1a3a1a"/>
  <circle cx="44" cy="23" r="1.2" fill="white"/><circle cx="58" cy="23" r="1.2" fill="white"/>
  <ellipse id="rLid1" cx="43" cy="24" rx="5" ry="1" fill="#8fba6a" opacity="0"/>
  <ellipse id="rLid2" cx="57" cy="24" rx="5" ry="1" fill="#8fba6a" opacity="0"/>
  <path id="rMouth" d="M44,33 Q50,38 56,33" fill="none" stroke="#3d6b42" stroke-width="2" stroke-linecap="round"/>
  <ellipse id="rBlush1" cx="36" cy="30" rx="7" ry="4" fill="#ff9999" opacity="0"/>
  <ellipse id="rBlush2" cx="64" cy="30" rx="7" ry="4" fill="#ff9999" opacity="0"/>
  <rect x="28" y="90" width="44" height="13" fill="#d4870a" rx="4"/>
  <text x="50" y="100" text-anchor="middle" font-family="Nunito" font-size="7" font-weight="900" fill="white">RISHIKA</text>
</svg>
</div>
<script>
var voicesReady=false,selectedVoice=null,elAudio=null;
function pickVoice(){{var vs=window.speechSynthesis.getVoices();if(!vs||vs.length===0)return false;var fk=["heera","veena","priya","raveena","female","woman","zira","samantha","victoria","karen"];for(var i=0;i<vs.length;i++){{if(vs[i].lang.toLowerCase().indexOf("en-in")===0){{var n=vs[i].name.toLowerCase();for(var k=0;k<fk.length;k++){{if(n.indexOf(fk[k])>=0){{selectedVoice=vs[i];return true;}}}}}}}}for(var i=0;i<vs.length;i++){{if(vs[i].lang.toLowerCase().indexOf("en")===0){{var n=vs[i].name.toLowerCase();for(var k=0;k<fk.length;k++){{if(n.indexOf(fk[k])>=0){{selectedVoice=vs[i];return true;}}}}}}}}return false;}}
function initVoices(cb){{if(pickVoice()){{voicesReady=true;cb();return;}}window.speechSynthesis.onvoiceschanged=function(){{window.speechSynthesis.onvoiceschanged=null;pickVoice();voicesReady=true;cb();}};setTimeout(function(){{if(!voicesReady){{pickVoice();voicesReady=true;cb();}}}},2000);}}
function stopAllAudio(){{if(elAudio){{try{{elAudio.pause();elAudio.src="";}}catch(x){{}}elAudio=null;}}if(window.speechSynthesis)window.speechSynthesis.cancel();}}
function sayBrowser(text,onEnd){{if(!window.speechSynthesis)return;window.speechSynthesis.cancel();rStartTalk(text.length);var u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=0.88;u.pitch=1.15;if(selectedVoice)u.voice=selectedVoice;u.onend=function(){{rStopTalk();if(onEnd)onEnd();}};u.onerror=function(){{rStopTalk();if(onEnd)onEnd();}};window.speechSynthesis.speak(u);}}
function say(text,onEnd){{stopAllAudio();rStartTalk(text.length);fetch("/tts",{{method:"POST",headers:{{"Content-Type":"application/json"}},body:JSON.stringify({{text:text}})}}).then(function(res){{if(!res.ok)throw new Error("TTS "+res.status);return res.blob();}}).then(function(blob){{var url=URL.createObjectURL(blob);elAudio=new Audio(url);elAudio.onended=function(){{URL.revokeObjectURL(url);elAudio=null;rStopTalk();if(onEnd)onEnd();}};elAudio.onerror=function(){{URL.revokeObjectURL(url);elAudio=null;rStopTalk();if(onEnd)onEnd();}};var p=elAudio.play();if(p&&p.catch){{p.catch(function(){{URL.revokeObjectURL(url);elAudio=null;sayBrowser(text,onEnd);}});}}}}).catch(function(err){{sayBrowser(text,onEnd);}});}}
function sayEl(id){{var e=G(id);if(e)say(e.innerText||e.textContent);}}
window.addEventListener("beforeunload",function(){{stopAllAudio();}});
var mouthTmr=null,blinkTmr=null,mOpen=false;
function rInit(){{var c=G("rChar");if(c)c.style.animation="rIn .6s cubic-bezier(.34,1.56,.64,1) forwards";scheduleBlink();}}
function scheduleBlink(){{blinkTmr=setTimeout(function(){{rBlink();scheduleBlink();}},2200+Math.random()*3000);}}
function rBlink(){{var l=G("rLid1"),r=G("rLid2");if(!l||!r)return;l.setAttribute("ry","5.5");r.setAttribute("ry","5.5");setTimeout(function(){{l.setAttribute("ry","1");r.setAttribute("ry","1");}},120);}}
function rStartTalk(len){{rStopTalk();G("rBlush1").style.opacity="0.7";G("rBlush2").style.opacity="0.7";mOpen=false;mouthTmr=setInterval(function(){{mOpen=!mOpen;var m=G("rMouth");if(!m)return;if(mOpen){{m.setAttribute("d","M42,33 Q50,42 58,33");m.setAttribute("fill","#1a3a1a");}}else{{m.setAttribute("d","M44,33 Q50,38 56,33");m.setAttribute("fill","none");}}}},160);setTimeout(rStopTalk,Math.max(1800,(len||20)*58));}}
function rStopTalk(){{clearInterval(mouthTmr);mOpen=false;var m=G("rMouth");if(m){{m.setAttribute("d","M44,33 Q50,38 56,33");m.setAttribute("fill","none");}}G("rBlush1").style.opacity="0";G("rBlush2").style.opacity="0";}}
function rHappy(){{var c=G("rChar");if(c)c.style.animation="rBounce .35s ease-in-out 5";G("rBlush1").style.opacity="1";G("rBlush2").style.opacity="1";setTimeout(function(){{rStopTalk();var c=G("rChar");if(c)c.style.animation="none";}},2500);}}
function rThink(){{setTimeout(rStopTalk,1800);}}

{explain_qb_js}

{anim_svgs_js}

function makeAnimPlay(id,steps,ansLabel){{return function(done){{setStatus("Solving step by step...");var delay=600;steps.forEach(function(_,i){{var d=delay+i*2800;(function(ii,dd){{at(dd,function(){{fade(id+"s"+ii,1);}});}})( i,d);}});at(delay+steps.length*2800,function(){{fade(id+"ans",1);setStatus("Answer: "+ansLabel);at(2000,done);}});}}; }}
var ANIM_PLAYS={{}};
QB.forEach(function(q){{ANIM_PLAYS[q.id]=makeAnimPlay(q.id,q.steps,q.ans[0]);}});
function getAnimPlay(t){{return ANIM_PLAYS[t]||function(done){{done();}};}}

var atTimers=[],session=[],idx=0,stepIdx=0,nudgeCount=0,completed=false,breakSecs=0,breakTmr=null,PER_SESSION=10;
function G(id){{return document.getElementById(id);}}
function clearAt(){{for(var i=0;i<atTimers.length;i++)clearTimeout(atTimers[i]);atTimers=[];}}
function at(ms,fn){{atTimers.push(setTimeout(fn,ms));}}
function fade(id,v){{var e=G(id);if(e){{e.style.transition="opacity .5s";e.style.opacity=v;}}}}
function setStatus(t){{var e=G("animStatus");if(e)e.textContent=t;}}
function startLesson(){{var btn=G('startBtn');if(btn){{btn.disabled=true;btn.textContent='▶ Starting...';}}var done=false;function proceed(){{if(!done){{done=true;setTimeout(showQ,600);}}}}say(G('introText').innerText,proceed);setTimeout(proceed,8000);}}
function init(){{
  rishiCheckPlan({CHAP_ID});
  var st=JSON.parse(localStorage.getItem("rishi_current_student")||"{{}}");
  G("sName")&&(G("sName").textContent=st.studentName?st.studentName.split(" ")[0]:"there");
  if(rishiIsExplainDone({CHAP_ID})){{completed=true;G("doneBanner").classList.add("show");unlockNav();}}
  buildSession();rInit();
  initVoices(function(){{startLesson();}});
}}
function buildSession(){{session=QB.slice().sort(function(){{return Math.random()-.5;}}).slice(0,PER_SESSION);}}
function showQ(){{
  if(idx>=session.length){{onComplete();return;}}
  var q=session[idx];stepIdx=0;nudgeCount=0;updateProg();G("qArea").innerHTML="";clearAt();
  var qc=document.createElement("div");qc.className="q-card";
  qc.innerHTML='<div class="q-label">Question '+(idx+1)+' of '+PER_SESSION+'</div><div class="q-text">'+q.q+'</div><button class="btn-speak" onclick="say(session[idx].qs)">&#128266; Hear</button>';
  G("qArea").appendChild(qc);
  var ap=document.createElement("div");ap.className="anim-panel";
  ap.innerHTML='<div class="anim-header"><span class="anim-header-lbl">&#127909; Live Animation</span><button class="anim-replay" id="animReplay" onclick="replayAnim()">&#8635; Replay</button></div>'
    +'<div class="anim-canvas" id="animCanvas">'+getAnimSVG(q.anim)+'</div>'
    +'<div class="anim-status" id="animStatus">Tap Play to watch with narration!</div>'
    +'<button class="anim-play-btn" id="animPlayBtn" onclick="startAnim()">&#9654; Play Animation</button>'
    +'<button class="steps-btn" id="stepsBtn" onclick="beginSteps()">&#128214; See Step-by-Step</button>';
  G("qArea").appendChild(ap);setTimeout(startAnim,800);
}}
function startAnim(){{var q=session[idx];var pb=G("animPlayBtn");if(pb){{pb.disabled=true;pb.textContent="&#9654; Playing...";}}getAnimPlay(q.anim)(function(){{var sb=G("stepsBtn");if(sb)sb.style.display="block";var rb=G("animReplay");if(rb)rb.style.display="block";if(pb)pb.style.display="none";setTimeout(beginSteps,600);}});}}
function replayAnim(){{clearAt();window.speechSynthesis&&window.speechSynthesis.cancel();rStopTalk();var q=session[idx];G("animCanvas").innerHTML=getAnimSVG(q.anim);G("animReplay").style.display="none";G("stepsBtn").style.display="none";var pb=G("animPlayBtn");if(pb){{pb.style.display="block";pb.disabled=false;pb.textContent="&#9654; Play Animation";}}setStatus("Tap Play to watch with narration!");}}
function beginSteps(){{var q=session[idx];var sc=document.createElement("div");sc.className="q-card";sc.innerHTML='<div class="q-label">&#128214; Step-by-Step</div><div id="stepsWrap"></div><button class="btn-speak" id="nxtStepBtn" onclick="nextStep()" style="margin-top:10px;">&#9654; Next Step</button>';G("qArea").appendChild(sc);sc.scrollIntoView({{behavior:"smooth",block:"start"}});G("stepsBtn").style.display="none";setTimeout(nextStep,350);}}
function nextStep(){{var q=session[idx];if(stepIdx>=q.steps.length){{G("nxtStepBtn").style.display="none";var ib=document.createElement("button");ib.className="btn-speak";ib.innerHTML="&#9989; I Understand!";ib.style.cssText="margin-top:16px;width:100%;";ib.onclick=function(){{ib.remove();showConfirm();}};G("stepsWrap").appendChild(ib);ib.scrollIntoView({{behavior:"smooth",block:"center"}});return;}}var s=q.steps[stepIdx];var wrap=G("stepsWrap");var d=document.createElement("div");d.className="step";d.innerHTML='<div class="step-num">'+(stepIdx+1)+'</div><div class="step-body">'+s.t+'</div>';wrap.appendChild(d);setTimeout(function(){{d.classList.add("vis");}},40);setTimeout(nextStep,3500);stepIdx++;}}
function showConfirm(){{
  var q=session[idx];var c=document.createElement("div");c.className="confirm-wrap";
  c.innerHTML='<div class="confirm-title">&#127917; Rishika asks!</div>'
    +'<div class="confirm-q">'+q.cq+'</div>'
    +'<textarea id="rawAnswer" class="math-raw" rows="2" placeholder="Type your answer here..."></textarea>'
    +'<div class="math-preview-label">Preview</div>'
    +'<div class="math-preview" id="mathPreview"></div>'
    +'<div class="sugg-chips" id="suggChips"></div>'
    +'<button type="button" onclick="submitTyped()" style="width:100%;font-family:Nunito,sans-serif;font-size:14px;font-weight:900;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--amber),var(--gold-light));color:#fff;cursor:pointer;margin-bottom:8px;">Submit Answer</button>'
    +'<div class="result-box" id="rbox"></div>'
    +'<div class="nudge" id="nudgeBox"></div>'
    +'<button type="button" class="btn-next" id="btnNext" onclick="goNext()">Next Question &#9654;</button>';
  G("qArea").appendChild(c);c.scrollIntoView({{behavior:"smooth",block:"center"}});
  var ra=G("rawAnswer");
  if(ra){{ra.addEventListener("input",mathUpdate);ra.addEventListener("keydown",function(ev){{if(ev.key==="Enter"&&!ev.shiftKey){{ev.preventDefault();submitTyped();}}}});setTimeout(function(){{ra.focus();}},300);}}
  buildSuggChips(q.ans);say(q.cqs);
}}
function submitTyped(){{var ra=G("rawAnswer");if(!ra)return;var val=String(ra.value||"").trim();if(!val){{ra.focus();return;}}handleAnswer(val.toLowerCase());}}
function goNext(){{idx++;G("qArea").innerHTML="";showQ();window.scrollTo({{top:0,behavior:"smooth"}});}}
function updateProg(){{var pct=Math.round((idx/PER_SESSION)*100);G("progFill").style.width=pct+"%";G("progLabel").textContent="Question "+(idx+1)+" of "+PER_SESSION;G("progPct").textContent=pct+"%";}}
function unlockNav(){{G("btnPractice").classList.remove("locked");G("btnExam").classList.remove("locked");G("lockTip").style.display="none";}}
function onComplete(){{
  rishiMarkExplainDone({CHAP_ID});
  completed=true;G("doneBanner").classList.add("show");unlockNav();
  var st=JSON.parse(localStorage.getItem("rishi_current_student")||"{{}}");
  var nm=st.studentName?st.studentName.split(" ")[0]:"champion";
  var cel=document.createElement("div");cel.className="rishika-wrap";
  cel.innerHTML='<div class="rishika-avatar">&#128105;&#8205;&#127979;</div>'
    +'<div class="rishika-bubble"><div class="rishika-name">Rishika</div>'
    +'<div class="rishika-text" id="celText">&#127881; <span class="hl">'+nm+'</span>, {celebrate_text}</div>'
    +'<button class="btn-speak" onclick="sayEl(\\'celText\\')">&#128266; Hear</button></div>';
  G("qArea").appendChild(cel);setTimeout(function(){{sayEl("celText");rHappy();}},400);
}}
function goPractice(){{if(!completed){{alert("Complete explanations first!");return;}}location.href="{PRACTICE_PATH}";}}
function goExam(){{if(!completed){{alert("Complete explanations first!");return;}}location.href="/exam.html?ch={EXAM_KEY}";}}
var CELEBRATIONS=[{{word:"Magnifique!",lang:"French",meaning:"Magnificent!",speak:"Magnifique"}},{{word:"Bravissimo!",lang:"Italian",meaning:"Very well done!",speak:"Bravissimo"}},{{word:"Wunderbar!",lang:"German",meaning:"Wonderful!",speak:"Wunderbar"}},{{word:"Shabash!",lang:"Hindi",meaning:"Well done!",speak:"Shabash"}},{{word:"Felicitaciones!",lang:"Spanish",meaning:"Congratulations!",speak:"Felicitaciones"}}];
var lastCelIdx=-1;
function celebrate(){{var i;do{{i=Math.floor(Math.random()*CELEBRATIONS.length);}}while(i===lastCelIdx&&CELEBRATIONS.length>1);lastCelIdx=i;var c=CELEBRATIONS[i];var rb=G("rbox");rb.className="result-box ok";rb.innerHTML='<div style="font-size:18px;font-weight:900;">'+c.word+'</div><div style="font-size:11px;">'+c.lang+' &middot; <em>'+c.meaning+'</em></div>';G("nudgeBox").classList.remove("show");var nb=G("btnNext");if(nb)nb.classList.add("show");say(c.speak);rHappy();}}
function handleAnswer(text){{var q=session[idx];var ok=q.ans.some(function(a){{return text.includes(a.toLowerCase())||a.toLowerCase().includes(text);}});var rb=G("rbox");if(ok){{celebrate();}}else{{nudgeCount++;rb.className="result-box no";rb.textContent="\\u2716 Not quite. Listen to my hint!";var nudge=q.nudges[Math.min(nudgeCount-1,q.nudges.length-1)];showNudge(nudge);say(nudge);rThink();if(nudgeCount>=3){{var nb2=G("btnNext");if(nb2){{nb2.classList.add("show");nb2.textContent="I Understand \\u25b6";}}}}}}}}
function showNudge(msg){{var n=G("nudgeBox");if(n){{n.textContent=msg;n.classList.add("show");}}}}
function openBreak(){{G("breakOv").classList.add("show");}}
function closeBreak(){{G("breakOv").classList.remove("show");}}
function startBreak(r){{closeBreak();breakSecs=0;G("timerLbl").textContent=r;G("timerNum").textContent="00:00";G("timerScreen").classList.add("show");breakTmr=setInterval(function(){{breakSecs++;var m=String(Math.floor(breakSecs/60)).padStart(2,"0");var s=String(breakSecs%60).padStart(2,"0");G("timerNum").textContent=m+":"+s;}},1000);}}
function endBreak(){{clearInterval(breakTmr);G("timerScreen").classList.remove("show");}}
function mathUpdate(){{var ra=G("rawAnswer");if(!ra)return;var v=ra.value.trim();var el=G("mathPreview");if(el)el.textContent=v||"";}}
function buildSuggChips(ans){{var el=G("suggChips");if(!el)return;el.innerHTML="";(ans||[]).forEach(function(a){{var btn=document.createElement("button");btn.className="schip";btn.textContent=a;btn.type="button";btn.addEventListener("click",function(){{var ra=G("rawAnswer");if(ra){{ra.value=a;mathUpdate();ra.focus();}}}});el.appendChild(btn);}});}}
window.onload=init;
</script>
<script src="/explain-helper.js"></script>
</body>
</html>"""

# ── PRACTICE PAGE GENERATOR ───────────────────────────────────────────────────
DESTINATIONS=['Paris, France','Bali, Indonesia','Machu Picchu, Peru','Santorini, Greece','Kyoto, Japan','Grand Canyon, USA','Amalfi Coast, Italy','Swiss Alps','Maldives','Rajasthan, India','Cape Town, S. Africa','New Zealand Fjords','Amazon Rainforest','Iceland Aurora','Dubai City']

def build_practice_qb_js(questions):
    lines = ['var QB=[']
    for i, q in enumerate(questions):
        steps_js  = json.dumps(q['steps'], ensure_ascii=False)
        ans_js    = json.dumps(q['answers'], ensure_ascii=False)
        trick_js  = json.dumps(q.get('trick',''), ensure_ascii=False)
        alt_js    = json.dumps(q.get('alt',''), ensure_ascii=False)
        comma = '' if i == len(questions)-1 else ','
        lines.append(f'{{q:{json.dumps(q["question"])},qs:{json.dumps(q["question_spoken"])},ans:{ans_js},steps:{steps_js},trick:{trick_js},alt:{alt_js}}}{comma}')
    lines.append('];')
    return '\n'.join(lines)

practice_qb_js = build_practice_qb_js(PRQ)
explain_path = f"/explain/class{CLASS}/{TOPIC}/{SLUG}.html"

PRACTICE_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="rishi-board" content="{BOARD}">
<meta name="rishi-class" content="{CLASS}">
<title>Practice — {NAME} | RISHI</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box;}}
body{{font-family:'Nunito',sans-serif;background:#0d0d1a;min-height:100vh;color:#fff;overflow-x:hidden;}}
.topbar{{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(0,0,0,.5);border-bottom:1px solid rgba(255,215,0,.2);position:sticky;top:0;z-index:200;gap:10px;flex-wrap:wrap;}}
.tbtn{{padding:8px 16px;border-radius:20px;border:none;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;font-size:13px;}}
.tbtn-back{{background:rgba(255,215,0,.15);border:1px solid #ffd700;color:#ffd700;}}
.tbtn-break{{background:rgba(255,107,107,.2);border:1px solid #ff6b6b;color:#ff6b6b;position:relative;}}
.break-menu{{display:none;position:absolute;top:40px;right:0;background:#1a1a2e;border:1px solid rgba(255,255,255,.15);border-radius:10px;min-width:160px;z-index:300;}}
.break-menu.show{{display:block;}}
.break-opt{{padding:10px 16px;cursor:pointer;font-size:13px;border-bottom:1px solid rgba(255,255,255,.05);}}
.break-opt:hover{{background:rgba(255,215,0,.1);}}
.session-timer{{font-family:'Courier New',monospace;font-size:14px;color:#aaa;background:rgba(0,0,0,.3);padding:6px 12px;border-radius:12px;}}
.coins-badge{{background:linear-gradient(135deg,#ffd700,#ffed4e);color:#1a1a2e;padding:6px 14px;border-radius:20px;font-weight:900;font-size:14px;display:flex;align-items:center;gap:5px;}}
.main-layout{{display:grid;grid-template-columns:220px 1fr 300px;gap:16px;padding:16px;max-width:1400px;margin:0 auto;}}
@media(max-width:1100px){{.main-layout{{grid-template-columns:1fr;}}}}
.left-panel{{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;height:fit-content;position:sticky;top:70px;}}
.lp-chapter{{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.4);margin-bottom:6px;}}
.lp-title{{font-size:15px;font-weight:800;color:#ffd700;margin-bottom:16px;line-height:1.3;}}
.lp-stat{{margin-bottom:12px;}}
.lp-stat-label{{font-size:11px;color:rgba(255,255,255,.4);margin-bottom:4px;}}
.lp-stat-val{{font-size:22px;font-weight:900;color:#fff;}}
.lp-stat-sub{{font-size:11px;color:rgba(255,255,255,.4);}}
.progress-dots{{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px;}}
.pdot{{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.4);}}
.pdot.active{{background:#ffd700;color:#1a1a2e;border-color:#ffd700;}}
.pdot.correct{{background:#2ecc71;color:#fff;border-color:#2ecc71;}}
.pdot.wrong{{background:#e74c3c;color:#fff;border-color:#e74c3c;}}
.streak-bar{{margin-top:14px;}}
.streak-label{{font-size:11px;color:rgba(255,255,255,.4);margin-bottom:6px;}}
.streak-pips{{display:flex;gap:4px;}}
.spip{{width:28px;height:8px;border-radius:4px;background:rgba(255,255,255,.1);}}
.spip.filled{{background:#2ecc71;}}
.q-area{{display:flex;flex-direction:column;gap:14px;}}
.q-card{{border-radius:18px;padding:28px;position:relative;overflow:hidden;min-height:160px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(135deg,#0a2a4a,#1a5276);}}
.q-badge{{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.5);margin-bottom:8px;}}
.q-text{{font-size:20px;font-weight:700;line-height:1.5;margin-bottom:6px;}}
.attempt-info{{display:flex;gap:12px;font-size:12px;color:rgba(255,255,255,.5);}}
.attempt-info span{{background:rgba(255,255,255,.08);padding:3px 10px;border-radius:10px;}}
.earn-badge{{background:rgba(255,215,0,.15);color:#ffd700;border:1px solid rgba(255,215,0,.3);}}
.destination-tag{{position:absolute;bottom:12px;right:16px;font-size:10px;color:rgba(255,255,255,.3);font-style:italic;}}
.instruction-box{{background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:12px;padding:14px 18px;font-size:13px;font-weight:700;color:#ffd700;min-height:40px;}}
.answer-wrap{{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px;}}
.answer-input{{width:100%;padding:14px 18px;background:rgba(0,0,0,.4);border:2px solid rgba(255,215,0,.3);border-radius:30px;color:#fff;font-size:17px;font-family:'Nunito',sans-serif;outline:none;transition:.2s;}}
.answer-input:focus{{border-color:#ffd700;}}
.submit-btn{{width:100%;margin-top:10px;padding:13px;background:linear-gradient(135deg,#ffd700,#f39c12);color:#1a1a2e;border:none;border-radius:30px;font-size:16px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;}}
.submit-btn:disabled{{opacity:.4;cursor:not-allowed;}}
.feedback-box{{border-radius:16px;padding:20px;display:none;}}
.feedback-box.correct{{display:block;background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.4);}}
.feedback-box.wrong{{display:block;background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.3);}}
.fb-title{{font-size:18px;font-weight:800;margin-bottom:12px;}}
.feedback-box.correct .fb-title{{color:#2ecc71;}}
.feedback-box.wrong .fb-title{{color:#e74c3c;}}
.steps-list{{background:rgba(0,0,0,.3);border-radius:10px;padding:14px;margin:10px 0;}}
.step-item{{padding:6px 0 6px 22px;position:relative;font-size:14px;line-height:1.5;border-bottom:1px solid rgba(255,255,255,.05);}}
.step-item:last-child{{border-bottom:none;}}
.step-item::before{{content:"→";position:absolute;left:0;color:#ffd700;}}
.trick-box{{background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);border-radius:8px;padding:10px 14px;margin-top:10px;font-size:13px;}}
.trick-box strong{{color:#ffd700;}}
.clear-check{{margin-top:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}}
.clear-check span{{font-size:14px;font-weight:700;flex:1;}}
.btn-yes{{padding:10px 22px;background:#2ecc71;color:#fff;border:none;border-radius:20px;cursor:pointer;font-weight:700;font-size:14px;font-family:'Nunito',sans-serif;}}
.btn-no{{padding:10px 22px;background:#e74c3c;color:#fff;border:none;border-radius:20px;cursor:pointer;font-weight:700;font-size:14px;font-family:'Nunito',sans-serif;}}
.try-again-btn{{display:none;width:100%;margin-top:12px;padding:14px;background:#c0392b;color:#ffd700;border:2px solid rgba(255,215,0,.3);border-radius:14px;font-size:17px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;}}
.praise-word{{font-size:28px;color:#ffd700;font-weight:900;font-style:italic;}}
.praise-meta{{font-size:12px;color:rgba(255,255,255,.5);margin-top:4px;}}
.next-btn{{width:100%;margin-top:12px;padding:13px;background:rgba(255,215,0,.15);border:1px solid #ffd700;color:#ffd700;border-radius:14px;font-size:15px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;display:none;}}
.next-btn.show{{display:block;}}
.right-panel{{display:flex;flex-direction:column;gap:14px;}}
.rishika-card{{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;text-align:center;}}
.rishika-name-tag{{font-size:11px;letter-spacing:2px;color:rgba(255,215,0,.7);text-transform:uppercase;margin-bottom:6px;}}
.rishika-bubble{{background:rgba(255,215,0,.08);border-radius:12px;padding:10px 14px;font-size:13px;line-height:1.5;min-height:48px;border:1px solid rgba(255,215,0,.15);}}
.rough-card{{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;flex:1;}}
.rough-title{{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.3);margin-bottom:8px;}}
.rough-area{{width:100%;min-height:280px;background:#f8f5ec;color:#333;border-radius:10px;padding:14px;font-family:'Courier New',monospace;font-size:14px;line-height:1.8;border:none;outline:none;resize:vertical;}}
.break-overlay{{display:none;position:fixed;inset:0;background:#0a0a1a;z-index:500;flex-direction:column;align-items:center;justify-content:center;text-align:center;}}
.break-overlay.show{{display:flex;}}
.break-clock{{font-family:'Courier New',monospace;font-size:96px;font-weight:700;color:#ffd700;margin-bottom:30px;}}
.end-break-btn{{padding:16px 48px;background:#2ecc71;color:#fff;border:none;border-radius:30px;font-size:20px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;}}
.comp-overlay{{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:600;align-items:center;justify-content:center;}}
.comp-overlay.show{{display:flex;}}
.comp-box{{background:linear-gradient(135deg,#0d0d1a,#1a1a2e);border:2px solid #ffd700;border-radius:24px;padding:48px;text-align:center;max-width:500px;width:90%;}}
.comp-icon{{font-size:64px;margin-bottom:12px;}}
.comp-title{{font-size:28px;font-weight:900;color:#ffd700;margin-bottom:8px;}}
.comp-msg{{color:rgba(255,255,255,.7);font-size:15px;line-height:1.6;margin-bottom:24px;}}
.comp-btn{{padding:14px 40px;background:linear-gradient(135deg,#ffd700,#f39c12);color:#1a1a2e;border:none;border-radius:24px;font-size:16px;font-weight:900;cursor:pointer;font-family:'Nunito',sans-serif;}}
.tap-overlay{{position:fixed;inset:0;background:rgba(10,10,26,0.92);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;}}
.tap-overlay.hidden{{display:none;}}
.tap-circle{{width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#ffd700,#f39c12);display:flex;align-items:center;justify-content:center;font-size:42px;margin-bottom:20px;box-shadow:0 0 40px rgba(255,215,0,0.5);}}
.tap-text{{color:#fff;font-size:20px;font-weight:800;letter-spacing:2px;}}
.tap-sub{{color:rgba(255,255,255,0.5);font-size:13px;margin-top:8px;}}
@keyframes coinFall{{0%{{transform:translateY(-60px) scale(1.2);opacity:1;}}100%{{transform:translateY(0) scale(0.5);opacity:0;}}}}
.coin-anim{{position:fixed;top:50px;right:80px;font-size:28px;z-index:1000;animation:coinFall 1s ease-in forwards;pointer-events:none;}}
@keyframes streakToast{{0%{{transform:translateX(120%);opacity:0;}}20%{{transform:translateX(0);opacity:1;}}80%{{transform:translateX(0);opacity:1;}}100%{{transform:translateX(120%);opacity:0;}}}}
.streak-toast{{position:fixed;bottom:30px;right:20px;background:#2ecc71;color:#fff;padding:14px 22px;border-radius:14px;font-weight:900;font-size:15px;z-index:700;animation:streakToast 3.5s ease forwards;pointer-events:none;}}
</style>
<script src="/rishi-sync.js"></script>
<script src="/rishi-core.js"></script>
<script src="/rishi-presence.js"></script>
</head>
<body>
<div class="tap-overlay" id="tapOverlay" onclick="startPractice()">
  <div class="tap-circle">&#9654;</div>
  <div class="tap-text">TAP TO BEGIN</div>
  <div class="tap-sub">Sound will be enabled</div>
</div>
<div class="topbar">
  <div style="display:flex;gap:8px;align-items:center;">
    <button class="tbtn tbtn-back" onclick="location.href='/syllabus.html'">&#8592; Syllabus</button>
    <div style="font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:2px;color:rgba(255,215,0,.6);">&#9999;&#65039; PRACTICE</div>
  </div>
  <span class="session-timer" id="sessionTimer">00:00</span>
  <div style="display:flex;gap:8px;align-items:center;">
    <div style="position:relative;">
      <button class="tbtn tbtn-break" onclick="toggleBreakMenu()">&#9208; Break &#9662;</button>
      <div class="break-menu" id="breakMenu">
        <div class="break-opt" onclick="startBreak('Water')">&#128167; Water</div>
        <div class="break-opt" onclick="startBreak('Washroom')">&#128701; Washroom</div>
        <div class="break-opt" onclick="startBreak('Physical')">&#127939; Physical</div>
      </div>
    </div>
    <div class="coins-badge">&#129689; <span id="coinCount">0</span></div>
  </div>
</div>
<div class="main-layout">
  <div class="left-panel">
    <div class="lp-chapter">Class {CLASS} &middot; {NAME}</div>
    <div class="lp-title">{NAME}</div>
    <div class="lp-stat"><div class="lp-stat-label">Question</div><div class="lp-stat-val"><span id="qNumDisp">1</span><span style="font-size:14px;color:rgba(255,255,255,.3);">/{len(PRQ)}</span></div></div>
    <div class="lp-stat"><div class="lp-stat-label">Correct Streak</div><div class="lp-stat-val" id="streakNum">0</div><div class="lp-stat-sub">Need 5 to unlock exam</div></div>
    <div class="lp-stat"><div class="lp-stat-label">Correct Total</div><div class="lp-stat-val" id="totalCorr">0</div></div>
    <div class="streak-bar"><div class="streak-label">Streak progress</div><div class="streak-pips" id="streakPips"></div></div>
    <div class="progress-dots" id="progressDots"></div>
  </div>
  <div class="q-area">
    <div class="q-card" id="qCard">
      <div class="q-badge" id="qBadge">Question 1 of {len(PRQ)}</div>
      <div class="q-text" id="qText">Loading...</div>
      <div class="attempt-info" style="margin-top:8px;">
        <span id="attemptNum">Attempt: 1</span>
        <span class="earn-badge" id="earnCoins">5 coins if correct</span>
      </div>
      <div class="destination-tag" id="destTag">&#127757; Loading...</div>
    </div>
    <div class="instruction-box" id="instrBox">Work it out, then type your answer below.</div>
    <div class="answer-wrap">
      <input type="text" class="answer-input" id="answerInput" placeholder="Type your answer here..." onkeydown="if(event.key==='Enter')submitAnswer();">
      <button class="submit-btn" id="submitBtn" onclick="submitAnswer()">Submit Answer &#9654;</button>
    </div>
    <div class="feedback-box" id="feedbackBox"></div>
    <button class="next-btn" id="nextBtn" onclick="nextQ()">Next Question &#9654;</button>
  </div>
  <div class="right-panel">
    <div class="rishika-card">
      <div class="rishika-name-tag">Rishika</div>
      <div id="rishika-avatar"></div>
      <div class="rishika-bubble" id="rishikaBubble">Ready for practice! &#127919;</div>
    </div>
    <div class="rough-card">
      <div class="rough-title">&#128221; Rough Work</div>
      <textarea class="rough-area" placeholder="Do all working here..."></textarea>
    </div>
  </div>
</div>
<div class="break-overlay" id="breakOverlay">
  <div style="font-size:20px;color:rgba(255,255,255,.6);margin-bottom:10px;" id="breakType">Break</div>
  <div class="break-clock" id="breakClock">00:00</div>
  <button class="end-break-btn" onclick="endBreak()">End Break &#9654;</button>
</div>
<div class="comp-overlay" id="compOverlay">
  <div class="comp-box">
    <div class="comp-icon" id="compIcon">&#127942;</div>
    <div class="comp-title" id="compTitle">Session Complete!</div>
    <div class="comp-msg" id="compMsg"></div>
    <button class="comp-btn" onclick="location.href='/syllabus.html'">Back to Syllabus</button>
  </div>
</div>
<script>
var CHAP_ID={CHAP_ID};
{practice_qb_js}
var DESTINATIONS={json.dumps(DESTINATIONS)};
var PRAISES=[{{word:'Magnifique!',lang:'French',mean:'Magnificent!'}},{{word:'Bravissimo!',lang:'Italian',mean:'Very well done!'}},{{word:'Wunderbar!',lang:'German',mean:'Wonderful!'}},{{word:'Shabash!',lang:'Hindi',mean:'Well done!'}},{{word:'Felicitaciones!',lang:'Spanish',mean:'Congratulations!'}},{{word:'Parabens!',lang:'Portuguese',mean:'Congratulations!'}},{{word:'Ottimo!',lang:'Italian',mean:'Excellent!'}},{{word:'Harika!',lang:'Turkish',mean:'Wonderful!'}}];
var voices=[],selVoice=null;
function initVoices(cb){{function load(){{voices=window.speechSynthesis.getVoices();var pref=['Heera','Priya','Zira','Samantha','en-IN','en-GB','en-US'];for(var p of pref){{for(var v of voices){{if(v.name.includes(p)||v.lang.includes(p)){{selVoice=v;break;}}}}if(selVoice)break;}}if(!selVoice&&voices.length)selVoice=voices[0];if(cb)cb();}}if(window.speechSynthesis.getVoices().length>0)load();else{{window.speechSynthesis.onvoiceschanged=load;setTimeout(function(){{if(!selVoice)load();}},1000);}}}}
function say(txt){{window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(txt);if(selVoice)u.voice=selVoice;u.rate=0.88;u.pitch=1.05;u.lang='en-IN';window.speechSynthesis.speak(u);}}
var idx=0,attemptNo=0,correctStreak=0,totalCorrect=0,answered=[];
var coins=parseInt(localStorage.getItem('rishi_coins')||'0');
var breakInterval=null,sessionInterval=null,sessionSecs=0;
function G(id){{return document.getElementById(id);}}
function init(){{
  rishiCheckPlan(CHAP_ID);
  if(!rishiIsExplainDone(CHAP_ID)){{window.location.href='{explain_path}';return;}}
  coins=parseInt(localStorage.getItem('rishi_coins')||'0');
  G('coinCount').textContent=coins;
  answered=new Array(QB.length).fill(null);
  renderDots();renderStreak();
  initVoices(function(){{loadQ(0);}});rInit();
  sessionInterval=setInterval(function(){{sessionSecs++;var m=Math.floor(sessionSecs/60).toString().padStart(2,'0');var s=(sessionSecs%60).toString().padStart(2,'0');G('sessionTimer').textContent=m+':'+s;}},1000);
}}
function loadQ(i){{
  if(i>=QB.length){{onComplete();return;}}
  idx=i;attemptNo=0;
  var q=QB[i];
  G('qBadge').textContent='Question '+(i+1)+' of '+QB.length;
  G('qText').innerHTML=q.q;
  G('qNumDisp').textContent=i+1;
  G('destTag').textContent='&#127757; '+DESTINATIONS[i%DESTINATIONS.length];
  G('attemptNum').textContent='Attempt: 1';
  G('earnCoins').textContent='5 coins if correct';
  G('answerInput').value='';G('answerInput').disabled=false;
  G('submitBtn').disabled=false;
  G('feedbackBox').className='feedback-box';
  G('nextBtn').className='next-btn';
  G('rishikaBubble').textContent='Ready for question '+(i+1)+'! &#127919;';
  if(i>0)setTimeout(function(){{say(q.qs||q.q.replace(/<[^>]+>/g,''));}},400);
  renderDots();
}}
function submitAnswer(){{
  var raw=G('answerInput').value.trim();if(!raw){{G('answerInput').focus();return;}}
  var q=QB[idx];attemptNo++;G('attemptNum').textContent='Attempt: '+attemptNo;
  var userClean=raw.toLowerCase().replace(/\s+/g,'');
  var ok=q.ans.some(function(a){{var ac=a.toLowerCase().replace(/\s+/g,'');return userClean===ac||userClean.includes(ac)||ac.includes(userClean);}});
  if(ok){{handleCorrect(q);}}else{{handleWrong(q,raw);}}
}}
function handleCorrect(q){{
  correctStreak++;totalCorrect++;G('streakNum').textContent=correctStreak;G('totalCorr').textContent=totalCorrect;
  if(attemptNo===1){{coins+=5;localStorage.setItem('rishi_coins',coins);G('coinCount').textContent=coins;spawnCoin();G('earnCoins').textContent='✓ +5 coins earned';}}
  answered[idx]='correct';renderDots();renderStreak();
  var p=PRAISES[Math.floor(Math.random()*PRAISES.length)];
  var fb=G('feedbackBox');fb.className='feedback-box correct';
  fb.innerHTML='<div class="fb-title">&#10003; Correct!</div><div class="praise-word">'+p.word+'</div><div class="praise-meta">'+p.lang+' — "'+p.mean+'"</div>';
  G('nextBtn').className='next-btn show';
  G('rishikaBubble').textContent='Excellent! '+p.word+' &#127881;';
  G('answerInput').disabled=true;G('submitBtn').disabled=true;
  if(correctStreak>=5&&!rishiIsPracticeDone(CHAP_ID)){{rishiMarkPracticeDone(CHAP_ID);showStreakToast();}}
}}
function handleWrong(q,userAns){{
  correctStreak=0;G('streakNum').textContent=correctStreak;
  answered[idx]='wrong';renderDots();renderStreak();
  G('answerInput').disabled=true;G('submitBtn').disabled=true;G('earnCoins').textContent='Missed this one';
  var stepsHtml=q.steps.map(function(s){{return '<div class="step-item">'+s+'</div>';}}).join('');
  var fb=G('feedbackBox');fb.className='feedback-box wrong';
  fb.innerHTML='<div class="fb-title">&#10007; Not quite</div>'
    +'<div style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:8px;">Your answer: <span style="color:#e74c3c;font-weight:700;">'+userAns+'</span></div>'
    +'<div class="steps-list">'+stepsHtml+'</div>'
    +'<div class="trick-box"><strong>&#128161; Rishika\'s Trick:</strong> '+q.trick+'</div>'
    +'<div class="clear-check"><span>Is it clear now?</span>'
    +'<button class="btn-yes" onclick="isClear(true)">Yes &#10003;</button>'
    +'<button class="btn-no" onclick="isClear(false)">No, show more</button></div>'
    +'<button class="try-again-btn" id="tryAgainBtn" onclick="tryAgain()">TRY AGAIN &#9654;</button>';
  G('rishikaBubble').textContent='Not quite! Let me explain step by step. &#128218;';
}}
function isClear(yes){{
  if(yes){{G('tryAgainBtn').style.display='block';G('rishikaBubble').textContent='Great! Now try again! &#127775;';}}
  else{{var q=QB[idx];var fb=G('feedbackBox');var div=document.createElement('div');div.style.cssText='margin-top:12px;padding:12px;background:rgba(78,205,196,.08);border-radius:10px;border:1px solid rgba(78,205,196,.2);font-size:13px;';div.innerHTML='<strong style="color:#4ecdc4;">&#128260; Alternative approach:</strong><br>'+q.alt;fb.appendChild(div);setTimeout(function(){{G('tryAgainBtn').style.display='block';}},400);}}
}}
function tryAgain(){{G('answerInput').value='';G('answerInput').disabled=false;G('submitBtn').disabled=false;G('feedbackBox').className='feedback-box';G('earnCoins').textContent='Keep trying!';G('answerInput').focus();}}
function nextQ(){{loadQ(idx+1);}}
function onComplete(){{
  var done=rishiIsPracticeDone(CHAP_ID);
  G('compIcon').textContent=done?'&#127942;':'&#128218;';
  G('compTitle').textContent=done?'Practice Complete! Exam Unlocked!':'Session Complete!';
  G('compMsg').textContent=done?'You got 5 in a row — the Chapter Exam is now unlocked! &#127881;':'Keep practising to get 5 in a row and unlock the exam!';
  G('compOverlay').className='comp-overlay show';
}}
function showStreakToast(){{var t=document.createElement('div');t.className='streak-toast';t.textContent='&#128293; 5 in a row! Exam Unlocked!';document.body.appendChild(t);setTimeout(function(){{if(t.parentNode)t.parentNode.removeChild(t);}},3600);}}
function spawnCoin(){{var c=document.createElement('div');c.className='coin-anim';c.textContent='&#129689;';document.body.appendChild(c);setTimeout(function(){{if(c.parentNode)c.parentNode.removeChild(c);}},1100);}}
function renderDots(){{var c=G('progressDots');if(!c)return;var h='';for(var i=0;i<QB.length;i++){{var cls='pdot';if(i===idx)cls+=' active';else if(answered[i]==='correct')cls+=' correct';else if(answered[i]==='wrong')cls+=' wrong';h+='<div class="'+cls+'">'+(i+1)+'</div>';}}c.innerHTML=h;}}
function renderStreak(){{var c=G('streakPips');if(!c)return;var h='';for(var i=0;i<5;i++){{h+='<div class="spip'+(i<correctStreak?' filled':'')+'" ></div>';}}c.innerHTML=h;}}
function toggleBreakMenu(){{G('breakMenu').classList.toggle('show');}}
function startBreak(reason){{G('breakType').textContent=reason+' Break';G('breakOverlay').className='break-overlay show';G('breakMenu').classList.remove('show');clearInterval(sessionInterval);var bSecs=0;breakInterval=setInterval(function(){{bSecs++;var m=Math.floor(bSecs/60).toString().padStart(2,'0');var s=(bSecs%60).toString().padStart(2,'0');G('breakClock').textContent=m+':'+s;}},1000);}}
function endBreak(){{clearInterval(breakInterval);G('breakOverlay').className='break-overlay';sessionInterval=setInterval(function(){{sessionSecs++;var m=Math.floor(sessionSecs/60).toString().padStart(2,'0');var s=(sessionSecs%60).toString().padStart(2,'0');G('sessionTimer').textContent=m+':'+s;}},1000);}}
function startPractice(){{G('tapOverlay').classList.add('hidden');var q=QB[idx];if(q)setTimeout(function(){{say(q.qs||q.q.replace(/<[^>]+>/g,''));}},300);}}
document.addEventListener('click',function(e){{if(!e.target.closest('.tbtn-break'))G('breakMenu').classList.remove('show');}});
window.onload=function(){{init();}};
</script>
<script>
var RISHI_SPRITES={{celebrate:{{file:'/images/rishika/sprites/celebrate.jpeg',cols:4,rows:3,fw:384,fh:341,seq:[[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2]],fps:8,loop:false,holdMs:3000,glow:'0 0 40px 12px rgba(245,158,11,0.6)',border:'#f59e0b'}},praise:{{file:'/images/rishika/sprites/praise.jpeg',cols:4,rows:3,fw:384,fh:341,seq:[[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2]],fps:6,loop:false,holdMs:2000,glow:'0 0 28px 8px rgba(139,92,246,0.5)',border:'#a78bfa'}},disappointed:{{file:'/images/rishika/sprites/disappointed-s1.jpeg',cols:4,rows:3,fw:384,fh:341,seq:[[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1]],fps:5,loop:false,holdMs:2000,glow:'0 0 25px 6px rgba(225,29,72,0.35)',border:'#f87171'}},talking:{{file:'/images/rishika/sprites/neutral-talking.png',cols:6,rows:2,fw:256,fh:512,seq:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1]],fps:10,loop:true,holdMs:0,glow:'0 0 20px rgba(109,40,217,0.3)',border:'#7c3aed'}}}};
var _rCanvas=null,_rCtx=null,_rCurName=null,_rSeqIdx=0,_rFrameTimer=null,_rImgs={{}},_rLoaded=0,_rTotal=0,_rDW=200,_rDH=220;
function rInit(){{var container=document.getElementById('rishika-avatar');if(!container||_rCanvas)return;_rCanvas=document.createElement('canvas');_rCanvas.width=_rDW;_rCanvas.height=_rDH;_rCanvas.style.cssText='border-radius:12px;transition:box-shadow .3s;display:block;margin:0 auto;';container.appendChild(_rCanvas);_rCtx=_rCanvas.getContext('2d');var keys=Object.keys(RISHI_SPRITES);_rTotal=keys.length;_rLoaded=0;keys.forEach(function(k){{var img=new Image();_rImgs[k]=img;img.onload=function(){{_rLoaded++;if(_rLoaded===_rTotal)_rPlay('talking');}};img.onerror=function(){{_rLoaded++;if(_rLoaded===_rTotal)_rPlay('talking');}};img.src=RISHI_SPRITES[k].file;}});}}
function _rPlay(name){{_rStop();if(!RISHI_SPRITES[name])return;_rCurName=name;_rSeqIdx=0;var s=RISHI_SPRITES[name];if(_rCanvas){{_rCanvas.style.boxShadow=s.glow;_rCanvas.style.border='2px solid '+s.border;}}_rDrawFrame();var interval=Math.round(1000/s.fps);_rFrameTimer=setInterval(function(){{_rSeqIdx++;if(_rSeqIdx>=s.seq.length){{if(s.loop){{_rSeqIdx=0;}}else{{_rStop();if(name!=='talking')setTimeout(function(){{_rPlay('talking');}},s.holdMs||1000);return;}}}}_rDrawFrame();}},interval);}}
function _rDrawFrame(){{if(!_rCtx||!_rCurName)return;var s=RISHI_SPRITES[_rCurName];var img=_rImgs[_rCurName];if(!img||!img.complete||img.naturalWidth===0)return;var frame=s.seq[_rSeqIdx]||[0,0];_rCtx.clearRect(0,0,_rDW,_rDH);_rCtx.drawImage(img,frame[0]*s.fw,frame[1]*s.fh,s.fw,s.fh,0,0,_rDW,_rDH);}}
function _rStop(){{if(_rFrameTimer){{clearInterval(_rFrameTimer);_rFrameTimer=null;}}}}
function rHappy(){{_rPlay('praise');}}function rCelebrate(){{_rPlay('celebrate');}}function rThink(){{_rPlay('disappointed');}}function rStartTalk(){{_rPlay('talking');}}function rStopTalk(){{}}
</script>
</body>
</html>"""

# Write HTML files
with open(explain_out, 'w', encoding='utf-8') as f:
    f.write(EXPLAIN_HTML)
print(f"  ✅ Explain: {explain_out.replace(ROOT,'')}")

with open(practice_out, 'w', encoding='utf-8') as f:
    f.write(PRACTICE_HTML)
print(f"  ✅ Practice: {practice_out.replace(ROOT,'')}")

# ── UPDATE SYLLABUS.HTML ──────────────────────────────────────────────────────
def update_syllabus():
    path = os.path.join(ROOT, 'syllabus.html')
    if not os.path.exists(path): print("  ⚠️  syllabus.html not found"); return
    with open(path,'r',encoding='utf-8') as f: content=f.read()
    # Find the chapter entry and mark built:true
    pattern = rf'({CHAP_ID}:\s*{{name:"{re.escape(NAME)}"[^}}]*?)built:false'
    new_content, n = re.subn(pattern, r'\1built:true ', content)
    if n==0:
        pattern2 = rf'({CHAP_ID}:\s*{{[^}}]*?")built:false'
        new_content, n = re.subn(pattern2, r'\1built:true ', content)
    if n > 0:
        with open(path,'w',encoding='utf-8') as f: f.write(new_content)
        print(f"  ✅ syllabus.html: Chapter {CHAP_ID} marked built:true")
    else:
        print(f"  ⚠️  syllabus.html: Could not find chapter {CHAP_ID} entry to update")

# ── UPDATE PARENT.HTML ────────────────────────────────────────────────────────
def update_parent():
    path = os.path.join(ROOT, 'parent.html')
    if not os.path.exists(path): print("  ⚠️  parent.html not found"); return
    with open(path,'r',encoding='utf-8') as f: content=f.read()
    # Find class N explainBuilt and add CHAP_ID to it
    pattern = rf'({CLASS}:\s*{{[\s\S]*?explainBuilt:\s*{{)([^}}]*)(}})'
    def add_chap(m):
        existing = m.group(2).strip()
        if f'{CHAP_ID}:1' in existing: return m.group(0)
        if existing:
            return m.group(1) + existing + f', {CHAP_ID}:1' + m.group(3)
        else:
            return m.group(1) + f'{CHAP_ID}:1' + m.group(3)
    new_content = re.sub(pattern, add_chap, content, count=1)
    if new_content != content:
        with open(path,'w',encoding='utf-8') as f: f.write(new_content)
        print(f"  ✅ parent.html: Class {CLASS} explainBuilt updated with chap {CHAP_ID}")
    else:
        print(f"  ⚠️  parent.html: Could not find Class {CLASS} explainBuilt to update")

# ── UPDATE ADMIN.HTML ─────────────────────────────────────────────────────────
def update_admin():
    path = os.path.join(ROOT, 'admin.html')
    if not os.path.exists(path): print("  ⚠️  admin.html not found"); return
    with open(path,'r',encoding='utf-8') as f: content=f.read()
    # Find chapter entry with built:false near the chapter name and fix it
    pattern = rf"(n:'{re.escape(NAME)}'[^}}]*?)built:false"
    new_content, n = re.subn(pattern, r'\1built:true ', content)
    if n > 0:
        with open(path,'w',encoding='utf-8') as f: f.write(new_content)
        print(f"  ✅ admin.html: {NAME} marked built:true")
    else:
        print(f"  ⚠️  admin.html: Could not find {NAME} entry to update")

print(f"\nRISHI Generator — {NAME} (Class {CLASS})")
print("="*50)
update_syllabus()
update_parent()
update_admin()
print("="*50)
print(f"""
DONE. Now:
  git add .
  git commit -m "Class {CLASS} {NAME} complete"
  git push
""")
