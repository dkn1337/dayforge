# DayForge v1.0 — release checklist

## Lokalny test core

- [ ] Utwórz projekt, zadanie oraz blok w plannerze.
- [ ] Zamknij aplikację i otwórz ją ponownie.
- [ ] Oznacz wykonanie nawyku na kilku dniach.
- [ ] Uruchom minutową sesję focus, odśwież aplikację i zakończ sesję.
- [ ] Sprawdź dashboard oraz analitykę.
- [ ] Pobierz backup JSON.
- [ ] Przywróć backup w kopii aplikacji.

## Test cloud

- [ ] Wgraj migrację SQL do nowego projektu Supabase.
- [ ] Dodaj `.env.local` z publicznymi wartościami.
- [ ] Załóż konto.
- [ ] Sprawdź workspace w aplikacji.
- [ ] Dodaj dane na komputerze A.
- [ ] Zaloguj się na komputerze B i sprawdź, czy dane się pojawiają.
- [ ] W Supabase Table Editor potwierdź istnienie `workspace_state_snapshots`.
- [ ] Przetestuj wylogowanie i ponowne zalogowanie.

## Quality gate

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npm run tauri:build
```

## Przed publicznym wydaniem

- [ ] Stwórz politykę prywatności i regulamin.
- [ ] Skonfiguruj prawdziwy adres resetu hasła / deep-link.
- [ ] Podpisz instalator Windows certyfikatem code-signing, aby ograniczyć ostrzeżenia SmartScreen.
- [ ] Włącz backupy projektu Supabase.
- [ ] Utwórz prywatne repo GitHub i dodaj `.env.local` wyłącznie lokalnie.
