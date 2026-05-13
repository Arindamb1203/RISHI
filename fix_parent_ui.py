import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

changes = []

# ── 1. Profile button: remove btn-hide-mobile so it shows on ALL screens ──
if 'showProfilePanel()' in h and 'btn-out-hdr btn-hide-mobile' in h:
    # Find and fix the profile button specifically
    h = re.sub(
        r'(<button onclick="showProfilePanel\(\)"[^>]*)class="btn-out-hdr btn-hide-mobile"',
        r'\1class="btn-out-hdr"',
        h, count=1
    )
    changes.append("Profile button: removed btn-hide-mobile (now visible on all screens)")

# ── 2. If profile button doesn't exist in header, add it ──
if 'showProfilePanel()' not in h or h.count('onclick="showProfilePanel()">') == 0:
    OLD = '>☁ Sync</button>'
    NEW = '>☁ Sync</button>\n      <button onclick="showProfilePanel()" class="btn-out-hdr" title="Profile &amp; Settings">👤</button>'
    if OLD in h:
        h = h.replace(OLD, NEW, 1)
        changes.append("Profile button added to header")

# ── 3. Fix hamburger CSS — ensure it shows on mobile ──
# Replace btn-hide-mobile with proper mobile CSS
OLD_MOB_CSS = """.btn-hide-mobile{display:none!important;}"""
if OLD_MOB_CSS not in h:
    # Find the @media block and fix
    h = re.sub(
        r'(@media\(max-width:640px\)\{.*?)\.btn-hide-mobile\{display:none!important;\}',
        r'\1.btn-hide-mobile{display:none!important;}\n  #hdr-menu-btn{display:block!important;}',
        h, flags=re.DOTALL, count=1
    )
    changes.append("Hamburger CSS enforced on mobile")

# Ensure hamburger button inline style doesn't override CSS
h = h.replace(
    'id="hdr-menu-btn" onclick="toggleHdrMenu()" style="display:none;',
    'id="hdr-menu-btn" onclick="toggleHdrMenu()" style="display:none;font-size:20px;padding:6px 12px;'
)

# ── 4. Fix handleMobileHeader to always run ──
# Replace the window.onload resize handler with a more reliable one
if 'handleMobileHeader' in h:
    h = re.sub(
        r"window\.addEventListener\('resize', handleMobileHeader\);",
        "window.addEventListener('resize', handleMobileHeader);",
        h, count=1
    )
    # Fix the function to use CSS class instead of inline style
    h = h.replace(
        "menuBtn.style.display = mobile ? 'block' : 'none';",
        "menuBtn.style.setProperty('display', mobile ? 'block' : 'none', 'important');"
    )
    changes.append("handleMobileHeader: uses !important display")

# ── 5. Fix login forgot/change password colors — white on dark bg ──
# Change gold/yellow color to white for the toggle buttons
h = h.replace(
    'onclick="toggleForgotParent()" style="background:none;border:none;color:var(--gold2);',
    'onclick="toggleForgotParent()" style="background:none;border:none;color:rgba(255,255,255,0.85);'
)
h = h.replace(
    'onclick="toggleChangePwParent()" style="background:none;border:none;color:var(--gold2);',
    'onclick="toggleChangePwParent()" style="background:none;border:none;color:rgba(255,255,255,0.85);'
)
changes.append("Login forgot/change password: color changed to white")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)

print("Changes applied:")
for c in changes: print(" ✓", c)
print()
print("git add .")
print('git commit -m "Parent UI: profile btn visible, hamburger fix, login colors"')
print("git push")
