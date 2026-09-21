import 'server-only';
import { cache } from 'react';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNotNull,
  like,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { db } from '@/db';
import { brands, productImages, products, reviews } from '@/db/schema';
import { normalizar } from './text';
import { GENERO_SIN_ASIGNAR } from './format';

export type ProductoVista = {
  id: number;
  codigo: string;
  slug: string;
  nombre: string;
  genero: string;
  tipo: string | null;
  marca: string | null;
  marcaSlug: string | null;
  precio: number | null;
  precioAnterior: number | null;
  stock: number | null;
  descripcionCorta: string | null;
  familiaOlfativa: string | null;
  destacado: boolean;
  bestseller: boolean;
  nuevo: boolean;
  imagen: string | null;
  imagenAlt: string | null;
};

export type Filtros = {
  q?: string;
  genero?: string[];
  marca?: string[];
  tipo?: string[];
  familia?: string[];
  precioMin?: number;
  precioMax?: number;
  disponibles?: boolean;
  flag?: string;
  orden?: string;
  pagina?: number;
  porPagina?: number;
};

export const POR_PAGINA = 24;

const columnas = {
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
  destacado: products.destacado,
  bestseller: products.bestseller,
  nuevo: products.nuevo,
  marca: brands.nombre,
  marcaSlug: brands.slug,
};

/** Condiciones de filtrado. `omitir` deja fuera una dimensión (para las facetas). */
function condiciones(filtros: Filtros, omitir?: keyof Filtros | 'precio'): SQL[] {
  const lista: SQL[] = [eq(products.activo, true)];

  if (filtros.q && omitir !== 'q') {
    for (const termino of normalizar(filtros.q).split(/\s+/).filter(Boolean).slice(0, 6)) {
      lista.push(like(products.buscador, `%${termino}%`));
    }
  }
  if (filtros.genero?.length && omitir !== 'genero') {
    lista.push(inArray(products.genero, filtros.genero));
  }
  if (filtros.tipo?.length && omitir !== 'tipo') {
    lista.push(inArray(products.tipo, filtros.tipo));
  }
  if (filtros.marca?.length && omitir !== 'marca') {
    lista.push(inArray(brands.slug, filtros.marca));
  }
  if (filtros.familia?.length && omitir !== 'familia') {
    lista.push(inArray(products.familiaOlfativa, filtros.familia));
  }
  if (filtros.precioMin != null && omitir !== 'precioMin' && omitir !== 'precio') {
    lista.push(gte(products.precio, filtros.precioMin));
  }
  if (filtros.precioMax != null && omitir !== 'precioMax' && omitir !== 'precio') {
    lista.push(lte(products.precio, filtros.precioMax));
  }
  if (filtros.disponibles && omitir !== 'disponibles') {
    lista.push(gt(products.stock, 0));
  }
  if (filtros.flag && omitir !== 'flag') {
    if (filtros.flag === 'destacado') lista.push(eq(products.destacado, true));
    if (filtros.flag === 'bestseller') lista.push(eq(products.bestseller, true));
    if (filtros.flag === 'nuevo') lista.push(eq(products.nuevo, true));
    if (filtros.flag === 'oferta') {
      lista.push(isNotNull(products.precioAnterior));
      lista.push(sql`${products.precioAnterior} > ${products.precio}`);
    }
  }
  return lista;
}

function ordenamiento(orden: string | undefined) {
  switch (orden) {
    case 'nombre':
      return [asc(products.nombre)];
    case 'precio-asc':
      // Las referencias sin precio se van al final.
      return [sql`${products.precio} is null`, asc(products.precio), asc(products.nombre)];
    case 'precio-desc':
      return [sql`${products.precio} is null`, desc(products.precio), asc(products.nombre)];
    case 'novedades':
      return [desc(products.createdAt), asc(products.orden)];
    default:
      return [desc(products.destacado), asc(products.orden), asc(products.nombre)];
  }
}

/** Imagen principal de cada producto (una sola consulta para todo el listado). */
async function imagenesPrincipales(ids: number[]) {
  if (!ids.length) return new Map<number, { url: string; alt: string | null }>();
  const filas = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      alt: productImages.alt,
      tipo: productImages.tipo,
      orden: productImages.orden,
    })
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(
      sql`case ${productImages.tipo} when 'principal' then 0 when 'secundaria' then 1 else 2 end`,
      asc(productImages.orden),
      asc(productImages.id),
    )
    .all();

  const mapa = new Map<number, { url: string; alt: string | null }>();
  for (const fila of filas) {
    if (!mapa.has(fila.productId)) mapa.set(fila.productId, { url: fila.url, alt: fila.alt });
  }
  return mapa;
}

type FilaProducto = Omit<ProductoVista, 'imagen' | 'imagenAlt'>;

async function conImagenes(filas: FilaProducto[]): Promise<ProductoVista[]> {
  const mapa = await imagenesPrincipales(filas.map((fila) => fila.id));
  return filas.map((fila) => ({
    ...fila,
    imagen: mapa.get(fila.id)?.url ?? null,
    imagenAlt: mapa.get(fila.id)?.alt ?? null,
  }));
}

export async function listarProductos(filtros: Filtros) {
  const porPagina = filtros.porPagina ?? POR_PAGINA;
  const pagina = Math.max(1, filtros.pagina ?? 1);
  const donde = and(...condiciones(filtros));

  const [filas, totalFilas] = await Promise.all([
    db
      .select(columnas)
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(donde)
      .orderBy(...ordenamiento(filtros.orden))
      .limit(porPagina)
      .offset((pagina - 1) * porPagina)
      .all(),
    db
      .select({ total: count() })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(donde)
      .get(),
  ]);

  const total = totalFilas?.total ?? 0;
  return {
    items: await conImagenes(filas),
    total,
    pagina,
    porPagina,
    paginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

/** Selecciones cortas para la home y los carruseles. */
export async function seleccion(
  filtros: Filtros & { limite?: number },
): Promise<ProductoVista[]> {
  const filas = await db
    .select(columnas)
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(...condiciones(filtros)))
    .orderBy(...ordenamiento(filtros.orden))
    .limit(filtros.limite ?? 8)
    .all();
  return conImagenes(filas);
}

export type Facetas = {
  marcas: { slug: string; nombre: string; total: number }[];
  tipos: { valor: string; total: number }[];
  generos: { valor: string; total: number }[];
  familias: { valor: string; total: number }[];
  precio: { min: number | null; max: number | null };
  conPrecio: number;
  /** Referencias con inventario controlado: sin ellas, filtrar por stock vaciaría el catálogo. */
  conStock: number;
  rangosPrecio: { min: number | null; max: number | null; etiqueta: string; total: number }[];
};

/**
 * Tramos pensados para precios de perfumería en pesos colombianos.
 * Cada mínimo empieza un peso por encima del máximo anterior: un perfume de
 * exactamente $250.000 cae en un solo tramo, no en dos.
 */
export const RANGOS_PRECIO: { min: number | null; max: number | null; etiqueta: string }[] = [
  { min: null, max: 250_000, etiqueta: 'Hasta $250.000' },
  { min: 250_001, max: 400_000, etiqueta: '$250.000 – $400.000' },
  { min: 400_001, max: 700_000, etiqueta: '$400.000 – $700.000' },
  { min: 700_001, max: 1_200_000, etiqueta: '$700.000 – $1.200.000' },
  { min: 1_200_001, max: null, etiqueta: 'Más de $1.200.000' },
];

export async function facetas(filtros: Filtros): Promise<Facetas> {
  const [marcasFilas, tiposFilas, generosFilas, familiasFilas, rango] = await Promise.all([
    db
      .select({ slug: brands.slug, nombre: brands.nombre, total: count() })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(and(...condiciones(filtros, 'marca'), isNotNull(brands.slug)))
      .groupBy(brands.slug, brands.nombre)
      .orderBy(asc(brands.nombre))
      .all(),
    db
      .select({ valor: products.tipo, total: count() })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(and(...condiciones(filtros, 'tipo'), isNotNull(products.tipo)))
      .groupBy(products.tipo)
      .all(),
    db
      .select({ valor: products.genero, total: count() })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(and(...condiciones(filtros, 'genero')))
      .groupBy(products.genero)
      .all(),
    db
      .select({ valor: products.familiaOlfativa, total: count() })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(
        and(
          ...condiciones(filtros, 'familia'),
          isNotNull(products.familiaOlfativa),
          ne(products.familiaOlfativa, ''),
        ),
      )
      .groupBy(products.familiaOlfativa)
      .orderBy(asc(products.familiaOlfativa))
      .all(),
    db
      .select({
        min: sql<number | null>`min(${products.precio})`,
        max: sql<number | null>`max(${products.precio})`,
        conPrecio: sql<number>`sum(case when ${products.precio} is not null then 1 else 0 end)`,
        conStock: sql<number>`sum(case when ${products.stock} is not null then 1 else 0 end)`,
        // Un contador por tramo, en la misma consulta.
        ...Object.fromEntries(
          RANGOS_PRECIO.map((rango, indice) => [
            `r${indice}`,
            sql<number>`sum(case when ${products.precio} is not null${
              rango.min != null ? sql` and ${products.precio} >= ${rango.min}` : sql``
            }${rango.max != null ? sql` and ${products.precio} <= ${rango.max}` : sql``} then 1 else 0 end)`,
          ]),
        ),
      })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(and(...condiciones(filtros, 'precio')))
      .get(),
  ]);

  const conteoRango = rango as Record<string, unknown> | undefined;

  return {
    marcas: marcasFilas.filter((fila): fila is { slug: string; nombre: string; total: number } =>
      Boolean(fila.slug),
    ),
    tipos: tiposFilas.filter((fila): fila is { valor: string; total: number } => Boolean(fila.valor)),
    generos: generosFilas.filter((fila) => fila.valor !== GENERO_SIN_ASIGNAR),
    familias: familiasFilas.filter((fila): fila is { valor: string; total: number } =>
      Boolean(fila.valor),
    ),
    precio: { min: rango?.min ?? null, max: rango?.max ?? null },
    conPrecio: Number(rango?.conPrecio ?? 0),
    conStock: Number(rango?.conStock ?? 0),
    rangosPrecio: RANGOS_PRECIO.map((tramo, indice) => ({
      ...tramo,
      total: Number(conteoRango?.[`r${indice}`] ?? 0),
    })).filter((tramo) => tramo.total > 0),
  };
}

/* ── Ficha de producto ─────────────────────────────────────────────── */

/*
 * Columnas que NUNCA salen de la base hacia la tienda: el costo es el precio
 * de compra del negocio y la referencia/URL delatan al proveedor. Se excluyen
 * aquí, en la consulta, y no más abajo: lo que no se lee no se puede filtrar
 * por error a un componente, a los datos estructurados o al payload de React.
 */
const { costo: _costo, proveedorRef: _ref, proveedorUrl: _url, ...columnasPublicas } =
  getTableColumns(products);

export const getProducto = cache(async (slug: string) => {
  const fila = await db
    .select({
      producto: columnasPublicas,
      marca: brands.nombre,
      marcaSlug: brands.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(eq(products.slug, slug), eq(products.activo, true)))
    .get();

  if (!fila) return null;

  const [imagenes, resenas, resumen] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, fila.producto.id))
      .orderBy(
        sql`case ${productImages.tipo} when 'principal' then 0 when 'secundaria' then 1 else 2 end`,
        asc(productImages.orden),
        asc(productImages.id),
      )
      .all(),
    db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, fila.producto.id), eq(reviews.estado, 'aprobada')))
      .orderBy(desc(reviews.createdAt))
      .limit(12)
      .all(),
    db
      .select({ total: count(), promedio: sql<number>`avg(${reviews.rating})` })
      .from(reviews)
      .where(and(eq(reviews.productId, fila.producto.id), eq(reviews.estado, 'aprobada')))
      .get(),
  ]);

  return {
    ...fila.producto,
    marca: fila.marca,
    marcaSlug: fila.marcaSlug,
    imagenes,
    resenas,
    rating: resumen?.total ? Number(resumen.promedio) : null,
    totalResenas: resumen?.total ?? 0,
  };
});

export async function relacionados(producto: {
  id: number;
  marcaId: number | null;
  tipo: string | null;
  genero: string;
}): Promise<ProductoVista[]> {
  const base = [eq(products.activo, true), ne(products.id, producto.id)];
  const afinidad = [
    producto.marcaId ? eq(products.marcaId, producto.marcaId) : undefined,
    producto.tipo ? eq(products.tipo, producto.tipo) : undefined,
    eq(products.genero, producto.genero),
  ].filter(Boolean) as SQL[];

  const filas = await db
    .select(columnas)
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(...base, or(...afinidad)))
    .orderBy(
      producto.marcaId
        ? sql`case when ${products.marcaId} = ${producto.marcaId} then 0 else 1 end`
        : sql`1`,
      sql`case when ${products.genero} = ${producto.genero} then 0 else 1 end`,
      asc(products.orden),
    )
    .limit(8)
    .all();

  return conImagenes(filas);
}

/** Sugerencias del buscador (respuesta instantánea). */
export async function sugerencias(termino: string, limite = 8) {
  const texto = normalizar(termino);
  if (texto.length < 2) return [];
  const condicionesBusqueda = texto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((parte) => like(products.buscador, `%${parte}%`));

  const filas = await db
    .select({
      slug: products.slug,
      nombre: products.nombre,
      codigo: products.codigo,
      genero: products.genero,
      precio: products.precio,
      marca: brands.nombre,
      id: products.id,
    })
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(eq(products.activo, true), ...condicionesBusqueda))
    .orderBy(desc(products.destacado), asc(products.nombre))
    .limit(limite)
    .all();

  const mapa = await imagenesPrincipales(filas.map((fila) => fila.id));
  return filas.map((fila) => ({ ...fila, imagen: mapa.get(fila.id)?.url ?? null }));
}

/** Productos concretos por id, respetando el orden recibido. */
export async function productosPorIds(ids: number[]): Promise<ProductoVista[]> {
  if (!ids.length) return [];
  const filas = await db
    .select(columnas)
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(eq(products.activo, true), inArray(products.id, ids)))
    .all();

  const conImagen = await conImagenes(filas);
  const orden = new Map(ids.map((id, indice) => [id, indice]));
  return conImagen.sort((a, b) => (orden.get(a.id) ?? 0) - (orden.get(b.id) ?? 0));
}

export const listarMarcas = cache(async () => {
  return db
    .select({
      slug: brands.slug,
      nombre: brands.nombre,
      origen: brands.origen,
      total: count(products.id),
    })
    .from(brands)
    .leftJoin(products, and(eq(products.marcaId, brands.id), eq(products.activo, true)))
    .groupBy(brands.id)
    .having(gt(count(products.id), 0))
    .orderBy(asc(brands.nombre))
    .all();
});

export const contarProductos = cache(async () => {
  const fila = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.activo, true))
    .get();
  return fila?.total ?? 0;
});
