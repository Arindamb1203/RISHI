import os, re

PATH = os.path.join('public', 'admin.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()

# Map topic id → URL
URL_MAP = {
    't7-arithmetic': '/topic-exam.html?topic=arithmetic&class=7',
    't7-algebra':    '/topic-exam.html?topic=algebra&class=7',
    't7-geometry':   '/topic-exam.html?topic=geometry&class=7',
    't9-algebra':    '/topic-exam.html?topic=algebra&class=9',
    't9-geometry':   '/topic-exam.html?topic=geometry&class=9',
    't9-mensuration':'/topic-exam.html?topic=mensuration&class=9',
    't9-data':       '/topic-exam.html?topic=datahandling&class=9',
}

changed = 0
for tid, url in URL_MAP.items():
    pattern = r"(id:'" + re.escape(tid) + r"'[^}]*?)url:null"
    replacement = r"\1url:'" + url + "'"
    new_h, n = re.subn(pattern, replacement, h, count=1)
    if n:
        h = new_h
        changed += 1
        print(f"Fixed: {tid}")
    else:
        print(f"MISS: {tid}")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)

print(f"\nFixed {changed}/7")
print("git add .")
print('git commit -m "Fix topic exam URLs for Class 7 and 9"')
print("git push")
