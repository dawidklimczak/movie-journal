# MovieJournal (Seenote)

Dziennik filmowy: oceniasz film w siedmiu kategoriach, AI przeprowadza z Tobą krótką
rozmowę o seansie i zapisuje z niej notatkę.

- `front/` — Svelte 4 + Vite
- `backend/` — Node 20+ / Express, SQLite (domyślnie) lub Postgres

## Co jest potrzebne

| Klucz | Do czego | Gdzie zdobyć |
| --- | --- | --- |
| `OPENAI_API_KEY` | rozmowa i podsumowanie recenzji | https://platform.openai.com/api-keys |
| `TMDB_API_KEY` **albo** `TMDB_ACCESS_TOKEN` | wyszukiwarka filmów, plakaty, reżyser | https://www.themoviedb.org/settings/api |

Domyślny model to `gpt-4.1-nano` — najtańszy z rodziny. Jedna recenzja to zwykle
kilka tysięcy tokenów, czyli ułamek grosza. Model podmienia się przez `OPENAI_MODEL`
bez zmian w kodzie (obsługiwane są też rodziny `gpt-5*` / `o*`, które wymagają
innych parametrów zapytania).

## Uruchomienie lokalne

```bash
# 1. backend
cd backend
cp .env.example .env      # uzupełnij OPENAI_API_KEY i TMDB_API_KEY
npm install
npm run migrate           # tworzy schemat (opcjonalne — serwer robi to też przy starcie)
npm run dev               # http://localhost:3000

# 2. front (w drugim terminalu)
cd front
npm install
npm run dev               # http://localhost:5173
```

Vite proxuje `/api` na `http://localhost:3000`, więc front nie potrzebuje żadnej
konfiguracji. Inny adres backendu ustawisz przez `VITE_PROXY_TARGET` (dev)
lub `VITE_API_URL` (build produkcyjny).

Czy wszystko jest podłączone, sprawdzisz pod `http://localhost:3000/api/health`:

```json
{ "ok": true, "db": "sqlite", "openai": "gpt-4.1-nano", "tmdb": true }
```

## Uruchomienie w Dockerze (z Postgresem)

```bash
export OPENAI_API_KEY=sk-...
export TMDB_API_KEY=...
docker compose up --build
```

Backend przełącza się na Postgresa samą obecnością `DATABASE_URL` — bez tej zmiennej
używa pliku SQLite w `backend/data/`. Schemat tworzy się przy starcie serwera.

## API

| Metoda | Ścieżka | Opis |
| --- | --- | --- |
| GET | `/api/health` | stan usług i wybrany model |
| GET | `/api/me` | konto (tryb jednego użytkownika) |
| GET | `/api/categories` | definicje kategorii ocen — źródło prawdy dla frontu i promptów |
| GET | `/api/movies/search?q=` | wyszukiwanie w TMDB (z reżyserem i plakatem) |
| GET | `/api/movies/:tmdbId` | szczegóły filmu |
| POST | `/api/chat/next` | kolejne pytanie AI; pusta lista `messages` = pytanie otwierające |
| GET | `/api/reviews?limit=` | lista recenzji, od najnowszej |
| POST | `/api/reviews` | zapis recenzji — podsumowanie generuje serwer |
| GET | `/api/reviews/:id` | pojedyncza recenzja |
| DELETE | `/api/reviews/:id` | usunięcie recenzji |

Rozmowa jest bezstanowa: front trzyma historię i odsyła ją przy każdej turze.
AI zadaje maksymalnie 5 pytań, po czym samo domyka wywiad; użytkownik może
zakończyć wcześniej przyciskiem „Zakończ”.

### Kontekst filmu w pytaniach

Przy `/api/chat/next` backend dociąga z TMDB po `tmdbId` streszczenie, obsadę z rolami,
tagi tematyczne i długość, po czym wstrzykuje je do promptu prowadzącego rozmowę.
Bez tego mały model pyta generycznie („czy jakaś scena zapadła Ci w pamięć?”);
z kontekstem zaczepia o konkrety — imię bohatera, aktora, miejsce, wątek.

Trzy rzeczy warte zapamiętania:

- Kontekst pobiera **serwer**, nie klient — przeglądarka nie może podstawić modelowi
  własnych „faktów” o filmie.
- Wynik jest cache'owany w pamięci (30 min), więc cała rozmowa to jedno zapytanie do TMDB.
- Awaria lub brak TMDB **nie wywraca rozmowy** — pytania są wtedy po prostu ogólniejsze.

Prompt zabrania modelowi streszczania fabuły i wychodzenia poza to, co przyszło z TMDB —
użytkownik widział film, AI nie. Podsumowanie recenzji kontekstu **nie dostaje** w ogóle,
żeby opierało się wyłącznie na tym, co użytkownik faktycznie powiedział.

## Tryb jednego użytkownika

Na MVP nie ma logowania — backend obsługuje jedno konto opisane przez
`SINGLE_USER_EMAIL` / `SINGLE_USER_NAME`, zakładane przy pierwszym starcie.
Wszystkie recenzje mają już kolumnę `user_id`, więc dołożenie Google OAuth
nie będzie wymagało migracji danych.
