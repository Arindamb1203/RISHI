import re, os

PATH = os.path.join('public', 'admin', 'admin.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# Find and show current card buttons
m = re.search(r"'<div style=\"display:flex;gap:6px;\">.*?</div>'", h, re.DOTALL)
if m:
    print("CURRENT BUTTONS:", m.group(0)[:300])
    
    NEW_BUTTONS = ("'<div style=\"display:flex;gap:6px;\">' +\n"
        "        '<button id=\"qb-gen-btn-' + ch.id + '\" onclick=\"qbGenerateChapter(\\'' + ch.id + '\\')\" "
        "style=\"flex:2;padding:7px 4px;border:none;border-radius:7px;font-size:13px;font-weight:800;"
        "cursor:pointer;background:rgba(124,58,237,.15);color:#7c3aed;font-family:Outfit,sans-serif;\">✨ Generate</button>' +\n"
        "        '<button id=\"qb-prev-btn-' + ch.id + '\" onclick=\"qbPreviewChapter(\\'' + ch.id + '\\')\" "
        "style=\"flex:1;padding:7px 4px;border:none;border-radius:7px;font-size:13px;font-weight:800;"
        "cursor:pointer;background:#1a7a4a;color:#fff;font-family:Outfit,sans-serif;\">👁 View</button>' +\n"
        "        '<button onclick=\"qbDeleteChapter(\\'' + ch.id + '\\')\" "
        "style=\"padding:7px 10px;border:none;border-radius:7px;font-size:13px;cursor:pointer;"
        "background:rgba(192,57,43,.08);color:var(--red);font-family:Outfit,sans-serif;\">🗑</button>' +\n"
        "      '</div>'")
    
    h = h.replace(m.group(0), NEW_BUTTONS, 1)
    print("Card buttons fixed")
else:
    print("Card buttons pattern not found")

# Remove Seed All from bulk ops HTML
before = len(h)
h = re.sub(r"<button[^>]*qbSeedAll\(\)[^>]*>.*?</button>\n?", '', h)
if len(h) < before:
    print("Seed All removed")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Fix card buttons: View btn, remove Seed"')
print("git push")
