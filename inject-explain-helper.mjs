/**
 * inject-explain-helper.mjs
 * Run from repo root: node inject-explain-helper.mjs
 *
 * Adds <script src="/explain-helper.js"></script> before </body>
 * in all 16 explain pages under public/explain/class8/
 * Safe to run multiple times — skips files already injected.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const EXPLAIN_ROOT = 'public/explain/class8';
const INJECT_TAG   = '<script src="/explain-helper.js"></script>';
const MARKER       = 'explain-helper.js';

var files = [];

function walk(dir) {
  var entries = readdirSync(dir);
  for (var i = 0; i < entries.length; i++) {
    var full = join(dir, entries[i]);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entries[i].endsWith('.html')) {
      files.push(full);
    }
  }
}

walk(EXPLAIN_ROOT);

var injected = 0;
var skipped  = 0;

for (var i = 0; i < files.length; i++) {
  var f    = files[i];
  var html = readFileSync(f, 'utf8');

  if (html.indexOf(MARKER) !== -1) {
    console.log('SKIP (already has it): ' + f);
    skipped++;
    continue;
  }

  if (html.indexOf('</body>') === -1) {
    console.log('WARN (no </body> found): ' + f);
    continue;
  }

  var updated = html.replace('</body>', INJECT_TAG + '\n</body>');
  writeFileSync(f, updated, 'utf8');
  console.log('INJECTED: ' + f);
  injected++;
}

console.log('\nDone. Injected: ' + injected + '  |  Skipped: ' + skipped + '  |  Total files: ' + files.length);
