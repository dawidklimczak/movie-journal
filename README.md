# MovieJournal

> **Work in progress.** This is a personal side project, not a finished or maintained product — expect rough edges and missing pieces.

A movie journal that turns a five-minute post-watch chat into a structured review — instead of a blank text box.

## The idea

Most rating apps ask for a star score and maybe a paragraph, which either gets skipped or reduced to "loved it." MovieJournal rates a film across seven concrete categories, then has an AI ask up to five short, film-specific follow-up questions about the viewing experience. The interview transcript is distilled into a short written summary automatically — no extra step for the user.

The interviewer isn't generic: before asking a question, the backend fetches the film's synopsis, cast, themes and runtime from TMDB and feeds that into the prompt. That's the difference between "did any scene stick with you?" and a question that references an actual character or actor by name.

## How it's built

- **`front/`** — Svelte 4 + Vite SPA (search, guided review flow, review list/detail)
- **`backend/`** — Node 20 / Express API, SQLite by default or Postgres in Docker

Key product/engineering decisions:

- **Context is fetched server-side**, never trusted from the client — the browser can't feed the model false "facts" about a movie.
- **The interview is stateless** — the frontend holds the conversation history and resends it each turn; the server caches TMDB lookups in memory for 30 minutes so a full conversation costs one external call.
- **Graceful degradation** — if TMDB is unreachable, the interview still runs, just with more generic questions instead of failing.
- **The final summary sees none of the TMDB context** — it's built only from what the user actually said, so it can't accidentally include plot details the user never mentioned.
- **Single-user MVP, migration-ready** — no auth yet, but every review already has a `user_id`, so adding Google OAuth later needs no data migration.

## Running locally

```bash
# 1. backend
cd backend
cp .env.example .env      # fill in OPENAI_API_KEY and TMDB_API_KEY
npm install
npm run migrate           # creates the schema (optional — the server does this on boot too)
npm run dev                # http://localhost:3000

# 2. frontend (separate terminal)
cd front
npm install
npm run dev                # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:3000`, so the frontend needs no extra config out of the box. Point it elsewhere with `VITE_PROXY_TARGET` (dev) or `VITE_API_URL` (production build).

Check that everything is wired up at `http://localhost:3000/api/health`:

```json
{ "ok": true, "db": "sqlite", "openai": "gpt-4.1-nano", "tmdb": true }
```

### Required keys

| Key | Used for | Get it at |
| --- | --- | --- |
| `OPENAI_API_KEY` | the review interview and summary | https://platform.openai.com/api-keys |
| `TMDB_API_KEY` **or** `TMDB_ACCESS_TOKEN` | movie search, posters, director, context | https://www.themoviedb.org/settings/api |

Default model is `gpt-4.1-nano` — cheap enough that a full review costs a fraction of a cent. Swap models via `OPENAI_MODEL` (the `gpt-5*` / `o*` families are also supported, with their different request parameters).

## Running with Docker (Postgres)

```bash
export OPENAI_API_KEY=sk-...
export TMDB_API_KEY=...
docker compose up --build
```

The backend switches to Postgres purely based on `DATABASE_URL` being set; without it, it falls back to a SQLite file in `backend/data/`. The schema is created on server startup either way.

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | service status and active model |
| GET | `/api/me` | current account (single-user mode) |
| GET | `/api/categories` | rating category definitions — source of truth for both the UI and the prompts |
| GET | `/api/movies/search?q=` | TMDB search (with director and poster) |
| GET | `/api/movies/:tmdbId` | movie details |
| POST | `/api/chat/next` | next interview question; an empty `messages` list returns the opening question |
| GET | `/api/reviews?limit=` | reviews, newest first |
| POST | `/api/reviews` | save a review — the summary is generated server-side |
| GET | `/api/reviews/:id` | a single review |
| DELETE | `/api/reviews/:id` | delete a review |

The AI asks at most 5 questions and then wraps up the interview on its own; the user can also end it early. The prompt is explicitly told not to summarize the plot or go beyond what TMDB provided — the user watched the film, the AI didn't.
