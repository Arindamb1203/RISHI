import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Remove overflow:hidden from hdr mobile CSS (it clips dropdown)
h = h.replace(
    '.hdr{padding:0 10px;gap:6px;overflow:hidden;}',
    '.hdr{padding:0 10px;gap:6px;overflow:visible;}'
)
print("hdr overflow:hidden → visible (fixes dropdown clipping)")

# 2. Make dropdown full-width on mobile, higher z-index
h = h.replace(
    'id="hdr-menu-dropdown" style="display:none;position:absolute;top:58px;right:12px;background:var(--navy);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;z-index:200;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.3);"',
    'id="hdr-menu-dropdown" style="display:none;position:fixed;top:58px;left:0;right:0;background:var(--navy);border-bottom:2px solid rgba(255,255,255,.15);padding:8px 12px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.4);"'
)
print("Dropdown: position:fixed full-width, z-index:9999")

# 3. Fix leaderboard — ensure it has btn-hide-mobile class
# Find leaderboard button and check its class
m = re.search(r'<button[^>]*showLeaderboard\(\)[^>]*>', h)
if m:
    btn = m.group(0)
    print("Leaderboard btn:", btn[:150])
    if 'btn-hide-mobile' not in btn:
        new_btn = btn.replace('class="btn-out-hdr"', 'class="btn-out-hdr btn-hide-mobile"')
        h = h.replace(btn, new_btn, 1)
        print("Added btn-hide-mobile to Leaderboard")
    else:
        print("Leaderboard already has btn-hide-mobile")

# 4. Fix profile panel z-index and mobile sizing
h = h.replace(
    "panel.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;';",
    "panel.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end;justify-content:center;padding:0;';"
)
# Make panel content scrollable on mobile
h = h.replace(
    "'background:#fff;border-radius:16px;padding:24px;max-width:480px;width:100%;font-family:Nunito,sans-serif;'",
    "'background:#fff;border-radius:16px 16px 0 0;padding:24px;max-width:480px;width:100%;font-family:Nunito,sans-serif;max-height:90vh;overflow-y:auto;'"
)
print("Profile panel: slides up from bottom on mobile")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("\nSaved parent.html")
print()
print("git add .")
print('git commit -m "Parent mobile: fix dropdown clip, full-width menu, profile panel"')
print("git push")
