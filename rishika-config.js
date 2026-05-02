/*
═══════════════════════════════════════════════════════════════
  RISHIKA CONFIG — Paste this entire file at the start of
  every new Claude session to restore full project context.
  Last updated: 2 May 2026 — evening
  (Class 9 all 12 chapters complete, generate.py built)
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

▌ FILE TREE (actual repo as of 2 May 2026)
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
  |           questions.js
  |           explain.js
  |           explain-differently.js    maxOutputTokens:200, ~50 token prompt (250 TPM limit)
  |           deploy.js
  |
  +---public\
  |   |   admin.html                    7 tabs incl. Deploy tab
  |   |                                 Edit modal: white bg, Class 6/7/8/9 + Board dropdown
  |   |   exam.html / topic-exam.html / sampurna-pariksha.html
  |   |   login.html / register.html / landing.html / coming-soon.html
  |   |   parent.html                   CLASS-AWARE, 5 tabs + Live Status + Study Slots
  |   |   parent-dashboard.html
  |   |   rishi-core.js                 rishi_admin_bypass → sessionStorage only
  |   |   rishi-presence.js / rishi-sync.js / rishi-diagram.js
  |   |   explain-helper.js             "I Don't Understand" → /api/explain-differently
  |   |   syllabus.html                 CLASS-AWARE for 6,7,8,9
  |   |   generate.py                   CHAPTER GENERATOR
  |   |
  |   +---data\
  |   |   +---class8\                   16 practice QB JSONs (old format)
  |   |   +---class9\                   12 content JSONs (new format for generator) ALL ✅
  |   |   +---class7\                   stubs only
  |   |   +---class6\                   stubs only
  |   |   \---cbse\class8\              Exam JSONs ch01-ch17
  |   |
  |   +---explain\
  |   |   +---class8\                   16 pages ✅ all built
  |   |   +---class9\                   12 pages ✅ all built
  |   |   +---class7\                   stubs only
  |   |   \---class6\                   stubs only
  |   |
  |   +---practice\                     same structure, all ✅
  |   |
  |   +---images\rishika\sprites\
  |           celebrate.jpeg / disappointed-s1.jpeg / neutral-talking.png / praise.jpeg
  |
  \---icons\ icon-192.png / icon-512.png

▌ CLASS 9 — ALL 12 CHAPTERS COMPLETE ✅
  Ch1  Real Numbers          (arithmetic)
  Ch2  Polynomials           (algebra)
  Ch3  Linear Equations in Two Variables (algebra)
  Ch4  Coordinate Geometry   (coordinate-geometry)
  Ch5  Euclid's Geometry     (geometry)
  Ch6  Lines and Angles      (geometry)
  Ch7  Triangles             (geometry)
  Ch8  Quadrilaterals        (geometry)
  Ch9  Circles               (geometry)
  Ch10 Heron's Formula       (mensuration)
  Ch11 Surface Areas & Vols  (mensuration)
  Ch12 Statistics            (data-handling)

▌ CLASS 8 — ALL 16 CHAPTERS COMPLETE ✅
  Chapters 6 & 7 (Squares/Cubes) deferred

▌ MULTI-CLASS ARCHITECTURE
  Folder: explain/classX/topic/chapter.html
          practice/classX/topic/chapter.html
          data/classX/chapter.json
  Meta tags on every page: rishi-board, rishi-class
  Admin bypass: sessionStorage only (not localStorage)
  generate.py marks built:true in all 3 portals automatically

▌ PORTAL STATUS — CLASS 9
  syllabus.html: all 12 chapters built:true ✅
  parent.html:   explainBuilt {1:1,2:1,...,12:1} ✅
  admin.html:    all 12 chapters built:true ✅

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

▌ REMAINING WORK — PRIORITY ORDER
  [DONE] Class 9 — all 12 chapters ✅
  [NEXT] Class 7 — 8 chapters (Ganita Prakash new NCERT 2025-26)
  [THEN] Class 6 — 10 chapters (new NCERT 2025-26)
  [THEN] ICSE Class 8 → WBBSE Class 8

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
*/
