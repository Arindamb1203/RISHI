/**
 * RISHI — clone-class.mjs
 * Clones explain + practice folders from one class to another.
 * Updates rishi-class meta tag. Clears step/answer content.
 * Generates empty question bank JSON stubs.
 *
 * Usage (run from D:\rishi\public):
 *   node clone-class.mjs --from class8 --to class7
 *   node clone-class.mjs --from class8 --to class6
 *   node clone-class.mjs --from class8 --to class9
 *
 * What it does:
 *   1. Copies explain/classX → explain/classY  (all topic subfolders + HTML)
 *   2. Copies practice/classX → practice/classY
 *   3. Updates <meta name="rishi-class" content="Y"> in every HTML
 *   4. Creates empty data/classY/*.json stubs (one per chapter)
 *   5. Outputs a checklist of files needing human content
 *
 * What it does NOT do:
 *   - Does not touch syllabus.html, rishi-core.js, register.html
 *   - Does not delete the source class
 *   - Does not overwrite if target already exists (safe re-run)
 */

import fs   from 'fs';
import path from 'path';

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const fromIdx = args.indexOf('--from');
const toIdx   = args.indexOf('--to');

if (fromIdx === -1 || toIdx === -1) {
  console.error('Usage: node clone-class.mjs --from class8 --to class7');
  process.exit(1);
}

const FROM_CLASS = args[fromIdx + 1];   // e.g. "class8"
const TO_CLASS   = args[toIdx   + 1];   // e.g. "class7"
const TO_NUM     = TO_CLASS.replace('class', ''); // e.g. "7"

const ROOT = process.cwd(); // must be run from D:\rishi\public

const FOLDERS = ['explain', 'practice'];

let checklist = [];
let created   = 0;
let skipped   = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  WARNING: Source not found: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.html')) {
      if (fs.existsSync(destPath)) {
        console.log(`  SKIP (exists): ${destPath.replace(ROOT, '')}`);
        skipped++;
        continue;
      }
      let html = fs.readFileSync(srcPath, 'utf8');

      // Update rishi-class meta
      html = html.replace(
        /(<meta\s+name=["']rishi-class["']\s+content=["'])\d+(["']>)/gi,
        `$1${TO_NUM}$2`
      );

      // Update <title> class reference  e.g. "Class 8" → "Class 7"
      html = html.replace(/Class\s+\d+/g, `Class ${TO_NUM}`);

      fs.writeFileSync(destPath, html, 'utf8');
      console.log(`  ✅ Created: ${destPath.replace(ROOT, '')}`);
      checklist.push(destPath.replace(ROOT, ''));
      created++;
    }
  }
}

function createJsonStubs(fromDataDir, toDataDir) {
  if (!fs.existsSync(fromDataDir)) {
    console.warn(`  WARNING: data source not found: ${fromDataDir}`);
    return;
  }
  fs.mkdirSync(toDataDir, { recursive: true });

  for (const fname of fs.readdirSync(fromDataDir)) {
    if (!fname.endsWith('.json')) continue;
    const dest = path.join(toDataDir, fname);
    if (fs.existsSync(dest)) { skipped++; continue; }

    // Read source to get structure, then blank the content arrays
    const src = JSON.parse(fs.readFileSync(path.join(fromDataDir, fname), 'utf8'));

    const stub = {
      _note: `STUB for ${TO_CLASS} — fill in questions before unlocking this class`,
      chapter: src.chapter || fname.replace('.json',''),
      class:   parseInt(TO_NUM),
      board:   src.board || 'cbse',
      questions: []
    };

    fs.writeFileSync(dest, JSON.stringify(stub, null, 2), 'utf8');
    console.log(`  📄 JSON stub: ${dest.replace(ROOT, '')}`);
    created++;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(`\nRISHI Clone — ${FROM_CLASS} → ${TO_CLASS}`);
console.log('─'.repeat(50));

// 1. Clone explain + practice
for (const folder of FOLDERS) {
  const src  = path.join(ROOT, folder, FROM_CLASS);
  const dest = path.join(ROOT, folder, TO_CLASS);
  console.log(`\nCloning ${folder}...`);
  copyDir(src, dest);
}

// 2. Create JSON stubs (practice question banks)
console.log(`\nCreating JSON stubs...`);
const fromData = path.join(ROOT, 'data', FROM_CLASS);
const toData   = path.join(ROOT, 'data', TO_CLASS);
createJsonStubs(fromData, toData);

// 3. Print checklist
console.log('\n' + '═'.repeat(50));
console.log(`DONE — Created: ${created}  Skipped (already exist): ${skipped}`);
console.log('═'.repeat(50));
console.log('\n📋 CONTENT CHECKLIST — these HTML files need chapter content updated:');
checklist.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
console.log('\n⚠️  Remember to:');
console.log(`  1. Fill in question bank JSONs under data/${TO_CLASS}/`);
console.log(`  2. Update chapter titles/IDs inside each HTML for ${TO_CLASS} syllabus`);
console.log(`  3. Unlock ${TO_CLASS} in register.html dropdown when ready`);
console.log(`  4. Make syllabus.html class-aware to load ${TO_CLASS} chapters\n`);
