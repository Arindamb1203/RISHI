#!/usr/bin/env python3
"""
RISHI Cleanup + Fix Script
Run from D:\rishi\  :  python rishi_cleanup.py

What it does:
  FIX 1  Move misplaced Class 8 exam JSONs to correct chapter folders
  FIX 2  Verify Class 7 exam JSONs are now in correct folder
  CLEAN  Go through one-time-use files one by one — you approve each deletion
"""
import os, shutil, pathlib, sys

ROOT   = pathlib.Path(__file__).parent.resolve()
PUBLIC = ROOT / "public"

G="\033[92m"; R="\033[91m"; Y="\033[93m"; C="\033[96m"; B="\033[1m"; X="\033[0m"
def ok(m):    print(f"  {G}✓{X} {m}")
def fail(m):  print(f"  {R}✗{X} {m}")
def fixed(m): print(f"  {Y}↻{X} FIXED: {m}")
def head(m):  print(f"\n{B}{C}{m}{X}")
def info(m):  print(f"  {C}ℹ{X} {m}")

moved = 0
deleted = 0
skipped = 0

# ═══════════════════════════════════════════════════════
# FIX 1: Move misplaced Class 8 exam JSONs
# ═══════════════════════════════════════════════════════
def fix_class8_exams():
    global moved
    head("═══ FIX 1: Class 8 Exam JSONs — Moving to correct folders ═══")
    class8 = PUBLIC / "data" / "cbse" / "class8"
    if not class8.exists():
        fail("data/cbse/class8 not found"); return

    # Walk all files under class8, find any chXX-exam.json in wrong folder
    for f in class8.rglob("*.json"):
        name = f.name  # e.g. ch08-exam.json
        if not name.endswith("-exam.json"): continue
        # Extract correct chapter from filename: ch08-exam.json → ch08
        ch_id = name.replace("-exam.json", "")  # e.g. ch08
        correct_dir = class8 / ch_id
        correct_path = correct_dir / name
        if f.parent == correct_dir:
            ok(f"{name} — already in correct folder")
            continue
        # File is in wrong folder — move it
        correct_dir.mkdir(parents=True, exist_ok=True)
        if correct_path.exists():
            info(f"{name} already exists at correct path, skipping move")
            continue
        shutil.move(str(f), str(correct_path))
        fixed(f"{name}: {f.parent.name}\\ → {ch_id}\\")
        moved += 1

    # Remove now-empty wrong folders (only if empty)
    for folder in sorted(class8.iterdir()):
        if folder.is_dir() and not any(folder.iterdir()):
            folder.rmdir()
            info(f"Removed empty folder: {folder.name}")

# ═══════════════════════════════════════════════════════
# FIX 2: Verify Class 7 exam JSONs
# ═══════════════════════════════════════════════════════
def verify_class7():
    head("═══ FIX 2: Class 7 Exam JSONs — Verification ═══")
    class7 = PUBLIC / "data" / "cbse" / "class7"
    chapters = ["ch01","ch02","ch03","ch04","ch05","ch06","ch07","ch08"]
    all_ok = True
    for ch in chapters:
        p = class7 / ch / f"{ch}-exam.json"
        if p.exists():
            ok(f"{ch}-exam.json found at correct path")
        else:
            fail(f"{ch}-exam.json MISSING from {p}")
            all_ok = False
    # Check for old typo folder still lingering
    typo = PUBLIC / "data" / "cbse" / "clsss7"
    if typo.exists():
        fail(f"Typo folder still exists: clsss7  — rename it manually to class7")
    elif all_ok:
        ok("All 8 Class 7 exam JSONs in correct locations")

# ═══════════════════════════════════════════════════════
# CLEANUP: One-time-use files
# ═══════════════════════════════════════════════════════
def ask(path, purpose, reason):
    """Show file info and ask user Y/N"""
    global deleted, skipped
    p = pathlib.Path(path)
    if not p.exists():
        info(f"Already gone: {p.relative_to(ROOT)}")
        return
    rel = str(p.relative_to(ROOT))
    print(f"\n  {B}File:{X}    {rel}")
    print(f"  {B}Purpose:{X} {purpose}")
    print(f"  {B}Why safe:{X} {reason}")
    ans = input(f"  Delete? [y/N]: ").strip().lower()
    if ans == "y":
        if p.is_dir():
            shutil.rmtree(p)
        else:
            p.unlink()
        print(f"  {R}Deleted.{X}")
        deleted += 1
    else:
        print(f"  Kept.")
        skipped += 1

def cleanup():
    head("═══ CLEANUP: One-time-use files (Y to delete, N to keep) ═══")
    print(f"  {Y}Each file shown with its purpose. Type Y + Enter to delete, just Enter to keep.{X}")

    # ── Root level ──────────────────────────────────────
    ask(ROOT / "fix_avatar_names.mjs",
        "One-time script that fixed 'Rekha' → 'Rishika' avatar names across all HTML pages.",
        "Already ran. All pages fixed. Will never be needed again.")

    ask(ROOT / "fix_explain_pages.mjs",
        "One-time script that batch-patched explain page HTML structure.",
        "Already ran. All explain pages are up to date.")

    ask(ROOT / "fix_explain_steps_silent.mjs",
        "One-time script that silenced extra TTS steps on explain pages.",
        "Already ran. All pages fixed.")

    ask(ROOT / "inject-explain-helper.mjs",
        "One-time script that injected explain-helper.js into all explain HTML pages.",
        "Already ran. explain-helper.js is now in all pages.")

    ask(ROOT / "inject-presence.mjs",
        "One-time script that injected rishi-presence.js into all HTML pages.",
        "Already ran. rishi-presence.js is now in all pages.")

    ask(ROOT / "math_block.js",
        "Experimental math rendering block, never integrated into the main app.",
        "Not used anywhere in the project. Safe to delete.")

    ask(ROOT / "patch-algebra-practice.mjs",
        "One-time script that patched algebra practice page HTML.",
        "Already ran. Practice pages are up to date.")

    ask(ROOT / "patch-arithmetic-practice.mjs",
        "One-time script that patched arithmetic practice page HTML.",
        "Already ran. Practice pages are up to date.")

    ask(ROOT / "patch-data-handling-practice.mjs",
        "One-time script that patched data-handling practice page HTML.",
        "Already ran. Practice pages are up to date.")

    ask(ROOT / "patch-geometry-practice.mjs",
        "One-time script that patched geometry practice page HTML.",
        "Already ran. Practice pages are up to date.")

    ask(ROOT / "patch-mensuration-practice.mjs",
        "One-time script that patched mensuration practice page HTML.",
        "Already ran. Practice pages are up to date.")

    ask(ROOT / "restructure_rishi.py",
        "One-time script that created the class7/class8/class9 folder structure inside explain/ and practice/.",
        "Already ran. Folder structure is in place. Not needed anymore.")

    ask(ROOT / "upgrade.py",
        "One-time script used to upgrade older HTML page format to newer structure.",
        "Already ran. All pages upgraded.")

    ask(ROOT / "cleanup.py",
        "Old cleanup script from an earlier session. Now replaced by this script (rishi_cleanup.py).",
        "Superseded. This script does everything the old one did, plus more.")

    ask(ROOT / "eslint.config.js",
        "ESLint configuration for JavaScript linting. Was set up when Vite/React was being considered.",
        "RISHI uses no build tools — pure HTML/CSS/JS. ESLint is not used anywhere.")

    ask(ROOT / "vite.config.js",
        "Vite bundler configuration. Was set up when React/Vite was being considered for RISHI.",
        "RISHI is pure HTML/CSS/JS, deployed directly from public/ to Cloudflare Pages. Vite is not used.")

    ask(ROOT / "package.json",
        "Node.js package file. Created when Vite/ESLint were being considered.",
        "No Node.js build pipeline exists. Cloudflare Pages deploys public/ directly. Safe to delete.")

    ask(ROOT / "package-lock.json",
        "Auto-generated Node.js lockfile (goes with package.json).",
        "Same reason as package.json — no Node.js pipeline. Safe to delete.")

    ask(ROOT / "rishi-tree.txt",
        "Temporary file tree snapshot generated during a session for reference.",
        "Temporary reference file. Not part of the app.")

    ask(ROOT / "rishi_tree.txt",
        "Temporary file tree snapshot generated during a session for reference.",
        "Temporary reference file. Not part of the app.")

    ask(ROOT / "structure.txt",
        "Old text note about folder structure, written during early project planning.",
        "Outdated. The rishika-config.js is the current reference document.")

    ask(ROOT / "API --eleven labs.docx",
        "Word document with ElevenLabs API notes, saved during initial TTS setup.",
        "Notes document, not code. ElevenLabs is already integrated and working.")

    ask(ROOT / "rishika-config.js",
        "Session context file you paste at the start of each Claude session to restore project state.",
        "This should stay on your LOCAL machine but NOT be in the git repo — it contains internal project details. Consider adding to .gitignore instead of deleting.")

    ask(ROOT / "index.html",
        "Root-level HTML file, likely a leftover from Vite setup. The real entry is public/landing.html.",
        "Cloudflare Pages serves from public/ folder. This root index.html is never served.")

    ask(ROOT / "dist",
        "Vite build output folder with compiled JS/CSS bundles. Generated when Vite build was tested.",
        "RISHI does not use a build step. Cloudflare Pages deploys public/ directly. dist/ is never used.")

    # ── Public level ────────────────────────────────────
    ask(PUBLIC / "fix_numberplay_all.py",
        "One-time script that fixed all answer errors in the number-play.json content file.",
        "Already ran. number-play.json is correct. Not needed anymore.")

    ask(PUBLIC / "fix_numberplay_q6.py",
        "One-time script that fixed question 6 specifically in number-play.json.",
        "Already ran. number-play.json question 6 is fixed.")

    ask(PUBLIC / "fix_peek_beyond.py",
        "One-time script that fixed answer errors in a-peek-beyond-the-point.json.",
        "Already ran. a-peek-beyond-the-point.json is correct.")

    ask(PUBLIC / "inject_sync.py",
        "One-time script that injected rishi-sync.js and D1 sync code into all 48 HTML pages.",
        "Already ran. All pages have sync code. Not needed anymore.")

    ask(PUBLIC / "check_class7.py",
        "Old Class 7 checker script from an early session.",
        "Replaced by fix_class7.py which both checks AND fixes. This older version is redundant.")

    ask(PUBLIC / "check_class7_exams.py",
        "Class 7 checker script from a previous session that only reports issues but does not fix them.",
        "Replaced by fix_class7.py which fixes everything automatically. This is the report-only version.")

    ask(PUBLIC / "check_exams.py",
        "General exam checker script from an earlier session.",
        "Replaced by fix_class7.py and other targeted checkers. This generic version is outdated.")

    ask(PUBLIC / "arindam.mp3",
        "An MP3 audio file, likely a test recording used during TTS development.",
        "Not referenced by any page or script in the project. Safe to delete.")

# ═══════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════
def main():
    print(f"\n{B}{'='*58}")
    print(f"  RISHI Cleanup + Fix Script")
    print(f"  Run from: D:\\rishi\\")
    print(f"{'='*58}{X}\n")

    fix_class8_exams()
    verify_class7()
    cleanup()

    print(f"\n{B}{'='*58}")
    print(f"  Files moved:   {moved}")
    print(f"  Files deleted: {deleted}")
    print(f"  Files kept:    {skipped}")
    print(f"{'='*58}{X}\n")

    if moved > 0 or deleted > 0:
        print(f"{Y}Changes made. Run git now:{X}")
        print("  git add .")
        print('  git commit -m "Fix misplaced exam JSONs, remove one-time scripts"')
        print("  git push\n")

if __name__ == "__main__":
    main()
