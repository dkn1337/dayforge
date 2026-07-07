# DayForge v1.0

DayForge to desktopowy workspace do zarządzania zadaniami, czasem, nawykami i skupieniem. Działa lokalnie bez konta, a po konfiguracji Supabase synchronizuje workspace między komputerami.

## Funkcje

- projekty, zadania, priorytety, wyszukiwarka i statusy;
- planer tygodniowy z blokami czasu i przeciąganiem;
- nawyki, cele tygodniowe oraz streaki;
- Focus/Pomodoro odporny na odświeżenie;
- dashboard, ocena dnia, wykresy i heatmapa;
- backup/import JSON;
- opcjonalne konto DayForge Cloud przez Supabase;
- aplikacja Windows budowana przez Tauri.

## Start lokalny

```powershell
npm install
npm run tauri:dev
```

Aby uruchomić tylko frontend w przeglądarce:

```powershell
npm run dev
```

## Kontrola jakości

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Pełny zestaw:

```powershell
npm run check
```

## Instalator Windows

```powershell
npm run tauri:build
```

Instalator pojawi się w `src-tauri/target/release/bundle/`.

## Włączenie synchronizacji chmurowej

1. Wykonaj SQL z `supabase/migrations/20260706_dayforge_v1.sql`.
2. Skopiuj `.env.example` do `.env.local`.
3. Wklej Project URL i publiczny anon/publishable key Supabase.
4. Zrestartuj aplikację.

Dokładna instrukcja: `docs/SUPABASE_SETUP.md`.

## Ważne

- Nie dodawaj `.env.local` do Git.
- Nie używaj `SUPABASE_SERVICE_ROLE_KEY` w aplikacji desktopowej.
- Przed pierwszą synchronizacją wykonaj backup JSON w Ustawieniach.

## Foldery

```text
app/                    widoki i routing Next.js
components/             UI, store, auth oraz moduły produktu
lib/                    analityka, daty i Supabase client
supabase/migrations/    schema bazy i RLS
tests/                  testy logiki
src-tauri/              warstwa desktopowa Windows
```
