import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Un solo cliente libSQL por proceso.
 * - Desarrollo: DATABASE_URL="file:./data/ylane.db"
 * - Producción: DATABASE_URL="libsql://<base>.turso.io" + DATABASE_AUTH_TOKEN
 *   (o, si la base se aprovisionó desde el Marketplace de Vercel,
 *   TURSO_DATABASE_URL + TURSO_AUTH_TOKEN: son los nombres que esa
 *   integración crea y no se pueden renombrar, así que se leen como
 *   alternativa cuando DATABASE_URL no está definida).
 * No hace falta cambiar código para pasar de uno a otro.
 */
const globalForDb = globalThis as unknown as { __ylaneClient?: Client };

function buildClient(): Client {
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ylane.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
  return createClient({ url, authToken });
}

const client = globalForDb.__ylaneClient ?? buildClient();
if (process.env.NODE_ENV !== 'production') globalForDb.__ylaneClient = client;

export const db = drizzle(client, { schema });
export { schema };
