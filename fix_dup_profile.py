import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# Find ALL profile buttons
buttons = [(m.start(), m.end(), m.group(0)) for m in re.finditer(
    r'<button[^>]*showProfilePanel[^>]*>.*?</button>', h, re.DOTALL
)]
print(f"Found {len(buttons)} profile buttons:")
for i, (s, e, txt) in enumerate(buttons):
    print(f"  [{i}]: {txt[:100]}")

# Keep only: 1 gold header button + 1 plain dropdown button
# Remove the extra one (the gold-styled one that replaced the dropdown)
# Strategy: the dropdown one has toggleHdrMenu in onclick; header one does not
header_btn = '<button onclick="showProfilePanel()" style="font-size:16px;padding:5px 12px;background:#c8922a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:900;margin:0 2px;" title="Profile">👤</button>'
dropdown_btn = '<button onclick="showProfilePanel();toggleHdrMenu()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:white;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">👤 Profile &amp; Settings</button>'

# Remove ALL showProfilePanel buttons first
h = re.sub(r'<button[^>]*showProfilePanel[^>]*>.*?</button>\n?', '', h, flags=re.DOTALL)
print("All profile buttons removed")

# Add header button back after Guide button
h = re.sub(
    r'(class="btn-out-hdr btn-hide-mobile"[^>]*>&#10067; Guide</button>)',
    r'\1\n      ' + header_btn,
    h, count=1
)
print("Single gold header button added")

# Add dropdown button back in hamburger menu
h = re.sub(
    r'(<button onclick="syncToCloud\(\);toggleHdrMenu\(\)")',
    dropdown_btn + '\n        ' + r'\1',
    h, count=1
)
print("Dropdown button restored")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: single profile button, fix duplicate"')
print("git push")
