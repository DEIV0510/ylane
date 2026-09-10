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

/**
 * IDs de analítica: manda la configuración del panel, si no la variable de entorno.
 *
 * Se validan con un formato estricto porque acaban dentro de un script. Un valor
 * con comillas rompería el literal y ejecutaría código en el navegador de cada
 * visitante; además evita que se pegue el snippet completo de Google y la
 * analítica quede rota en silencio.
 */
const FORMATO_GA4 = /^(G|UA|AW|GT|GTM)-[A-Z0-9-]{4,24}$/i;
const FORMATO_PIXEL = /^\d{6,20}$/;

function idValido(valor: string | undefined, formato: RegExp): string {
  const limpio = valor?.trim() ?? '';
  return formato.test(limpio) ? limpio : '';
}

export async function getAnalyticsIds() {
  const ajustes = await getSettings();
  return {
    ga4: idValido(ajustes.ga4_id || process.env.NEXT_PUBLIC_GA4_ID, FORMATO_GA4),
    pixel: idValido(ajustes.meta_pixel_id || process.env.NEXT_PUBLIC_META_PIXEL_ID, FORMATO_PIXEL),
  };
}

export const FORMATOS_ANALITICA = { ga4_id: FORMATO_GA4, meta_pixel_id: FORMATO_PIXEL };

export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:5331';
}
