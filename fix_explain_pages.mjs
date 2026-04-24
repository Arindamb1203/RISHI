import fs from 'fs';
import path from 'path';

const BASE = path.join(process.cwd(), 'public', 'explain', 'class8');

const START_LESSON_FN =
  "function startLesson(){" +
  "var btn=G('startBtn');" +
  "if(btn){btn.disabled=true;btn.textContent='\u25b6 Starting...';}" +
  "var done=false;" +
  "function proceed(){if(!done){done=true;setTimeout(showQ,600);}}" +
  "say(G('introText').innerText,proceed);" +
  "setTimeout(proceed,8000);" +
  "}\n";

function fix(src) {
  // Remove old startLesson if already injected by previous run
  src = src.replace(
    /function startLesson\(\)\{[^\n]+\n/g,
    ''
  );

  src = src.replace(
    'initVoices(function(){say(G("introText").innerText);setTimeout(showQ,2200);});',
    'initVoices(function(){});'
  );
  src = src.replace(
    /initVoices\(function\(\)\s*\{\s*say\(G\("introText"\)\.innerText\);\s*setTimeout\(showQ,\s*2200\);\s*\}\s*\);/gs,
    'initVoices(function(){});'
  );
  src = src.replace(
    /onclick="say\(G\('introText'\)\.innerText\)">&#128266; Hear[^<]+<\/button>/g,
    'onclick="startLesson()" id="startBtn">\u25b6 Start Lesson</button>'
  );

  // Fix showQ — only add startAnim if not already there
  if (!src.includes('G("qArea").appendChild(ap);setTimeout(startAnim,800);')) {
    src = src.split('G("qArea").appendChild(ap);').join('G("qArea").appendChild(ap);setTimeout(startAnim,800);');
  }

  // Fix startAnim — only add beginSteps if not already there
  if (!src.includes('setTimeout(beginSteps,600)')) {
    src = src.replace(
      /if\(pb\)pb\.style\.display="none";(\s*\}\);)/g,
      'if(pb)pb.style.display="none";setTimeout(beginSteps,600);$1'
    );
  }

  // Fix nextStep — only add auto-advance if not already there
  if (!src.includes('setTimeout(nextStep,400)')) {
    src = src.split('setTimeout(function(){say(s.s);},280);').join(
      'setTimeout(function(){say(s.s,function(){setTimeout(nextStep,400);});},280);'
    );
  }

  // Always re-inject startLesson fresh
  if (!src.includes('function startLesson')) {
    src = src.replace('function init(){', START_LESSON_FN + 'function init(){');
  }

  return src;
}

let changed = 0;
const subfolders = ['algebra','arithmetic','data-handling','geometry','mensuration'];
for (const sub of subfolders) {
  const dir = path.join(BASE, sub);
  if (!fs.existsSync(dir)) { console.log(`SKIP folder: ${sub}`); continue; }
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const filePath = path.join(dir, file);
    const orig = fs.readFileSync(filePath, 'utf8');
    const fixed = fix(orig);
    if (fixed === orig) { console.log(`NO CHANGE: ${sub}/${file}`); }
    else { fs.writeFileSync(filePath, fixed, 'utf8'); console.log(`FIXED: ${sub}/${file}`); changed++; }
  }
}
console.log(`Done. ${changed} fixed.`);
