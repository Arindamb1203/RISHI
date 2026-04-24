"""
fix_explain_pages.py
Run from the ROOT of the RISHI repo:
    python fix_explain_pages.py
Patches all 16 explain/class8/chN.html files so the lesson flow is automatic.
"""
import os, re

EXPLAIN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'explain', 'class8')

START_LESSON_FN = (
    "function startLesson(){"
    "var btn=G('startBtn');"
    "if(btn){btn.disabled=true;btn.textContent='\\u25b6 Starting...';}"
    "say(G('introText').innerText,function(){setTimeout(showQ,600);});}\n"
)

def fix(src):
    # ── 1. initVoices callback: stop auto-say + showQ on load ─────────────
    # Pattern A – minified one-liner
    src = src.replace(
        'initVoices(function(){say(G("introText").innerText);setTimeout(showQ,2200);});',
        'initVoices(function(){});'
    )
    # Pattern B – multiline (linear-equations, practical-geometry style)
    src = re.sub(
        r'initVoices\(function\(\)\s*\{\s*say\(G\("introText"\)\.innerText\);\s*'
        r'setTimeout\(showQ,\s*2200\);\s*\}\s*\);',
        'initVoices(function(){});',
        src, flags=re.DOTALL
    )

    # ── 2. Intro button → Start Lesson ────────────────────────────────────
    src = re.sub(
        r'onclick="say\(G\(\'introText\'\)\.innerText\)">&#128266; Hear[^<]+</button>',
        'onclick="startLesson()" id="startBtn">&#9654; Start Lesson</button>',
        src
    )

    # ── 3. showQ: auto-launch animation after question card loads ─────────
    # G("qArea").appendChild(ap); is the unique last statement in showQ
    src = src.replace(
        'G("qArea").appendChild(ap);',
        'G("qArea").appendChild(ap);setTimeout(startAnim,800);'
    )

    # ── 4. startAnim done-callback: auto-launch steps after anim ends ─────
    # Handles both minified (});}) and multiline (newline before });)
    src = re.sub(
        r'if\(pb\)pb\.style\.display="none";(\s*\}\);)',
        r'if(pb)pb.style.display="none";setTimeout(beginSteps,600);\1',
        src
    )

    # ── 5. nextStep: auto-advance after audio ends ─────────────────────────
    src = src.replace(
        'setTimeout(function(){say(s.s);},280);',
        'setTimeout(function(){say(s.s,function(){setTimeout(nextStep,400);});},280);'
    )

    # ── 6. Inject startLesson() function before init() ────────────────────
    if 'function startLesson' not in src:
        src = src.replace('function init(){', START_LESSON_FN + 'function init(){', 1)

    return src


changed = 0
skipped = 0
for i in range(1, 17):
    fname = f'ch{i}.html'
    path = os.path.join(EXPLAIN_DIR, fname)
    if not os.path.exists(path):
        print(f'  SKIP (not found): {fname}')
        skipped += 1
        continue
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    fixed = fix(original)
    if fixed == original:
        print(f'  WARNING — no changes: {fname}')
        skipped += 1
    else:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f'  FIXED: {fname}')
        changed += 1

print(f'\nDone. {changed} fixed, {skipped} skipped.')
