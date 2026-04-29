"""
RISHI — patch-admin-edit.py
Adds Class and Board fields to the student edit modal in admin.html.
Also fixes the modal background to ensure it's always readable.

Run from D:\\rishi\\public:
  python patch-admin-edit.py
"""

import os, shutil

ROOT   = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(ROOT, "admin.html")
BACKUP = os.path.join(ROOT, "admin.html.editbak")

shutil.copy2(TARGET, BACKUP)
print("  ✅ Backup: admin.html.editbak")

with open(TARGET, "r", encoding="utf-8") as f:
    html = f.read()

# ── PATCH 1: Add class + board fields to showSubEdit panel ────────────────────

OLD_PANEL_START = "  panel.innerHTML = '<div style=\"background:var(--card);border-radius:18px;padding:24px;width:90%;max-width:420px;font-family:Outfit,sans-serif;\">'"

NEW_PANEL_START = "  panel.innerHTML = '<div style=\"background:#ffffff;border-radius:18px;padding:24px;width:90%;max-width:480px;font-family:Outfit,sans-serif;box-shadow:0 8px 40px rgba(0,0,0,0.4);\">'"

if OLD_PANEL_START in html:
    html = html.replace(OLD_PANEL_START, NEW_PANEL_START)
    print("  ✅ Modal background fixed to solid white")
else:
    print("  ⚠️  Modal start not found — may already be patched")

# Add class and board fields before the closing buttons div
OLD_BUTTONS = """    + '<div style=\"display:flex;gap:10px;\">'\
    + '<button onclick=\"saveSubEdit(""" 

# Find the rejoined date block end and insert class+board before the buttons
OLD_BEFORE_BUTTONS = """    + '<div style=\"margin-bottom:18px;\"><label style=\"font-size:12px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px;\">Rejoined Date (if applicable)</label>'\
    + '<input type=\"date\" id=\"se-rejoin\" value=\"' + rejoin + '\" style=\"width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;font-family:Outfit,sans-serif;font-size:14px;background:var(--card2);color:var(--text);box-sizing:border-box;\"></div>'\
    + '<div style=\"display:flex;gap:10px;\">'\
    + '<button onclick=\"saveSubEdit("""

NEW_BEFORE_BUTTONS = """    + '<div style=\"margin-bottom:12px;\"><label style=\"font-size:12px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px;\">Rejoined Date (if applicable)</label>'\
    + '<input type=\"date\" id=\"se-rejoin\" value=\"' + rejoin + '\" style=\"width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;font-family:Outfit,sans-serif;font-size:14px;background:var(--card2);color:var(--text);box-sizing:border-box;\"></div>'\
    + '<div style=\"display:flex;gap:10px;margin-bottom:12px;\">'\
    + '<div style=\"flex:1;\"><label style=\"font-size:12px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px;\">Class</label>'\
    + '<select id=\"se-class\" style=\"width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;font-family:Outfit,sans-serif;font-size:14px;background:var(--card2);color:var(--text);\">'\
    + '<option value=\"6\"' + (r.class==\"6\"?\" selected\":\"\") + \'>Class 6</option>\'\
    + \'<option value=\"7\"' + (r.class==\"7\"?\" selected\":\"\") + \'>Class 7</option>\'\
    + \'<option value=\"8\"' + (r.class==\"8\"||!r.class?\" selected\":\"\") + \'>Class 8</option>\'\
    + \'<option value=\"9\"' + (r.class==\"9\"?\" selected\":\"\") + \'>Class 9</option>\'\
    + \'</select></div>\'\
    + \'<div style=\"flex:1;\"><label style=\"font-size:12px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px;\">Board</label>\'\
    + \'<select id=\"se-board\" style=\"width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;font-family:Outfit,sans-serif;font-size:14px;background:var(--card2);color:var(--text);\">'\
    + '<option value=\"CBSE\"' + (r.board===\"CBSE\"||!r.board?\" selected\":\"\") + '>CBSE</option>'\
    + '<option value=\"ICSE\"' + (r.board===\"ICSE\"?\" selected\":\"\") + '>ICSE</option>'\
    + '<option value=\"WBBSE\"' + (r.board===\"WBBSE\"?\" selected\":\"\") + '>WBBSE</option>'\
    + '</select></div>'\
    + '</div>'\
    + '<div style=\"display:flex;gap:10px;\">'\
    + '<button onclick=\"saveSubEdit("""

if OLD_BEFORE_BUTTONS in html:
    html = html.replace(OLD_BEFORE_BUTTONS, NEW_BEFORE_BUTTONS)
    print("  ✅ Class + Board fields added to edit modal")
else:
    # Try a simpler targeted replacement — just insert before the buttons div
    # Find the save button line and insert before it
    SAVE_BTN_SEARCH = "    + '<div style=\"display:flex;gap:10px;\">'\r\n    + '<button onclick=\"saveSubEdit("
    SAVE_BTN_SEARCH2 = "    + '<div style=\"display:flex;gap:10px;\">'\n    + '<button onclick=\"saveSubEdit("
    
    CLASS_BOARD_BLOCK = """    + '<div style=\"display:flex;gap:10px;margin-bottom:12px;\">'\
    + '<div style=\"flex:1;\"><label style=\"font-size:12px;font-weight:700;color:#6b5a3e;display:block;margin-bottom:4px;\">Class</label>'\
    + '<select id=\"se-class\" style=\"width:100%;padding:8px;border:1px solid #e8d9c4;border-radius:8px;font-size:14px;background:#fff;color:#1a1208;\">'\
    + '<option value=\"6\"' + (r.class===\"6\"?' selected':'') + '>Class 6</option>'\
    + '<option value=\"7\"' + (r.class===\"7\"?' selected':'') + '>Class 7</option>'\
    + '<option value=\"8\"' + (r.class===\"8\"||!r.class?' selected':'') + '>Class 8</option>'\
    + '<option value=\"9\"' + (r.class===\"9\"?' selected':'') + '>Class 9</option>'\
    + '</select></div>'\
    + '<div style=\"flex:1;\"><label style=\"font-size:12px;font-weight:700;color:#6b5a3e;display:block;margin-bottom:4px;\">Board</label>'\
    + '<select id=\"se-board\" style=\"width:100%;padding:8px;border:1px solid #e8d9c4;border-radius:8px;font-size:14px;background:#fff;color:#1a1208;\">'\
    + '<option value=\"CBSE\"' + (r.board===\"CBSE\"||!r.board?' selected':'') + '>CBSE</option>'\
    + '<option value=\"ICSE\"' + (r.board===\"ICSE\"?' selected':'') + '>ICSE</option>'\
    + '<option value=\"WBBSE\"' + (r.board===\"WBBSE\"?' selected':'') + '>WBBSE</option>'\
    + '</select></div>'\
    + '</div>'\n"""
    
    if SAVE_BTN_SEARCH in html:
        html = html.replace(SAVE_BTN_SEARCH, CLASS_BOARD_BLOCK + SAVE_BTN_SEARCH)
        print("  ✅ Class + Board fields added (CRLF variant)")
    elif SAVE_BTN_SEARCH2 in html:
        html = html.replace(SAVE_BTN_SEARCH2, CLASS_BOARD_BLOCK + SAVE_BTN_SEARCH2)
        print("  ✅ Class + Board fields added (LF variant)")
    else:
        print("  ❌ Could not find insertion point — check manually")

# ── PATCH 2: Save class + board in saveSubEdit ────────────────────────────────

OLD_SAVE = """  regs[ri].subscriptionStatus  = document.getElementById('se-status').value;
  regs[ri].subscriptionExpiry  = document.getElementById('se-expiry').value;
  regs[ri].discontinuedDate    = document.getElementById('se-disc').value   || null;
  regs[ri].rejoinedDate        = document.getElementById('se-rejoin').value || null;"""

NEW_SAVE = """  regs[ri].subscriptionStatus  = document.getElementById('se-status').value;
  regs[ri].subscriptionExpiry  = document.getElementById('se-expiry').value;
  regs[ri].discontinuedDate    = document.getElementById('se-disc').value   || null;
  regs[ri].rejoinedDate        = document.getElementById('se-rejoin').value || null;
  var seClass = document.getElementById('se-class');
  var seBoard = document.getElementById('se-board');
  if(seClass) regs[ri].class = seClass.value;
  if(seBoard) regs[ri].board = seBoard.value;"""

if OLD_SAVE in html:
    html = html.replace(OLD_SAVE, NEW_SAVE)
    print("  ✅ saveSubEdit updated to save class + board")
else:
    print("  ⚠️  saveSubEdit save block not found — check manually")

# ── Write ─────────────────────────────────────────────────────────────────────
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\n{'='*50}")
print("DONE — admin.html patched.")
print(f"{'='*50}")
print("""
Test:
  1. Admin → Student tab → click Edit on any student
  2. Modal should show white background, Class + Board dropdowns
  3. Change class to 9, save
  4. Click Student button → opens syllabus with Class 9
""")
