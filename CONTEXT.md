# RISHI — Project Context

## What is RISHI?
RISHI is an AI-powered mathematics tutoring platform for Indian school students (CBSE and ICSE boards, Classes 6–9). It provides chapter-wise explain pages, practice problems with an AI tutor avatar (Rishika), and chapter/topic exams with instant feedback.

**Owner:** Arindam Bhowmik  
**Live URL:** https://rishi-ewh.pages.dev  
**Repo:** https://github.com/Arindamb1203/RISHI  
**Pricing:** ₹599/month flat

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Pure HTML / CSS / Vanilla JS — no frameworks |
| Hosting | Cloudflare Pages (auto-deploy on git push, ~30s) |
| Database | Cloudflare D1 (student accounts, logs, progress) |
| Question Store | Cloudflare KV (`RISHI_QUESTIONS` binding) |
| AI | OpenAI gpt-4.1-mini via `OPENAI_API_KEY` |
| TTS | ElevenLabs (proxy via `functions/tts.js`) + browser speechSynthesis fallback |
| Build scripts | Python (in `public/`) |

---

## Content Status (as of 27 May 2026)

| Class | Board | Explain + Practice | Chapter Exams (KV) |
|-------|-------|-------------------|-------------------|
| Class 6 | CBSE | 10 chapters ✓ | Done ✓ |
| Class 7 | CBSE | 8 chapters ✓ | Done ✓ |
| Class 8 | CBSE | 16 chapters ✓ (Ch6 Squares, Ch7 Cubes deferred) | Done ✓ |
| Class 9 | CBSE | 12 chapters ✓ | Done ✓ |
| Class 6 | ICSE | 28 chapters ✓ | Done ✓ (all 28 in KV) |
| Class 7 | ICSE | 22 chapters ✓ | Done ✓ |
| Class 8 | ICSE | 21 chapters ✓ | Done ✓ |
| Class 9 | ICSE | 20 chapters ✓ | Done ✓ |

**Deferred (intentional):** CBSE 8 Ch6 (Squares & Square Roots) and Ch7 (Cubes & Cube Roots) — no build script exists for CBSE 8, marked `built:false` in admin.

---

## File Structure

```
D:\rishi\                          ← repo root (git push from here)
├── public\                        ← Cloudflare Pages build output
│   ├── admin.html                 ← Admin dashboard
│   ├── syllabus.html              ← Chapter list (class-aware, CBSE + ICSE)
│   ├── parent.html                ← Parent portal (2700+ lines)
│   ├── register.html              ← Registration + payment
│   ├── exam.html                  ← Chapter exams (no avatar)
│   ├── topic-exam.html            ← Topic-wise exams
│   ├── sampurna-pariksha.html     ← Full syllabus exam
│   ├── rishi-core.js              ← Shared logic, bypass detection, error/break logging
│   ├── rishi-sync.js              ← Syncs localStorage keys to D1
│   ├── rishi-presence.js          ← Session resume for explain + practice pages
│   ├── explain\                   ← Explain pages
│   │   ├── class6\ .. class9\    ← CBSE
│   │   └── icse\class6\ ..9\     ← ICSE
│   ├── practice\                  ← Practice pages (137 total)
│   │   ├── class6\ .. class9\    ← CBSE
│   │   └── icse\class6\ ..9\     ← ICSE
│   ├── data\                      ← Question bank JSONs
│   │   ├── cbse\class6..9\chXX\  ← Chapter exam JSONs
│   │   └── icse\class6..9\chXX\  ← ICSE chapter exam JSONs
│   └── images\rishika\sprites\    ← Avatar images
└── functions\                     ← Cloudflare Pages Functions (serverless)
    ├── tts.js                     ← ElevenLabs TTS proxy
    └── api\
        ├── admin.js               ← Admin auth
        ├── questions.js           ← KV question fetch
        ├── explain.js             ← AI explain generation
        ├── generate-questions.js  ← AI question generation
        ├── d1-sync.js             ← D1 database operations
        ├── fix-error.js           ← AI error diagnosis
        └── deploy.js
```

---

## Key Architecture

### Class Keys
| Board | Class | Key used in code | Progress prefix |
|-------|-------|-----------------|----------------|
| CBSE | 6–9 | `6`, `7`, `8`, `9` | (empty) |
| ICSE | 6–9 | `'ic6'`, `'ic7'`, `'ic8'`, `'ic9'` | `ic6_`, `ic7_`, etc. |

### KV Key Format
`{board}_{class}_ch{chId}_{tag}` — e.g. `icse_6_ch07_chapter_exam`, `cbse_7_ch03_chapter_exam`

### D1 Actions (d1-sync.js)
`set`, `get`, `register`, `find-account`, `find-by-mobile`, `save-pw`, `update-profile`, `list_all`, `get_logs`, `store-admin-code`, `store-referral`, `validate-referral`, `redeem-referral`

### Bypass System
- Key: `rishi_admin_bypass` — **sessionStorage only** (never localStorage)
- Admin `openPage()` appends `?bypass=1` → `rishi-core.js` detects → sets sessionStorage
- Allows admin to view student pages without plan/progress checks

### Rishika Avatar (practice pages)
- Images: `Good Morning.png`, `Observing.png`, `Naughty.png`, `Celebrating.png`, `Angry.png`
- Behaviour: page load → Good Morning (4s) → Observing; correct → Celebrating (3s); wrong → Naughty (3s); 5-min break → Angry (6s)
- TTS: browser `speechSynthesis`, female voice, pitch 1.15
- **exam.html has NO avatar** (removed 24 May 2026)

### Exam Pages
- `exam.html` — chapter exams, 2-column layout, no avatar, loads questions from KV
- `topic-exam.html` — reads `board` from URL params only
- `sampurna-pariksha.html` — reads `board` from URL params only

---

## Admin Panel
**URL:** /admin  **Password:** rishi2025

**Tabs:** Dashboard | Exams | Questions | Student | Logs | Deploy | Users

- **Board toggle:** CBSE / ICSE → then class 6/7/8/9
- **Questions tab:** Generate / view / delete KV question banks per chapter
- **Student tab:** Pick any registered student → view progress → open their pages as that student
- **Users tab:** All registered students table with direct Explain/Practice/Exam open buttons
- **Logs tab:** Break log + JS error log fetched from D1, with AI Fix button per error

---

## Test Accounts
| Role | Name | ID | Password |
|------|------|----|---------|
| Student | Dabeet Bhowmik | `RISHI-DABEET-001` | — |
| Parent | Priyanka | `PARENT-PRIYANKA-002` | `rishi2025` |
| Admin | — | — | `rishi2025` |

---

## Build Scripts (run from `public\`, need `OPENAI_API_KEY`)
| Script | Class | Notes |
|--------|-------|-------|
| `build_class6.py` | CBSE 6 | — |
| `build_icse_class6.py` | ICSE 6 | 5 parallel workers |
| `build_icse_class7.py` | ICSE 7 | Sequential |
| `build_icse_class8.py` | ICSE 8 | 5 parallel workers |
| `build_icse_class9.py` | ICSE 9 | 5 parallel workers |

Individual chapter: `python build_icse_classX.py --chapter chapter-slug --skip-explain --skip-practice`
