import fs from 'fs';
import path from 'path';

const BASE = path.join(process.cwd(), 'public', 'explain', 'class8');

const OLD = 'setTimeout(function(){say(s.s,function(){setTimeout(nextStep,400);});},280);';
const NEW = 'setTimeout(nextStep,3500);';

let changed = 0;
const subfolders = ['algebra','arithmetic','data-handling','geometry','mensuration'];
for (const sub of subfolders) {
  const dir = path.join(BASE, sub);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const filePath = path.join(dir, file);
    const orig = fs.readFileSync(filePath, 'utf8');
    const fixed = orig.split(OLD).join(NEW);
    if (fixed === orig) { console.log(`NO CHANGE: ${sub}/${file}`); }
    else { fs.writeFileSync(filePath, fixed, 'utf8'); console.log(`FIXED: ${sub}/${file}`); changed++; }
  }
}
console.log(`Done. ${changed} fixed.`);
