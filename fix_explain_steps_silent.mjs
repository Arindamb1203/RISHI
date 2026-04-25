import fs from 'fs';
import path from 'path';

const BASE = path.join(process.cwd(), 'public', 'explain', 'class8');

const I_UNDERSTAND =
  'var ib=document.createElement("button");ib.className="btn-speak";' +
  'ib.innerHTML="&#9989; I Understand!";ib.style.cssText="margin-top:16px;width:100%;";' +
  'ib.onclick=function(){ib.remove();showConfirm();};' +
  'G("stepsWrap").appendChild(ib);' +
  'ib.scrollIntoView({behavior:"smooth",block:"center"});';

function fix(src) {
  // 1. Remove all literal say("...") animation narration calls
  src = src.replace(/say\("[^"]*"\);/g, '');

  // 2a. Minified nextStep pattern
  src = src.replace(
    'if(stepIdx>=q.steps.length){G("nxtStepBtn").style.display="none";showConfirm();return;}',
    'if(stepIdx>=q.steps.length){G("nxtStepBtn").style.display="none";' + I_UNDERSTAND + 'return;}'
  );

  // 2b. Multiline nextStep pattern
  src = src.replace(
    'if(stepIdx>=q.steps.length){\n    G("nxtStepBtn").style.display="none";\n    showConfirm();\n    return;\n  }',
    'if(stepIdx>=q.steps.length){\n    G("nxtStepBtn").style.display="none";\n    ' + I_UNDERSTAND + '\n    return;\n  }'
  );

  return src;
}

let changed = 0;
const subfolders = ['algebra','arithmetic','data-handling','geometry','mensuration'];
for (const sub of subfolders) {
  const dir = path.join(BASE, sub);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const filePath = path.join(dir, file);
    const orig = fs.readFileSync(filePath, 'utf8');
    const fixed = fix(orig);
    if (fixed === orig) { console.log(`NO CHANGE: ${sub}/${file}`); }
    else { fs.writeFileSync(filePath, fixed, 'utf8'); console.log(`FIXED: ${sub}/${file}`); changed++; }
  }
}
console.log(`Done. ${changed} fixed.`);
