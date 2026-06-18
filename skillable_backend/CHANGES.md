# SkillAble Accessibility Fixes — Implementation Guide

## Files Changed

```
skillAble_frontend/src/App.jsx                                ← REPLACE
skillAble_frontend/src/pages/InterviewRoom.jsx                ← REPLACE
skillAble_frontend/src/pages/BrowseJobs.jsx                   ← REPLACE
skillAble_frontend/src/components/accessibility/VoiceNavigationButton.jsx  ← REPLACE
accessibility/views.py                                        ← REPLACE
interviews/consumers.py                                       ← REPLACE
```

---

## 1. Interview Room — Deaf Candidate Fixes

### Problems Fixed
| Problem | Root Cause | Fix |
|---|---|---|
| Sign language not converted to voice/text | MediaPipe landmarks never actually sent to backend (interval was commented out) | Landmarks now sent every 600ms via WebSocket `sign_data` message |
| `employer_user` scope bug | `employer_user` was referenced inside `connect()` before it was defined in `check_access()` | `check_access()` now returns a dict with both user IDs, stored as instance attributes |
| Interviewer speech not shown as captions | Speech recognition ran locally but result was never actually sent to WS or displayed | Employer STT now sends `speech_text` over WS; all clients receive and show it as captions |
| Sign results not voiced to interviewer | `sign_result` handler called TTS but checked wrong condition | Corrected: when sign result `sender_id` ≠ current user, speak it |
| No MediaPipe drawing utilities | Only dots were drawn; connections not rendered | Dynamically loads `drawConnectors` and `HAND_CONNECTIONS` from MediaPipe CDN |

### How It Works Now (Deaf Candidate Flow)
1. Deaf candidate joins → **Sign Language mode auto-enables**
2. MediaPipe Hands detects hand landmarks from webcam
3. Every 600ms, landmarks sent via WebSocket → Django `consumers.py` → AI microservice `/predict`
4. Prediction result (`gesture`, `text`, `confidence`) broadcast to **entire group**
5. All participants see the large sign overlay card
6. **Interviewer hears it via TTS** — `speak("signed: hello")`
7. Caption history panel in chat records the sign translation

### How It Works Now (Interviewer Speech → Deaf Candidate)
1. Interviewer (EMPLOYER role) has **Captions** auto-started
2. Browser `SpeechRecognition` listens continuously
3. Final transcripts sent via WebSocket `speech_text` message
4. All participants receive it → **live caption bar** appears at bottom of video
5. Deaf candidate can also see the **caption history panel** in the chat sidebar

---

## 2. Voice Navigation (Blind User) — Full Overhaul

### Problems Fixed
| Problem | Fix |
|---|---|
| `read_aloud` only read `h1` text | Now scans all semantic elements: headings, paragraphs, list items, labels, buttons, job cards — in DOM order |
| Filter commands never reached `BrowseJobs` component | Added custom DOM events: `voice:filter_jobs`, `voice:search_jobs`, `voice:apply_job` that `BrowseJobs` listens to |
| Voice not auto-enabled for blind users | `App.jsx` syncs `disabilityType === 'BLIND'` to accessibility store, auto-enables voice navigation |
| Page changes not announced | Location listener in `VoiceNavigationButton` announces each route change for blind users |
| `apply_job` did nothing useful | Now navigates to job list filtered by title, dispatches `voice:apply_job` event, `BrowseJobs` finds matching job |
| No visual feedback during processing | Status bubble shows interim transcript and processing state |
| Commands often failed silently | Robust client-side fallback NLP if backend API is unreachable |

### Supported Voice Commands (say "Hello Bandhu …" then any of these)
```
Navigation
  "go to jobs"               → /jobs
  "go to dashboard"          → /dashboard
  "open resume"              → /resumes
  "view my applications"     → /applications
  "open resources"           → /resources
  "open accessibility settings" → /accessibility
  "go back"                  → navigate(-1)

Job Search
  "search Python developer jobs"
  "find remote React jobs"
  "show full-time engineering positions"
  "browse jobs in Delhi"

Job Filters
  "show remote jobs"         → filter job_type=REMOTE
  "filter full time jobs"    → filter job_type=FULL_TIME
  "show accessibility friendly jobs" → filter is_accessibility_friendly=true
  "jobs near Mumbai"         → filter location=Mumbai

Apply
  "apply for Software Engineer"  → searches + navigates to matching job

Read Aloud
  "read aloud"               → reads ALL page text in order
  "read the page"
  "read screen"

Deactivate
  "stop listening" / "goodbye"
```

### Quick access button
A **Volume2** button (🔊) is always visible in the bottom-right corner — clicking it immediately reads the page aloud, no wake word needed.

### Keyboard shortcut
**Alt+V** toggles the microphone on/off.

---

## 3. BrowseJobs — Voice Event Listeners

`BrowseJobs.jsx` now listens to three window events:

```js
window.addEventListener('voice:filter_jobs',  handler)  // applies filter object to state
window.addEventListener('voice:search_jobs',  handler)  // updates search query
window.addEventListener('voice:apply_job',    handler)  // finds job + navigates
```

These are emitted by `VoiceNavigationButton` after the backend returns an action.

A **live announcement bar** appears at the top when a voice filter is applied, and the SR-only `role="status"` region keeps screen readers informed.

---

## 4. App.jsx — AccessibilitySync Component

New `<AccessibilitySync />` component:
- Runs on user login
- If `user.disabilityType === 'BLIND'` → auto-enables `voiceNavigation`
- If `user.disabilityType === 'DEAF'` → auto-enables `signLanguageSupport`
- Welcomes blind users with a spoken greeting on first load

---

## 5. Backend — accessibility/views.py

Enhanced `resolve_command()`:
- Added: `apply for [title]` regex → `apply_job` action
- Added: `resume`, `accessibility settings`, `interview` navigation
- Added: contract/freelance job type filter
- Added: location-based filter ("jobs near Delhi")
- Improved: search query extraction strips noise words properly
- Better fallback message that lists example commands

---

## Setup / Deployment Notes

### MediaPipe (Sign Language)
The frontend dynamically loads MediaPipe Hands from CDN:
```
https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js
```
No npm install needed. Requires HTTPS (or localhost) for webcam access.

### Django Channels (WebSocket)
`consumers.py` requires `channels` and `channels_redis`. The `check_access()` bug fix is critical — the old code referenced `employer_user` before it existed in scope, causing `NameError` on every connection.

### CORS / WebSocket origin
Ensure `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in `settings.py` include your frontend origin.

### AI Sign Language Service
The `AI_SIGN_LANGUAGE_URL` setting must point to a running `/predict` endpoint. Until it's live, the consumer gracefully returns empty results without crashing.
