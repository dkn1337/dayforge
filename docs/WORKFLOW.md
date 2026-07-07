# DayForge — workflow pracy

## Codzienny start

```powershell
npm run tauri:dev
```

## Przed większą zmianą

```powershell
git status
git add .
git commit -m "opis zmiany"
```

## Kontrola jakości przed wydaniem

```powershell
npm run check
npm run tauri:build
```

## Zasada etapów

1. Jedna faza = jeden zakres produktu.
2. Po fazie: test ręczny, kontrola jakości, commit.
3. Nie wdrażaj Supabase, planera, billingów i UI w tym samym kroku.
4. Klucze i sekrety istnieją wyłącznie w `.env.local`, nigdy w repozytorium.
