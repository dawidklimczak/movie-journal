import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function resolveFromRoot(p) {
  return path.isAbsolute(p) ? p : path.join(backendRoot, p);
}

export const config = {
  backendRoot,
  port: Number(process.env.PORT) || 3000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  databaseUrl: process.env.DATABASE_URL || '',
  sqliteFile: resolveFromRoot(process.env.SQLITE_FILE || './data/moviejournal.sqlite'),

  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-nano',

  tmdbApiKey: process.env.TMDB_API_KEY || '',
  tmdbAccessToken: process.env.TMDB_ACCESS_TOKEN || '',
  tmdbLanguage: process.env.TMDB_LANGUAGE || 'pl-PL',

  singleUser: {
    email: process.env.SINGLE_USER_EMAIL || 'jan.kowalski@example.com',
    name: process.env.SINGLE_USER_NAME || 'Jan Kowalski',
  },
};

export const hasOpenAi = () => Boolean(config.openaiApiKey);
export const hasTmdb = () => Boolean(config.tmdbApiKey || config.tmdbAccessToken);
