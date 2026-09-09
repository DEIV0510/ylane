import { defineConfig } from 'drizzle-kit';

/**
 * Local  → SQLite en archivo (dialecto sqlite).
 * Producción → Turso / libSQL (dialecto turso) usando DATABASE_URL + token.
 */
const url = process.env.DATABASE_URL ?? 'file:./data/ylane.db';
const esArchivo = url.startsWith('file:');

export default defineConfig(
  esArchivo
    ? {
        schema: './src/db/schema.ts',
        out: './drizzle',
        dialect: 'sqlite',
        dbCredentials: { url },
      }
    : {
        schema: './src/db/schema.ts',
        out: './drizzle',
        dialect: 'turso',
        dbCredentials: { url, authToken: process.env.DATABASE_AUTH_TOKEN ?? '' },
      },
);
