import fs from 'node:fs';
import path from 'node:path';
import knexFactory from 'knex';
import { config } from '../config.js';

const usingPostgres = Boolean(config.databaseUrl);

if (!usingPostgres) {
  fs.mkdirSync(path.dirname(config.sqliteFile), { recursive: true });
}

export const db = knexFactory(
  usingPostgres
    ? {
        client: 'pg',
        connection: config.databaseUrl,
        pool: { min: 0, max: 10 },
      }
    : {
        client: 'better-sqlite3',
        connection: { filename: config.sqliteFile },
        useNullAsDefault: true,
      }
);

export const dbDriver = usingPostgres ? 'postgres' : 'sqlite';

/**
 * Tworzy schemat, jeśli go nie ma, i zapewnia istnienie konta w trybie
 * jednego użytkownika. Kolumny JSON trzymamy jako tekst — działa identycznie
 * na SQLite i Postgresie, a rozmiary są tu znikome.
 */
export async function migrate() {
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('email').notNullable().unique();
      t.string('name').notNullable();
      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());
    });
  }

  if (!(await db.schema.hasTable('reviews'))) {
    await db.schema.createTable('reviews', (t) => {
      t.increments('id').primary();
      t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

      t.integer('tmdb_id');
      t.string('title').notNullable();
      t.string('original_title');
      t.string('year');
      t.string('director');
      t.string('poster_url', 500);
      t.string('genre');

      t.integer('overall_rating').notNullable();
      t.text('detailed_ratings').notNullable(); // JSON
      t.text('chat_history').notNullable(); // JSON
      t.text('ai_summary').notNullable();

      t.timestamp('created_at').notNullable().defaultTo(db.fn.now());

      t.index(['user_id', 'created_at']);
    });
  }

  return ensureSingleUser();
}

let cachedUserId = null;

/** Zwraca id konta używanego w trybie jednego użytkownika (tworzy je przy pierwszym starcie). */
export async function ensureSingleUser() {
  if (cachedUserId !== null) return cachedUserId;

  const { email, name } = config.singleUser;
  const existing = await db('users').where({ email }).first();

  if (existing) {
    cachedUserId = existing.id;
  } else {
    const [row] = await db('users').insert({ email, name }).returning('id');
    cachedUserId = typeof row === 'object' ? row.id : row;
  }

  return cachedUserId;
}
