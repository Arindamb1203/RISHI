/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 28 April 2026 — evening (presence system,
  admin overhaul, parent portal redesign, leaderboard)
═══════════════════════════════════════════════════════════════

▌ OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student testing: Dabeet (student), Priyanka (parent)
  Student ID: dabeet8{class}{last3mobile} e.g. dabeet8171
  Parent ID:  priyanka{last5mobile}       e.g. priyanka47522

▌ REPO & HOSTING
  Repo:    github.com/Arindamb1203/RISHI
  Live:    rishi-ewh.pages.dev
  Host:    Cloudflare Pages (free, unlimited bandwidth)
  Deploy:  git push to main → auto deploys (~30 seconds)
  Build output directory: public

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks, no React
  Works on low-end devices and budget Android phones
  No backend server — Cloudflare Pages Functions for API only

▌ FILE TREE (actual repo as of 28 Apr 2026)
  D:\rishi\
  |
  +---functions\                        ROOT level — NOT inside public
  |   |   tts.js                        ElevenLabs TTS proxy
  |   \---api\
  |           admin.js                  POST seed/delete/list KV — ALL 17 chapters
  |           questions.js              GET exam questions (KV then static fallback)
  |           explain.js                POST Gemini Flash proxy for wrong-answer explanations
  |
  +---public\
  |   |   admin.html                    Admin panel — warm cream theme, 6 tabs:
  |   |                                   Dashboard / Chapters / Topic Exams /
  |   |                                   Questions (KV seed) / Student / Logs
  |   |                                   NEW: Registered Students card with search,
  |   |                                   subscription status, direct bypass buttons
  |   |   exam.html                     Universal exam page (?ch=01 to ?ch=17)
  |   |                                   NEW: exam timer saved every 10s, auto-resumes
  |   |   topic-exam.html               Universal topic exam (?topic=algebra etc)
  |   |   sampurna-pariksha.html        Grand final exam — all 17 chapters
  |   |   login.html                    NEW: first-login password setup screen
  |   |   parent.html                   NEW: 5 tabs + Live Status + Study Slots +
  |   |                                   redesigned guide page (warm, animated slabs) +
  |   |                                   leaderboard button
  |   |   parent-dashboard.html         Analytics dashboard (separate page — legacy)
  |   |   register.html                 NEW: mobile-based unique IDs, firstLogin flags,
  |   |                                   30-day auto trial, no default password
  |   |   rishi-core.js                 Shared functions — include on EVERY student page
  |   |   rishi-presence.js             NEW: timing slots, heartbeat, exam resume,
  |   |                                   expiry warnings — injected into all 48 pages
  |   |   rishi-diagram.js              SVG diagram renderer (18 shape types)
  |   |   rishi-sync.js                 Cross-page sync utilities
  |   |   explain-helper.js             "I Don't Understand" button — Gemini re-explain
  |   |   syllabus.html                 NEW: leaderboard button, admin bypass for locks
  |   |   manifest.json
  |   |   sw.js
  |   |   favicon.svg
  |   |   landing.html
  |   |   coming-soon.html
  |   |   inject-presence.mjs           Run once: adds rishi-presence.js to all pages
  |   |
  |   +---admin\
  |   |       question-manager.html     OLD — now integrated into admin.html Questions tab
  |   |
  |   +---data\
  |   |   +---class8\                   Practice question JSON banks (flat folder)
  |   |   |       algebraic-expressions-identities.json
  |   |   |       area-plane-figures.json
  |   |   |       chance-probability.json
  |   |   |       comparing-quantities.json
  |   |   |       direct-inverse-proportions.json
  |   |   |       factorisation.json
  |   |   |       frequency-distribution.json
  |   |   |       introduction-to-graphs.json
  |   |   |       linear-equations.json
  |   |   |       playing-with-numbers.json
  |   |   |       powers-exponents.json
  |   |   |       practical-geometry.json
  |   |   |       rational-numbers.json
  |   |   |       surface-area-volume.json
  |   |   |       understanding-quadrilaterals.json
  |   |   |       visualising-solid-shapes.json
  |   |   |
  |   |   \---cbse\class8\              Exam JSON banks — grouped by topic folder
  |   |       +---ch01\                 (ch01,ch08,ch12,ch13 — arithmetic)
  |   |       +---ch02\                 (ch02,ch09,ch14 — algebra)
  |   |       +---ch03\                 (ch03,ch04,ch10 — geometry)
  |   |       +---ch05\                 (ch05 — data handling)
  |   |       +---ch11\                 (ch11a,ch11b — mensuration)
  |   |       +---ch15\                 (ch15 — graphs)
  |   |       +---ch16\                 (ch16 — playing with numbers)
  |   |       \---ch17\                 (ch17 — chance & probability ✅ seeded)
  |   |
  |   +---explain\class8\              16 pages — all fixed Apr 27
  |   |   +---algebra\                 (4 files)
  |   |   +---arithmetic\              (5 files)
  |   |   +---data-handling\           (2 files)
  |   |   +---geometry\                (3 files)
  |   |   \---mensuration\             (2 files)
  |   |
  |   +---practice\class8\             16 pages — built but UNVERIFIED (P3)
  |   |   +---algebra\                 (4 files)
  |   |   +---arithmetic\              (5 files)
  |   |   +---data-handling\           (2 files)
  |   |   +---geometry\                (3 files)
  |   |   \---mensuration\             (2 files)
  |   |
  |   +---images\rishika\sprites\
  |   |       celebrate.jpeg
  |   |       disappointed-s1.jpeg
  |   |       disappointed-s2.png
  |   |       neutral-talking.png
  |   |       praise.jpeg
  |   |
  |   \---icons\
  |           icon-192.png
  |           icon-512.png

▌ CHARACTERS
  Rishika           — ALL pages (explain + practice). Turtle SVG bottom-left + speaking bubble.
                      Rekha the Turtle is RETIRED — do not reference anywhere.
  NO avatar on exam.html or topic-exam.html (by design decision Apr 26)

▌ USER ID SYSTEM (new — Apr 28)
  Student ID: {firstname}{class}{last3ofmobile}  e.g. dabeet8171   (lowercase, no dashes)
  Parent ID:  {firstname}{last5ofmobile}          e.g. priyanka47522 (lowercase, no dashes)
  Password:   Set by user on FIRST LOGIN — no default password
  First login flag: firstLoginStudent / firstLoginParent in rishi_registrations[]
  Trial: 30 days auto from registration date (subscriptionExpiry field)
  Subscription fields: subscriptionStatus (trial/subscribed/discontinued)
                       subscriptionExpiry (ISO date)
                       discontinuedDate, rejoinedDate

▌ ADMIN BYPASS SYSTEM
  rishi_admin_bypass=1 in localStorage → skips ALL gates
  goStudent(idx) in admin.html sets this before opening syllabus
  goParent(idx) passes ?bypass=1&sName=...&sId=... in URL
  parent.html checkAuth() reads URL params → auto-enters portal
  rishi-presence.js → returns immediately if bypass=1
  syllabus.html getPlanActive() → returns '__all__' if bypass=1 (all chapters open)

▌ SUBSCRIPTION & EXPIRY SYSTEM (new — Apr 28)
  Admin sets per-student: status, expiry date, disc/rejoin dates via ✏ Edit popup
  rishi-presence.js checks on every student page load:
    - Expired + not subscribed → full-screen block (can't dismiss)
    - 3 days before expiry → toast warning at bottom (once per day, 10s auto-dismiss)
  Admin test data: 🧪 Load Test Data button (6 fictitious students, all conditions)
                   🗑 Clear Test Data button removes them cleanly

▌ ELEVENLABS TTS
  Proxy:    /tts (POST) via functions/tts.js at repo root
  Voice ID: 21m00Tcm4TlvDq8ikWAM (Rachel — free voice)
            Priyanka BpjGufoPiobT79j2vtj4 = paid voice — DO NOT USE on free plan
  Fallback: Browser TTS (sayBrowser) if ElevenLabs fails
  Cloudflare env vars: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (both Plaintext)

▌ GEMINI API (wrong-answer explanations)
  Proxy:    /api/explain (POST) via functions/api/explain.js
  Model:    gemini-2.5-flash (working model — v1beta endpoint)
  URL:      https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
  Cloudflare env var: GEMINI_API_KEY (Plaintext, set ✅)
  Used in:  topic-exam.html + explain-helper.js
  Request:  { question, correct_answer, options?, student_answer }
  Response: { steps: ["Step 1: ...", "Step 2: ...", "Answer: ..."] }

▌ EXPLAIN PAGE FLOW (all 16 pages — fixed Apr 27)
  1. Page loads → initVoices(function(){startLesson();})
  2. startLesson() → say(introText, proceed) + setTimeout(proceed, 8000) safety
  3. proceed() → setTimeout(showQ, 600)
  4. showQ() → builds question card → setTimeout(startAnim, 800)
  5. startAnim() → plays turtle animation → setTimeout(beginSteps, 600)
  6. beginSteps() → creates step card → setTimeout(nextStep, 350)
  7. nextStep() → say(s.s, function(){ setTimeout(nextStep, 400) })
  8. After all steps → showConfirm() → student types answer
  explain-helper.js injected into all 16 pages — "I Don't Understand" button
  Gemini re-explains using story/analogy/visual steps approach

▌ EXPLAIN PAGE KEY PATTERNS
  var elAudio = null  (declared at top of each page)
  initVoices(cb) → picks browser voice, calls cb when ready
  say(text, onEnd) → tries ElevenLabs /tts first, falls back to sayBrowser
  rStartTalk(len) / rStopTalk() → Rishika turtle talking animation
  getAnimPlay(animId) → returns function that plays SVG animation
  rishiCheckPlan(chId) → redirects if chapter not in parent plan
  rishiMarkExplainDone(chId) → called on completion
  Bypass: rishi_admin_bypass=1 in localStorage skips all gates

▌ RISHI-PRESENCE.JS (new — Apr 28)
  Injected into all 48 student pages via inject-presence.mjs
  Skips everything if rishi_admin_bypass=1
  Features:
    heartbeat() → localStorage every 30s (rishi_presence_online timestamp)
    visibilitychange + beforeunload → rishi_presence_offline timestamp
    isInSlot() → reads rishi_slots[], blocks with overlay if outside slot
    checkExpiryWarning() → toast (3 days before) or hard block (expired)
    presLog(type) → rishi_presence_log[] capped at 200 entries
  Public API (used by exam pages):
    rishiSaveExamState(chIdStr, timerSecs, currentIdx)
    rishiGetExamResume(chIdStr) → {timerSecs, currentIdx} or null (4hr TTL)
    rishiClearExamResume(chIdStr)
  Parent portal Live Status tab polls localStorage every 10s

▌ RISHI-CORE.JS KEY FUNCTIONS
  rishiCheckPlan(chId)             — gate: redirects if not in plan
  rishiMarkExplainDone(chId)       — marks explain complete
  rishiMarkPracticeDone(chId)      — marks practice complete
  rishiIsExplainDone(chId)         — read explain status
  rishiIsPracticeDone(chId)        — read practice status
  rishiMarkChapExamDone(chIdStr)   — marks exam done, increments attempt counter
  rishiExamAttemptCount(chIdStr)   — returns attempt count
  rishiSaveExamScore(chIdStr, n)   — saves high score, returns previous high
  rishiGetExamHighScore(chIdStr)   — returns stored high score
  rishiAddCoins(n)                 — adds coins, returns new total
  rishiGetCoins()                  — returns current coin total
  rishiExamCoins(score,prevHigh,attemptNum,sectionAAllCorrect,zeroWrong)
                                   — returns {base, bonus, total, badge, grade}
  rishiLogBreak(type, secs)        — logs break to localStorage
  rishiMarkTopicExamDone(topic)    — marks topic exam done
  rishiIsTopicExamDone(topic)      — checks topic exam done
  rishiSaveTopicExamScore(topic,n) — saves topic exam high score
  rishiTopicExamAttemptCount(topic)— returns topic exam attempt count
  rishiTopicExamCoins(pct,prevPct,attemptNum) — returns {base,bonus,total,grade,badge}
  Idle break detector              — 5 min idle → overlay with timer

▌ TOPIC EXAM SYSTEM (built Apr 26)
  Universal page: /topic-exam.html?topic=algebra (or geometry/mensuration/arithmetic/datahandling)
  32 questions / 60 marks / 45 minutes / no avatar
  Gate: all chapter exams in topic must be done (or admin bypass)
  Post-exam: wrong answers with Gemini "Explain" button
  Grade: Topic Master(≥90%) / Topic Star(≥75%) / Topic Pass(≥60%) / Try Again(<60%)
  Coins: 750 / 450 / 250 / 50 + bonuses

▌ CHAPTER MAP (17 active, ch06+ch07 excluded)
  Ch01  Rational Numbers              → arithmetic
  Ch02  Linear Equations              → algebra
  Ch03  Understanding Quadrilaterals  → geometry
  Ch04  Practical Geometry            → geometry
  Ch05  Data Handling (Freq Dist)     → data-handling
  Ch08  Comparing Quantities          → arithmetic
  Ch09  Algebraic Expressions         → algebra
  Ch10  Visualising Solid Shapes      → geometry
  Ch11a Area of Plane Figures         → mensuration
  Ch11b Surface Area & Volume         → mensuration
  Ch12  Exponents and Powers          → arithmetic
  Ch13  Direct & Inverse Proportions  → arithmetic
  Ch14  Factorisation                 → algebra
  Ch15  Introduction to Graphs        → algebra
  Ch16  Playing with Numbers          → arithmetic
  Ch17  Chance & Probability          → data-handling (exam JSON seeded ✅)

▌ EXAM SYSTEM
  Universal page: /exam.html?ch=01 (zero-padded, 11a, 11b for mensuration, 17 for ch17)
  52 questions / 100 marks / 90 minutes
  Section A: 20 MCQ × 1 mark  | Section B: 10 MCQ × 2 marks
  Section C:  6 MCQ × 3 marks | Section D: 10 Direct input × 3 marks
  Section E:  6 Case study × 2 marks
  NEW: exam timer auto-saved every 10s → auto-resumes on re-entry (4hr TTL)
  Gates: rishiCheckPlan(intId) + rishiIsPracticeDone(chIdStr)

▌ EXAM COIN & GRADE SYSTEM
  90-100 → 500 coins  ⭐ Chapter Topper
  75-89  → 300 coins  🥈 Chapter Star
  60-74  → 175 coins  🥉 Chapter Pass
  40-59  →  75 coins  ✅ Cleared
  <40    →  20 coins  🔁 Try Again
  Bonuses: +50 first attempt pass | +75 improved score
           +100 all Section A correct | +150 zero wrong

▌ SYLLABUS PAGE
  EXAM_PATHS map: chId (integer) → /exam.html?ch=XX
  EXAM_DONE_KEYS map: chId → padded string (2→"02", 11→"11a", 112→"11b", 17→"17")
  Exam button states: locked / Start Exam / Done·Retry
  Topic Exam: shows when all chapters done
  NEW: leaderboard button top-right header
  NEW: getPlanActive() returns '__all__' if admin bypass → all chapters open

▌ PARENT PORTAL (parent.html — major update Apr 28)
  5 tabs: Study Plan / Performance / Analytics / Study Slots / Live Status
  Study Slots tab: add/remove allowed time windows (saved to rishi_slots[])
  Live Status tab: online/offline, last page, last seen, activity log — polls 10s
  Guide page: warm cream, two-column animated slabs (parent to-do + student must know)
  Leaderboard button: top-right header
  Bypass: ?bypass=1&sName=...&sId=... in URL → auto-enters portal (no login)

▌ LEADERBOARD
  Available on: parent.html header + syllabus.html header
  Reads: rishi_registrations[] + rishi_coins from localStorage
  NOTE: currently per-device only — cross-student ranking needs D1 cloud sync

▌ QUESTIONS.JS FOLDER MAP
  "01"→ch01  "08"→ch01  "12"→ch01  "13"→ch01
  "02"→ch02  "09"→ch02  "14"→ch02
  "03"→ch03  "04"→ch03  "10"→ch03
  "05"→ch05
  "11a"→ch11  "11b"→ch11
  "15"→ch15  "16"→ch16  "17"→ch17

▌ ADMIN PANEL
  URL: /admin.html — password: rishi2025
  Theme: warm cream/white, amber accents
  6 tabs: Dashboard / Chapters / Topic Exams / Questions / Student / Logs
  Bypass toggle: top-right button (sets rishi_admin_bypass=1)
  Students card: search by name/ID/mobile, subscription badge, ✏ Edit popup
  🧪 Load Test Data / 🗑 Clear Test Data buttons
  Direct access: 📚 Student button → opens syllabus with bypass
                 👨‍👩‍👧 Parent button → opens parent portal bypassing login

▌ LOCALSTORAGE KEYS
  rishi_explain_done_{chId}           → "1"
  rishi_practice_done_{chId}          → "1"
  rishi_chapexam_done_{chIdStr}       → "1"
  rishi_exam_score_{chIdStr}          → score number
  rishi_exam_attempts_{chIdStr}       → attempt count
  rishi_topicexam_done_{topic}        → "1"
  rishi_topicexam_score_{topic}       → score out of 60
  rishi_topicexam_attempts_{topic}    → attempt count
  rishi_coins                         → running total
  rishi_break_log                     → JSON array of breaks
  rishi_active_chapters               → JSON {chId: {startDate, targetDate}}
  rishi_current_student               → JSON {studentName, class, board, studentId, studentUsername}
  rishi_admin_bypass                  → "1" skips all gates
  rishi_explain_sessions              → JSON {chId: count}
  rishi_practice_sessions             → JSON {chId: count}
  rishi_registrations                 → JSON array of registration objects
  rishi_slots                         → JSON [{start:"09:00",end:"12:00"}]
  rishi_presence_online               → timestamp (ms)
  rishi_presence_offline              → timestamp (ms)
  rishi_presence_page                 → last page path
  rishi_presence_log                  → JSON array (capped 200)
  rishi_exam_resume_{chIdStr}         → JSON {timerSecs, currentIdx, ts}
  rishi_expiry_warned                 → ISO date string (today) — prevents repeat warning

▌ REMAINING WORK — PRIORITY ORDER (updated 28 Apr 2026 — evening)

  [P3 — DONE ✅ 28 Apr 2026]
  Practice pages — all 16 pages verified and patched
  ISSUES FOUND AND FIXED:
    ✅ rishi-presence.js injected via patch scripts (rishi-core.js is inlined in practice
       pages — inject-presence.mjs missed them. Patch scripts added tag after rishi-sync.js)
    ✅ rishiIsExplainDone(CHAP_ID) gate added to init() on all 16 pages
    ✅ Admin bypass respected in explain gate
    ✅ CHAP_ID bug fixed: chance-probability.html had CHAP_ID=5 (wrong) → fixed to 17
    ✅ All other wiring confirmed correct: rishiCheckPlan, 5-streak gate,
       rishiMarkPracticeDone, Rishika avatar, coins (+5 per correct first attempt),
       Rishika's Trick on wrong answer, Try Again, Alternative explanation
  PATCH SCRIPTS (all in repo root D:\rishi\):
    patch-arithmetic-practice.mjs  — 5 files (ch01,08,12,13,16)
    patch-algebra-practice.mjs     — 4 files (ch02,09,14,15)
    patch-geometry-practice.mjs    — 3 files (ch03,04,10)
    patch-mensuration-practice.mjs — 2 files (ch11a,11b)
    patch-data-handling-practice.mjs — 2 files (ch05,ch17) + CHAP_ID fix

  [P2 — NEXT]
  YouTube video embed
  - Arindam picks 1 YouTube video per chapter (16 videos total)
  - Claude adds "▶ Watch Video" button to each explain page
  - Simple embed — no API, just iframe or youtube.com/embed link
  - Button appears before or after the explain lesson

  [P4 — FUTURE]
  Vedic Maths / Calculation Shortcuts mini-module

  [P5 — FUTURE]
  OTP SMS reset — blocked on TRAI DLT registration

  [P6 — FUTURE]
  Ch06 Squares & Square Roots + Ch07 Cubes & Cube Roots
  (deliberately excluded from current build)

  [P7 — FUTURE]
  Leaderboard cross-device — currently per-device localStorage only
  Needs D1 cloud sync to show real rankings across all students

  [P8 — AFTER CLASS 8 COMPLETE]
  Multi-class / multi-board expansion
  Architecture: public/cbse/class8/, public/icse/class8/, public/wbse/class8/
  Clone script: node clone-class.mjs --from cbse/class8 --to cbse/class7
  Rule: DO NOT START until Class 8 CBSE fully complete

▌ CRITICAL RULES FOR CLAUDE
  1. NEVER guess at file contents — always read actual file first
  2. NEVER deliver code without checking for probable errors
  3. Always end every session with: git add . → git commit → git push
  4. Node.js v24 available. package.json has "type":"module" — use .mjs for scripts
  5. Python is NOT installed on Arindam's Windows machine
  6. Response style: extremely concise, no fluff, no repeating back what was said
  7. When making scripts — test against actual uploaded files before delivering
  8. Smart apostrophes (') inside JS single-quoted strings = syntax crash. Use \' or &#39;
  9. tts.js lives at repo ROOT functions\tts.js — NOT inside public\
  10. Exam JSONs are grouped by topic folder — questions.js uses FOLDER_MAP to resolve paths
  11. Do things the simple, straight way — never overcomplicate
  12. topic-exam.html explanation shown AFTER full submission only, not during exam
  13. Leaderboard is per-device only until D1 cloud sync is implemented
  14. rishi-presence.js must always check rishi_admin_bypass=1 first and return early
*/
