import 'server-only';
import { cache } from 'react';
import { db } from '@/db';
import { settings } from '@/db/schema';

export type Ajustes = Record<string, string>;

/**
 * Configuración de la tienda (clave/valor). Se cachea por petición para no
 * repetir la consulta en cada componente del árbol.
 */
export const getSettings = cache(async (): Promise<Ajustes> => {
  try {
    const filas = await db.select().from(settings).all();
    return Object.fromEntries(filas.map((fila) => [fila.clave, fila.valor]));
  } catch {
    // La base todavía no existe (primer arranque antes de `npm run db:push`).
    return {};
  }
});

export async function getSetting(clave: string, porDefecto = ''): Promise<string> {
  const ajustes = await getSettings();
  return ajustes[clave]?.trim() || porDefecto;
}

/** IDs de analítica: manda la configuración del panel, si no la variable de entorno. */
export async function getAnalyticsIds() {
  const ajustes = await getSettings();
  return {
    ga4: ajustes.ga4_id?.trim() || process.env.NEXT_PUBLIC_GA4_ID?.trim() || '',
    pixel: ajustes.meta_pixel_id?.trim() || process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '',
  };
}

export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:5331';
}
