# Security notes — DayForge v1.0

## Secrets

- `NEXT_PUBLIC_SUPABASE_URL` and the public `anon` / publishable key may be shipped to the client.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in the desktop app, `.env.local` committed to Git, installer, logs or screenshots.
- RLS is the boundary that makes a public Supabase client safe.

## Data model

Every domain table is scoped by `workspace_id`; policies check workspace membership in PostgreSQL. UI filters are not considered a security boundary.

## Sync model

v1.0 uses a workspace snapshot with last-write-wins behavior. It is appropriate for a single personal workspace and early testing. Do not use simultaneous edits on two computers as a conflict-resolution guarantee. Export a JSON backup before testing sync.

## Desktop distribution

Unsigned Windows installers can trigger SmartScreen because the publisher has no reputation. This is expected for private testing. Public release needs a trusted code-signing certificate and a clear update process.
