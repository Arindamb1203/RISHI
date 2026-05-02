"""
RISHI Repo Cleanup Script
Run from D:\\rishi (repo root):
    python cleanup.py
"""

import os, shutil

ROOT = os.path.abspath(os.path.dirname(__file__))

DELETE_DIRS = [
    "node_modules",          # npm/React junk — never needed
    "src",                   # Vite/React template leftovers
]

DELETE_FILES = [
    os.path.join("public", "admin.html.editbak"),
    os.path.join("public", "arindam.mp3"),
    os.path.join("public", "patch-admin-edit.py"),
]

GITIGNORE_ENTRIES = [
    "node_modules/",
    "__pycache__/",
    "*.pyc",
    ".DS_Store",
    "Thumbs.db",
    "*.editbak",
    "*.bak",
]

def delete_dir(rel):
    path = os.path.join(ROOT, rel)
    if os.path.isdir(path):
        shutil.rmtree(path)
        print(f"  [DELETED DIR]  {rel}\\")
    else:
        print(f"  [SKIP]         {rel}\\ (not found)")

def delete_file(rel):
    path = os.path.join(ROOT, rel)
    if os.path.isfile(path):
        os.remove(path)
        print(f"  [DELETED FILE] {rel}")
    else:
        print(f"  [SKIP]         {rel} (not found)")

def update_gitignore():
    gi_path = os.path.join(ROOT, ".gitignore")
    existing = ""
    if os.path.isfile(gi_path):
        with open(gi_path, "r", encoding="utf-8") as f:
            existing = f.read()
    added = []
    for entry in GITIGNORE_ENTRIES:
        if entry not in existing:
            existing += f"\n{entry}"
            added.append(entry)
    with open(gi_path, "w", encoding="utf-8") as f:
        f.write(existing.strip() + "\n")
    if added:
        print(f"  [GITIGNORE]    Added: {', '.join(added)}")
    else:
        print(f"  [GITIGNORE]    Already up to date")

def main():
    print("\n=== RISHI Cleanup ===\n")

    print("Deleting folders:")
    for d in DELETE_DIRS:
        delete_dir(d)

    print("\nDeleting files:")
    for f in DELETE_FILES:
        delete_file(f)

    print("\nUpdating .gitignore:")
    update_gitignore()

    print("\n=== Done! ===")
    print("\nRun in VS Code terminal:")
    print("  cd D:\\rishi")
    print("  git rm -r --cached node_modules src 2>nul")
    print("  git add .")
    print('  git commit -m "cleanup: remove node_modules, src leftovers, junk files"')
    print("  git push")
    print()
    print("NOTE: If you also want to delete public\\inject_sync.py, run:")
    print("  del public\\inject_sync.py")

if __name__ == "__main__":
    main()
