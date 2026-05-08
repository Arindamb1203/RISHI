import os

ROOT = os.path.dirname(os.path.abspath(__file__))

chapters = [
    (1, "arithmetic",  "large-numbers-around-us"),
    (2, "arithmetic",  "arithmetic-expressions"),
    (3, "arithmetic",  "a-peek-beyond-the-point"),
    (4, "arithmetic",  "number-play"),
    (5, "arithmetic",  "working-with-fractions"),
    (6, "algebra",     "expressions-using-letter-numbers"),
    (7, "geometry",    "parallel-and-intersecting-lines"),
    (8, "geometry",    "a-tale-of-three-intersecting-lines"),
]

print("\nClass 7 Build Status:")
print("="*60)
for chap_id, topic, slug in chapters:
    explain  = os.path.join(ROOT, "explain",  "class7", topic, f"{slug}.html")
    practice = os.path.join(ROOT, "practice", "class7", topic, f"{slug}.html")
    data     = os.path.join(ROOT, "data",     "class7", f"{slug}.json")

    e_size = os.path.getsize(explain)  if os.path.exists(explain)  else 0
    p_size = os.path.getsize(practice) if os.path.exists(practice) else 0
    d_size = os.path.getsize(data)     if os.path.exists(data)     else 0

    e_ok = "OK" if e_size > 5000 else ("SHELL" if e_size > 0 else "MISSING")
    p_ok = "OK" if p_size > 5000 else ("SHELL" if p_size > 0 else "MISSING")
    d_ok = "OK" if d_size > 1000 else ("SHELL" if d_size > 0 else "MISSING")

    status = "DONE" if all(x=="OK" for x in [e_ok,p_ok,d_ok]) else "INCOMPLETE"
    print(f"  Ch{chap_id} {slug[:30]:30s} | explain:{e_ok:7s} practice:{p_ok:7s} data:{d_ok:7s} | {status}")

print("="*60)
