#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_class6_bugs.py  —  Patch all 10 Class 6 explain + practice pages in-place.

Fixes:
  1. Practice pages: var CHAP_ID=14  ->  correct chapter id (1-10)
  2. Explain pages:  rishiCheckPlan/IsExplainDone/MarkExplainDone(5)  ->  correct id
  3. Explain pages:  goPractice/goExam hardcoded to class7  ->  correct class6 URLs
  4. Explain pages:  var svgs={} contains fractions template content
                     ->  rebuilt from the QB already in the page

Run from any directory:
  python public/fix_class6_bugs.py
OR from inside public/:
  python fix_class6_bugs.py
"""

import re
from pathlib import Path

PUBLIC = Path(__file__).parent.resolve()

CHAPTERS = [
    {'id':1, 'slug':'patterns-in-mathematics',        'topic':'arithmetic',    'name':'Patterns in Mathematics'},
    {'id':2, 'slug':'lines-and-angles',                'topic':'geometry',      'name':'Lines and Angles'},
    {'id':3, 'slug':'number-play',                     'topic':'arithmetic',    'name':'Number Play'},
    {'id':4, 'slug':'data-handling-and-presentation',  'topic':'data-handling', 'name':'Data Handling and Presentation'},
    {'id':5, 'slug':'prime-time',                      'topic':'arithmetic',    'name':'Prime Time'},
    {'id':6, 'slug':'perimeter-and-area',               'topic':'mensuration',   'name':'Perimeter and Area'},
    {'id':7, 'slug':'fractions',                        'topic':'arithmetic',    'name':'Fractions'},
    {'id':8, 'slug':'playing-with-constructions',       'topic':'geometry',      'name':'Playing with Constructions'},
    {'id':9, 'slug':'symmetry',                         'topic':'geometry',      'name':'Symmetry'},
    {'id':10,'slug':'the-other-side-of-zero',           'topic':'arithmetic',    'name':'The Other Side of Zero'},
]
BY_SLUG = {c['slug']: c for c in CHAPTERS}


# ── helpers ──────────────────────────────────────────────────────────────────

def read(path):
    return path.read_text(encoding='utf-8')

def write(path, text):
    path.write_text(text, encoding='utf-8')

def extract_svgs_from_qb(html):
    """
    Extract all (anim_key, anim_svg_json_string) pairs from the QB block.
    Returns the rebuilt 'var svgs={...};' string, or None if not found.
    Each QB entry has the form:
        anim:"q1",
        ...
        anim_svg:"<svg ...>"
    The anim_svg value is JSON-encoded (escaped double quotes inside).
    """
    # Match anim:"xxx" followed (lazily) by anim_svg:"..."
    pairs = re.findall(
        r'anim:("(?:q|p)\d+")[\s\S]*?anim_svg:("(?:[^"\\]|\\.)*")',
        html
    )
    if not pairs:
        return None
    entries = [f'{anim}:base+{svg}' for anim, svg in pairs]
    return 'var svgs={\n' + ',\n'.join(entries) + '\n};'


# ── practice fix ─────────────────────────────────────────────────────────────

def fix_practice(path, ch):
    html = read(path)
    new_html = re.sub(r'var CHAP_ID=\d+;', f'var CHAP_ID={ch["id"]};', html, count=1)
    if new_html == html:
        print(f'  SKIP (no change): {path.relative_to(PUBLIC)}')
        return
    write(path, new_html)
    print(f'  OK practice: {path.relative_to(PUBLIC)}  CHAP_ID -> {ch["id"]}')


# ── explain fix ──────────────────────────────────────────────────────────────

def fix_explain(path, ch):
    html = read(path)
    changes = []

    # 1. Fix rishiCheckPlan / rishiIsExplainDone / rishiMarkExplainDone IDs
    def _replace_id(m):
        return f'{m.group(1)}({ch["id"]})'
    new = re.sub(
        r'(rishiCheckPlan|rishiIsExplainDone|rishiMarkExplainDone)\(\d+\)',
        _replace_id, html
    )
    if new != html:
        changes.append(f'chapter-id -> {ch["id"]}')
        html = new

    # 2. Fix goPractice() URL
    practice_url = f'/practice/class6/{ch["topic"]}/{ch["slug"]}.html'
    new = re.sub(
        r'location\.href="/practice/class7/[^"]+\.html"',
        f'location.href="{practice_url}"',
        html, count=1
    )
    if new != html:
        changes.append(f'goPractice -> {practice_url}')
        html = new

    # 3. Fix goExam() URL
    exam_url = f'/exam.html?ch=c6-{ch["id"]:02d}'
    new = re.sub(
        r'location\.href="/exam\.html\?ch=c7-[^"]+"',
        f'location.href="{exam_url}"',
        html, count=1
    )
    if new != html:
        changes.append(f'goExam -> {exam_url}')
        html = new

    # 4. Fix confirmShown: not declared → follow-up skipped after q1
    new = re.sub(r'(completed=false,)(breakSecs)', r'\1confirmShown=false,\2', html, count=1)
    if new != html:
        changes.append('confirmShown declared')
        html = new

    # 5. Fix confirmShown: not reset in goNext → only q1 ever shows confirm
    new = re.sub(r'(function goNext\(\)\{)(idx\+\+)', r'\1confirmShown=false;\2', html, count=1)
    if new != html:
        changes.append('confirmShown reset in goNext')
        html = new

    # 6. Fix completion message (template hardcodes "Working with Fractions")
    new = re.sub(r"You&#39;ve mastered [^<]+!", f"You&#39;ve mastered {ch['name']}!", html, count=1)
    if new != html:
        changes.append(f'completion message -> {ch["name"]}')
        html = new

    # 7. Rebuild var svgs={} from QB anim_svg fields
    new_svgs = extract_svgs_from_qb(html)
    if new_svgs:
        new = re.sub(r'var svgs=\{[\s\S]*?\r?\n\};', new_svgs, html, count=1)
        if new != html:
            changes.append('svgs rebuilt from QB')
            html = new
        else:
            print(f'  WARN: svgs block not matched in {path.name}')
    else:
        print(f'  WARN: no anim_svg pairs found in {path.name}')

    if not changes:
        print(f'  SKIP (no change): {path.relative_to(PUBLIC)}')
        return
    write(path, html)
    print(f'  OK explain: {path.relative_to(PUBLIC)}  [{";  ".join(changes)}]')


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    print()
    print('=' * 58)
    print('  fix_class6_bugs.py — patching Class 6 pages')
    print('=' * 58)

    print('\n--- PRACTICE PAGES ---')
    for f in sorted((PUBLIC / 'practice' / 'class6').rglob('*.html')):
        slug = f.stem
        if slug in BY_SLUG:
            fix_practice(f, BY_SLUG[slug])
        else:
            print(f'  SKIP (unknown slug): {f.name}')

    print('\n--- EXPLAIN PAGES ---')
    for f in sorted((PUBLIC / 'explain' / 'class6').rglob('*.html')):
        slug = f.stem
        if slug in BY_SLUG:
            fix_explain(f, BY_SLUG[slug])
        else:
            print(f'  SKIP (unknown slug): {f.name}')

    print()
    print('Done.')
    print()


if __name__ == '__main__':
    main()
