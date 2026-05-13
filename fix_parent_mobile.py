import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Replace header CSS with mobile-responsive version
OLD_HDR_CSS = """.hdr{
  background:var(--navy);color:white;padding:0 24px;
  display:flex;align-items:center;gap:16px;height:58px;
  box-shadow:0 2px 12px rgba(0,0,0,.2);
}"""
NEW_HDR_CSS = """.hdr{
  background:var(--navy);color:white;padding:0 16px;
  display:flex;align-items:center;gap:10px;min-height:58px;
  box-shadow:0 2px 12px rgba(0,0,0,.2);flex-wrap:nowrap;
  position:relative;
}"""
if OLD_HDR_CSS in h: h=h.replace(OLD_HDR_CSS,NEW_HDR_CSS,1); print("hdr CSS updated")
else: print("MISS hdr CSS")

# 2. Make tab-bar scrollable
OLD_TAB_CSS = """.tab-bar{
  background:var(--navy2);display:flex;padding:0 24px;
  border-bottom:1px solid rgba(255,255,255,.08);
}"""
NEW_TAB_CSS = """.tab-bar{
  background:var(--navy2);display:flex;padding:0 12px;
  border-bottom:1px solid rgba(255,255,255,.08);
  overflow-x:auto;-webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.tab-bar::-webkit-scrollbar{display:none;}"""
if OLD_TAB_CSS in h: h=h.replace(OLD_TAB_CSS,NEW_TAB_CSS,1); print("tab-bar scrollable")
else: print("MISS tab-bar CSS")

# 3. Make hdr-r responsive
OLD_HDR_R = ".hdr-r{margin-left:auto;display:flex;align-items:center;gap:10px;}"
NEW_HDR_R = ".hdr-r{margin-left:auto;display:flex;align-items:center;gap:6px;flex-shrink:0;}"
if OLD_HDR_R in h: h=h.replace(OLD_HDR_R,NEW_HDR_R,1); print("hdr-r updated")
else: print("MISS hdr-r")

# 4. Add mobile responsive CSS after existing CSS
MOBILE_CSS = """
/* ── MOBILE RESPONSIVE ── */
@media(max-width:640px){
  .hdr{padding:0 12px;gap:8px;}
  .hdr-logo{font-size:17px;letter-spacing:2px;}
  .hdr-sep{display:none;}
  .hdr-title{font-size:13px;font-weight:700;}
  .hdr-badge{font-size:12px;padding:4px 8px;max-width:130px;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .btn-hide-mobile{display:none!important;}
  .btn-out-hdr{font-size:13px;padding:5px 8px;}
  .sync-btn-mobile{padding:6px 10px!important;font-size:12px!important;}
  .tab-btn{font-size:13px;padding:12px 10px;white-space:nowrap;}
  .wrap{padding:12px 10px 60px;}
}
@media(max-width:380px){
  .hdr-title{display:none;}
  .hdr-badge{max-width:100px;}
}"""

# Insert before </style>
h = h.replace('</style>', MOBILE_CSS + '\n</style>', 1)
print("Mobile responsive CSS added")

# 5. Add class to Leaderboard and Guide buttons to hide on mobile
h = h.replace(
    'onclick="showLeaderboard()">🏆 Leaderboard</button>',
    'onclick="showLeaderboard()" class="btn-out-hdr btn-hide-mobile">🏆 Leaderboard</button>'
)
h = h.replace(
    'onclick="showInstructions()">&#10067; Guide</button>',
    'onclick="showInstructions()" class="btn-out-hdr btn-hide-mobile">&#10067; Guide</button>'
)
print("Leaderboard + Guide hidden on mobile")

# Add hamburger menu button (mobile only) - shows hidden buttons
OLD_HDR_R_HTML = '<div class="hdr-r">'
NEW_HDR_R_HTML = '''<div class="hdr-r">
      <button class="btn-out-hdr" id="hdr-menu-btn" onclick="toggleHdrMenu()" style="display:none;padding:5px 10px;font-size:18px;" aria-label="Menu">☰</button>
      <div id="hdr-menu-dropdown" style="display:none;position:absolute;top:58px;right:12px;background:var(--navy);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;z-index:200;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.3);">
        <button onclick="showLeaderboard();toggleHdrMenu()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:white;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">🏆 Leaderboard</button>
        <button onclick="showInstructions();toggleHdrMenu()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:white;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">❓ Guide</button>
        <button onclick="syncToCloud();toggleHdrMenu()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:#22c97d;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">☁ Sync</button>
        <button onclick="logout()" style="display:block;width:100%;text-align:left;padding:10px 14px;background:none;border:none;color:#ef4444;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;border-radius:6px;">← Sign Out</button>
      </div>'''

# Only replace inside the hdr div
if OLD_HDR_R_HTML in h:
    h = h.replace(OLD_HDR_R_HTML, NEW_HDR_R_HTML, 1)
    print("Hamburger menu added")
else:
    print("MISS hdr-r HTML")

# 6. Add hamburger show/hide JS and hide Sync+SignOut on mobile via CSS
MOBILE_JS = """
function toggleHdrMenu() {
  var d = document.getElementById('hdr-menu-dropdown');
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
}
document.addEventListener('click', function(e) {
  var btn = document.getElementById('hdr-menu-btn');
  var dd = document.getElementById('hdr-menu-dropdown');
  if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
    dd.style.display = 'none';
  }
});
function handleMobileHeader() {
  var mobile = window.innerWidth <= 640;
  var menuBtn = document.getElementById('hdr-menu-btn');
  if (!menuBtn) return;
  menuBtn.style.display = mobile ? 'block' : 'none';
  // Hide sync + signout individually on mobile (they're in hamburger)
  var btns = document.querySelectorAll('.sync-btn-standalone, .signout-btn-standalone');
  btns.forEach(function(b){ b.style.display = mobile ? 'none' : ''; });
}
window.addEventListener('resize', handleMobileHeader);
window.addEventListener('load', handleMobileHeader);
"""

if 'toggleHdrMenu' not in h:
    h = h.replace('function syncToCloud()', MOBILE_JS + '\nfunction syncToCloud()', 1)
    print("Mobile header JS added")

# Mark sync and signout buttons for mobile hiding
h = h.replace(
    '>☁ Sync</button><button class="btn-out-hdr" onclick="logout()">Sign Out</button>',
    'class="sync-btn-standalone">☁ Sync</button><button class="btn-out-hdr signout-btn-standalone" onclick="logout()">Sign Out</button>'
)

# Remove duplicate onclick for sync button that's now inline
h = h.replace(
    'onclick="syncToCloud()" style="background:#1a7a4a;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;margin-right:6px;"',
    'onclick="syncToCloud()" style="background:#1a7a4a;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;margin-right:6px;"'
)

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("\nSaved parent.html")
print()
print("git add .")
print('git commit -m "Parent: mobile responsive header, hamburger menu, scrollable tabs"')
print("git push")
