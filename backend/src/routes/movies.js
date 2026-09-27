import { Router } from 'express';
import { asyncHandler, ApiError } from '../http.js';
import { getMovie, searchMovies } from '../services/tmdb.js';

export const moviesRouter = Router();

moviesRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = String(req.query.q || '').trim();
    if (query.length < 2) return res.json({ results: [] });
    res.json({ results: await searchMovies(query) });
  })
);

moviesRouter.get(
  '/:tmdbId',
  asyncHandler(async (req, res) => {
    const tmdbId = Number(req.params.tmdbId);
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw new ApiError('Nieprawidłowe id filmu.');
    res.json(await getMovie(tmdbId));
  })
);
