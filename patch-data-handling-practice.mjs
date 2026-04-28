/**
 * patch-data-handling-practice.mjs
 * Fixes both data-handling practice pages:
 *   1. Adds rishi-presence.js script tag
 *   2. Adds rishiIsExplainDone gate in init()
 *   3. CRITICAL: fixes chance-probability.html CHAP_ID from 5 → 17
 *
 * Run from repo root: node patch-data-handling-practice.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILES = [
  { path: 'public/practice/class8/data-handling/frequency-distribution.html', fixChapId: null },
  { path: 'public/practice/class8/data-handling/chance-probability.html',     fixChapId: { from: 'var CHAP_ID=5;', to: 'var CHAP_ID=17;' } },
];

const SYNC_TAG    = '<script src="/rishi-sync.js"></script>';
const PRESENCE    = '\n<script src="/rishi-presence.js"></script>';
const INIT_MARKER = 'function init(){\r\n  rishiCheckPlan(CHAP_ID);';
const INIT_FIXED  = 'function init(){\r\n  rishiCheckPlan(CHAP_ID);\r\n  if(localStorage.getItem(\'rishi_admin_bypass\')!==\'1\' && !rishiIsExplainDone(CHAP_ID)){window.location.href=\'/syllabus.html\';return;}';

let patched=0, skipped=0;

FILES.forEach(function(file) {
  var fp = file.path;
  let src;
  try { src = readFileSync(fp, 'utf8'); } catch(e) {
    console.log('  ✗ NOT FOUND: ' + fp); skipped++; return;
  }

  let changed = false;

  /* Fix CHAP_ID if needed */
  if (file.fixChapId) {
    if (src.includes(file.fixChapId.from)) {
      src = src.replace(file.fixChapId.from, file.fixChapId.to);
      console.log('  🔧 Fixed CHAP_ID 5→17 in: ' + fp);
      changed = true;
    } else if (!src.includes(file.fixChapId.to)) {
      console.log('  ⚠ CHAP_ID pattern not found in: ' + fp);
    }
  }

  /* Fix 1: presence */
  if (!src.includes('/rishi-presence.js')) {
    if (src.includes(SYNC_TAG)) {
      src = src.replace(SYNC_TAG, SYNC_TAG + PRESENCE);
      changed = true;
    } else {
      console.log('  ⚠ No rishi-sync.js tag in: ' + fp);
    }
  }

  /* Fix 2: explain gate */
  if (!src.includes('rishiIsExplainDone(CHAP_ID)')) {
    if (src.includes(INIT_MARKER)) {
      src = src.replace(INIT_MARKER, INIT_FIXED);
      changed = true;
    } else {
      console.log('  ⚠ init() pattern not found in: ' + fp);
    }
  }

  if (changed) {
    writeFileSync(fp, src, 'utf8');
    console.log('  ✅ ' + fp);
    patched++;
  } else {
    console.log('  — already OK: ' + fp);
    skipped++;
  }
});

console.log('\nDone — patched: ' + patched + ' | skipped/missing: ' + skipped);
