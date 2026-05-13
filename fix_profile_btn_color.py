import os

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

OLD = 'onclick="showProfilePanel()" title="Profile &amp; Settings" style="font-size:17px;padding:5px 10px;">👤</button>'
NEW = 'onclick="showProfilePanel()" title="Profile &amp; Settings" style="font-size:17px;padding:5px 12px;background:#c8922a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:800;">👤</button>'

if OLD in h:
    h = h.replace(OLD, NEW, 1)
    print("Fixed: profile button now gold bg white text")
else:
    print("MISS")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)

print("git add .")
print('git commit -m "Parent: profile button gold color"')
print("git push")
