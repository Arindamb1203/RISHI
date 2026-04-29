"""
RISHI — setup-classes.py
Run from D:\\rishi\\public

Does:
  1. Deletes wrong Class 9 files (created by clone-class.mjs with Class 8 names)
  2. Creates correct explain + practice folder structure for Class 6, 7, 9
  3. Creates minimal HTML shells with correct meta tags
  4. Creates empty JSON stubs under data/class6, data/class7, data/class9

Run:
  cd D:\\rishi\\public
  python setup-classes.py
"""

import os, shutil, json

ROOT = os.path.dirname(os.path.abspath(__file__))

# ── CHAPTER DEFINITIONS ───────────────────────────────────────────────────────

CLASSES = {
    "class9": {
        "num": "9",
        "board": "cbse",
        "chapters": {
            "arithmetic":            ["real-numbers"],
            "algebra":               ["polynomials", "linear-equations-two-variables"],
            "coordinate-geometry":   ["coordinate-geometry"],
            "geometry":              ["euclids-geometry", "lines-and-angles", "triangles",
                                      "quadrilaterals", "circles"],
            "mensuration":           ["herons-formula", "surface-areas-volumes"],
            "data-handling":         ["statistics"],
        }
    },
    "class7": {
        "num": "7",
        "board": "cbse",
        "chapters": {
            "arithmetic":  ["large-numbers-around-us", "arithmetic-expressions",
                            "a-peek-beyond-the-point", "number-play", "working-with-fractions"],
            "algebra":     ["expressions-using-letter-numbers"],
            "geometry":    ["parallel-and-intersecting-lines", "a-tale-of-three-intersecting-lines"],
        }
    },
    "class6": {
        "num": "6",
        "board": "cbse",
        "chapters": {
            "arithmetic":     ["number-play", "prime-time", "fractions",
                               "the-other-side-of-zero", "patterns-in-mathematics"],
            "geometry":       ["lines-and-angles", "playing-with-constructions", "symmetry"],
            "mensuration":    ["perimeter-and-area"],
            "data-handling":  ["data-handling-and-presentation"],
        }
    }
}

# ── HELPERS ───────────────────────────────────────────────────────────────────

def title_from_slug(slug):
    return slug.replace("-", " ").title()

def explain_shell(chapter_slug, class_num, board):
    title = title_from_slug(chapter_slug)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="rishi-board" content="{board}">
<meta name="rishi-class" content="{class_num}">
<title>RISHI — {title}</title>
<!-- SHELL: Content to be built chapter by chapter -->
<script src="/rishi-core.js"></script>
</head>
<body>
<!-- {title} | Class {class_num} | {board.upper()} | Explain Page -->
<!-- TODO: Build full explain page content here -->
</body>
</html>
"""

def practice_shell(chapter_slug, class_num, board):
    title = title_from_slug(chapter_slug)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="rishi-board" content="{board}">
<meta name="rishi-class" content="{class_num}">
<title>Practice — {title} | RISHI</title>
<!-- SHELL: Content to be built chapter by chapter -->
<script src="/rishi-core.js"></script>
</head>
<body>
<!-- {title} | Class {class_num} | {board.upper()} | Practice Page -->
<!-- TODO: Build full practice page content here -->
</body>
</html>
"""

def json_stub(chapter_slug, class_num, board):
    return json.dumps({
        "_note": f"STUB — fill in questions before unlocking Class {class_num}",
        "chapter": chapter_slug,
        "class": int(class_num),
        "board": board,
        "questions": []
    }, indent=2)

# ── STEP 1: DELETE WRONG CLASS 9 FILES ───────────────────────────────────────

print("\n" + "="*55)
print("STEP 1 — Deleting wrong Class 9 files (Class 8 names)")
print("="*55)

wrong_dirs = [
    os.path.join(ROOT, "explain",  "class9"),
    os.path.join(ROOT, "practice", "class9"),
    os.path.join(ROOT, "data",     "class9"),
]

for d in wrong_dirs:
    if os.path.exists(d):
        shutil.rmtree(d)
        print(f"  🗑  Deleted: {d.replace(ROOT, '')}")
    else:
        print(f"  (not found, skipping): {d.replace(ROOT, '')}")

# ── STEP 2: CREATE CORRECT STRUCTURE ─────────────────────────────────────────

print("\n" + "="*55)
print("STEP 2 — Creating correct folders + HTML shells + JSON stubs")
print("="*55)

total_explain = 0
total_practice = 0
total_json = 0

for class_key, cfg in CLASSES.items():
    class_num = cfg["num"]
    board     = cfg["board"]
    chapters  = cfg["chapters"]

    print(f"\n  📁 {class_key.upper()}")

    for topic, chaps in chapters.items():
        # Explain folder
        exp_dir = os.path.join(ROOT, "explain", class_key, topic)
        os.makedirs(exp_dir, exist_ok=True)

        # Practice folder
        prac_dir = os.path.join(ROOT, "practice", class_key, topic)
        os.makedirs(prac_dir, exist_ok=True)

        for chap in chaps:
            # Explain shell
            exp_path = os.path.join(exp_dir, f"{chap}.html")
            if not os.path.exists(exp_path):
                with open(exp_path, "w", encoding="utf-8") as f:
                    f.write(explain_shell(chap, class_num, board))
                print(f"    ✅ explain/{class_key}/{topic}/{chap}.html")
                total_explain += 1
            else:
                print(f"    ⏭  exists: explain/{class_key}/{topic}/{chap}.html")

            # Practice shell
            prac_path = os.path.join(prac_dir, f"{chap}.html")
            if not os.path.exists(prac_path):
                with open(prac_path, "w", encoding="utf-8") as f:
                    f.write(practice_shell(chap, class_num, board))
                print(f"    ✅ practice/{class_key}/{topic}/{chap}.html")
                total_practice += 1
            else:
                print(f"    ⏭  exists: practice/{class_key}/{topic}/{chap}.html")

        # JSON stubs
        data_dir = os.path.join(ROOT, "data", class_key)
        os.makedirs(data_dir, exist_ok=True)
        for chap in chaps:
            json_path = os.path.join(data_dir, f"{chap}.json")
            if not os.path.exists(json_path):
                with open(json_path, "w", encoding="utf-8") as f:
                    f.write(json_stub(chap, class_num, board))
                print(f"    📄 data/{class_key}/{chap}.json")
                total_json += 1

# ── SUMMARY ───────────────────────────────────────────────────────────────────

print("\n" + "="*55)
print("DONE")
print("="*55)
print(f"  Explain shells created  : {total_explain}")
print(f"  Practice shells created : {total_practice}")
print(f"  JSON stubs created      : {total_json}")
print("""
Next steps:
  1. Verify folder structure looks correct
  2. Build chapters one by one (explain + practice together per chapter)
  3. Unlock each class in register.html when content is ready
""")
