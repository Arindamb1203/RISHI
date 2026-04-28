/**
 * inject-presence.mjs
 * Adds <script src="/rishi-presence.js"></script> after rishi-core.js
 * in all explain, practice, exam, topic-exam, sampurna-pariksha, syllabus pages.
 *
 * Run from repo root: node inject-presence.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PUBLIC = './public';
const MARKER = '<script src="/rishi-core.js"></script>';
const INSERT = '\n<script src="/rishi-presence.js"></script>';

/** Recursively collect .html files */
function collectHtml(dir) {
  var results = [];
  readdirSync(dir).forEach(function(name) {
    var full = join(dir, name);
    if (statSync(full).isDirectory()) {
      results = results.concat(collectHtml(full));
    } else if (name.endsWith('.html')) {
      results.push(full);
    }
  });
  return results;
}

/** Pages to SKIP (parent portal, admin, login, landing etc.) */
var SKIP = [
  'parent.html', 'parent-dashboard.html',
  'admin.html', 'login.html', 'register.html',
  'landing.html', 'coming-soon.html',
  'question-manager.html'
];

function shouldSkip(filePath) {
  return SKIP.some(function(s) { return filePath.replace(/\\/g, '/').endsWith('/' + s); });
}

var files = collectHtml(PUBLIC);
var patched = 0, skipped = 0, already = 0;

files.forEach(function(fp) {
  if (shouldSkip(fp)) { skipped++; return; }

  var src = readFileSync(fp, 'utf8');

  /* Already injected? */
  if (src.includes('/rishi-presence.js')) { already++; return; }

  /* Has rishi-core.js? If not, skip silently */
  if (!src.includes(MARKER)) { skipped++; return; }

  var patched_src = src.replace(MARKER, MARKER + INSERT);
  writeFileSync(fp, patched_src, 'utf8');
  patched++;
  console.log('  ✅ ' + fp.replace(PUBLIC, ''));
});

console.log('\nDone — patched: ' + patched + ' | already done: ' + already + ' | skipped: ' + skipped);
