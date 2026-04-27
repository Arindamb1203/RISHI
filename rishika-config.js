/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 26 April 2026 — night (topic exam live, admin rebuilt)
═══════════════════════════════════════════════════════════════

▌ OWNER
  Arindam Bhowmik — non-technical, sole developer + owner
  All code written by Claude, deployed via git push from VS Code on Windows
  Student testing: Dabeet (student), Priyanka (parent)

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

▌ FILE TREE (actual repo as of 26 Apr 2026)
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
  |   |   admin.html                    Admin panel — light cream theme, 6 tabs:
  |   |                                   Dashboard / Chapters / Topic Exams /
  |   |                                   Questions (KV seed) / Student / Logs
  |   |   exam.html                     Universal exam page (?ch=01 to ?ch=17)
  |   |   topic-exam.html               Universal topic exam (?topic=algebra etc)
  |   |                                   32 questions / 60 marks / 45 min
  |   |                                   Wrong answers: Explain button (Gemini AI)
  |   |                                   No avatar. Explanation shown AFTER submit only.
  |   |   login.html
  |   |   parent.html
  |   |   parent-dashboard.html
  |   |   register.html
  |   |   rishi-core.js                 Shared functions — include on EVERY page
  |   |   rishi-diagram.js              SVG diagram renderer (18 shape types)
  |   |   rishi-sync.js                 Cross-page sync utilities
  |   |   syllabus.html                 Student hub — topic exam buttons now live
  |   |   manifest.json
  |   |   sw.js
  |   |   favicon.svg
  |   |   landing.html
  |   |   coming-soon.html
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
  |   |       +---ch01\                 Arithmetic group
  |   |       |       ch01-exam.json    Rational Numbers
  |   |       |       ch08-exam.json    Comparing Quantities
  |   |       |       ch12-exam.json    Exponents and Powers
  |   |       |       ch13-exam.json    Direct & Inverse Proportions
  |   |       +---ch02\                 Algebra group
  |   |       |       ch02-exam.json    Linear Equations
  |   |       |       ch09-exam.json    Algebraic Expressions
  |   |       |       ch14-exam.json    Factorisation
  |   |       +---ch03\                 Geometry group
  |   |       |       ch03-exam.json    Understanding Quadrilaterals
  |   |       |       ch04-exam.json    Practical Geometry
  |   |       |       ch10-exam.json    Visualising Solid Shapes
  |   |       +---ch05\                 Data Handling group
  |   |       |       ch05-exam.json    Frequency Distribution
  |   |       +---ch11\                 Mensuration group
  |   |       |       ch11a-exam.json   Area of Plane Figures
  |   |       |       ch11b-exam.json   Surface Area & Volume
  |   |       +---ch15\
  |   |       |       ch15-exam.json    Introduction to Graphs
  |   |       +---ch16\
  |   |       |       ch16-exam.json    Playing with Numbers
  |   |       \---ch17\                 NEW — Chance & Probability (seeded to KV ✅)
  |   |               ch17-exam.json
  |   |
  |   +---explain\class8\
  |   |   +---algebra\
  |   |   |       linear-equations.html
  |   |   |       algebraic-expressions-identities.html
  |   |   |       factorisation.html
  |   |   |       introduction-to-graphs.html
  |   |   +---arithmetic\
  |   |   |       rational-numbers.html
  |   |   |       comparing-quantities.html
  |   |   |       powers-exponents.html
  |   |   |       direct-inverse-proportions.html
  |   |   |       playing-with-numbers.html
  |   |   +---data-handling\
  |   |   |       frequency-distribution.html
  |   |   |       chance-probability.html
  |   |   +---geometry\
  |   |   |       understanding-quadrilaterals.html
  |   |   |       practical-geometry.html
  |   |   |       visualising-solid-shapes.html
  |   |   \---mensuration\
  |   |           area-plane-figures.html
  |   |           surface-area-volume.html
  |   |
  |   +---practice\class8\             Same subfolder structure as explain\
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
  |
  NOTE: public\functions\tts.js was a stale duplicate — DELETED from repo ✅

▌ CHARACTERS
  Rishika           — ALL pages (explain + practice). Turtle SVG bottom-left + speaking bubble.
                      Rekha the Turtle is RETIRED — do not reference anywhere.
  NO avatar on exam.html or topic-exam.html (by design decision Apr 26)

▌ ELEVENLABS TTS
  Proxy:    /tts (POST) via functions/tts.js at repo root
  Voice ID: 21m00Tcm4TlvDq8ikWAM (Rachel — free voice)
            Priyanka BpjGufoPiobT79j2vtj4 = paid voice — DO NOT USE on free plan
  Fallback: Browser TTS (sayBrowser) if ElevenLabs fails
  Cloudflare env vars: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (both Plaintext)

▌ GEMINI API (wrong-answer explanations)
  Proxy:    /api/explain (POST) via functions/api/explain.js
  Model:    gemini-2.5-flash (working model as of Apr 2026 — v1beta endpoint)
  Cloudflare env var: GEMINI_API_KEY (Plaintext, set ✅)
  Used in:  topic-exam.html ONLY — shows step-by-step after full exam submission
  Request:  { question, correct_answer, options?, student_answer }
  Response: { steps: ["Step 1: ...", "Step 2: ...", "Answer: ..."] }
  Future:   Will also be used in "Explain Differently" button on explain pages

▌ EXPLAIN PAGE FLOW (all 16 pages — fixed Apr 24)
  1. Page loads → initVoices(function(){startLesson();})
  2. startLesson() → say(introText, proceed) + setTimeout(proceed, 8000) safety
  3. proceed() → setTimeout(showQ, 600)
  4. showQ() → builds question card → setTimeout(startAnim, 800)
  5. startAnim() → plays turtle animation → setTimeout(beginSteps, 600)
  6. beginSteps() → creates step card → setTimeout(nextStep, 350)
  7. nextStep() → say(s.s, function(){ setTimeout(nextStep, 400) })
  8. After all steps → showConfirm() → student types answer

▌ EXPLAIN PAGE KEY PATTERNS
  var elAudio = null  (declared at top of each page)
  initVoices(cb) → picks browser voice, calls cb when ready
  say(text, onEnd) → tries ElevenLabs /tts first, falls back to sayBrowser
  rStartTalk(len) / rStopTalk() → Rekha turtle talking animation
  getAnimPlay(animId) → returns function that plays SVG animation
  rishiCheckPlan(chId) → redirects if chapter not in parent plan
  rishiMarkExplainDone(chId) → called on completion
  Bypass: rishi_admin_bypass=1 in localStorage skips all gates

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
  rishiExamCoins(score, prevHigh, attemptNum, sectionAAllCorrect, zeroWrong)
                                   — returns {base, bonus, total, badge, grade}
  rishiLogBreak(type, secs)        — logs break to localStorage
  rishiMarkTopicExamDone(topic)    — marks topic exam done
  rishiIsTopicExamDone(topic)      — checks topic exam done
  rishiSaveTopicExamScore(topic,n) — saves topic exam high score
  rishiTopicExamAttemptCount(topic)— returns topic exam attempt count
  rishiTopicExamCoins(pct,prevPct,attemptNum) — returns {base,bonus,total,grade,badge}
  Idle break detector              — 5 min idle → overlay with timer
  NOTE: Smart apostrophes in idle overlay strings caused syntax crash (fixed Apr 24)

▌ TOPIC EXAM SYSTEM (built Apr 26)
  Universal page: /topic-exam.html?topic=algebra (or geometry/mensuration/arithmetic/datahandling)
  32 questions / 60 marks / 45 minutes / no avatar
  Sections: A(14×1) + B(8×2) + C(4×3) + D(6×3) = 60 marks
  Sampling: pools ALL questions from all chapters in topic, shuffles, samples
  Gate: all chapter exams in topic must be done (or admin bypass)
  Post-exam: wrong answers shown with Gemini "Explain" button (collapses after read)
  Explanation shown AFTER full submission only — not during exam
  Grade: Topic Master(≥90%) / Topic Star(≥75%) / Topic Pass(≥60%) / Try Again(<60%)
  Coins: 750 / 450 / 250 / 50 + bonuses
  localStorage: rishi_topicexam_done_{topic}, rishi_topicexam_score_{topic},
                rishi_topicexam_attempts_{topic}

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
  Ch17  Chance & Probability          → data-handling (exam JSON built + KV seeded ✅)

▌ EXAM SYSTEM
  Universal page: /exam.html?ch=01 (zero-padded, 11a, 11b for mensuration, 17 for ch17)
  52 questions / 100 marks / 90 minutes
  Section A: 20 MCQ × 1 mark  | Section B: 10 MCQ × 2 marks
  Section C:  6 MCQ × 3 marks | Section D: 10 Direct input × 3 marks
  Section E:  6 Case study × 2 marks
  Geometry chapters (03,04,10): Section D also MCQ (no drawing)
  Gates: rishiCheckPlan(intId) + rishiIsPracticeDone(chIdStr)
  Diagrams: RishiDiagram.render(slot, question.diagram) — shown when field present
  Chapters with diagrams: ch03(39), ch04(39), ch10(29), ch11a(46), ch11b(47), ch16(50)
  Total: 250 diagrams across 6 chapters

▌ EXAM COIN & GRADE SYSTEM
  90-100 → 500 coins  ⭐ Chapter Topper
  75-89  → 300 coins  🥈 Chapter Star
  60-74  → 175 coins  🥉 Chapter Pass
  40-59  →  75 coins  ✅ Cleared
  <40    →  20 coins  🔁 Try Again
  Bonuses: +50 first attempt pass | +75 improved score
           +100 all Section A correct | +150 zero wrong

▌ SYLLABUS PAGE
  EXAM_PATHS map: chId (integer) → /exam.html?ch=XX (ch17 now wired ✅)
  EXAM_DONE_KEYS map: chId → padded string (2→"02", 11→"11a", 112→"11b", 17→"17")
  isChapExamDone() uses EXAM_DONE_KEYS to match what exam.html writes
  Exam button states: locked (After Practice) / Start Exam (link) / Done·Retry (link)
  Topic Exam: shows Start Topic Exam link when all chapters done, Done·Retry when taken

▌ QUESTIONS.JS FOLDER MAP (updated Apr 26)
  "01"→ch01  "08"→ch01  "12"→ch01  "13"→ch01
  "02"→ch02  "09"→ch02  "14"→ch02
  "03"→ch03  "04"→ch03  "10"→ch03
  "05"→ch05
  "11a"→ch11  "11b"→ch11
  "15"→ch15
  "16"→ch16
  "17"→ch17  ← NEW

▌ ADMIN PANEL (rebuilt Apr 26)
  URL: /admin.html — password: rishi2025
  Theme: warm cream/white, bold dark text, amber accents (no black, no blue)
  6 tabs: Dashboard / Chapters / Topic Exams / Questions / Student / Logs
  Bypass toggle: top-right button, sets rishi_admin_bypass=1 in localStorage
  Topic Exams tab: open/reset each of 5 topic exams directly
  Questions tab: Seed ALL 17 chapters, seed individual, list KV keys
  Token for API: uses the password typed at login
  KV namespace: RISHI_QUESTIONS — ALL 17 CHAPTERS SEEDED ✅
  Cloudflare env vars: RISHI_ADMIN_TOKEN, ELEVENLABS_API_KEY,
                       ELEVENLABS_VOICE_ID, GEMINI_API_KEY (all set ✅)

▌ LOCALSTORAGE KEYS
  rishi_explain_done_{chId}           → "1"  (integer e.g. 2)
  rishi_practice_done_{chId}          → "1"  (integer e.g. 2)
  rishi_chapexam_done_{chIdStr}       → "1"  (padded e.g. "02", "11a", "17")
  rishi_exam_score_{chIdStr}          → score number
  rishi_exam_attempts_{chIdStr}       → attempt count
  rishi_topicexam_done_{topic}        → "1"  (e.g. "algebra")
  rishi_topicexam_score_{topic}       → score out of 60
  rishi_topicexam_attempts_{topic}    → attempt count
  rishi_coins                         → running total
  rishi_break_log                     → JSON array of breaks
  rishi_active_chapters               → JSON {chId: {startDate, targetDate}}
  rishi_current_student               → JSON {studentName, class, board, studentId}
  rishi_admin_bypass                  → "1" skips all gates
  rishi_explain_sessions              → JSON {chId: count}
  rishi_practice_sessions             → JSON {chId: count}

▌ EXPLANATION QUALITY STATUS
  DONE:    rational-numbers (Apr 24) — gold standard template
  PENDING: all other 15 chapters — rewrite one per session as Dabeet progresses
  NEXT SESSION PLAN (explain rewrite):
    Step 1 — Build explain-helper.js (shared "Explain Differently" engine using Gemini)
              Single file, injected into all 16 explain pages at once
              Button: "I didn't understand → Explain Differently"
              Gemini re-explains using a different approach (story/analogy/visual steps)
    Step 2 — Rewrite one chapter explain page per session, starting with
              whichever chapter Dabeet is currently studying
    Quality standard: match rational-numbers.html — clear steps, real examples,
              proper Indian student language, not textbook dry

▌ REMAINING WORK (updated 27 Apr 2026 night) — IN PRIORITY ORDER
  [DONE THIS SESSION — 27 Apr 2026]
  ✅ explain-helper.js — "I Don't Understand" button, method cycling, double-btn fix
  ✅ explain-differently.js — Gemini endpoint for re-teaching
  ✅ All 16 explain pages — RISHIKA everywhere, fresh confirm questions (different numbers),
     explain-helper.js injected, rishi-core.js in head (mensuration fix)
  ✅ Gemini model fixed to gemini-2.5-flash (v1beta)
  ✅ Sampurna Pariksha — sampurna-pariksha.html + syllabus.html wired
     50Q / 100 marks / 90 min / all 17 chapters / shuffle every attempt
     Gate: all 16 chapter exams done / coins 1000-50 / Gemini explain wrong answers

  [NEXT — P1]
  1. Presence & Resume System — rishi-presence.js (single injection, all 48 pages)

     FEATURES:
     a) TIMING SLOTS — parent sets allowed slots (9am-12pm etc.) in parent.html
        Student locked out outside slot. Active slot → green, else locked overlay.
     b) ONLINE/OFFLINE — heartbeat to localStorage every 30s.
        visibilitychange + beforeunload → offline immediately with timestamp.
        Parent dashboard: green dot (online) / grey + "X min ago" (offline).
     c) SESSION RESUME — on any page load, check if student was mid-session.
        Explain/Practice: resumes at last question index (already in localStorage).
        Exam: timer remaining seconds saved every 10s → restored on re-entry.
     d) REAL-TIME PARENT VIEW — parent-dashboard.html polls localStorage every 10s.
        Shows: current page, online/offline, active break, time in slot, full log.
        All events → rishi_presence_log JSON array (capped 200 entries).

     IMPLEMENTATION (localStorage only — no new server/DB/Cloudflare functions):
     - rishi-presence.js patches startTimer() on exam pages after load
     - Inject via extended inject-explain-helper.mjs into all 48 pages
     - parent-dashboard.html gets a new Presence panel

  [SOON — P2]
  2. YouTube video embed — Arindam picks 1 video per chapter,
     Claude wires "Watch Video" button in explain pages (no API, embed only)

  [SOON — P3]
  3. Practice pages — unverified since Apr 24, needs flow + voice + avatar check

  [FUTURE]
  4. Vedic Maths / Calculation Shortcuts mini-module
  5. OTP SMS reset — blocked on TRAI DLT registration
  6. Ch06, Ch07 (Squares, Cubes) — excluded from current build

▌ MULTI-CLASS / MULTI-BOARD EXPANSION PLAN (do after Class 8 CBSE complete)

  FOLDER ARCHITECTURE (target):
  public/
  ├── rishi-core.js, rishi-sync.js, rishi-presence.js, explain-helper.js, rishi-diagram.js
  ├── login.html, parent.html, parent-dashboard.html  (shared, board-agnostic)
  ├── cbse/
  │   ├── class6/  explain/ practice/ data/
  │   ├── class7/  explain/ practice/ data/
  │   └── class8/  (current content moves here)
  ├── icse/
  │   └── class8/  explain/ practice/ data/
  └── wbse/
      └── class8/  explain/ practice/ data/

  PARAMETERISATION (one-time, do before first clone):
  Add to every explain/practice/exam page:
    meta name rishi-board content cbse
    meta name rishi-class content 8
  All shared JS reads these at runtime. Zero rewrites when cloning.

  CLONE SCRIPT (clone-class.mjs):
  node clone-class.mjs --from cbse/class8 --to cbse/class7
  Does: copies all HTML, replaces chapter IDs/titles, clears QB steps/answers,
  updates meta tags, generates empty JSON bank files, outputs content checklist.

  EFFORT PER NEW CLASS:
  Architecture + clone script: 2 sessions (one-time only)
  Content (QB JSON + explain steps) per class: 8-10 sessions
  UI / engine / parent portal / coins: 100% reused, zero extra work

  BOARD DIFFERENCES (ICSE/WBSE):
  Same engine, different board flag, different chapter sequence.
  Only question JSON and chapter order differ. Everything else identical.

  RULE: Do NOT start expansion until Class 8 CBSE fully complete
  (Presence system + YouTube + Practice verification all done first).

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
  12. topic-exam.html explanation: shown AFTER full submission only, not during exam
*/
