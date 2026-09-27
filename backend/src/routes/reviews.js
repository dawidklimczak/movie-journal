import { Router } from 'express';
import { asyncHandler, ApiError } from '../http.js';
import { db, ensureSingleUser } from '../db/index.js';
import { parseReviewInput } from '../domain/reviewInput.js';
import { generateSummary } from '../services/llm.js';

export const reviewsRouter = Router();

/**
 * SQLite zwraca CURRENT_TIMESTAMP jako "YYYY-MM-DD HH:MM:SS" w UTC,
 * Postgres zwraca obiekt Date. Front dostaje zawsze ISO.
 */
function toIso(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  if (typeof value === 'string') {
    const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? `${value.replace(' ', 'T')}Z`
      : value;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  return new Date().toISOString();
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function serialize(row) {
  return {
    id: row.id,
    movie: {
      tmdbId: row.tmdb_id,
      title: row.title,
      originalTitle: row.original_title,
      year: row.year,
      director: row.director,
      genre: row.genre,
      posterUrl: row.poster_url,
    },
    overallRating: row.overall_rating,
    detailedRatings: safeParse(row.detailed_ratings, {}),
    chatHistory: safeParse(row.chat_history, []),
    aiSummary: row.ai_summary,
    createdAt: toIso(row.created_at),
  };
}

reviewsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = await ensureSingleUser();
    const limitRaw = Number(req.query.limit);
    const query = db('reviews').where({ user_id: userId }).orderBy('created_at', 'desc').orderBy('id', 'desc');

    if (Number.isInteger(limitRaw) && limitRaw > 0) query.limit(Math.min(limitRaw, 200));

    const rows = await query;
    res.json({ reviews: rows.map(serialize) });
  })
);

reviewsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = await ensureSingleUser();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError('Nieprawidłowe id recenzji.');

    const row = await db('reviews').where({ id, user_id: userId }).first();
    if (!row) throw new ApiError('Nie znaleziono takiej recenzji.', 404);

    res.json(serialize(row));
  })
);

reviewsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = await ensureSingleUser();
    const input = parseReviewInput(req.body);

    // Podsumowanie powstaje na serwerze — dzięki temu nie da się go podmienić z frontu
    // i nie płacimy za jego generowanie, jeśli walidacja odrzuci wejście.
    const aiSummary = await generateSummary(input);

    const [row] = await db('reviews')
      .insert({
        user_id: userId,
        tmdb_id: input.movie.tmdbId,
        title: input.movie.title,
        original_title: input.movie.originalTitle,
        year: input.movie.year,
        director: input.movie.director,
        genre: input.movie.genre,
        poster_url: input.movie.posterUrl,
        overall_rating: input.overallRating,
        detailed_ratings: JSON.stringify(input.detailedRatings),
        chat_history: JSON.stringify(input.messages),
        ai_summary: aiSummary,
      })
      .returning('id');

    const id = typeof row === 'object' ? row.id : row;
    const saved = await db('reviews').where({ id }).first();

    res.status(201).json(serialize(saved));
  })
);

reviewsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = await ensureSingleUser();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw new ApiError('Nieprawidłowe id recenzji.');

    const deleted = await db('reviews').where({ id, user_id: userId }).del();
    if (!deleted) throw new ApiError('Nie znaleziono takiej recenzji.', 404);

    res.status(204).end();
  })
);
