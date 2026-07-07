# DayForge agent rules

- Stack: Next.js 16 App Router, TypeScript strict, Tailwind CSS 4, React 19, Tauri 2.
- Nie używaj `any`, alertów przeglądarkowych ani `innerHTML` dla danych użytkownika.
- UI jest po polsku i utrzymuje ciemny, premium styl DayForge.
- W zmianach UI zapewniaj loading, empty i error states, gdy dotyczy.
- Nie dodawaj sekretów do kodu. Zmienne środowiskowe trafiają do `.env.local` i `.env.example`.
- Tauri ma minimalne uprawnienia; nowe pluginy dodawaj tylko, gdy funkcja ich faktycznie wymaga.
- Przed zakończeniem pracy uruchom `npm run check`.
