# DayForge v1.0 — master checklist

## Desktop core

- [x] Next.js + React + TypeScript strict
- [x] Premium desktop UI, responsive sidebar and mobile behavior
- [x] Tauri 2 wrapper with NSIS/MSI build configuration
- [x] Local-first storage and recovery after app restart
- [x] Projects, tasks, priorities, filters and search
- [x] Weekly planner with block CRUD and drag & drop
- [x] Habits, weekly targets and real streaks
- [x] Focus / Pomodoro with persisted timer state
- [x] Dashboard, transparent score, charts and heatmap

## DayForge Cloud

- [x] Auth screens: registration, sign in, sign out and password-reset request
- [x] Profile display name stored locally or in Supabase
- [x] `.env.example` and Supabase browser client
- [x] SQL migration for profiles, workspaces, relational domain tables and RLS
- [x] Personal workspace trigger on registration
- [x] Snapshot sync for the full workspace state after sign-in
- [x] Local fallback if Supabase has not been configured
- [ ] Create the real Supabase project and run the included migration (requires your Supabase account)
- [ ] Test one account on two computers

## v1.0 quality

- [x] Lint, TypeScript, production static build and unit tests
- [x] Error, loading, empty and offline/cloud status states
- [x] JSON export/import and controlled local reset
- [x] `/welcome` product landing page
- [x] Tauri CSP is no longer disabled
- [x] README, security/setup docs and release checklist
- [ ] Build and test the final Windows installer locally
- [ ] Create private GitHub repository
- [ ] Configure password-reset URL / desktop deep-link before public launch
- [ ] Code-sign Windows installer before public launch

## After v1.0

- [ ] Stripe Free/Pro billing
- [ ] Record-level Supabase sync + realtime conflict policy
- [ ] Team workspaces and invitations
- [ ] Google Calendar integration
- [ ] AI planning assistant
