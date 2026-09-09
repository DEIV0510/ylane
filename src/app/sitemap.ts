import type { MetadataRoute } from 'next';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { brands, products } from '@/db/schema';
import { siteUrl } from '@/lib/settings';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const estaticas = [
    { ruta: '', prioridad: 1 },
    { ruta: '/perfumes', prioridad: 0.9 },
    { ruta: '/arabes', prioridad: 0.9 },
    { ruta: '/hombre', prioridad: 0.8 },
    { ruta: '/mujer', prioridad: 0.8 },
    { ruta: '/unisex', prioridad: 0.8 },
    { ruta: '/ofertas', prioridad: 0.7 },
    { ruta: '/marcas', prioridad: 0.7 },
    { ruta: '/descubre', prioridad: 0.7 },
    { ruta: '/mayoristas', prioridad: 0.7 },
    { ruta: '/nosotros', prioridad: 0.5 },
    { ruta: '/contacto', prioridad: 0.5 },
    { ruta: '/envios', prioridad: 0.4 },
    { ruta: '/preguntas-frecuentes', prioridad: 0.4 },
    { ruta: '/politicas', prioridad: 0.3 },
    { ruta: '/terminos', prioridad: 0.3 },
    { ruta: '/privacidad', prioridad: 0.3 },
    { ruta: '/cambios-y-devoluciones', prioridad: 0.3 },
  ];

  let referencias: { slug: string; updatedAt: string }[] = [];
  let marcas: { slug: string }[] = [];
  try {
    referencias = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.activo, true))
      .orderBy(asc(products.id))
      .all();
    marcas = await db.select({ slug: brands.slug }).from(brands).all();
  } catch {
    // Sin base de datos disponible se publica al menos el mapa estático.
  }

  return [
    ...estaticas.map((pagina) => ({
      url: `${base}${pagina.ruta}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: pagina.prioridad,
    })),
    ...marcas.map((marca) => ({
      url: `${base}/marcas/${marca.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...referencias.map((referencia) => ({
      url: `${base}/perfumes/${referencia.slug}`,
      lastModified: new Date(referencia.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
