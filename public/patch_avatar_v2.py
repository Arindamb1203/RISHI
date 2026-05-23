"""
Avatar + voice patch v2:
  1. Engine: new RISHIKA_IMGS keys, rInit shows greeting 4s then neutral,
             rHappy/rCelebrate→celebrate, rThink→taunt, add rAngry
  2. setRishika: add angry/break → rAngry() (class 6/8 + ICSE — multi-line only)
  3. Break timeout: setRishika('disappointed'→'angry') for 5-min comeback message
  4. Voice A (multi-line): tighter female-name list, no lang-code fallback, regex fallback
  5. Voice B (minified): same improvement for class7/class9
  6. Pitch A (multi-line say): 1.05 → 1.15
  7. Pitch B (minified say): 1.05 → 1.15
"""
import os, glob

ROOT     = os.path.dirname(os.path.abspath(__file__))
PRACTICE = os.path.join(ROOT, 'practice')

# ── 1. Engine block ───────────────────────────────────────────────────────────
OLD_ENGINE = (
    '<script>\n'
    '/* -- RISHIKA IMAGE AVATAR -- */\n'
    'var RISHIKA_IMGS = {\n'
    "  neutral:      'Observing.png',\n"
    "  celebrate:    'Celebrating.png',\n"
    "  praise:       'Naughty.png',\n"
    "  disappointed: 'Angry.png',\n"
    "  thinking:     'Good Morning.png'\n"
    '};\n'
    'var _rTimer = null;\n'
    'function _rSet(state) {\n'
    "  var el = document.getElementById('rishika-img');\n"
    '  if (!el) return;\n'
    "  el.src = '/images/rishika/sprites/' + (RISHIKA_IMGS[state] || RISHIKA_IMGS.neutral);\n"
    '}\n'
    "function rInit()         { _rSet('neutral'); }\n"
    "function rHappy()        { _rSet('praise');      clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 3000); }\n"
    "function rCelebrate()    { _rSet('celebrate');   clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 3000); }\n"
    "function rThink()        { _rSet('disappointed'); clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 3000); }\n"
    'function rStartTalk(len) { /* TTS speaks */ }\n'
    'function rStopTalk()     { /* no-op */ }\n'
    '</script>\n'
)
NEW_ENGINE = (
    '<script>\n'
    '/* -- RISHIKA IMAGE AVATAR -- */\n'
    'var RISHIKA_IMGS = {\n'
    "  neutral:   'Observing.png',\n"
    "  celebrate: 'Celebrating.png',\n"
    "  taunt:     'Naughty.png',\n"
    "  angry:     'Angry.png',\n"
    "  greeting:  'Good Morning.png'\n"
    '};\n'
    'var _rTimer = null;\n'
    'function _rSet(state) {\n'
    "  var el = document.getElementById('rishika-img');\n"
    '  if (!el) return;\n'
    "  el.src = '/images/rishika/sprites/' + (RISHIKA_IMGS[state] || RISHIKA_IMGS.neutral);\n"
    '}\n'
    "function rInit()         { _rSet('greeting'); clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 4000); }\n"
    "function rHappy()        { _rSet('celebrate');  clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 3000); }\n"
    "function rCelebrate()    { _rSet('celebrate');  clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 3000); }\n"
    "function rThink()        { _rSet('taunt');      clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 3000); }\n"
    "function rAngry()        { _rSet('angry');      clearTimeout(_rTimer); _rTimer = setTimeout(function(){ _rSet('neutral'); }, 6000); }\n"
    'function rStartTalk(len) { /* TTS speaks */ }\n'
    'function rStopTalk()     { /* no-op */ }\n'
    '</script>\n'
)

# ── 2. setRishika (multi-line, class 6/8 + ICSE) ─────────────────────────────
OLD_SETRISHIKA = (
    'function setRishika(expr,txt){\n'
    "  if(expr==='celebrate'||expr==='praise'){rHappy();}\n"
    "  else if(expr==='thinking'||expr==='disappointed'){rThink();}\n"
    "  var bubble=G('rishikaBubble');\n"
    '  if(bubble&&txt){bubble.textContent=txt;rStartTalk(txt.length);}\n'
    '}'
)
NEW_SETRISHIKA = (
    'function setRishika(expr,txt){\n'
    "  if(expr==='angry'||expr==='break'){rAngry();}\n"
    "  else if(expr==='celebrate'||expr==='praise'){rHappy();}\n"
    "  else if(expr==='thinking'||expr==='disappointed'){rThink();}\n"
    "  var bubble=G('rishikaBubble');\n"
    '  if(bubble&&txt){bubble.textContent=txt;rStartTalk(txt.length);}\n'
    '}'
)

# ── 3. Break 5-min timeout message ────────────────────────────────────────────
OLD_BREAK = "      setRishika('disappointed','Aye! Time to get back! Padhai karo! ⏰');"
NEW_BREAK = "      setRishika('angry','Aye! Time to get back! Padhai karo! ⏰');"

# ── 4a. Voice — multi-line (class 6/8 + ICSE) ────────────────────────────────
OLD_VOICE_A = (
    "    var pref=['Riya','Heera','Priya','Aditi','Zira','Samantha','Google UK English Female','Microsoft Zira','en-IN','en-GB','en-US'];\n"
    "    for(var p of pref){for(var v of voices){if(v.name.includes(p)||v.lang.includes(p)){selVoice=v;break;}}if(selVoice)break;}\n"
    "    if(!selVoice&&voices.length)selVoice=voices.find(v=>v.lang.startsWith('en'))||voices[0];"
)
NEW_VOICE_A = (
    "    var pref=['Riya','Heera','Priya','Aditi','Zira','Samantha','Google UK English Female','Microsoft Zira','Microsoft Heera','Neerja'];\n"
    "    for(var p of pref){for(var v of voices){if(v.name.includes(p)){selVoice=v;break;}}if(selVoice)break;}\n"
    "    if(!selVoice&&voices.length)selVoice=voices.find(function(v){return /female|zira|heera|priya|samantha|riya|neerja/i.test(v.name);})||voices.find(function(v){return v.lang.startsWith('en');})||voices[0];"
)

# ── 4b. Voice — minified (class 7/9) ─────────────────────────────────────────
OLD_VOICE_B = "var pref=['Heera','Priya','Zira','Samantha','en-IN','en-GB','en-US'];for(var p of pref){for(var v of voices){if(v.name.includes(p)||v.lang.includes(p)){selVoice=v;break;}}if(selVoice)break;}if(!selVoice&&voices.length)selVoice=voices[0];"
NEW_VOICE_B = "var pref=['Riya','Heera','Priya','Aditi','Zira','Samantha','Google UK English Female','Microsoft Zira','Microsoft Heera','Neerja'];for(var p of pref){for(var v of voices){if(v.name.includes(p)){selVoice=v;break;}}if(selVoice)break;}if(!selVoice&&voices.length)selVoice=voices.find(function(v){return /female|zira|heera|priya|samantha|riya|neerja/i.test(v.name);})||voices.find(function(v){return v.lang.startsWith('en');})||voices[0];"

# ── 5a. Pitch — multi-line say() ──────────────────────────────────────────────
OLD_PITCH_A = "  u.rate=rate||0.88;u.pitch=pitch||1.05;u.lang='en-IN';"
NEW_PITCH_A = "  u.rate=rate||0.88;u.pitch=pitch||1.15;u.lang='en-IN';"

# ── 5b. Pitch — minified say() ────────────────────────────────────────────────
OLD_PITCH_B = "u.rate=0.88;u.pitch=1.05;u.lang='en-IN';"
NEW_PITCH_B = "u.rate=0.88;u.pitch=1.15;u.lang='en-IN';"

PATCHES = [
    (OLD_ENGINE,     NEW_ENGINE,     'engine'),
    (OLD_SETRISHIKA, NEW_SETRISHIKA, 'setrishika'),
    (OLD_BREAK,      NEW_BREAK,      'break'),
    (OLD_VOICE_A,    NEW_VOICE_A,    'voice-A'),
    (OLD_VOICE_B,    NEW_VOICE_B,    'voice-B'),
    (OLD_PITCH_A,    NEW_PITCH_A,    'pitch-A'),
    (OLD_PITCH_B,    NEW_PITCH_B,    'pitch-B'),
]

total = 0
patched = 0
problems = []

for path in glob.glob(os.path.join(PRACTICE, '**', '*.html'), recursive=True):
    total += 1
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    original = src
    applied = []
    for old, new, tag in PATCHES:
        if old in src:
            src = src.replace(old, new)
            applied.append(tag)
    if src != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(src)
        patched += 1
        rel = os.path.relpath(path, ROOT)
        print(f'  OK [{",".join(applied)}]  {rel}')
    else:
        problems.append(os.path.relpath(path, ROOT))

print(f'\nDone: {patched}/{total} patched.')
if problems:
    print(f'Unpatched ({len(problems)}):')
    for p in problems: print(f'  {p}')
