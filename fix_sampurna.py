import os, re

PATH = os.path.join('public', 'sampurna-pariksha.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Add ALL_CHAPTERS_CLASS7 after CLASS9
OLD = "var ALL_CHAPTERS_CLASS9 = ['01','02','03','04','05','06','07','08','09','10','11','12'];"
NEW = ("var ALL_CHAPTERS_CLASS9 = ['01','02','03','04','05','06','07','08','09','10','11','12'];\n"
       "var ALL_CHAPTERS_CLASS7 = ['01','02','03','04','05','06','07','08'];")

if OLD in h:
    h = h.replace(OLD, NEW, 1)
    print("ALL_CHAPTERS_CLASS7 added")
else:
    print("MISS: CLASS9 line")

# 2. Update class detection to include class 7
OLD2 = "ALL_CHAPTERS  = (STUDENT_CLASS === 9) ? ALL_CHAPTERS_CLASS9 : ALL_CHAPTERS_CLASS8;"
NEW2 = ("ALL_CHAPTERS  = (STUDENT_CLASS === 7) ? ALL_CHAPTERS_CLASS7\n"
        "              : (STUDENT_CLASS === 9) ? ALL_CHAPTERS_CLASS9\n"
        "              : ALL_CHAPTERS_CLASS8;")

if OLD2 in h:
    h = h.replace(OLD2, NEW2, 1)
    print("Class detection updated")
else:
    print("MISS: class detection")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved sampurna-pariksha.html")

# 3. Fix admin.html SAMPURNA_BY_CLASS
ADMIN = os.path.join('public', 'admin.html')
with open(ADMIN, 'r', encoding='utf-8') as f:
    admin = f.read()
admin = admin.replace('\r\n', '\n')

OLD3 = "var SAMPURNA_BY_CLASS={6:null,7:null,8:'/sampurna-pariksha.html',9:null};"
NEW3 = "var SAMPURNA_BY_CLASS={6:null,7:'/sampurna-pariksha.html?class=7',8:'/sampurna-pariksha.html',9:'/sampurna-pariksha.html?class=9'};"

if OLD3 in admin:
    admin = admin.replace(OLD3, NEW3, 1)
    print("SAMPURNA_BY_CLASS updated")
else:
    # Try regex
    import re
    new_admin = re.sub(
        r"var SAMPURNA_BY_CLASS\s*=\s*\{[^}]+\};",
        NEW3,
        admin, count=1
    )
    if new_admin != admin:
        admin = new_admin
        print("SAMPURNA_BY_CLASS updated (regex)")
    else:
        print("MISS: SAMPURNA_BY_CLASS")

with open(ADMIN, 'w', encoding='utf-8', newline='\n') as f:
    f.write(admin)
print("Saved admin.html")
print()
print("git add .")
print('git commit -m "Sampurna: Class 7 and 9 support, admin URLs updated"')
print("git push")
