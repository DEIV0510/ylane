import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Un solo cliente libSQL por proceso.
 * - Desarrollo: DATABASE_URL="file:./data/ylane.db"
 * - Producción: DATABASE_URL="libsql://<base>.turso.io" + DATABASE_AUTH_TOKEN
 * No hace falta cambiar código para pasar de uno a otro.
 */
const globalForDb = globalThis as unknown as { __ylaneClient?: Client };

function buildClient(): Client {
  const url = process.env.DATABASE_URL ?? 'file:./data/ylane.db';
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
  return createClient({ url, authToken });
}

const client = globalForDb.__ylaneClient ?? buildClient();
if (process.env.NODE_ENV !== 'production') globalForDb.__ylaneClient = client;

export const db = drizzle(client, { schema });
export { schema };
