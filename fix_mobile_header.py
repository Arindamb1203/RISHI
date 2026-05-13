import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Remove inline display:none from hamburger button — CSS will control it
h = re.sub(
    r'(<button[^>]*id="hdr-menu-btn"[^>]*)style="[^"]*"',
    r'\1style="font-size:20px;padding:6px 12px;"',
    h, count=1
)
print("Hamburger: inline style cleared")

# 2. Add btn-hide-mobile class to Leaderboard, Guide, Sync, SignOut, Profile
# Leaderboard
h = re.sub(
    r'(<button[^>]*class="btn-out-hdr btn-hide-mobile"[^>]*>&#127942; Leaderboard</button>)',
    r'\1', h, count=1  # already has it
)
# Sync button — add hide class
h = re.sub(
    r'(onclick="syncToCloud\(\)"[^>]*style=")([^"]*)(">☁ Sync</button>)',
    r'\1\2" class="sync-btn-standalone btn-hide-mobile\3',
    h, count=1
)
# Sign Out button  
h = re.sub(
    r'(<button class="btn-out-hdr)(signout-btn-standalone)?(" onclick="logout\(\)">Sign Out</button>)',
    r'<button class="btn-out-hdr btn-hide-mobile\3',
    h, count=1
)
# Profile button — keep visible on all screens (already no hide class)
print("btn-hide-mobile classes checked")

# 3. Replace mobile CSS block with clean version
OLD_MOBILE = re.search(r'/\* ── MOBILE RESPONSIVE.*?@media\(max-width:380px\)\{.*?\}', h, re.DOTALL)
if OLD_MOBILE:
    NEW_MOBILE = """/* ── MOBILE RESPONSIVE ── */
#hdr-menu-btn{display:none;}
@media(max-width:700px){
  #hdr-menu-btn{display:flex!important;align-items:center;justify-content:center;}
  .btn-hide-mobile{display:none!important;}
  .hdr{padding:0 10px;gap:6px;overflow:hidden;}
  .hdr-sep{display:none;}
  .hdr-title{font-size:13px;}
  .hdr-badge{font-size:12px;padding:3px 8px;max-width:140px;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .tab-bar{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 8px;scrollbar-width:none;}
  .tab-bar::-webkit-scrollbar{display:none;}
  .tab-btn{font-size:13px;padding:12px 10px;white-space:nowrap;}
  .wrap{padding:12px 10px 60px;}
}
@media(max-width:380px){
  .hdr-title{display:none;}
  .hdr-badge{max-width:110px;}
}"""
    h = h[:OLD_MOBILE.start()] + NEW_MOBILE + h[OLD_MOBILE.end():]
    print("Mobile CSS rewritten (pure CSS, no JS needed)")
else:
    print("MISS: mobile CSS block")

# 4. Remove handleMobileHeader calls (no longer needed — pure CSS)
h = re.sub(r"window\.addEventListener\('resize', handleMobileHeader\);\s*\n", '', h)
h = re.sub(r"document\.addEventListener\('DOMContentLoaded', handleMobileHeader\);\s*\n", '', h)
h = re.sub(r"window\.addEventListener\('load', handleMobileHeader\);\s*\n", '', h)
print("JS resize/load handlers removed (pure CSS now)")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved parent.html")
print()
print("git add .")
print('git commit -m "Parent mobile header: pure CSS hamburger, no overflow"')
print("git push")
