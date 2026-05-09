#!/usr/bin/env python3
"""
RISHI — Class 7 Check Script (read-only, no changes made)
Run from D:\rishi\public\  :  python check7.py
"""
import json, sys, pathlib

try:
    import requests
    HAS_REQ = True
except ImportError:
    HAS_REQ = False

BASE_URL = "https://rishi-ewh.pages.dev"
PUBLIC   = pathlib.Path(__file__).parent.resolve()
TIMEOUT  = 10

G="\033[92m"; R="\033[91m"; Y="\033[93m"; C="\033[96m"; B="\033[1m"; X="\033[0m"
def ok(m):   print(f"  {G}'+chr(10003)+'{X} {m}")
def fail(m): print(f"  {R}'+chr(10007)+'{X} {m}"); global FC; FC+=1
def head(m): print(f"\n{B}{C}{m}{X}")
PC=0; FC=0

def chk(cond, om, fm):
    global PC, FC
    if cond: ok(om); PC+=1; return True
    fail(fm); return False

CHAPTERS = [
    {"ch":"ch01","key":"c7-01","num":"01","slug":"large-numbers-around-us",           "topic":"arithmetic"},
    {"ch":"ch02","key":"c7-02","num":"02","slug":"arithmetic-expressions",             "topic":"arithmetic"},
    {"ch":"ch03","key":"c7-03","num":"03","slug":"a-peek-beyond-the-point",            "topic":"arithmetic"},
    {"ch":"ch04","key":"c7-04","num":"04","slug":"number-play",                        "topic":"arithmetic"},
    {"ch":"ch05","key":"c7-05","num":"05","slug":"working-with-fractions",             "topic":"arithmetic"},
    {"ch":"ch06","key":"c7-06","num":"06","slug":"expressions-using-letter-numbers",   "topic":"algebra"},
    {"ch":"ch07","key":"c7-07","num":"07","slug":"parallel-and-intersecting-lines",    "topic":"geometry"},
    {"ch":"ch08","key":"c7-08","num":"08","slug":"a-tale-of-three-intersecting-lines", "topic":"geometry"},
]

def check_local():
    head("=== LOCAL: Exam JSON Files ===")
    EXP = {"A":(20,1),"B":(10,2),"C":(6,3),"D":(10,3)}
    for info in CHAPTERS:
        ch   = info["ch"]
        key  = info["key"]
        path = PUBLIC/"data"/"cbse"/"class7"/ch/f"{ch}-exam.json"
        if not chk(path.exists(), f"{key} present", f"{key} MISSING: {path}"): continue
        try:
            d = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            fail(f"{key} bad JSON: {e}"); continue
        secs = d.get("sections",{})
        total = 0
        for s,(cnt,mks) in EXP.items():
            qs = secs.get(s,{}).get("questions",[])
            chk(len(qs)==cnt, f"{key} Sec {s}: {len(qs)} Qs OK", f"{key} Sec {s}: {len(qs)}!={cnt}")
            total += len(qs)*mks
        cases = secs.get("E",{}).get("questions",[]) or secs.get("E",{}).get("cases",[])
        total += sum(sp.get("marks",0) for c in cases for sp in c.get("subparts",[]))
        chk(total==100, f"{key} = 100 marks", f"{key} = {total} (not 100)")

def get(url, label, find=None):
    global PC, FC
    try:
        r = requests.get(url, timeout=TIMEOUT)
        if r.status_code==200:
            if find and find.lower() not in r.text.lower():
                fail(f"{label} — 200 but '{find}' missing"); return False,""
            ok(f"{label} — 200 OK"); PC+=1; return True, r.text
        fail(f"{label} — HTTP {r.status_code}"); return False,""
    except Exception as e:
        fail(f"{label} — {e}"); return False,""

def check_http():
    head("=== HTTP: API ===")
    for i in CHAPTERS:
        get(f"{BASE_URL}/api/questions?board=cbse&class=7&ch={i['num']}&type=exam", f"API ch{i['num']}")

    head("=== HTTP: Exam Pages ===")
    for i in CHAPTERS:
        get(f"{BASE_URL}/exam.html?ch={i['key']}", f"exam?ch={i['key']}")

    head("=== HTTP: Syllabus ===")
    ok_,body = get(f"{BASE_URL}/syllabus.html","syllabus.html")
    if ok_:
        for i in CHAPTERS: chk(i["key"] in body, f"syllabus has {i['key']}", f"syllabus MISSING {i['key']}")

    head("=== HTTP: Admin ===")
    ok_,body = get(f"{BASE_URL}/admin.html","admin.html")
    if ok_:
        for i in CHAPTERS: chk(i["key"] in body, f"admin has {i['key']}", f"admin MISSING {i['key']}")

    head("=== HTTP: Parent ===")
    get(f"{BASE_URL}/parent.html","parent.html")
    get(f"{BASE_URL}/parent-dashboard.html","parent-dashboard.html")

    head("=== HTTP: Avatar ===")
    ok_,body = get(f"{BASE_URL}/exam.html?ch=c7-01","exam avatar")
    if ok_:
        chk("rishika" in body.lower(),"Rishika present","Rishika MISSING")
        chk("rishi-core.js" in body.lower(),"rishi-core.js present","rishi-core.js MISSING")
        chk("rishi-presence.js" in body.lower(),"rishi-presence.js present","rishi-presence.js MISSING")

    head("=== HTTP: Explain Pages ===")
    for i in CHAPTERS:
        ok_,body = get(f"{BASE_URL}/explain/class7/{i['topic']}/{i['slug']}.html", i["slug"])
        if ok_:
            chk("<svg" in body or "at(" in body, f"  animation OK", f"  NO animation")
            chk("rishika" in body.lower(), f"  Rishika OK", f"  Rishika MISSING")

    head("=== HTTP: Practice Pages ===")
    for i in CHAPTERS:
        get(f"{BASE_URL}/practice/class7/{i['topic']}/{i['slug']}.html", i["slug"])

def main():
    print(f"\n{B}{'='*50}\n  RISHI Class 7 Checker\n{'='*50}{X}\n")
    check_local()
    if HAS_REQ: check_http()
    else: print(f"\n{Y}pip install requests --break-system-packages{X}")
    total = PC+FC
    pct = int(PC/total*100) if total else 0
    print(f"\n{B}{'='*50}")
    print(f"  Passed: {PC}/{total} ({pct}%)")
    print(f"  Failed: {FC}")
    print(f"  {'ALL CLEAR' if FC==0 else str(FC)+' issues'}")
    print(f"{'='*50}{X}\n")
    sys.exit(0 if FC==0 else 1)

if __name__=="__main__":
    main()
