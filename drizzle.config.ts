import { defineConfig } from 'drizzle-kit';

/**
 * Local  → SQLite en archivo (dialecto sqlite).
 * Producción → Turso / libSQL (dialecto turso) usando DATABASE_URL + token,
 * o TURSO_DATABASE_URL + TURSO_AUTH_TOKEN si la base viene del Marketplace
 * de Vercel (esa integración crea las variables con ese prefijo fijo).
 */
const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ylane.db';
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || '';
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
        dbCredentials: { url, authToken },
      },
);
