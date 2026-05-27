"""
patch_games.py — Add Games option to break menus on all explain + practice pages.
- Rename "Physical" / "Physical Game" → "Offline Activity"
- Remove old "Play with me" option (already replaced by Games)
- Add "Games" option that opens /games/games.html?from=<current-page>

Run from D:/rishi/public/
"""
import os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
EXPLAIN_DIRS = [os.path.join(ROOT, 'explain')]
PRACTICE_DIRS = [os.path.join(ROOT, 'practice')]

def find_html(dirs):
    files = []
    for d in dirs:
        for root, _, fnames in os.walk(d):
            for f in fnames:
                if f.endswith('.html') and not f.endswith('.bak'):
                    files.append(os.path.join(root, f))
    return files

def patch_explain(html, fpath):
    changed = False

    # 1. Rename Physical → Offline Activity
    old = "onclick=\"startBreak('Physical')\">&#127939; Physical</button>"
    new = "onclick=\"startBreak('Offline Activity')\">&#127939; Offline Activity</button>"
    if old in html:
        html = html.replace(old, new)
        changed = True

    # 2. Add Games button after the Offline Activity button (before Cancel)
    games_btn = """      <button class="break-opt" onclick="openGames()">&#127918; Games</button>\n"""
    # Insert before the Cancel button
    cancel_pat = '    <button class="break-opt" style="color:var(--soft)" onclick="closeBreak()">Cancel</button>'
    if games_btn.strip() not in html and cancel_pat in html:
        html = html.replace(cancel_pat, games_btn + cancel_pat)
        changed = True

    # 3. Add openGames() function — inject before closing </script> of the main script block
    #    We look for the endBreak function definition to anchor the injection
    games_fn = """
function openGames(){closeBreak();var url='/games/games.html?from='+encodeURIComponent(location.pathname+location.search);location.href=url;}
"""
    if 'openGames' not in html:
        # inject after endBreak definition
        html = re.sub(r'(function endBreak\(\)\{[^\}]+\})', r'\1' + games_fn, html, count=1)
        if 'openGames' not in html:
            # fallback: inject before closing body
            html = html.replace('</body>', games_fn + '</body>', 1)
        changed = True

    return html, changed

def patch_practice(html, fpath):
    changed = False

    # 1. Rename Physical / Physical Game → Offline Activity
    for old, new in [
        ("onclick=\"startBreak('Physical Game')\">&#127939; Physical Game</div>",
         "onclick=\"startBreak('Offline Activity')\">&#127939; Offline Activity</div>"),
        ("onclick=\"startBreak('Physical Game')\">🏃 Physical Game</div>",
         "onclick=\"startBreak('Offline Activity')\">🏃 Offline Activity</div>"),
        ("onclick=\"startBreak('Physical')\">&#127939; Physical</div>",
         "onclick=\"startBreak('Offline Activity')\">&#127939; Offline Activity</div>"),
        ("onclick=\"startBreak('Physical')\">🏃 Physical</div>",
         "onclick=\"startBreak('Offline Activity')\">🏃 Offline Activity</div>"),
    ]:
        if old in html:
            html = html.replace(old, new)
            changed = True

    # 2. Remove old "Play with me" option (Games replaces it)
    for old in [
        '        <div class="break-opt" onclick="startBreak(\'Play with me\')">&#127918; Play with me</div>\n',
        '        <div class="break-opt" onclick="startBreak(\'Play with me\')">🎮 Play with me</div>\n',
    ]:
        if old in html:
            html = html.replace(old, '')
            changed = True

    # 3. Add Games option — insert after the Offline Activity line
    games_opt = '        <div class="break-opt" onclick="openGames()">&#127918; Games</div>\n'
    # Find the offline activity line to anchor after
    anchor_patterns = [
        "onclick=\"startBreak('Offline Activity')\">&#127939; Offline Activity</div>\n",
        "onclick=\"startBreak('Offline Activity')\">🏃 Offline Activity</div>\n",
    ]
    for anchor in anchor_patterns:
        if anchor in html and games_opt not in html:
            html = html.replace(anchor, anchor + games_opt)
            changed = True
            break

    # 4. Add openGames() function
    games_fn = """
function openGames(){toggleBreakMenu();var url='/games/games.html?from='+encodeURIComponent(location.pathname+location.search);location.href=url;}
"""
    if 'openGames' not in html:
        # inject after endBreak definition
        html = re.sub(r'(function endBreak\(\)\s*\{[^\}]+\})', r'\1' + games_fn, html, count=1)
        if 'openGames' not in html:
            html = html.replace('</body>', games_fn + '</body>', 1)
        changed = True

    return html, changed

def process(fpath, is_explain):
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()
    orig = html
    if is_explain:
        html, changed = patch_explain(html, fpath)
    else:
        html, changed = patch_practice(html, fpath)
    if changed and html != orig:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False

explain_files = find_html(EXPLAIN_DIRS)
practice_files = find_html(PRACTICE_DIRS)

ok_e = ok_p = 0
for f in explain_files:
    if process(f, True): ok_e += 1
for f in practice_files:
    if process(f, False): ok_p += 1

print(f"Patched {ok_e}/{len(explain_files)} explain pages")
print(f"Patched {ok_p}/{len(practice_files)} practice pages")
print("Done.")
