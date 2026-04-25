import fs from 'fs';
import path from 'path';

const BASE = path.join(process.cwd(), 'public', 'explain', 'class8');

function fix(src) {
  src = src.replace(/class="rishika-name">Rekha<\/div>/g, 'class="rishika-name">Rishika</div>');
  src = src.replace(/class="rishika-name">Drishti<\/div>/g, 'class="rishika-name">Rishika</div>');
  src = src.replace(/class="rishika-name">Chetra<\/div>/g, 'class="rishika-name">Rishika</div>');
  src = src.replace(/class="rishika-name">Kona<\/div>/g, 'class="rishika-name">Rishika</div>');
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
