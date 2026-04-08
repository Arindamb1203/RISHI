#!/usr/bin/env python3
"""
RISHI Explain Pages — Standard Upgrade Script v2
Targets: public/explain/**/*.html
Run from repo root: python upgrade.py

Groups:
  A/C — standard SVG template (11 files + factorisation)
  B   — panel-layout MCQ (comparing-quantities, direct-inverse-proportions,
         powers-exponents, rational-numbers)
  SKIP — introduction-to-graphs (needs full rebuild)
"""

import re, os, glob, sys

SKIP_FILES = {"introduction-to-graphs.html"}

TURTLE_HTML = '''<div id="rWrap">
<svg id="rChar" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="68" rx="36" ry="28" fill="#5a8a60" stroke="#3d6b42" stroke-width="2"/>
  <ellipse cx="50" cy="66" rx="22" ry="16" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5"/>
  <line x1="50" y1="50" x2="50" y2="82" stroke="#5a8a60" stroke-width="1.5"/>
  <line x1="28" y1="66" x2="72" y2="66" stroke="#5a8a60" stroke-width="1.5"/>
  <line x1="32" y1="55" x2="68" y2="77" stroke="#5a8a60" stroke-width="1"/>
  <line x1="68" y1="55" x2="32" y2="77" stroke="#5a8a60" stroke-width="1"/>
  <ellipse cx="20" cy="82" rx="10" ry="7" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(-20,20,82)"/>
  <ellipse cx="80" cy="82" rx="10" ry="7" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(20,80,82)"/>
  <ellipse cx="22" cy="58" rx="9" ry="6" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(20,22,58)"/>
  <ellipse cx="78" cy="58" rx="9" ry="6" fill="#7ab87a" stroke="#5a8a60" stroke-width="1.5" transform="rotate(-20,78,58)"/>
  <ellipse cx="50" cy="42" rx="10" ry="14" fill="#8fba6a" stroke="#5a8a60" stroke-width="1.5"/>
  <ellipse cx="50" cy="28" rx="18" ry="16" fill="#8fba6a" stroke="#5a8a60" stroke-width="2"/>
  <ellipse cx="43" cy="24" rx="5" ry="5.5" fill="white"/>
  <ellipse cx="57" cy="24" rx="5" ry="5.5" fill="white"/>
  <ellipse cx="43" cy="25" rx="3" ry="3.5" fill="#1a3a1a"/>
  <ellipse cx="57" cy="25" rx="3" ry="3.5" fill="#1a3a1a"/>
  <circle cx="44" cy="23" r="1.2" fill="white"/>
  <circle cx="58" cy="23" r="1.2" fill="white"/>
  <ellipse id="rLid1" cx="43" cy="24" rx="5" ry="1" fill="#8fba6a" opacity="0"/>
  <ellipse id="rLid2" cx="57" cy="24" rx="5" ry="1" fill="#8fba6a" opacity="0"/>
  <path id="rMouth" d="M44,33 Q50,38 56,33" fill="none" stroke="#3d6b42" stroke-width="2" stroke-linecap="round"/>
  <ellipse id="rBlush1" cx="36" cy="30" rx="7" ry="4" fill="#ff9999" opacity="0"/>
  <ellipse id="rBlush2" cx="64" cy="30" rx="7" ry="4" fill="#ff9999" opacity="0"/>
  <rect x="28" y="90" width="44" height="13" fill="#d4870a" rx="4"/>
  <text x="50" y="100" text-anchor="middle" font-family="Nunito" font-size="7" font-weight="900" fill="white">REKHA</text>
</svg>
</div>'''

TURTLE_CSS = '''#rWrap{position:fixed;bottom:68px;left:10px;z-index:200;width:82px;pointer-events:none;}
#rChar{width:82px;filter:drop-shadow(0 4px 10px rgba(107,76,42,.3));}
@keyframes rIn{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes rBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}'''

TURTLE_JS = '''/* ═══════ REKHA (TURTLE) CHARACTER ═══════ */
var mouthTmr=null, blinkTmr=null, mOpen=false;
function rInit(){
  var c=G("rChar");
  if(c)c.style.animation="rIn .6s cubic-bezier(.34,1.56,.64,1) forwards";
  scheduleBlink();
}
function scheduleBlink(){
  blinkTmr=setTimeout(function(){rBlink();scheduleBlink();},2200+Math.random()*3000);
}
function rBlink(){
  var l=G("rLid1"),r=G("rLid2");if(!l||!r)return;
  l.setAttribute("ry","5.5");r.setAttribute("ry","5.5");
  setTimeout(function(){l.setAttribute("ry","1");r.setAttribute("ry","1");},120);
}
function rStartTalk(len){
  rStopTalk();
  G("rBlush1").style.opacity="0.7";G("rBlush2").style.opacity="0.7";
  mOpen=false;
  mouthTmr=setInterval(function(){
    mOpen=!mOpen;
    var m=G("rMouth");if(!m)return;
    if(mOpen){m.setAttribute("d","M42,33 Q50,42 58,33");m.setAttribute("fill","#1a3a1a");}
    else{m.setAttribute("d","M44,33 Q50,38 56,33");m.setAttribute("fill","none");}
  },160);
  setTimeout(rStopTalk,Math.max(1800,(len||20)*58));
}
function rStopTalk(){
  clearInterval(mouthTmr);mOpen=false;
  var m=G("rMouth");
  if(m){m.setAttribute("d","M44,33 Q50,38 56,33");m.setAttribute("fill","none");}
  G("rBlush1").style.opacity="0";G("rBlush2").style.opacity="0";
}
function rHappy(){
  var c=G("rChar");if(c)c.style.animation="rBounce .35s ease-in-out 5";
  G("rBlush1").style.opacity="1";G("rBlush2").style.opacity="1";
  setTimeout(function(){rStopTalk();var c=G("rChar");if(c)c.style.animation="none";},2500);
}
function rThink(){setTimeout(rStopTalk,1800);}'''

SAY_BROWSER = '''function sayBrowser(text,onEnd){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  rStartTalk(text.length);
  var u=new SpeechSynthesisUtterance(text);
  u.lang="en-IN";u.rate=0.88;u.pitch=1.15;
  var v=(typeof selectedVoice!=="undefined"&&selectedVoice)?selectedVoice:
         (typeof chosenVoice!=="undefined"&&chosenVoice)?chosenVoice:null;
  if(v)u.voice=v;
  u.onend=function(){rStopTalk();if(onEnd)onEnd();};
  u.onerror=function(){rStopTalk();if(onEnd)onEnd();};
  window.speechSynthesis.speak(u);
}'''

SAY_FUNC = '''function say(text,onEnd){
  stopAllAudio();
  rStartTalk(text.length);
  fetch("/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:text})})
  .then(function(res){if(!res.ok)throw new Error("TTS "+res.status);return res.blob();})
  .then(function(blob){
    var url=URL.createObjectURL(blob);
    elAudio=new Audio(url);
    elAudio.onended=function(){URL.revokeObjectURL(url);elAudio=null;rStopTalk();if(onEnd)onEnd();};
    elAudio.onerror=function(){URL.revokeObjectURL(url);elAudio=null;rStopTalk();if(onEnd)onEnd();};
    var p=elAudio.play();
    if(p&&p.catch){p.catch(function(){URL.revokeObjectURL(url);elAudio=null;sayBrowser(text,onEnd);});}
  })
  .catch(function(err){sayBrowser(text,onEnd);});
}'''


def find_function_end(content, start):
    depth, i = 0, start
    while i < len(content):
        if content[i] == '{': depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0: return i + 1
        i += 1
    return -1

def replace_function(content, name, replacement):
    m = re.search(r'function\s+' + re.escape(name) + r'\s*\([^)]*\)\s*\{', content)
    if not m: return content, False
    end = find_function_end(content, m.end() - 1)
    if end == -1: return content, False
    while end < len(content) and content[end] in '\n\r': end += 1
    return content[:m.start()] + replacement + '\n' + content[end:], True

def remove_function(content, name):
    m = re.search(r'function\s+' + re.escape(name) + r'\s*\([^)]*\)\s*\{', content)
    if not m: return content, False
    end = find_function_end(content, m.end() - 1)
    if end == -1: return content, False
    while end < len(content) and content[end] in '\n\r': end += 1
    return content[:m.start()] + content[end:], True


# ── Group A/C steps ────────────────────────────────────────────────────────────

def step_avatar_html(c):
    p = re.compile(r'<div id="rWrap">.*?</div>', re.DOTALL)
    new, n = p.subn(TURTLE_HTML, c, count=1)
    return new, n > 0

def step_fix_css(c):
    changed = False
    if '#rCharImg' in c:
        c = re.sub(r'#rCharImg\{[^}]*\}[\r\n]*', '', c); changed = True
    if '#rChar{' not in c and '#rWrap{' in c:
        c = c.replace(
            '#rWrap{position:fixed;bottom:68px;left:10px;z-index:200;width:82px;pointer-events:none;}',
            '#rWrap{position:fixed;bottom:68px;left:10px;z-index:200;width:82px;pointer-events:none;}\n#rChar{width:82px;filter:drop-shadow(0 4px 10px rgba(107,76,42,.3));}', 1)
        changed = True
    return c, changed

def step_character_js(c):
    for pat in [
        re.compile(r'/\*\s*═+[^*]*CHARACTER[^*]*═+\s*\*/.*?function\s+rThink\s*\(\)\s*\{[^}]*\}', re.DOTALL),
        re.compile(r'function\s+stopSpeakAnim\s*\(.*?function\s+rThink\s*\(\)\s*\{[^}]*\}', re.DOTALL),
        re.compile(r'function\s+rInit\s*\(\s*\)\s*\{.*?function\s+rThink\s*\(\)\s*\{[^}]*\}', re.DOTALL),
    ]:
        new, n = pat.subn(TURTLE_JS, c, count=1)
        if n: return new, True
    return c, False

def step_fix_say(c):
    changed = False
    c, ok = replace_function(c, 'sayBrowser', SAY_BROWSER); changed = changed or ok
    c, ok = replace_function(c, 'say', SAY_FUNC);           changed = changed or ok
    return c, changed

def step_elaudio(c):
    if 'var elAudio' in c or 'elAudio=null' in c: return c, False
    new, n = re.subn(r'var voicesReady\s*=\s*false\s*,\s*selectedVoice\s*=\s*null\s*;',
                     'var voicesReady=false, selectedVoice=null, elAudio=null;', c, count=1)
    return (new, True) if n else (c, False)

def step_remove_recog(c):
    changed = False
    c, ok = remove_function(c, 'setupRecog'); changed = changed or ok
    new, n = re.subn(r'setupRecog\(\)\s*;?\s*', '', c)
    if n: c = new; changed = True
    return c, changed

# ── Group B steps ──────────────────────────────────────────────────────────────

def step_b_turtle_css(c):
    if '#rWrap' in c or '</style>' not in c: return c, False
    return c.replace('</style>', TURTLE_CSS + '\n</style>', 1), True

def step_b_turtle_html(c):
    if '<div id="rWrap">' in c or '</body>' not in c: return c, False
    return c.replace('</body>', TURTLE_HTML + '\n</body>', 1), True

def step_b_turtle_js(c):
    if 'function rInit(' in c or 'window.onload=' not in c: return c, False
    return c.replace('window.onload=', TURTLE_JS + '\nwindow.onload=', 1), True

def step_b_elaudio(c):
    if 'var elAudio' in c or 'elAudio=null' in c: return c, False
    new, n = re.subn(r'(var chosenVoice[^;]+;)', r'\1\nvar elAudio=null;', c, count=1)
    return (new, True) if n else (c, False)

def step_b_rinit(c):
    if 'rInit()' in c or 'startBlink();' not in c: return c, False
    return c.replace('startBlink();', 'startBlink();rInit();', 1), True


# ── Main ───────────────────────────────────────────────────────────────────────

def is_group_b(c):
    return '<div id="rWrap">' not in c and 'var chosenVoice' in c

def process_file(filepath):
    fname = os.path.basename(filepath)
    if fname in SKIP_FILES:
        print(f"  SKIP  {fname}  (needs full rebuild)")
        return False

    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        c = f.read()
    c = c.replace('\r\n', '\n').replace('\r', '\n')

    report = []
    grp = 'B' if is_group_b(c) else 'A'

    if grp == 'B':
        for fn, label in [
            (step_b_turtle_css,  'turtle_css'),
            (step_b_turtle_html, 'turtle_html'),
            (step_b_turtle_js,   'turtle_js'),
            (step_b_elaudio,     'elaudio'),
            (step_b_rinit,       'rinit'),
            (step_fix_say,       'say_fix'),
            (step_remove_recog,  'recog_remove'),
        ]:
            c, ok = fn(c)
            if ok: report.append(label)
    else:
        for fn, label in [
            (step_avatar_html,  'avatar_html'),
            (step_fix_css,      'css_fix'),
            (step_character_js, 'character_js'),
            (step_fix_say,      'say_fix'),
            (step_elaudio,      'elaudio'),
            (step_remove_recog, 'recog_remove'),
        ]:
            c, ok = fn(c)
            if ok: report.append(label)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

    print(f"  {'OK' if report else 'NOOP'} [{grp}] {fname}")
    if report: print(f"         ✓ {', '.join(report)}")
    return True


if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')
    files = sorted(glob.glob(os.path.join(d, '**', '*.html'), recursive=True))
    if not files: files = sorted(glob.glob(os.path.join(d, '*.html')))
    if not files: print(f"No HTML files found under: {d}"); sys.exit(1)

    print(f"\nRISHI Upgrade v2 — {len(files)} file(s)\n")
    n = sum(1 for fp in files if process_file(fp))
    print(f"\nDone. {n} file(s) written.")
    if SKIP_FILES:
        print("\nSkipped:")
        for s in sorted(SKIP_FILES): print(f"  - {s}")
    print()
