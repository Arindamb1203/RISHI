/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 6 May 2026
  (Class 9 fully complete incl. exams + topic exams + sampurna)
  (Class 7 explain + practice complete, exams not yet built)
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
  CRITICAL: git add . must be run from D:\rishi (NOT D:\rishi\public)
            functions\ folder is at repo root, not inside public\

▌ STACK
  Pure HTML / CSS / Vanilla JS — no frameworks, no React
  Works on low-end devices and budget Android phones
  No backend server — Cloudflare Pages Functions for API only

▌ GENERATOR SYSTEM (generate.py)
  Location: D:\rishi\public\generate.py
  Usage:    cd D:\rishi\public
            python generate.py data/class9/chapter-slug.json
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
  NOTE: If generator shows warnings on portal files but HTML was
        generated — portals may already be correct. Check before fixing.

▌ BATCH GENERATORS
  batch_generate.py     — generates explain+practice pages for a class
    Usage: python batch_generate.py --class 7 [--resume]
  batch_exam_generate.py — generates chapter exam JSONs for a class
    Usage: python batch_exam_generate.py [--resume]
    Currently supports Class 9 only. Rate limit: wait 20s between chapters.
    On 429 error: waits 65s and retries. Use --resume to skip already-built.

▌ FILE TREE (actual repo as of 6 May 2026)
  D:\rishi\
  |
  +---.github\workflows\                 AUTOMATED TESTING PIPELINE
  |       test.yml / test-explain.yml (Class8+9) / test-practice.yml (Class8+9)
  |       test-exam.yml / test-admin.yml / test-parent.yml (incl. syllabus) / test-landing.yml
  |
  +---functions\                        ROOT level — NOT inside public
  |   |   tts.js                        ElevenLabs TTS proxy
  |   \---api\
  |           admin.js
  |           questions.js              CLASS-AWARE: supports class 8 and 9
  |           explain.js
  |           explain-differently.js    maxOutputTokens:200, ~50 token prompt (250 TPM limit)
  |           deploy.js
  |
  +---public\
  |   |   admin.html                    7 tabs incl. Deploy tab
  |   |                                 Edit modal: white bg, Class 6/7/8/9 + Board dropdown
  |   |   exam.html                     CLASS-AWARE: reads ?ch= param, supports c9-XX keys
  |   |   topic-exam.html               CLASS-AWARE: reads ?topic=&class= params
  |   |   sampurna-pariksha.html        CLASS-AWARE: reads ?class= param
  |   |   login.html / register.html / landing.html / coming-soon.html
  |   |   parent.html                   CLASS-AWARE, 5 tabs + Live Status + Study Slots
  |   |                                 ⚡ Analytics tab → redirects to parent-dashboard.html
  |   |   parent-dashboard.html         Full analytics — RISHI light theme, fluorescent green borders
  |   |                                 Has referral banner (Tiranga/green), back button → parent.html
  |   |   rishi-core.js                 rishi_admin_bypass → sessionStorage only
  |   |   rishi-presence.js / rishi-sync.js / rishi-diagram.js
  |   |   explain-helper.js             "I Don't Understand" → /api/explain-differently
  |   |   syllabus.html                 CLASS-AWARE for 6,7,8,9
  |   |                                 Class 9 EXAM_PATHS filled ✅
  |   |                                 Topic exam + sampurna links pass ?class= param ✅
  |   |   generate.py                   CHAPTER GENERATOR
  |   |   batch_generate.py             BATCH EXPLAIN+PRACTICE GENERATOR
  |   |   batch_exam_generate.py        BATCH EXAM JSON GENERATOR (Class 9)
  |   |
  |   +---data\
  |   |   +---class8\                   16 practice QB JSONs (old format)
  |   |   +---class9\                   12 content JSONs (new format for generator) ALL ✅
  |   |   +---class7\                   8 content JSONs ✅
  |   |   +---class6\                   stubs only
  |   |   \---cbse\
  |   |       +---class8\              Exam JSONs ch01-ch17 ✅
  |   |       \---class9\              Exam JSONs ch01-ch12 ✅
  |   |           ch01/ ch02/ ch03/ ch04/ ch05/ ch06/
  |   |           ch07/ ch08/ ch09/ ch10/ ch11/ ch12/
  |   |
  |   +---explain\
  |   |   +---class8\                   16 pages ✅ all built
  |   |   +---class9\                   12 pages ✅ all built
  |   |   +---class7\                   8 pages ✅ all built
  |   |   \---class6\                   stubs only
  |   |
  |   +---practice\                     same structure
  |   |   +---class8\  ✅  class9\  ✅  class7\  ✅  class6\ stubs
  |   |
  |   +---images\rishika\sprites\
  |           celebrate.jpeg / disappointed-s1.jpeg / neutral-talking.png / praise.jpeg
  |
  \---icons\ icon-192.png / icon-512.png

▌ CLASS 9 — FULLY COMPLETE ✅
  Ch1  Real Numbers          (arithmetic)         exam: c9-01
  Ch2  Polynomials           (algebra)            exam: c9-02
  Ch3  Linear Equations      (algebra)            exam: c9-03
  Ch4  Coordinate Geometry   (coordinate-geometry) exam: c9-04
  Ch5  Euclid's Geometry     (geometry)           exam: c9-05
  Ch6  Lines and Angles      (geometry)           exam: c9-06
  Ch7  Triangles             (geometry)           exam: c9-07
  Ch8  Quadrilaterals        (geometry)           exam: c9-08
  Ch9  Circles               (geometry)           exam: c9-09
  Ch10 Heron's Formula       (mensuration)        exam: c9-10
  Ch11 Surface Areas & Vols  (mensuration)        exam: c9-11
  Ch12 Statistics            (data-handling)      exam: c9-12
  Topic exams: arithmetic, algebra, coord-geometry, geometry, mensuration, datahandling ✅
  Sampurna Pariksha: class-aware, gates on all 12 chapter exams ✅

▌ CLASS 8 — ALL 16 CHAPTERS COMPLETE ✅
  Chapters 6 & 7 (Squares/Cubes) deferred
  Exam keys: ch01-ch17 (with ch11a, ch11b for mensuration)
  Topic exams: algebra, geometry, mensuration, arithmetic, datahandling ✅
  Sampurna Pariksha: gates on all 17 chapter exams ✅

▌ CLASS 7 — EXPLAIN + PRACTICE COMPLETE ✅, EXAMS NOT YET BUILT
  Ch1 Large Numbers Around Us  (arithmetic)
  Ch2 Arithmetic Expressions   (arithmetic)
  Ch3 A Peek Beyond the Point  (arithmetic)
  Ch4 Expressions using Letter-Numbers (algebra)
  Ch5 Parallel and Intersecting Lines  (geometry)
  Ch6 Number Play              (arithmetic)
  Ch7 A Tale of Three Intersecting Lines (geometry)
  Ch8 Working with Fractions   (arithmetic)
  Exam keys: c7-01 to c7-08 (reserved, not yet built)

▌ CLASS 6 — NOT STARTED
  10 chapters defined in syllabus.html, all built:false

▌ EXAM KEY FORMAT
  Class 8: 01, 02, 03, 04, 05, 08, 09, 10, 11a, 11b, 12, 13, 14, 15, 16, 17
  Class 9: c9-01 to c9-12
  Class 7: c7-01 to c7-08 (reserved)
  Class 6: c6-01 to c6-10 (reserved)

▌ QUESTIONS.JS FOLDER MAP
  Class 8: grouped by topic (ch01 folder has ch01,ch08,ch12,ch13 etc.)
  Class 9: 1:1 mapping (ch01/ → ch01-exam.json, ch02/ → ch02-exam.json etc.)
  API: GET /api/questions?board=cbse&class=8&ch=01&type=exam

▌ MULTI-CLASS ARCHITECTURE
  Folder: explain/classX/topic/chapter.html
          practice/classX/topic/chapter.html
          data/classX/chapter.json
          data/cbse/classX/chXX/chXX-exam.json
  Meta tags on every page: rishi-board, rishi-class
  Admin bypass: sessionStorage only (not localStorage)
  generate.py marks built:true in all 3 portals automatically

▌ PORTAL STATUS
  Class 8: syllabus ✅  parent ✅  admin ✅
  Class 9: syllabus ✅  parent ✅  admin ✅
  Class 7: syllabus ✅ (3 of 8 built:true)  parent ✅  admin ✅

▌ AGENT-BASED TESTING
  Arindam has created agents to test pages automatically
  Manual testing not required — agents handle verification

▌ CHARACTERS
  Rishika — ALL pages. Turtle SVG bottom-left on explain pages.
             Sprite canvas on practice pages.
             "Rishika is by your side today!" (Rekha RETIRED)

▌ USER ID SYSTEM
  Student: {firstname}{class}{last3mobile}
  Parent:  {firstname}{last5mobile}
  Trial: 30 days from registration

▌ ELEVENLABS TTS
  Proxy: /tts via functions/tts.js
  Fallback: Browser TTS if ElevenLabs fails

▌ GEMINI API
  Model: gemini-2.5-flash
  URL:   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
  Key:   GEMINI_API_KEY (Cloudflare env var)
  explain-differently.js: maxOutputTokens:200 (fits 250 TPM free tier)

▌ EXPLAIN PAGE FLOW
  initVoices → startLesson → showQ → startAnim → beginSteps → showConfirm
  explain-helper.js adds "I Don't Understand" → /api/explain-differently

▌ PRACTICE PAGE FLOW
  CHAP_ID = chapter number (1-based per class)
  15 questions, 5-streak unlocks exam
  Coins: +5 per correct first attempt
  Rishika sprite canvas (celebrate/praise/disappointed/talking)

▌ QUESTION BANK SOURCES
  NCERT, NCERT Exemplar, RD Sharma, RS Aggarwal,
  CBSE Past Papers (10yr), Olympiad (IMO/MOF/ISMO), CBSE Sample Papers (2yr)

▌ REFERRAL SYSTEM (built 4 May 2026)
  parent-dashboard.html — referral banner with fluorescent green border
  Referral link: https://rishi-ewh.pages.dev/landing.html?ref=PARENTID
  D1 table: rishi_referrals (ref_by, referred_username, registered_at, subscription_credited)
  D1 actions: log-referral, get-referrals, credit-referral (payment stub)
  register.html reads ?ref= on load → fires log-referral silently on registration
  Unlimited stacking — each referral = 1 free month
  credit-referral: wire to payment gateway when available

▌ LOGIN PAGE (login.html)
  "Pin on Home Page" button — shown only when ?role=parent in URL
  Android: native beforeinstallprompt PWA install
  iOS: shows step-by-step Share → Add to Home Screen tip
  Parent app appears as R on home screen

▌ REGISTER PAGE (register.html)
  Success modal — two sections: Student (gold) + Parent (sage/green)
  Student instructions: use Laptop/Desktop, bookmark the link
  Parent instructions: use Mobile, tap Pin on Home Page, app appears as R
  Copy Link buttons for both student and parent links
  D1 URL fixed: /d1-sync (was /functions/d1-sync)

▌ LANDING PAGE (landing.html)
  arindam.mp3 father voice — file at D:\rishi\public\arindam.mp3
  CRITICAL: arindam.mp3 must be committed to git (was in dist\ not public\)
  System requirements popup: auto-shows on r5 section after 1 second
  Student: Laptop/Desktop + headphones + internet
  Parent: Mobile (Android or iPhone) + internet
  Close X + "Got It — Let's Begin" button → /register.html

▌ REMAINING WORK — PRIORITY ORDER
  [DONE] Class 9 — fully complete ✅
  [DONE] Class 7 — explain + practice ✅
  [NEXT] Class 7 — chapter exams (8 JSONs, manual or batch)
  [THEN] Class 7 — topic exams + sampurna (need exam JSONs first)
  [THEN] Class 6 — 10 chapters (explain + practice + exams)
  [THEN] ICSE Class 8 → WBBSE Class 8
  [PENDING] Payment gateway → wire credit-referral in d1-sync.js

▌ CLASS 7 CHAPTER MAP (Ganita Prakash, new NCERT 2025-26)
  Arithmetic: Large Numbers Around Us, Arithmetic Expressions,
              A Peek Beyond the Point, Number Play, Working with Fractions
  Algebra:    Expressions using Letter-Numbers
  Geometry:   Parallel and Intersecting Lines
               A Tale of Three Intersecting Lines

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
  6. Smart apostrophes in JS = syntax crash. Use \' or &#39;
  7. tts.js at repo ROOT functions\tts.js — NOT inside public\
  8. Do things simply — never overcomplicate
  9. rishi_admin_bypass in sessionStorage — never change this
  10. generate.py handles portal updates automatically
  11. NEVER ask Arindam to edit code manually — deliver complete files
  12. Build order: content JSON → run generate.py → git push
  13. data-handling folder uses hyphen (not underscore)
  14. Topic folder for Statistics: data-handling
  15. RISHI theme is LIGHT — cream bg (#fdf6ec), warm white cards (#fffdf8),
      charcoal text (#2a2218), gold accents. NO DARK BACKGROUNDS EVER.
*/
