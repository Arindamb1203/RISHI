/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 6 May 2026
  (Class 9 fully complete. Class 7 explain+practice done.)
═══════════════════════════════════════════════════════════════

▌ OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student testing: Dabeet (student), Priyanka (parent)
  Student ID format: {firstname}{class}{last3mobile} e.g. dabeet8171
  Parent ID format:  {firstname}{last5mobile}        e.g. priyanka47522

▌ REPO & HOSTING
  Repo:    github.com/Arindamb1203/RISHI
  Live:    rishi-ewh.pages.dev
  Host:    Cloudflare Pages (free, unlimited bandwidth)
  Deploy:  git push to main → auto deploys (~30 seconds)
  Build output directory: public
  CRITICAL: git add . must be run from D:\rishi (NOT D:\rishi\public)
            functions\ folder is at repo root, not inside public\

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks, no React
  Works on low-end devices and budget Android phones
  No backend server — Cloudflare Pages Functions for API only

▌ CLOUDFLARE ENVIRONMENT VARIABLES (all set)
  ELEVENLABS_API_KEY   — ElevenLabs API key (ends in 91f7)
  ELEVENLABS_VOICE_ID  — EXAVITQu4vr4xnSDxMaL (Sarah — free voice)
  GEMINI_API_KEY       — Gemini API key
  RISHI_ADMIN_TOKEN    — Admin panel auth token

  NOTE on ElevenLabs voices:
    Sarah (EXAVITQu4vr4xnSDxMaL) — FREE voice — USE THIS
    Priyanka (BpjGufoPiobT79j2vtj4) — PAID library voice — DO NOT USE on free plan

▌ CLOUDFLARE D1 DATABASE
  Database name: rishi-db
  D1 binding name in Cloudflare dashboard: DB
  Tables:
    rishi_sync     — progress data (explain done, practice done, exam scores etc.)
    rishi_accounts — student and parent registrations
    rishi_referrals — ref_by, referred_username, registered_at, subscription_credited
  File: functions/d1-sync.js (at repo ROOT — NOT inside public\)
  Client interceptor: public/rishi-sync.js (silently pushes rishi_* keys to D1)
  Injected into all HTML pages via inject_sync.py

▌ D1-SYNC.JS ACTIONS
  sync-progress     — push/pull localStorage rishi_* keys
  register          — save student/parent account to rishi_accounts
  login             — validate credentials (case-insensitive username matching)
  forgot            — retrieve credentials by mobile number
  change-password   — update password in D1
  assign-chapters   — parent assigns chapters to student
  log-referral      — record referral on registration
  get-referrals     — fetch parent referral list
  credit-referral   — mark referral credited (stub — wire to payment gateway later)

▌ AUTH SYSTEM
  Student login: username={firstname}{class}{last3mobile}, password=Study@Rishi1
  Parent login:  username={firstname}{last5mobile}, password=Parent@Rishi1
  Hardcoded fallback: username=parent / password=rishi2024 (any device)
  Login flow: check D1 first → check localStorage → check hardcoded fallback
  After login: student → /syllabus.html | parent → /parent.html
  rishi_admin_bypass → sessionStorage ONLY (never localStorage)
  Admin password: rishi2025

▌ GENERATOR SYSTEM (generate.py)
  Location: D:\rishi\public\generate.py
  Usage:    cd D:\rishi\public
            python generate.py data/classX/chapter-slug.json
  What it does:
    1. Reads content JSON from data/classX/chapter-slug.json
    2. Generates explain/classX/topic/chapter-slug.html
    3. Generates practice/classX/topic/chapter-slug.html
    4. Updates syllabus.html — marks built:true
    5. Updates parent.html — adds to explainBuilt
    6. Updates admin.html — marks built:true
  Content JSON schema: chapter_slug, chapter_name, chapter_emoji,
    class_num, board, topic, chap_id, exam_key, intro_text,
    complete_message, explain_questions (10), practice_questions (15)

▌ BATCH GENERATORS
  batch_generate.py      — generates explain+practice pages for a class
    Usage: python batch_generate.py --class 7 [--resume]
    Gemini generates content JSON, runs generate.py on each.
    On 429: waits 65s. Between chapters: waits 20s. max_tokens=16000.
    --resume: skips chapters where all 3 files already exist.

  batch_exam_generate.py — generates chapter exam JSONs
    Usage: python batch_exam_generate.py [--resume]
    Currently supports Class 9. Output: data/cbse/class9/chXX/chXX-exam.json

▌ FILE TREE (actual repo as of 6 May 2026)
  D:\rishi\
  |
  +---.github\workflows\
  |       test.yml / test-explain.yml / test-practice.yml / test-exam.yml
  |       test-admin.yml / test-parent.yml / test-landing.yml
  |
  +---functions\                        REPO ROOT — NOT inside public
  |   |   tts.js                        ElevenLabs TTS proxy
  |   \---api\
  |           admin.js
  |           questions.js              CLASS-AWARE: class 8 and 9
  |           explain.js
  |           explain-differently.js    maxOutputTokens:200
  |           deploy.js
  |
  +---public\
  |   |   admin.html                    Password: rishi2025
  |   |                                 7 tabs: Dashboard/Chapters/Topic Exams/
  |   |                                 Questions/Student/Logs/Deploy
  |   |                                 Bypass toggle → rishi_admin_bypass=1 sessionStorage
  |   |   exam.html                     CLASS-AWARE: ?ch= param, supports c9-XX keys
  |   |   topic-exam.html               CLASS-AWARE: ?topic=&class= params
  |   |   sampurna-pariksha.html        CLASS-AWARE: ?class= param
  |   |   login.html                    Hardcoded fallback parent/rishi2024
  |   |                                 "Pin on Home Page" button when ?role=parent
  |   |   register.html                 Success modal: Student (gold) + Parent (sage/green)
  |   |                                 Copy Link buttons. D1 URL: /d1-sync
  |   |   landing.html                  arindam.mp3 father voice (public\arindam.mp3)
  |   |                                 System requirements popup auto-shows on r5 section
  |   |   coming-soon.html
  |   |   parent.html                   CLASS-AWARE, 5 tabs + Live Status + Study Slots
  |   |                                 Analytics tab → redirects to parent-dashboard.html
  |   |   parent-dashboard.html         Light theme, fluorescent green borders
  |   |                                 Referral banner, back → parent.html
  |   |                                 Polls localStorage every 10s for presence data
  |   |   rishi-core.js                 Plan checks, explain/practice tracking
  |   |                                 5-minute idle auto-break detector
  |   |                                 rishi_admin_bypass → sessionStorage only
  |   |   rishi-presence.js             Injected all pages. Timing slots, heartbeat (30s),
  |   |                                 exam timer persistence (10s), session resume
  |   |                                 rishi_presence_log — JSON array capped 200 entries
  |   |   rishi-sync.js                 localStorage interceptor → D1 sync
  |   |   rishi-diagram.js
  |   |   explain-helper.js             "I Don't Understand" / "Explain Differently"
  |   |                                 → /api/explain-differently → Gemini
  |   |   syllabus.html                 CLASS-AWARE for 6,7,8,9
  |   |                                 Class 9 EXAM_PATHS filled
  |   |                                 Topic exam + sampurna links pass ?class=STUDENT_CLASS
  |   |   generate.py / batch_generate.py / batch_exam_generate.py
  |   |
  |   +---data\
  |   |   +---class8\  16 practice QB JSONs (old format)
  |   |   +---class9\  12 content JSONs (new format) ALL built
  |   |   +---class7\  8 content JSONs built
  |   |   +---class6\  stubs only
  |   |   \---cbse\
  |   |       +---class8\  Exam JSONs ch01-ch17 (topic-grouped folders)
  |   |       \---class9\  Exam JSONs ch01-ch12 (1:1 folders)
  |   |
  |   +---explain\
  |   |   class8(16p) / class9(12p) / class7(8p) / class6(stubs)
  |   |
  |   +---practice\
  |   |   class8(16p) / class9(12p) / class7(8p) / class6(stubs)
  |   |
  |   +---images\rishika\sprites\
  |   |   celebrate.jpeg / disappointed-s1.jpeg / neutral-talking.png / praise.jpeg
  |   |
  |   +---icons\  icon-192.png + icon-512.png (gold R on navy — PWA)
  |   \---manifest.json / sw.js  (PWA — parent.html only)

▌ CLASS 9 — FULLY COMPLETE
  Ch1  Real Numbers          (arithmetic)          c9-01
  Ch2  Polynomials           (algebra)             c9-02
  Ch3  Linear Equations      (algebra)             c9-03
  Ch4  Coordinate Geometry   (coordinate-geometry) c9-04
  Ch5  Euclid Geometry       (geometry)            c9-05
  Ch6  Lines and Angles      (geometry)            c9-06
  Ch7  Triangles             (geometry)            c9-07
  Ch8  Quadrilaterals        (geometry)            c9-08
  Ch9  Circles               (geometry)            c9-09
  Ch10 Heron Formula         (mensuration)         c9-10
  Ch11 Surface Areas Vols    (mensuration)         c9-11
  Ch12 Statistics            (data-handling)       c9-12
  Chapter exams / Topic exams / Sampurna Pariksha — ALL DONE

▌ CLASS 8 — ALL 16 CHAPTERS COMPLETE
  Chapters 6 and 7 (Squares/Cubes) deferred
  Exam keys: 01-17 (11a, 11b for mensuration split)
  Chapter exams / Topic exams / Sampurna Pariksha — ALL DONE

▌ CLASS 7 — EXPLAIN + PRACTICE DONE, EXAMS NOT YET BUILT
  Ch1 Large Numbers Around Us   (arithmetic)  c7-01 reserved
  Ch2 Arithmetic Expressions    (arithmetic)  c7-02 reserved
  Ch3 A Peek Beyond the Point   (arithmetic)  c7-03 reserved
  Ch4 Expressions Letter-Numbers (algebra)    c7-04 reserved
  Ch5 Parallel Intersecting Lines (geometry)  c7-05 reserved
  Ch6 Number Play               (arithmetic)  c7-06 reserved
  Ch7 A Tale Three Intersecting  (geometry)   c7-07 reserved
  Ch8 Working with Fractions    (arithmetic)  c7-08 reserved
  Textbook: Ganita Prakash (new NCERT 2025-26)

▌ CLASS 6 — NOT STARTED
  10 chapters in syllabus.html, all built:false
  Textbook: new NCERT 2025-26

▌ EXAM KEY FORMAT
  Class 8: 01,02,03,04,05,08,09,10,11a,11b,12,13,14,15,16,17
  Class 9: c9-01 to c9-12
  Class 7: c7-01 to c7-08 (reserved)
  Class 6: c6-01 to c6-10 (reserved)

▌ QUESTIONS.JS FOLDER MAP
  Class 8 — topic-grouped (not 1:1):
    01→ch01  08→ch01  12→ch01  13→ch01
    02→ch02  09→ch02  14→ch02
    03→ch03  04→ch03  10→ch03
    05→ch05  11a→ch11  11b→ch11
    15→ch15  16→ch16  17→ch17
  Class 9 — 1:1: 01→ch01 ... 12→ch12
  API: GET /api/questions?board=cbse&class=8&ch=01&type=exam
  Fallback: KV (RISHI_QUESTIONS) → static JSON file

▌ TOPIC EXAM STRUCTURE
  topic-exam.html reads ?topic=&class= from URL
  Class 8 topics: algebra(02,09,14,15) geometry(03,04,10) mensuration(11a,11b)
                  arithmetic(01,08,12,13,16) datahandling(05,17)
  Class 9 topics: arithmetic(01) algebra(02,03) coord-geometry(04)
                  geometry(05,06,07,08,09) mensuration(10,11) datahandling(12)
  Sampling: 14xA + 8xB + 4xC + 6xD = 32 questions / 60 marks / 45 min
  Gate: all chapter exams in topic must be done

▌ SAMPURNA PARIKSHA
  sampurna-pariksha.html reads ?class= from URL
  Class 8: 17 chapters | Class 9: 12 chapters
  Sampling: 20xA + 10xB + 8xC + 12xD = 50 questions / 100 marks / 90 min
  Gate: ALL chapter exams done

▌ CHAPTER EXAM JSON FORMAT
  sections A(20x1) B(10x2) C(6x3) D(10x3) E(2 cases x 3 subparts) = 52Q / 100 marks
  Known fixes applied: Class 9 Ch01 D_Q7 = 1225, D_Q9 replaced with 6^x=216

▌ LOCALSTORAGE KEYS (complete)
  rishi_explain_done_{chId}        "1"  (integer chId e.g. 2)
  rishi_practice_done_{chId}       "1"
  rishi_chapexam_done_{chIdStr}    "1"  (padded e.g. "02","11a","c9-01")
  rishi_exam_score_{chIdStr}       number
  rishi_exam_attempts_{chIdStr}    number
  rishi_topicexam_done_{topic}     "1"
  rishi_topicexam_score_{topic}    number
  rishi_sampurna_done             "1"
  rishi_sampurna_score            number
  rishi_coins                     number
  rishi_break_log                 JSON array
  rishi_current_student           JSON object
  rishi_active_chapters_{sid}     JSON (parent assigned chapters, keyed by student ID)
  rishi_active_chapters           JSON (fallback, no student ID)
  rishi_presence_log              JSON array capped 200 entries
  rishi_presence_heartbeat        timestamp
  rishi_presence_page             page name
  rishi_exam_timer_{chIdStr}      remaining seconds (saved every 10s)
  rishi_admin_bypass              "1" (sessionStorage ONLY — never localStorage)

  LEGACY (Class 8 backward compat):
  explain_linear_done / explain_quadrilaterals_done / explain_practical_done
  explain_algebraic_done / explain_area_done / explain_surface_done / explain_graphs_done

▌ EXPLAIN PAGE TECHNICAL RULES (critical — never violate)
  SVG canvas: max-height 195px. ViewBox max height 195px. e.g. viewBox="0 0 420 178"
  Timer: ALL setTimeout via at(ms, fn) → stored in atTimers[] → clearAt() on Replay
  Replay: re-inject fresh SVG via canvas.innerHTML = getAnimSVG(...)
  Duration estimate: Math.max(1800, text.length * 58) ms
  initVoices(callback) MUST complete before any say() call
  Never call say() in window.onload directly
  Mouth sync: setInterval 160ms. Blush 0.7 while talking, 0 after.
  Blink: recursive setTimeout, delay 2200+rand*3000, lid ry for 120ms
  speechSynthesis.cancel() on beforeunload and pagehide
  Smart apostrophes in JS strings = crash. Use \' or &#39;
  SVG attributes: never double-quote inside JS double-quoted string

▌ RISHIKA AVATAR
  Only character — ALL pages. Rekha RETIRED forever.
  Explain: SVG turtle bottom-left
  Practice/exam: sprite canvas (FaceTime-style)
  Wrong answer: 1st→disappointed, 2nd→talking/hint, 3rd→neutral
  Multilingual praise: 10 languages

▌ ELEVENLABS TTS
  Proxy: POST /tts via functions/tts.js (REPO ROOT — not inside public\)
  Free voice: Sarah EXAVITQu4vr4xnSDxMaL
  DO NOT USE: Priyanka BpjGufoPiobT79j2vtj4 (paid)
  Browser TTS fallback: heera→veena→priya→raveena→female→woman→zira→samantha
  Rate: 0.88, Pitch: 1.15, Lang: en-IN

▌ GEMINI API
  Model: gemini-2.5-flash
  URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
  Key: GEMINI_API_KEY (Cloudflare env var)
  explain-differently.js: maxOutputTokens:200 (250 TPM free tier)

▌ RISHI THEME (always light)
  Background: cream #fdf6ec | Cards: warm white #fffdf8
  Text: charcoal #2a2218 | Accents: gold #d4a017 / amber / sage green
  NO DARK BACKGROUNDS on student/parent pages
  Fonts: Orbitron (headers) + Nunito (body)

▌ WINDOWS FAMILY SAFETY
  Dabeet laptop: family.microsoft.com
  Child Microsoft account: dabeet.171822@outlook.com

▌ REMAINING WORK — PRIORITY ORDER
  [DONE] Class 8 — fully complete
  [DONE] Class 9 — fully complete
  [DONE] Class 7 — explain + practice
  [NEXT] Class 7 — chapter exams (8 JSONs, manual write like Class 9)
  [THEN] Class 7 — topic exams + sampurna (after exams built)
  [THEN] Class 6 — 10 chapters full build
  [THEN] ICSE Class 8 → WBBSE Class 8
  [PENDING] Payment gateway → credit-referral in d1-sync.js
  [PENDING] YouTube video embed (one per chapter, Arindam picks, Claude wires)
  [FUTURE] OTP SMS reset — blocked on TRAI DLT registration
  [FUTURE] Vedic Maths mini-module

▌ CLASS 6 CHAPTER MAP (new NCERT 2025-26)
  Arithmetic:    Patterns in Mathematics, Number Play, Prime Time,
                 Fractions, The Other Side of Zero
  Geometry:      Lines and Angles, Playing with Constructions, Symmetry
  Mensuration:   Perimeter and Area
  Data Handling: Data Handling and Presentation

▌ CRITICAL RULES FOR CLAUDE
  1. NEVER guess file contents — always read actual file first
  2. NEVER deliver code without checking for errors
  3. git add . from D:\rishi (NOT D:\rishi\public)
  4. Always end every session: git add . → commit → push
  5. Response style: extremely concise, no fluff
  6. Smart apostrophes in JS = crash. Use \' or &#39;
  7. tts.js at REPO ROOT functions\tts.js — NOT inside public\
  8. Do things simply — never overcomplicate
  9. rishi_admin_bypass in sessionStorage ONLY — never localStorage
  10. generate.py handles portal updates automatically
  11. NEVER ask Arindam to edit code manually — deliver complete files
  12. Build order: content JSON → run generate.py → git push
  13. data-handling folder uses hyphen (not underscore)
  14. Topic folder for Statistics: data-handling
  15. RISHI theme is LIGHT. NO dark backgrounds ever.
  16. SVG canvas max-height 195px — never exceed
  17. All setTimeout via at() on explain pages — never raw setTimeout
  18. initVoices(callback) before any say() — never say() in window.onload
  19. functions/d1-sync.js is at REPO ROOT functions/ — not in public/
  20. arindam.mp3 must be in public/ and committed to git
*/
