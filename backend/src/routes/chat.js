import { Router } from 'express';
import { asyncHandler } from '../http.js';
import { hasTmdb } from '../config.js';
import { parseReviewInput } from '../domain/reviewInput.js';
import { nextInterviewMessage } from '../services/llm.js';
import { getMovieContext } from '../services/tmdb.js';

export const chatRouter = Router();

/**
 * Kontekst filmu pobieramy na serwerze po `tmdbId`, a nie z ciała żądania — dzięki
 * temu klient nie może podstawić modelowi dowolnych "faktów". Wynik jest cache'owany,
 * więc cała rozmowa kosztuje jedno zapytanie do TMDB.
 *
 * Brak kontekstu tylko obniża jakość pytań, więc błąd TMDB nie może wywrócić rozmowy.
 */
async function loadContext(tmdbId) {
  if (!tmdbId || !hasTmdb()) return null;
  try {
    return await getMovieContext(tmdbId);
  } catch (err) {
    console.warn(`Nie udało się pobrać kontekstu filmu ${tmdbId}: ${err.message}`);
    return null;
  }
}

/**
 * Rozmowa jest bezstanowa — front trzyma całą historię i odsyła ją przy każdej turze.
 * Pusta lista "messages" oznacza prośbę o otwierające pytanie.
 */
chatRouter.post(
  '/next',
  asyncHandler(async (req, res) => {
    const input = parseReviewInput(req.body);
    const context = await loadContext(input.movie.tmdbId);
    res.json(await nextInterviewMessage({ ...input, context }));
  })
);
