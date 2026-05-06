import os
ROOT = os.path.dirname(os.path.abspath(__file__))
print("\nClass 9 Exam JSON Status:")
print("="*40)
for i in range(1, 13):
    ch = str(i).zfill(2)
    path = os.path.join(ROOT, "data", "cbse", "class9", f"ch{ch}", f"ch{ch}-exam.json")
    status = "FOUND" if os.path.exists(path) else "MISSING"
    print(f"  Ch{ch}: {status}")
print("="*40)
