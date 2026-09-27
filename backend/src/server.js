import express from 'express';
import cors from 'cors';
import { config, hasOpenAi, hasTmdb } from './config.js';
import { db, dbDriver, migrate, ensureSingleUser } from './db/index.js';
import { ApiError, asyncHandler } from './http.js';
import { CATEGORIES } from './domain/categories.js';
import { moviesRouter } from './routes/movies.js';
import { chatRouter } from './routes/chat.js';
import { reviewsRouter } from './routes/reviews.js';

const app = express();

app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    db: dbDriver,
    openai: hasOpenAi() ? config.openaiModel : null,
    tmdb: hasTmdb(),
  });
});

app.get('/api/categories', (req, res) => res.json({ categories: CATEGORIES }));

app.get(
  '/api/me',
  asyncHandler(async (req, res) => {
    const id = await ensureSingleUser();
    const user = await db('users').where({ id }).first();
    res.json({ id: user.id, name: user.name, email: user.email });
  })
);

app.use('/api/movies', moviesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/reviews', reviewsRouter);

app.use('/api', (req, res) => res.status(404).json({ error: 'Nie ma takiego endpointu.' }));

// eslint-disable-next-line no-unused-vars -- Express rozpoznaje error middleware po arności (4 argumenty).
app.use((err, req, res, next) => {
  // Błędy z jawnym `status` są zamierzone (zła konfiguracja, brak zasobu) —
  // do konsoli trafiają tylko te nieprzewidziane.
  const expected = Number.isInteger(err?.status);
  const status = expected ? err.status : 500;

  if (!expected) console.error(err);

  res.status(status).json({ error: expected ? err.message : 'Błąd serwera.' });
});

try {
  await migrate();
} catch (err) {
  console.error('Nie udało się przygotować bazy danych:', err);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`API słucha na http://localhost:${config.port} (baza: ${dbDriver})`);
  if (!hasOpenAi()) console.warn('! Brak OPENAI_API_KEY — rozmowa i podsumowania nie zadziałają.');
  if (!hasTmdb()) console.warn('! Brak TMDB_API_KEY/TMDB_ACCESS_TOKEN — wyszukiwarka filmów nie zadziała.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => db.destroy().finally(() => process.exit(0)));
  });
}
