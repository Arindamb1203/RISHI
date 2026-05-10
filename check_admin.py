import os, re

PATH = os.path.join('public', 'admin.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()

print("File size:", len(h))
print("Has TOPIC_EXAMS_BY_CLASS:", 'TOPIC_EXAMS_BY_CLASS' in h)
print("Has t7-arithmetic:", 't7-arithmetic' in h)
print("Has t9-algebra:", 't9-algebra' in h)
print("Has url:null:", h.count('url:null'))

# Show t7 section
m = re.search(r'7:\[.*?\],', h, re.DOTALL)
if m: print("\nClass 7 data:\n", m.group(0)[:400])

m2 = re.search(r'9:\[.*?\],\s*\}', h, re.DOTALL)
if m2: print("\nClass 9 data:\n", m2.group(0)[:400])
