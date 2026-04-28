/**
 * patch-geometry-practice.mjs
 * Fixes all 3 geometry practice pages:
 *   1. Adds rishi-presence.js script tag
 *   2. Adds rishiIsExplainDone gate in init()
 *
 * Run from repo root: node patch-geometry-practice.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const FILES = [
  'public/practice/class8/geometry/understanding-quadrilaterals.html',
  'public/practice/class8/geometry/practical-geometry.html',
  'public/practice/class8/geometry/visualising-solid-shapes.html',
];

const SYNC_TAG    = '<script src="/rishi-sync.js"></script>';
const PRESENCE    = '\n<script src="/rishi-presence.js"></script>';
const INIT_MARKER = 'function init(){\r\n  rishiCheckPlan(CHAP_ID);';
const INIT_FIXED  = 'function init(){\r\n  rishiCheckPlan(CHAP_ID);\r\n  if(localStorage.getItem(\'rishi_admin_bypass\')!==\'1\' && !rishiIsExplainDone(CHAP_ID)){window.location.href=\'/syllabus.html\';return;}';

let patched=0, skipped=0;

FILES.forEach(function(fp) {
  let src;
  try { src = readFileSync(fp, 'utf8'); } catch(e) {
    console.log('  ✗ NOT FOUND: ' + fp); skipped++; return;
  }

  let changed = false;

  if (!src.includes('/rishi-presence.js')) {
    if (src.includes(SYNC_TAG)) {
      src = src.replace(SYNC_TAG, SYNC_TAG + PRESENCE);
      changed = true;
    } else {
      console.log('  ⚠ No rishi-sync.js tag in: ' + fp);
    }
  }

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
