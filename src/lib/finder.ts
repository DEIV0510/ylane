import 'server-only';
import { and, asc, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { brands, productImages, products } from '@/db/schema';

/**
 * Buscador de fragancias.
 *
 * El puntaje se calcula SÓLO con los atributos que el negocio haya cargado
 * desde /admin (personalidad, ocasión, intensidad). Mientras no existan, la
 * recomendación se limita al género elegido y se avisa en la interfaz: nunca
 * se inventan coincidencias ni se recomienda al azar.
 */
export const PREGUNTAS = {
  genero: ['hombre', 'mujer', 'unisex'] as const,
  personalidad: [
    'elegante',
    'seductor',
    'fresco',
    'misterioso',
    'intenso',
    'dulce',
    'sofisticado',
  ] as const,
  ocasion: ['dia', 'noche', 'cita', 'trabajo', 'fiesta', 'evento'] as const,
  intensidad: ['suave', 'media', 'intensa'] as const,
};

export type Respuestas = {
  genero?: string;
  personalidad?: string[];
  ocasion?: string[];
  intensidad?: string;
};

const GENERO_DB: Record<string, string> = {
  hombre: 'CABALLERO',
  mujer: 'DAMA',
  unisex: 'UNISEX',
};

export async function recomendar(respuestas: Respuestas, limite = 8) {
  const generoPrincipal = respuestas.genero ? GENERO_DB[respuestas.genero] : undefined;

  const condiciones = [eq(products.activo, true)];
  if (generoPrincipal) {
    // El unisex siempre entra como opción válida, pero puntúa por debajo.
    condiciones.push(
      generoPrincipal === 'UNISEX'
        ? eq(products.genero, 'UNISEX')
        : (or(eq(products.genero, generoPrincipal), eq(products.genero, 'UNISEX')) ?? eq(products.genero, generoPrincipal)),
    );
  }

  const filas = await db
    .select({
      id: products.id,
      codigo: products.codigo,
      slug: products.slug,
      nombre: products.nombre,
      genero: products.genero,
      tipo: products.tipo,
      precio: products.precio,
      precioAnterior: products.precioAnterior,
      stock: products.stock,
      descripcionCorta: products.descripcionCorta,
      familiaOlfativa: products.familiaOlfativa,
      concentracion: products.concentracion,
      destacado: products.destacado,
      bestseller: products.bestseller,
      nuevo: products.nuevo,
      intensidad: products.intensidad,
      ocasion: products.ocasion,
      personalidad: products.personalidad,
      orden: products.orden,
      marca: brands.nombre,
      marcaSlug: brands.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(...condiciones))
    .all();

  const personalidadBuscada = respuestas.personalidad ?? [];
  const ocasionBuscada = respuestas.ocasion ?? [];

  let coincidenciasReales = 0;

  const puntuadas = filas.map((fila) => {
    let puntaje = 0;
    let motivos: string[] = [];

    const personalidadProducto = (fila.personalidad ?? []).map((valor) => valor.toLowerCase());
    const ocasionProducto = (fila.ocasion ?? []).map((valor) => valor.toLowerCase());

    for (const valor of personalidadBuscada) {
      if (personalidadProducto.includes(valor)) {
        puntaje += 3;
        motivos.push(valor);
      }
    }
    for (const valor of ocasionBuscada) {
      if (ocasionProducto.includes(valor)) {
        puntaje += 2;
        motivos.push(valor);
      }
    }
    if (respuestas.intensidad && fila.intensidad?.toLowerCase() === respuestas.intensidad) {
      puntaje += 2;
      motivos.push(respuestas.intensidad);
    }

    if (puntaje > 0) coincidenciasReales += 1;

    // Desempates suaves (no crean coincidencias donde no las hay).
    if (fila.genero === generoPrincipal) puntaje += 0.5;
    if (fila.destacado) puntaje += 0.3;
    if (fila.bestseller) puntaje += 0.2;

    return { fila, puntaje, motivos: [...new Set(motivos)] };
  });

  puntuadas.sort((a, b) => b.puntaje - a.puntaje || a.fila.orden - b.fila.orden);
  const elegidas = puntuadas.slice(0, limite);

  const ids = elegidas.map((item) => item.fila.id);
  const imagenes = new Map<number, string>();
  const segundas = new Map<number, string>();
  if (ids.length) {
    // Mismo orden que el catálogo: primero la principal, luego la secundaria.
    // Sin este ORDER BY podía salir una foto de "notas" o "lifestyle" en la tarjeta.
    const filasImagen = await db
      .select({ productId: productImages.productId, url: productImages.url })
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(
        sql`case ${productImages.tipo} when 'principal' then 0 when 'secundaria' then 1 else 2 end`,
        asc(productImages.orden),
        asc(productImages.id),
      )
      .all();
    for (const imagen of filasImagen) {
      if (!imagenes.has(imagen.productId)) imagenes.set(imagen.productId, imagen.url);
      else if (!segundas.has(imagen.productId)) segundas.set(imagen.productId, imagen.url);
    }
  }

  return {
    // Indica si las recomendaciones se apoyan en atributos cargados o sólo en el género.
    conAtributos: coincidenciasReales > 0,
    items: elegidas.map((item) => ({
      id: item.fila.id,
      codigo: item.fila.codigo,
      slug: item.fila.slug,
      nombre: item.fila.nombre,
      genero: item.fila.genero,
      tipo: item.fila.tipo,
      marca: item.fila.marca,
      marcaSlug: item.fila.marcaSlug,
      precio: item.fila.precio,
      precioAnterior: item.fila.precioAnterior,
      stock: item.fila.stock,
      descripcionCorta: item.fila.descripcionCorta,
      familiaOlfativa: item.fila.familiaOlfativa,
      concentracion: item.fila.concentracion,
      destacado: item.fila.destacado,
      bestseller: item.fila.bestseller,
      nuevo: item.fila.nuevo,
      imagen: imagenes.get(item.fila.id) ?? null,
      imagenAlt: null,
      imagen2: segundas.get(item.fila.id) ?? null,
      motivos: item.motivos,
    })),
  };
}
