/**
 * Klient API. W dev Vite proxuje /api na backend (patrz vite.config.mjs),
 * więc domyślnie wystarczy ścieżka względna. Na produkcji można wskazać
 * inny host przez VITE_API_URL.
 */
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Nie można połączyć się z serwerem. Czy backend jest uruchomiony?', 0);
  }

  if (res.status === 204) return null;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(payload?.error || `Serwer zwrócił błąd ${res.status}.`, res.status);
  }

  return payload;
}

export const api = {
  health: () => request('/api/health'),
  me: () => request('/api/me'),
  categories: () => request('/api/categories'),

  searchMovies: (query, signal) =>
    request(`/api/movies/search?q=${encodeURIComponent(query)}`, { signal }),

  /** Kolejna wypowiedź AI. Pusta lista `messages` = prośba o pytanie otwierające. */
  nextChatMessage: (payload, signal) => request('/api/chat/next', { method: 'POST', body: payload, signal }),

  listReviews: (limit) => request(`/api/reviews${limit ? `?limit=${limit}` : ''}`),
  getReview: (id) => request(`/api/reviews/${id}`),
  createReview: (payload) => request('/api/reviews', { method: 'POST', body: payload }),
  deleteReview: (id) => request(`/api/reviews/${id}`, { method: 'DELETE' }),
};

/** "2025-01-15T..." -> "15.01.2025" */
export function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pl-PL');
}
