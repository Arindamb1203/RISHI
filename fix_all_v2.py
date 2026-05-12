"""
fix_all_v2.py — Run from D:\rishi>
"""
import os, re

def read(p):
    with open(p,'r',encoding='utf-8') as f: return f.read().replace('\r\n','\n')
def write(p,c):
    with open(p,'w',encoding='utf-8',newline='\n') as f: f.write(c)
    print("  Saved:", p)

# ── 1. rishi-sync.js: add rishi_plans_ to sync ──────────────
f = 'public/rishi-sync.js'
h = read(f)
OLD = "    'rishi_active_chapters'\n  ];"
NEW = "    'rishi_active_chapters',\n    'rishi_plans'\n  ];"
if OLD in h:
    h = h.replace(OLD, NEW, 1)
    # Also add rishi_plans_ prefix
    OLD2 = "    'rishi_chapexam_done_'\n  ];"
    NEW2 = "    'rishi_chapexam_done_',\n    'rishi_plans_'\n  ];"
    h = h.replace(OLD2, NEW2, 1)
    print("rishi-sync.js: rishi_plans + rishi_plans_ added to sync")
else:
    print("MISS rishi-sync.js — trying regex")
    h = re.sub(
        r"'rishi_active_chapters'\s*\];",
        "'rishi_active_chapters',\n    'rishi_plans'\n  ];",
        h, count=1
    )
    h = re.sub(
        r"'rishi_chapexam_done_'\s*\];",
        "'rishi_chapexam_done_',\n    'rishi_plans_'\n  ];",
        h, count=1
    )
    print("rishi-sync.js: applied via regex")
write(f, h)

# ── 2. admin.html: fix buildDashboard Live Stats ─────────────
f = 'public/admin.html'
h = read(f)
m = re.search(r'(function buildDashboard\(\) \{.*?var items = \[).*?(\];)', h, re.DOTALL)
if m:
    NEW_ITEMS = (
        m.group(1) + "\n"
        "  var regs = [];\n"
        "  try { regs = JSON.parse(localStorage.getItem('rishi_registrations') || '[]'); } catch(e) {}\n"
        "  var totalReg = regs.length;\n"
        "  var totalRevenue = regs.filter(function(r){return r.subscriptionStatus==='subscribed';}).length * 599;\n"
        "  var now = Math.floor(Date.now()/1000);\n"
        "  var online = 0;\n"
        "  regs.forEach(function(r){\n"
        "    var sid=(r.studentUsername||r.studentId||'').toLowerCase();\n"
        "    var ts=parseInt(localStorage.getItem('rishi_presence_online_'+sid)||'0',10);\n"
        "    if(ts&&(now-ts)<300) online++;\n"
        "  });\n"
        "  var items = [\n"
        "    {n: totalReg,                 l:'Registered',          c:'var(--gold)'},\n"
        "    {n: online,                   l:'Online Now',          c:'var(--green)'},\n"
        "    {n: totalReg - online,        l:'Offline',             c:'var(--muted)'},\n"
        "    {n: '&#8377;' + totalRevenue, l:'Revenue Earned',      c:'var(--amber)'},\n"
        "    {n: '&#8212;',               l:'Referrals',           c:'var(--dim)'}\n"
        "  ]" + m.group(2)
    )
    h = h[:m.start()] + NEW_ITEMS + h[m.end():]
    print("admin.html: Live Stats updated")
else:
    print("MISS admin.html buildDashboard")
write(f, h)

# ── 3. login.html: remove bottom nav section ────────────────
f = 'public/login.html'
h = read(f)
# Remove the section I added last time
old_section = re.search(
    r'<div style="margin:24px 0 16px;padding:18px;border-top:2px solid.*?</div>\s*\n',
    h, re.DOTALL
)
if old_section:
    h = h.replace(old_section.group(0), '', 1)
    print("login.html: bottom nav section removed")
else:
    print("login.html: section already absent or MISS (OK)")
write(f, h)

# ── 4. parent.html: fix profile panel (add ref + subs history) ─
f = 'public/parent.html'
h = read(f)
# Find the profile panel and update the buttons section
OLD_BTNS = (
    "      '<button onclick=\"alert(\\'Payment history coming soon\\')" 
    "\" style=\"padding:12px;background:#1a7a4a;color:#fff;border:none;border-radius:10px;"
    "font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;\">💳 Payment History</button>' +"
)
NEW_BTNS = (
    "      '<button onclick=\"showPaymentHistory()\" style=\"padding:12px;background:#1a7a4a;color:#fff;"
    "border:none;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:14px;\">"
    "💳 Subscription History</button>' +"
    "\n      '<button onclick=\"alert(\\'Referral feature coming soon\\')\" style=\"padding:12px;"
    "background:#7c3aed;color:#fff;border:none;border-radius:10px;font-weight:800;cursor:pointer;"
    "font-family:inherit;font-size:14px;\">🔗 Referral Program</button>' +"
)
if OLD_BTNS in h:
    h = h.replace(OLD_BTNS, NEW_BTNS, 1)
    print("parent.html: Subscription History + Referral buttons added")
else:
    # Try a more lenient match
    if 'Payment history coming soon' in h:
        h = h.replace(
            "alert('Payment history coming soon')",
            "showPaymentHistory()",
            1
        )
        print("parent.html: Payment history → showPaymentHistory()")
    else:
        print("parent.html: profile panel buttons MISS (might already be correct)")

# Add showPaymentHistory function if not present
if 'showPaymentHistory' not in h:
    HIST_FN = """
function showPaymentHistory() {
  var sid = sessionStorage.getItem('rishi_parent_student_id') || 'default';
  var regs = [];
  try { regs = JSON.parse(localStorage.getItem('rishi_registrations')||'[]'); } catch(e){}
  var reg = regs.find(function(r){ return r.studentUsername === sid; }) || {};
  var status = reg.subscriptionStatus || 'trial';
  var expiry = reg.subscriptionExpiry || 'N/A';
  var disc   = reg.discontinuedDate || null;
  var rejoin = reg.rejoinedDate || null;
  var msg = 'Subscription Status: ' + status.toUpperCase() + '\\n'
           + 'Expiry: ' + expiry + '\\n'
           + (disc   ? 'Discontinued: ' + disc + '\\n' : '')
           + (rejoin ? 'Rejoined: ' + rejoin + '\\n' : '')
           + '\\nAmount: ₹599/month\\n(Full payment history will be available once payment gateway is live)';
  alert(msg);
}
"""
    h = h.replace('function resetPassword()', HIST_FN + '\nfunction resetPassword()', 1)
    print("parent.html: showPaymentHistory function added")

write(f, h)

print()
print("git add .")
print('git commit -m "Sync plans, Live Stats fix, remove login bottom nav, parent profile panel updates"')
print("git push")
