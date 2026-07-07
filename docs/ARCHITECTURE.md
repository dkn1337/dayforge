# Architektura DayForge v1.0

```text
Next.js + React       interfejs, routing, komponenty
Tauri + Rust          natywne okno Windows i instalator
LocalStorage          tryb offline i lokalny backup
Supabase Auth         rejestracja i logowanie e-mail/hasło
PostgreSQL + RLS       prywatność danych i workspace
Snapshot sync         bezpieczna synchronizacja całego stanu v1.0
```

## Główne granice odpowiedzialności

- `components/` — interfejs i zachowania użytkownika.
- `components/providers/dayforge-store-provider.tsx` — stan domeny, offline persistence oraz cloud-sync.
- `components/providers/auth-provider.tsx` — sesja użytkownika, profil i status chmury.
- `lib/analytics.ts` — czyste funkcje do streaków, KPI i oceny dnia.
- `supabase/migrations/` — jedyne źródło prawdy dla struktury bazy i RLS.

## Ocena dnia

DayForge nie generuje pustej oceny. Wynik 0–100 korzysta z realnej aktywności:

- 40%: wykonanie zaplanowanych zadań,
- 35%: czas focus względem minimum godziny lub zaplanowanych bloków deep work,
- 25%: wykonane nawyki.

Brak danych daje zero dla danej składowej, zamiast sztucznego wyniku.
