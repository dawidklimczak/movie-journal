import { ApiError } from '../http.js';
import { CATEGORY_IDS } from './categories.js';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 40;

function rating(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    throw new ApiError(`Pole "${field}" musi być liczbą całkowitą z zakresu 1-10.`);
  }
  return n;
}

export function parseMovie(raw) {
  if (!raw || typeof raw !== 'object') throw new ApiError('Brak danych filmu ("movie").');
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) throw new ApiError('Film musi mieć tytuł.');

  const str = (v, max = 255) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

  return {
    tmdbId: Number.isInteger(Number(raw.tmdbId)) && raw.tmdbId != null ? Number(raw.tmdbId) : null,
    title: title.slice(0, 255),
    originalTitle: str(raw.originalTitle),
    year: str(raw.year, 10),
    director: str(raw.director),
    genre: str(raw.genre, 100),
    posterUrl: str(raw.posterUrl, 500),
  };
}

export function parseRatings(rawOverall, rawDetailed) {
  const overallRating = rating(rawOverall, 'overallRating');

  const detailedRatings = {};
  if (rawDetailed && typeof rawDetailed === 'object') {
    for (const id of CATEGORY_IDS) {
      if (rawDetailed[id] != null) detailedRatings[id] = rating(rawDetailed[id], id);
    }
  }

  return { overallRating, detailedRatings };
}

export function parseMessages(raw) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new ApiError('Pole "messages" musi być tablicą.');
  if (raw.length > MAX_MESSAGES) throw new ApiError('Rozmowa jest zbyt długa.');

  return raw.map((m, i) => {
    if (!m || typeof m !== 'object') throw new ApiError(`Wiadomość #${i + 1} ma zły format.`);
    const role = m.role === 'ai' ? 'ai' : 'user';
    const text = typeof m.text === 'string' ? m.text.trim() : '';
    if (!text) throw new ApiError(`Wiadomość #${i + 1} jest pusta.`);
    return { role, text: text.slice(0, MAX_MESSAGE_LENGTH) };
  });
}

/** Wspólne wejście dla /api/chat/next i POST /api/reviews. */
export function parseReviewInput(body) {
  const movie = parseMovie(body?.movie);
  const { overallRating, detailedRatings } = parseRatings(body?.overallRating, body?.detailedRatings);
  const messages = parseMessages(body?.messages);
  return { movie, overallRating, detailedRatings, messages };
}
