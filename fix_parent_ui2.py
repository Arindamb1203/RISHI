import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

changes = []

# ── 1. Fix forgot/change button colors (white card = need dark text) ──
h = h.replace(
    'onclick="toggleForgotParent()" style="background:none;border:none;color:rgba(255,255,255,0.85);',
    'onclick="toggleForgotParent()" style="background:none;border:none;color:#0f2240;'
)
h = h.replace(
    'onclick="toggleChangePwParent()" style="background:none;border:none;color:rgba(255,255,255,0.85);',
    'onclick="toggleChangePwParent()" style="background:none;border:none;color:#0f2240;'
)
changes.append("Forgot/Change buttons: dark navy color on white card")

# ── 2. Add Profile button directly to header (visible always) ──
# It's currently only in the hamburger dropdown - add to header too
OLD_GUIDE_BTN = '<button class="btn-out-hdr btn-hide-mobile" onclick="showInstructions()">&#10067; Guide</button>'
NEW_GUIDE_BTN = '<button class="btn-out-hdr btn-hide-mobile" onclick="showInstructions()">&#10067; Guide</button>\n      <button class="btn-out-hdr" onclick="showProfilePanel()" title="Profile &amp; Settings" style="font-size:17px;padding:5px 10px;">👤</button>'
if OLD_GUIDE_BTN in h:
    h = h.replace(OLD_GUIDE_BTN, NEW_GUIDE_BTN, 1)
    changes.append("Profile 👤 button added to header (always visible)")
else:
    # Try alternate pattern
    h = re.sub(
        r'(onclick="showInstructions\(\)"[^>]*>&#10067; Guide</button>)',
        r'\1\n      <button class="btn-out-hdr" onclick="showProfilePanel()" title="Profile &amp; Settings" style="font-size:17px;padding:5px 10px;">👤</button>',
        h, count=1
    )
    changes.append("Profile 👤 button added (regex)")

# ── 3. Fix hamburger — add handleMobileHeader JS properly ──
MOBILE_JS = """
function handleMobileHeader() {
  var isMobile = window.innerWidth <= 640;
  var menuBtn = document.getElementById('hdr-menu-btn');
  if (!menuBtn) return;
  menuBtn.style.setProperty('display', isMobile ? 'flex' : 'none', 'important');
  menuBtn.style.alignItems = 'center';
  menuBtn.style.justifyContent = 'center';
  // On mobile hide desktop-only buttons
  document.querySelectorAll('.btn-hide-mobile').forEach(function(b){
    b.style.setProperty('display', isMobile ? 'none' : '', 'important');
  });
}
window.addEventListener('resize', handleMobileHeader);
document.addEventListener('DOMContentLoaded', handleMobileHeader);
window.addEventListener('load', handleMobileHeader);
"""

if 'handleMobileHeader' not in h:
    h = h.replace('function toggleHdrMenu()', MOBILE_JS + '\nfunction toggleHdrMenu()', 1)
    changes.append("handleMobileHeader JS added")
else:
    # Replace existing empty/broken one
    h = re.sub(
        r'function handleMobileHeader\(\)\s*\{[^}]*\}',
        MOBILE_JS.strip().split('\n', 1)[1].rsplit('\n', 3)[0],
        h, count=1
    )
    changes.append("handleMobileHeader JS fixed")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)

print("Changes applied:")
for c in changes: print(" ✓", c)
print()
print("git add .")
print('git commit -m "Parent: dark login colors, profile btn in header, hamburger fix"')
print("git push")
