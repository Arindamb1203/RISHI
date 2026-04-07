import os, re, glob

# ── Read math JS block from companion file ────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(script_dir, 'math_block.js'), 'r', encoding='utf-8') as f:
    MATH_JS = f.read()

MATH_SCRIPT_BLOCK = '\n<script>\n' + MATH_JS + '\n</script>'

KATEX_CDN = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">\n<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>'

MATH_CSS = """.math-input-wrap{margin-bottom:10px;}
.math-raw{width:100%;padding:10px 13px;border-radius:10px;border:2px solid var(--border-dark);background:var(--warm-white);color:var(--charcoal);font-size:1rem;font-family:'Share Tech Mono',monospace;resize:none;outline:none;min-height:48px;line-height:1.6;transition:border-color .2s;}
.math-raw:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(212,135,10,.12);}
.math-raw::placeholder{color:var(--inactive);font-family:'Nunito',sans-serif;}
.math-preview-label{font-size:0.68rem;text-transform:uppercase;letter-spacing:2px;color:var(--soft);margin:.5rem 0 .25rem;}
.math-preview{min-height:44px;padding:.6rem 1rem;background:#f9f4ec;border-radius:8px;border:1.5px solid var(--gold-pale);font-size:1.2rem;color:var(--charcoal);overflow-x:auto;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.math-preview .katex{font-size:1.2rem;}
.math-preview .mph{color:var(--inactive);font-style:italic;font-size:.85rem;font-family:'Nunito',sans-serif;}
.sugg-strip{margin-bottom:10px;}
.sugg-strip-head{font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--soft);margin-bottom:.4rem;}
.sugg-chips{display:flex;flex-wrap:wrap;gap:.35rem;}
.schip{border:1.5px solid;border-radius:20px;padding:.25rem .75rem;font-size:.78rem;cursor:pointer;background:transparent;font-family:'Nunito',sans-serif;font-weight:700;transition:all .15s;}
.schip.identity{border-color:#4a8a4a;color:#3a7a3a;background:#f0f8f0;}
.schip.identity:hover{background:#d8f0d8;}
.schip.shortcut{border-color:#7a4aaa;color:#6a3a9a;background:#f5f0ff;}
.schip.shortcut:hover{background:#e8e0ff;}
.schip.hint{border-color:#aa6a0a;color:#8a5008;background:#fff8ee;}
.schip.hint:hover{background:#ffeedd;}
.schip.confirm{border-color:#1a6aaa;color:#0a5a9a;background:#eef6ff;font-weight:800;}
.schip.confirm:hover{background:#d8eeff;}
.schip.fuzzy{border-color:#0a8a8a;color:#0a6a6a;background:#eefafa;border-style:dashed;}
.math-hint-toast{font-size:.78rem;color:#8a5008;background:#fff8ee;border:1.5px solid #aa6a0a;border-radius:7px;padding:.4rem .7rem;margin-bottom:8px;}
.result-box.ok{background:#eef2eb;border:2px solid var(--sage);color:var(--sage);display:block;}
.result-box.no{background:#fff5f0;border:2px solid var(--rust);color:var(--rust);display:block;}
.cel-word{font-size:1.5rem;font-weight:900;letter-spacing:1px;line-height:1.2;margin-bottom:3px;}
.cel-meta{font-size:0.75rem;font-weight:700;opacity:0.8;letter-spacing:0.5px;}"""

STOP_ALL_AND_SAY = """function stopAllAudio(){
  if(elAudio){try{elAudio.pause();elAudio.src="";}catch(x){} elAudio=null;}
  if(window.speechSynthesis)window.speechSynthesis.cancel();
}
function sayBrowser(text,onEnd){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  rSetAvatar("speaking");startSpeakAnim();
  var u=new SpeechSynthesisUtterance(text);
  u.lang="en-IN";u.rate=0.88;u.pitch=1.15;
  if(selectedVoice)u.voice=selectedVoice;
  u.onend=function(){stopSpeakAnim();rSetAvatar("idle");if(onEnd)onEnd();};
  u.onerror=function(){stopSpeakAnim();rSetAvatar("idle");if(onEnd)onEnd();};
  window.speechSynthesis.speak(u);
}
function say(text,onEnd){
  stopAllAudio();
  rSetAvatar("speaking");startSpeakAnim();
  fetch("/tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:text})})
  .then(function(res){if(!res.ok)throw new Error("TTS "+res.status);return res.blob();})
  .then(function(blob){
    var url=URL.createObjectURL(blob);
    elAudio=new Audio(url);
    elAudio.onended=function(){URL.revokeObjectURL(url);elAudio=null;stopSpeakAnim();rSetAvatar("idle");if(onEnd)onEnd();};
    elAudio.onerror=function(){URL.revokeObjectURL(url);elAudio=null;stopSpeakAnim();rSetAvatar("idle");if(onEnd)onEnd();};
    elAudio.play();
  })
  .catch(function(err){sayBrowser(text,onEnd);});
}"""

NEW_SHOW_CONFIRM = r"""function showConfirm(){
  var q=session[idx];var c=document.createElement("div");c.className="confirm-wrap";
  c.innerHTML='<div class="confirm-title">&#127917; Rishika asks!</div>'
    +'<div class="confirm-q">'+q.cq+'</div>'
    +'<div class="math-input-wrap"><textarea id="rawAnswer" class="math-raw" rows="2" autocomplete="off" placeholder="Type your answer e.g. (x+2)(x-3) or 4(x+2) or x^2-9"></textarea></div>'
    +'<div class="math-preview-label">Rendered preview</div>'
    +'<div class="math-preview" id="mathPreview"><span class="mph">your answer will render here...</span></div>'
    +'<div class="sugg-strip"><div class="sugg-strip-head">Suggestions</div><div class="sugg-chips" id="suggChips"></div></div>'
    +'<button type="button" onclick="submitTyped()" style="width:100%;font-family:\'Nunito\',sans-serif;font-size:14px;font-weight:900;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--amber),var(--gold-light));color:#fff;cursor:pointer;margin-bottom:8px;">Submit Answer</button>'
    +'<div class="result-box" id="rbox"></div>'
    +'<div class="nudge" id="nudgeBox"></div>'
    +'<button type="button" class="btn-next" id="btnNext" onclick="goNext()">Next Question &#9654;</button>';
  G("qArea").appendChild(c);c.scrollIntoView({behavior:"smooth",block:"center"});
  var ra=G("rawAnswer");
  if(ra){
    ra.addEventListener("input",mathUpdate);
    ra.addEventListener("keydown",function(ev){if(ev.key==="Enter"&&!ev.shiftKey){ev.preventDefault();submitTyped();}});
    setTimeout(function(){ra.focus();},300);
  }
  buildSuggChips(MATH_DEFAULTS);
  say(q.cqs);
}"""

NEW_SUBMIT_TYPED = """function submitTyped(){
  var ra=G("rawAnswer");
  if(!ra)return;
  var val=String(ra.value||"").trim();
  if(!val){ra.focus();return;}
  handleAnswer(val.toLowerCase());
}"""

CELEBRATIONS_BLOCK = """var CELEBRATIONS=[
  {word:"Magnifique !",lang:"French",meaning:"Magnificent!",speak:"Magnifique"},
  {word:"Brillante!",lang:"Spanish",meaning:"Brilliant!",speak:"Brillante"},
  {word:"Wunderbar!",lang:"German",meaning:"Wonderful!",speak:"Wunderbar"},
  {word:"Bravissimo!",lang:"Italian",meaning:"Very well done!",speak:"Bravissimo"},
  {word:"Fantastico!",lang:"Portuguese",meaning:"Fantastic!",speak:"Fantastico"},
  {word:"Muhteşem!",lang:"Turkish",meaning:"Magnificent!",speak:"Muhteşem"},
  {word:"Formidable!",lang:"French",meaning:"Formidable!",speak:"Formidable"},
  {word:"Bravo!",lang:"Italian",meaning:"Well done!",speak:"Bravo"},
];
var lastCelIdx=-1;
function celebrate(){
  var idx;
  do{idx=Math.floor(Math.random()*CELEBRATIONS.length);}while(idx===lastCelIdx&&CELEBRATIONS.length>1);
  lastCelIdx=idx;
  var c=CELEBRATIONS[idx];
  var rb=G("rbox");
  rb.className="result-box ok";
  rb.innerHTML='<div class="cel-word">'+c.word+'</div><div class="cel-meta">'+c.lang+' &nbsp;&middot;&nbsp; <em>'+c.meaning+'</em></div>';
  G("nudgeBox").classList.remove("show");
  var nb=G("btnNext");if(nb)nb.classList.add("show");
  say(c.speak);
  rHappy();
}
"""

def replace_function(content, func_name, replacement):
    pattern = r'function ' + re.escape(func_name) + r'\s*\([^)]*\)\s*\{'
    match = re.search(pattern, content)
    if not match:
        return content, False
    start = match.start()
    brace_count = 0
    i = match.end() - 1
    end = len(content)
    while i < len(content):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end = i + 1
                break
        i += 1
    content = content[:start] + replacement + content[end:]
    return content, True

# ── Find all explain HTML files ───────────────────────────────────────────
files = glob.glob('public/explain/**/*.html', recursive=True)
files += glob.glob('public/explain/*.html')
files = list(set(files))
files = [f for f in files if 'factorisation.html' not in f.replace('\\', '/')]

if not files:
    print("ERROR: No HTML files found.")
    print("Make sure you run this from D:\\rishi\\ (your repo root folder)")
    input("Press Enter to exit.")
    exit()

print(f"Found {len(files)} files to process:\n")
for f in files:
    print(f"  {f}")
print()

done, skipped, errors = [], [], []

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'mathUpdate' in content:
            print(f"  SKIP (already done): {filepath}")
            skipped.append(filepath)
            continue

        # 1. Add KaTeX CDN after Google Fonts link
        if 'katex' not in content:
            content = re.sub(
                r'(googleapis\.com[^\n]+rel="stylesheet">)',
                r'\1\n' + KATEX_CDN,
                content
            )

        # 2. Remove mic CSS
        for pat in [
            r'\.mic-btn\.[a-z-]+\{[^}]*\}',
            r'\.mic-btn\{[^}]*\}',
            r'@keyframes mic-pulse\{[^}]*\}',
            r'input\.transcript\.[a-z]+\{[^}]*\}',
            r'input\.transcript\{[^}]*\}',
            r'\.transcript\.[a-z]+\{[^}]*\}',
            r'\.transcript\{[^}]*\}',
        ]:
            content = re.sub(pat, '', content)

        # 3. Replace result-box ok/no, add math CSS before </style>
        content = re.sub(r'\.result-box\.ok\{[^}]*\}', '', content)
        content = re.sub(r'\.result-box\.no\{[^}]*\}', '', content)
        content = content.replace('</style>', MATH_CSS + '\n</style>', 1)

        # 4. Add elAudio var
        content = content.replace(
            'var voicesReady=false,selectedVoice=null;',
            'var voicesReady=false,selectedVoice=null;\nvar elAudio=null;'
        )

        # 5. Fix beforeunload listener
        content = content.replace(
            'window.addEventListener("beforeunload",function(){window.speechSynthesis&&window.speechSynthesis.cancel();});',
            'window.addEventListener("beforeunload",function(){stopAllAudio();});'
        )
        content = content.replace(
            'window.addEventListener("pagehide",function(){window.speechSynthesis&&window.speechSynthesis.cancel();});',
            'window.addEventListener("pagehide",function(){stopAllAudio();});'
        )

        # 6. Replace say() with new version (includes stopAllAudio + sayBrowser)
        content, ok = replace_function(content, 'say', STOP_ALL_AND_SAY)
        if not ok:
            print(f"  WARNING: say() not found in {filepath}")

        # 7. Fix recog/listening variable
        content = re.sub(
            r'var recog\s*=\s*null\s*,\s*listening\s*=\s*false[^;]*;',
            'var breakSecs=0,breakTmr=null;',
            content
        )

        # 8. Replace showConfirm()
        content, _ = replace_function(content, 'showConfirm', NEW_SHOW_CONFIRM)

        # 9. Replace submitTyped()
        content, _ = replace_function(content, 'submitTyped', NEW_SUBMIT_TYPED)

        # 10. answerInput → rawAnswer
        content = content.replace('G("answerInput")', 'G("rawAnswer")')
        content = content.replace("G('answerInput')", "G('rawAnswer')")

        # 11. Replace if(ok){ block with celebrate()
        content = re.sub(
            r'if\(ok\)\{.*?\}else\{',
            'if(ok){\n    celebrate();\n  }else{',
            content,
            flags=re.DOTALL
        )

        # 12. Add CELEBRATIONS + celebrate() before handleAnswer
        if 'celebrate' not in content:
            content = content.replace(
                'function handleAnswer(',
                CELEBRATIONS_BLOCK + '\nfunction handleAnswer('
            )

        # 13. Remove voice recognition script block
        content = re.sub(
            r'<script>\s*\(function\(\)\{[^<]*(?:SpeechRecognition|RISHI_startVoice)[^<]*\}\)\(\);\s*</script>',
            '',
            content,
            flags=re.DOTALL
        )

        # 14. Remove leftover voice functions
        for fn in ['startListen', 'setMicBtn', 'setListen']:
            content, _ = replace_function(content, fn, '')

        # 15. Add math script block before </body>
        content = content.replace('</body>', MATH_SCRIPT_BLOCK + '\n</body>')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  DONE: {filepath}")
        done.append(filepath)

    except Exception as e:
        print(f"  ERROR in {filepath}: {e}")
        errors.append(filepath)

print(f"\n{'='*60}")
print(f"  Upgraded : {len(done)} files")
print(f"  Skipped  : {len(skipped)} files (already done)")
print(f"  Errors   : {len(errors)} files")
if not errors:
    print(f"\n  Now run:")
    print(f"  git add .")
    print(f'  git commit -m "Upgrade all explain pages: math input + ElevenLabs + celebrations"')
    print(f"  git push")
input("\nPress Enter to close.")
