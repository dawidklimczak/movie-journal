import { config, hasTmdb } from '../config.js';

const BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

/** Ile wyników wzbogacamy o reżysera/gatunek — każdy kosztuje osobne zapytanie do TMDB. */
const DETAIL_LIMIT = 8;

class TmdbError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

async function tmdbFetch(pathname, params = {}) {
  if (!hasTmdb()) {
    throw new TmdbError('Brak konfiguracji TMDB (ustaw TMDB_API_KEY lub TMDB_ACCESS_TOKEN).', 503);
  }

  const url = new URL(BASE + pathname);
  url.searchParams.set('language', config.tmdbLanguage);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const headers = { Accept: 'application/json' };
  if (config.tmdbAccessToken) {
    headers.Authorization = `Bearer ${config.tmdbAccessToken}`;
  } else {
    url.searchParams.set('api_key', config.tmdbApiKey);
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 401) {
      throw new TmdbError('TMDB odrzuciło klucz API (401). Sprawdź TMDB_API_KEY / TMDB_ACCESS_TOKEN.', 502);
    }
    throw new TmdbError(`TMDB zwróciło ${res.status}: ${body.slice(0, 200)}`, 502);
  }

  return res.json();
}

function directorFrom(details) {
  const crew = details?.credits?.crew || [];
  const directors = crew.filter((p) => p.job === 'Director').map((p) => p.name);
  return directors.length ? directors.join(', ') : null;
}

function toMovie(details) {
  return {
    tmdbId: details.id,
    title: details.title || details.original_title || 'Bez tytułu',
    originalTitle: details.original_title || null,
    year: details.release_date ? details.release_date.slice(0, 4) : null,
    director: directorFrom(details),
    genre: details.genres?.[0]?.name || null,
    posterUrl: details.poster_path ? POSTER_BASE + details.poster_path : null,
    overview: details.overview || null,
  };
}

/** Szczegóły filmu razem z obsadą/ekipą (jedno zapytanie dzięki append_to_response). */
export async function getMovie(tmdbId) {
  const details = await tmdbFetch(`/movie/${tmdbId}`, { append_to_response: 'credits' });
  return toMovie(details);
}

/** Ilu aktorów podajemy modelowi — dalsze pozycje to epizody, tylko zaszumiłyby prompt. */
const CAST_LIMIT = 6;
const KEYWORD_LIMIT = 8;

const CONTEXT_TTL_MS = 30 * 60 * 1000;
const CONTEXT_CACHE_MAX = 200;

/** Cache w pamięci — cała rozmowa (do 5 pytań) kosztuje wtedy jedno zapytanie do TMDB. */
const contextCache = new Map();

function readCache(tmdbId) {
  const hit = contextCache.get(tmdbId);
  if (!hit) return null;
  if (Date.now() - hit.at > CONTEXT_TTL_MS) {
    contextCache.delete(tmdbId);
    return null;
  }
  return hit.value;
}

function writeCache(tmdbId, value) {
  // Najstarszy wpis wypada pierwszy — Map zachowuje kolejność wstawiania.
  if (contextCache.size >= CONTEXT_CACHE_MAX) {
    contextCache.delete(contextCache.keys().next().value);
  }
  contextCache.set(tmdbId, { at: Date.now(), value });
}

/**
 * Materiał, na którym AI opiera pytania: streszczenie, obsada, tagi tematyczne,
 * długość. Jedno zapytanie do TMDB dzięki append_to_response.
 */
export async function getMovieContext(tmdbId) {
  const cached = readCache(tmdbId);
  if (cached) return cached;

  const details = await tmdbFetch(`/movie/${tmdbId}`, { append_to_response: 'credits,keywords' });

  // TMDB nie robi fallbacku na inny język — przy filmach bez polskiego opisu
  // `overview` przychodzi puste, a to najcenniejsza część kontekstu.
  let overview = details.overview || null;
  if (!overview && config.tmdbLanguage !== 'en-US') {
    const fallback = await tmdbFetch(`/movie/${tmdbId}`, { language: 'en-US' }).catch(() => null);
    overview = fallback?.overview || null;
  }

  const context = {
    overview,
    runtime: Number.isInteger(details.runtime) && details.runtime > 0 ? details.runtime : null,
    genres: (details.genres || []).map((g) => g.name),
    cast: (details.credits?.cast || [])
      .slice(0, CAST_LIMIT)
      .map((p) => ({ name: p.name, character: p.character || null })),
    keywords: (details.keywords?.keywords || []).slice(0, KEYWORD_LIMIT).map((k) => k.name),
  };

  writeCache(tmdbId, context);
  return context;
}

/**
 * Wyszukiwanie po tytule. TMDB nie zwraca reżysera w wynikach wyszukiwania,
 * więc dla kilku pierwszych trafień dociągamy szczegóły równolegle.
 */
export async function searchMovies(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const search = await tmdbFetch('/search/movie', { query: trimmed, include_adult: 'false' });
  const candidates = (search.results || []).slice(0, DETAIL_LIMIT);

  const settled = await Promise.allSettled(candidates.map((r) => getMovie(r.id)));

  return settled.flatMap((result, i) => {
    if (result.status === 'fulfilled') return [result.value];
    // Jeśli szczegóły padły, pokazujemy to, co dała wyszukiwarka — bez reżysera.
    const raw = candidates[i];
    return [
      {
        tmdbId: raw.id,
        title: raw.title || raw.original_title || 'Bez tytułu',
        originalTitle: raw.original_title || null,
        year: raw.release_date ? raw.release_date.slice(0, 4) : null,
        director: null,
        genre: null,
        posterUrl: raw.poster_path ? POSTER_BASE + raw.poster_path : null,
        overview: raw.overview || null,
      },
    ];
  });
}

export { TmdbError };
