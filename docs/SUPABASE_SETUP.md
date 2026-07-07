# DayForge Cloud — konfiguracja Supabase

DayForge v1.0 działa od razu lokalnie. Chmura jest opcjonalna: po jej podłączeniu konto synchronizuje cały workspace między komputerami.

## 1. Utwórz projekt

1. Otwórz Supabase Dashboard i utwórz nowy projekt.
2. Wybierz silne hasło bazy oraz region najbliższy użytkownikom.
3. Po uruchomieniu projektu przejdź do **SQL Editor**.

## 2. Wgraj schemat

1. Otwórz `supabase/migrations/20260706_dayforge_v1.sql`.
2. Wklej całą zawartość do SQL Editor.
3. Uruchom skrypt jeden raz.

Skrypt tworzy profile, personal workspace, zadania, planner, nawyki, sesje focus, preferencje i tabelę bezpiecznej synchronizacji workspace. Włącza też RLS na wszystkich tabelach.

## 3. Dodaj publiczne klucze

1. W Supabase wybierz **Project Settings → API**.
2. Skopiuj Project URL oraz publiczny `anon` / publishable key.
3. Skopiuj `.env.example` do `.env.local`.
4. Uzupełnij wartości:

```env
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj-publiczny-klucz
```

Nigdy nie wpisuj `service_role` do DayForge. Ten klucz omija RLS i nie może trafić do aplikacji desktopowej ani repozytorium.

## 4. Ustaw Auth

W **Authentication → Providers → Email** włącz Email/Password. Dla prostego testu możesz czasowo wyłączyć Confirm email. W wersji produkcyjnej zostaw potwierdzanie e-maili włączone.

Desktopowy reset hasła wymaga docelowej strony internetowej lub deep-linka. Przed publicznym wydaniem skonfiguruj w **URL Configuration** adres swojej strony resetu hasła. Zwykłe logowanie i rejestracja e-mail/hasło działają bez tego dodatkowego kroku.

## 5. Uruchom

```powershell
npm install
npm run tauri:dev
```

Po podłączeniu `.env.local` DayForge pokaże ekran logowania. Pierwsze zalogowanie tworzy personal workspace. Jeżeli w chmurze nie ma snapshotu, DayForge wysyła aktualne dane lokalne. Jeśli snapshot już istnieje, pobiera go jako źródło prawdy.

## Model synchronizacji v1.0

v1.0 synchronizuje podpisany przez RLS dokument stanu workspace w tabeli `workspace_state_snapshots`. Dzięki temu wszystkie istniejące funkcje desktopowe — zadania, planner, nawyki i focus — mogą być od razu przeniesione na drugi komputer bez ryzyka częściowej migracji.

Aplikacja zapisuje też pełny relacyjny schemat domeny. W kolejnym wydaniu można przejść na synchronizację rekord po rekordzie i realtime, bez zmiany modelu kont lub RLS.

## Bezpieczeństwo

- Zalogowany użytkownik odczytuje i aktualizuje tylko workspace, którego jest członkiem.
- Polityki RLS są egzekwowane w bazie, a nie tylko w interfejsie.
- Klucz publiczny `anon` jest bezpieczny w aplikacji pod warunkiem, że RLS pozostaje włączone.
- Zrób eksport JSON z Ustawień przed pierwszym testem synchronizacji.
