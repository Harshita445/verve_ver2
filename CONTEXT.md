
# Verve — Canonical Repository Status

Last verified: direct inspection of every backend and frontend source file in
this repository (not inferred, not carried over from prior notes). Anything
not listed here as "Implemented" does not exist in the codebase.

## 1. Backend — Implemented

### Carried over from previous sessions
- Auth API: signup, login, refresh, logout, forgot-password, reset-password
- `GET /api/v1/users/me`
- Practice sessions: create, get-by-id (no list/update/delete/lifecycle)
- Refresh-token rotation with reuse detection

### Done this session — UserProfile + onboarding
- **`app/models/user_profile.py`** (new) — `UserProfile` model with bio, job_title,
  company, communication_goals fields, linked 1:1 to User.
- **`app/models/user.py`** — added `onboarding_completed` (bool) and
  `onboarding_step` (int) columns.
- **`app/schemas/profile.py`** (new) — `ProfileRead`, `ProfileUpdate`, `OnboardingUpdate` schemas.
- **`app/schemas/auth.py`** — `UserOut` now exposes `onboarding_completed` and `onboarding_step`.
- **`app/services/profile_service.py`** (new) — `get_or_create_profile`, `update_profile`, `complete_onboarding`.
- **`app/api/v1/profile.py`** (new) — `GET /profile`, `PUT /profile`, `POST /profile/onboarding`.
- **`app/api/v1/router.py`** — registered profile router.
- **`alembic/env.py`** — registered `user_profile` model for autogenerate.
- **`alembic/versions/d3c4e5f6a7b8_add_onboarding_fields_and_user_profiles.py`** (new) — migration.

## 2. Frontend — Implemented

### Carried over from previous sessions
- `app/api/health/route.ts` — trivial local health check
- AuthForm, AuthProvider, apiFetch, middleware (all from prior auth integration)

### Done this session — landing page redesign
- **`components/landing/StageIllustration.tsx`** (new) — animated SVG stage with
  podium, speaker silhouette, and soft spotlight glow.
- **`components/landing/ModeIcons.tsx`** (new) — SVG icon components for each training mode.
- **`components/landing/ModeCard.tsx`** — rebuilt with Framer Motion hover/scroll
  animations, gold border on hover, soft shadow glow.
- **`app/page.tsx`** — full redesign: hero section with stage illustration + copy,
  training modes grid (4 premium cards), "How It Works" timeline, CTA section,
  and footer. Matches the detailed design spec.
- **`components/shared/Nav.tsx`** (new) — fixed top nav with branding,
  auth-aware links (sign in / get started vs dashboard + name).
- **`app/layout.tsx`** — added Nav component, pt-16 offset for fixed nav.

### Done this session — auth pages redesign
- **`components/auth/AuthForm.tsx`** — redesigned with design system colors,
  labels, proper inputs with focus states, gold buttons, error display,
  shadow-soft card, animated entry via Framer Motion.
- **`app/login/page.tsx`** — centered layout.
- **`app/signup/page.tsx`** — centered layout.

### Done this session — onboarding flow
- **`app/onboarding/page.tsx`** (new) — 4-step onboarding wizard: Welcome,
  About You (job title, company, bio), Your Goals, You're Ready. Persists
  profile data via `PUT /profile`, marks onboarding complete via
  `POST /profile/onboarding`, redirects to `/dashboard`.

### Done this session — real dashboard
- **`app/dashboard/page.tsx`** — real dashboard replacing the placeholder:
  welcome message, current rating card, session count card, streak card,
  quick-start grid with 4 training modes, empty-state for no sessions.
  Redirects to `/onboarding` if user hasn't completed onboarding.

### Done this session — middleware + API client updates
- **`middleware.ts`** — now protects `/onboarding` and `/training` in addition to `/dashboard`.
- **`lib/api/client.ts`** — added `UserProfile`, `ProfileUpdatePayload`,
  `OnboardingUpdatePayload` types; added `getProfile`, `updateProfile`,
  `updateOnboarding` API methods.

## 3. Accurate Summary Table

| Area | Status |
|---|---|
| Signup / Login / Logout / Refresh / Forgot / Reset (backend) | Implemented |
| Refresh token rotation + reuse detection | Implemented |
| GET /users/me | Implemented |
| User onboarding fields on User model | Implemented |
| UserProfile model + endpoints (GET/PUT /profile) | Implemented |
| Onboarding UI (4-step wizard) | Implemented |
| Dashboard UI (rating, session count, streak, quick-start) | Implemented |
| Practice session create + get-by-id | Implemented (minimal) |
| Practice session list / update / delete / lifecycle | Not implemented |
| Landing page hero with stage SVG | Implemented |
| Training modes section | Implemented |
| Auth pages with design system styling | Implemented |
| Automated tests | None exist |
| Email delivery for password reset | Not implemented (dev-mode console log only) |
| Recording / audio upload / AI evaluation | Not started |
| Curtain transition animation | Not started |
| Recording experience (waveform, controls) | Not started |
| Feedback page | Not started |
| Progress page + radar chart | Not started |
| Leaderboard / rankings | Not started |

## 4. Recommended Build Order (next work, in dependency order)

1. Practice session lifecycle — listing endpoint, state-transition endpoints
   (recording -> processing -> complete/failed), scoring fields.
2. Training mode selection page + setup screen (prep/speak time config).
3. Curtain sequence (Framer Motion) wired to session-creation call.
4. Recording screen: MediaRecorder + wavesurfer.js waveform, stop/pause/resume.
5. Storage integration: signed upload URL, direct-to-bucket upload.
6. Background worker skeleton with stubbed job.
7. Whisper + transcription inside worker.
8. Feedback engine (OpenAI + Pydantic-scored JSON).
9. Rating service (ELO math) wired to session completion.
10. Feedback page (rating reveal, skill breakdown, transcript review).
11. Progress page + radar chart + streak tracker.
12. Leaderboard / rankings page.
13. Email delivery for password reset (SMTP integration).
14. Full error/loading/empty state pass across every screen.
15. Accessibility + mobile recording QA pass.

## Source of Truth Rule
This repository is the only repository that should be modified going
forward. All future milestones must extend existing code and update this
document — and any claim in it must be checked against the actual files,
not carried over from a prior draft.
