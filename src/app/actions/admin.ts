'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  banners,
  brands,
  categories,
  contentBlocks,
  coupons,
  leads,
  orderItems,
  orders,
  productImages,
  products,
  reviews,
  settings,
  users,
} from '@/db/schema';
import { assertAdmin } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { slugify, textoBuscador } from '@/lib/text';
import { ESTADOS_PEDIDO } from '@/lib/format';
import { FORMATOS_ANALITICA } from '@/lib/settings';

export type Estado = { ok: boolean; mensaje: string } | null;

const ok = (mensaje: string): Estado => ({ ok: true, mensaje });
const error = (mensaje: string): Estado => ({ ok: false, mensaje });

/** Toda acción del panel valida la sesión antes de tocar la base de datos. */
async function guardia() {
  await assertAdmin();
}

function refrescarTienda(rutas: string[] = []) {
  for (const ruta of ['/', '/perfumes', ...rutas]) revalidatePath(ruta);
}

const numeroOpcional = z
  .union([z.string(), z.number()])
  .transform((valor) => {
    const texto = String(valor).replace(/[^\d-]/g, '').trim();
    if (!texto) return null;
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : null;
  })
  .nullable()
  .optional();

const listaOpcional = z
  .string()
  .optional()
  .transform((valor) =>
    (valor ?? '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );

const textoOpcional = z
  .string()
  .optional()
  .transform((valor) => (valor?.trim() ? valor.trim() : null));

const SINONIMOS_GENERO: Record<string, string> = {
  DAMA: 'mujer dama femenino',
  CABALLERO: 'hombre caballero masculino',
  UNISEX: 'unisex',
};

const SINONIMOS_TIPO: Record<string, string> = {
  arabe: 'arabe arabes oriental',
  nicho: 'nicho',
  disenador: 'disenador diseñador',
  comercial: 'comercial',
};

/**
 * Texto normalizado que alimenta el buscador. Vive en un solo sitio para que
 * cualquier acción que cambie nombre, marca, género o tipo lo recalcule igual.
 */
function indiceBuscador(producto: {
  codigo: string;
  nombre: string;
  marca?: string | null;
  genero: string;
  tipo?: string | null;
  familiaOlfativa?: string | null;
  tags?: string[] | null;
}): string {
  return textoBuscador([
    producto.codigo,
    producto.nombre,
    producto.marca,
    SINONIMOS_GENERO[producto.genero],
    producto.tipo ? SINONIMOS_TIPO[producto.tipo] : null,
    producto.familiaOlfativa,
    (producto.tags ?? []).join(' '),
  ]);
}

/* ═══════════════════════════════ PRODUCTOS ═══════════════════════ */
const esquemaProducto = z.object({
  id: z.coerce.number().int().optional(),
  codigo: z.string().trim().min(1, 'El código es obligatorio').max(40),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  slug: z.string().trim().max(200).optional(),
  genero: z.enum(['DAMA', 'CABALLERO', 'UNISEX', 'SIN_GENERO']),
  marcaId: z.coerce.number().int().optional().nullable(),
  tipo: z.string().trim().optional(),
  descripcion: textoOpcional,
  descripcionCorta: textoOpcional,
  precio: numeroOpcional,
  precioAnterior: numeroOpcional,
  precioMayorista: numeroOpcional,
  costo: numeroOpcional,
  stock: numeroOpcional,
  stockMinimo: numeroOpcional,
  familiaOlfativa: textoOpcional,
  concentracion: textoOpcional,
  presentacion: textoOpcional,
  notasSalida: textoOpcional,
  notasCorazon: textoOpcional,
  notasFondo: textoOpcional,
  duracion: textoOpcional,
  origenPais: textoOpcional,
  intensidad: textoOpcional,
  ocasion: listaOpcional,
  personalidad: listaOpcional,
  tags: listaOpcional,
  seoTitle: textoOpcional,
  seoDescription: textoOpcional,
  destacado: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  nuevo: z.coerce.boolean().optional(),
  activo: z.coerce.boolean().optional(),
  requiereRevision: z.coerce.boolean().optional(),
});

export async function guardarProducto(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();

  const bruto = Object.fromEntries(formulario) as Record<string, string>;
  const analisis = esquemaProducto.safeParse({
    ...bruto,
    marcaId: bruto.marcaId ? Number(bruto.marcaId) : null,
    destacado: bruto.destacado === 'on',
    bestseller: bruto.bestseller === 'on',
    nuevo: bruto.nuevo === 'on',
    activo: bruto.activo === 'on',
    requiereRevision: bruto.requiereRevision === 'on',
  });

  if (!analisis.success) return error(analisis.error.issues[0]?.message ?? 'Revisa los datos');
  const datos = analisis.data;

  if (datos.precio != null && datos.precioAnterior != null && datos.precioAnterior <= datos.precio) {
    return error('El precio anterior debe ser mayor que el precio actual');
  }

  const marca = datos.marcaId
    ? await db.select({ nombre: brands.nombre }).from(brands).where(eq(brands.id, datos.marcaId)).get()
    : null;

  const buscador = indiceBuscador({
    codigo: datos.codigo,
    nombre: datos.nombre,
    marca: marca?.nombre,
    genero: datos.genero,
    tipo: datos.tipo,
    familiaOlfativa: datos.familiaOlfativa,
    tags: datos.tags,
  });

  const valores = {
    codigo: datos.codigo,
    nombre: datos.nombre,
    genero: datos.genero,
    marcaId: datos.marcaId ?? null,
    tipo: datos.tipo || null,
    descripcion: datos.descripcion,
    descripcionCorta: datos.descripcionCorta,
    precio: datos.precio ?? null,
    precioAnterior: datos.precioAnterior ?? null,
    precioMayorista: datos.precioMayorista ?? null,
    costo: datos.costo ?? null,
    stock: datos.stock ?? null,
    stockMinimo: datos.stockMinimo ?? 3,
    familiaOlfativa: datos.familiaOlfativa,
    concentracion: datos.concentracion,
    presentacion: datos.presentacion,
    notasSalida: datos.notasSalida,
    notasCorazon: datos.notasCorazon,
    notasFondo: datos.notasFondo,
    duracion: datos.duracion,
    origenPais: datos.origenPais,
    intensidad: datos.intensidad,
    ocasion: datos.ocasion ?? [],
    personalidad: datos.personalidad ?? [],
    tags: datos.tags ?? [],
    seoTitle: datos.seoTitle,
    seoDescription: datos.seoDescription,
    destacado: datos.destacado ?? false,
    bestseller: datos.bestseller ?? false,
    nuevo: datos.nuevo ?? false,
    activo: datos.activo ?? false,
    requiereRevision: datos.requiereRevision ?? false,
    buscador,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (datos.id) {
      const existente = await db.select().from(products).where(eq(products.id, datos.id)).get();
      if (!existente) return error('La referencia ya no existe');
      await db.update(products).set(valores).where(eq(products.id, datos.id));
      refrescarTienda([`/perfumes/${existente.slug}`]);
      return ok('Cambios guardados');
    }

    const slugBase = datos.slug?.trim() ? slugify(datos.slug) : slugify(datos.nombre);
    const slug = await slugLibre(slugBase || slugify(datos.codigo));
    await db.insert(products).values({ ...valores, slug });
    refrescarTienda([`/perfumes/${slug}`]);
    return ok('Referencia creada');
  } catch (fallo) {
    const mensaje = fallo instanceof Error ? fallo.message : '';
    if (mensaje.includes('UNIQUE') && mensaje.includes('codigo')) {
      return error('Ya existe una referencia con ese código');
    }
    return error('No se pudo guardar la referencia');
  }
}

async function slugLibre(base: string): Promise<string> {
  let candidato = base || 'referencia';
  let intento = 2;
  while (await db.select({ id: products.id }).from(products).where(eq(products.slug, candidato)).get()) {
    candidato = `${base}-${intento}`;
    intento += 1;
  }
  return candidato;
}

export async function alternarBandera(id: number, campo: 'activo' | 'destacado' | 'bestseller' | 'nuevo') {
  await guardia();
  const producto = await db.select().from(products).where(eq(products.id, id)).get();
  if (!producto) return;
  await db
    .update(products)
    .set({ [campo]: !producto[campo], updatedAt: new Date().toISOString() })
    .where(eq(products.id, id));
  revalidatePath('/admin/productos');
  refrescarTienda([`/perfumes/${producto.slug}`]);
}

export async function eliminarProducto(id: number) {
  await guardia();
  const producto = await db.select().from(products).where(eq(products.id, id)).get();
  if (!producto) return;
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/admin/productos');
  refrescarTienda();
}

export async function duplicarProducto(id: number) {
  await guardia();
  const original = await db.select().from(products).where(eq(products.id, id)).get();
  if (!original) return;

  const { id: _ignorado, createdAt, updatedAt, ...resto } = original;
  let codigo = `${original.codigo}-COPIA`;
  let intento = 2;
  while (await db.select({ id: products.id }).from(products).where(eq(products.codigo, codigo)).get()) {
    codigo = `${original.codigo}-COPIA${intento}`;
    intento += 1;
  }

  await db.insert(products).values({
    ...resto,
    codigo,
    slug: await slugLibre(`${original.slug}-copia`),
    nombre: `${original.nombre} (copia)`,
    activo: false,
  });
  revalidatePath('/admin/productos');
}

/** Edición masiva de precio y stock desde la tabla rápida. */
export async function guardarPreciosMasivo(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();

  const cambios = new Map<
    number,
    { precio?: number | null; precioAnterior?: number | null; costo?: number | null; stock?: number | null }
  >();
  for (const [clave, valor] of formulario.entries()) {
    const coincidencia = /^(precio|precioAnterior|costo|stock)_(\d+)$/.exec(clave);
    if (!coincidencia) continue;
    const [, campo, idTexto] = coincidencia;
    const id = Number(idTexto);
    const texto = String(valor).replace(/[^\d]/g, '');
    const numero = texto ? Number(texto) : null;
    cambios.set(id, { ...cambios.get(id), [campo]: numero });
  }

  if (cambios.size === 0) return error('No hay cambios que guardar');

  let actualizados = 0;
  const rechazados: string[] = [];

  for (const [id, valores] of cambios) {
    const actual = await db.select().from(products).where(eq(products.id, id)).get();
    if (!actual) continue;
    const nuevos = {
      precio: valores.precio !== undefined ? valores.precio : actual.precio,
      precioAnterior: valores.precioAnterior !== undefined ? valores.precioAnterior : actual.precioAnterior,
      costo: valores.costo !== undefined ? valores.costo : actual.costo,
      stock: valores.stock !== undefined ? valores.stock : actual.stock,
    };

    // Un "precio anterior" que no sea mayor que el precio pintaría un descuento
    // que no existe. Se rechaza la fila en vez de publicar una oferta falsa.
    if (nuevos.precioAnterior != null && (nuevos.precio == null || nuevos.precioAnterior <= nuevos.precio)) {
      rechazados.push(actual.codigo);
      continue;
    }
    if (nuevos.precio != null && nuevos.precio < 0) {
      rechazados.push(actual.codigo);
      continue;
    }

    if (
      nuevos.precio === actual.precio &&
      nuevos.precioAnterior === actual.precioAnterior &&
      nuevos.costo === actual.costo &&
      nuevos.stock === actual.stock
    ) {
      continue;
    }
    await db
      .update(products)
      .set({ ...nuevos, updatedAt: new Date().toISOString() })
      .where(eq(products.id, id));
    actualizados += 1;
  }

  revalidatePath('/admin/productos/precios');
  refrescarTienda();

  const mensaje = `${actualizados} ${actualizados === 1 ? 'referencia actualizada' : 'referencias actualizadas'}`;
  if (rechazados.length) {
    return error(
      `${mensaje}. Sin guardar (el precio anterior debe ser mayor que el precio): ${rechazados.join(', ')}`,
    );
  }
  return ok(mensaje);
}

/** Asigna el mismo género a varias referencias a la vez. */
export async function asignarGeneroMasivo(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();

  const genero = String(formulario.get('genero') ?? '');
  if (!['DAMA', 'CABALLERO', 'UNISEX'].includes(genero)) return error('Elige el género a asignar');

  const ids = formulario
    .getAll('ids')
    .map((valor) => Number(valor))
    .filter((valor) => Number.isInteger(valor) && valor > 0);
  if (!ids.length) return error('Selecciona al menos una referencia');

  const afectados = await db
    .select({
      id: products.id,
      codigo: products.codigo,
      nombre: products.nombre,
      tipo: products.tipo,
      familiaOlfativa: products.familiaOlfativa,
      tags: products.tags,
      marca: brands.nombre,
    })
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(inArray(products.id, ids))
    .all();

  // El género entra en el índice del buscador ("hombre", "mujer"…): se recalcula.
  for (const producto of afectados) {
    await db
      .update(products)
      .set({
        genero,
        buscador: indiceBuscador({ ...producto, genero }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, producto.id));
  }

  revalidatePath('/admin/productos/generos');
  refrescarTienda(['/hombre', '/mujer', '/unisex']);
  const etiqueta = genero === 'DAMA' ? 'Mujer' : genero === 'CABALLERO' ? 'Hombre' : 'Unisex';
  return ok(`${afectados.length} ${afectados.length === 1 ? 'referencia' : 'referencias'} → ${etiqueta}`);
}

/* ═══════════════════════════════ IMÁGENES ════════════════════════ */
export async function agregarImagen(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const productId = Number(formulario.get('productId'));
  const url = String(formulario.get('url') ?? '').trim();
  const tipo = String(formulario.get('tipo') ?? 'galeria');
  const alt = String(formulario.get('alt') ?? '').trim();

  if (!Number.isInteger(productId) || !url) return error('Falta la imagen');
  if (!/^(https?:\/\/|\/)/.test(url)) return error('La URL de la imagen no es válida');

  const producto = await db.select().from(products).where(eq(products.id, productId)).get();
  if (!producto) return error('La referencia no existe');

  const maximo = await db
    .select({ maximo: sql<number>`coalesce(max(${productImages.orden}), -1)` })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .get();

  await db.insert(productImages).values({
    productId,
    url,
    alt: alt || producto.nombre,
    tipo,
    orden: (maximo?.maximo ?? -1) + 1,
  });

  revalidatePath(`/admin/productos/${productId}`);
  refrescarTienda([`/perfumes/${producto.slug}`]);
  return ok('Imagen agregada');
}

export async function eliminarImagen(id: number) {
  await guardia();
  const imagen = await db.select().from(productImages).where(eq(productImages.id, id)).get();
  if (!imagen) return;
  await db.delete(productImages).where(eq(productImages.id, id));
  revalidatePath(`/admin/productos/${imagen.productId}`);
  refrescarTienda();
}

export async function definirPrincipal(id: number) {
  await guardia();
  const imagen = await db.select().from(productImages).where(eq(productImages.id, id)).get();
  if (!imagen) return;
  await db
    .update(productImages)
    .set({ tipo: 'galeria' })
    .where(and(eq(productImages.productId, imagen.productId), eq(productImages.tipo, 'principal')));
  await db.update(productImages).set({ tipo: 'principal' }).where(eq(productImages.id, id));
  revalidatePath(`/admin/productos/${imagen.productId}`);
  refrescarTienda();
}

/* ═══════════════════════════════ PEDIDOS ═════════════════════════ */
export async function cambiarEstadoPedido(id: number, estado: string) {
  await guardia();
  if (!ESTADOS_PEDIDO.includes(estado as (typeof ESTADOS_PEDIDO)[number])) return;

  const pedido = await db.select().from(orders).where(eq(orders.id, id)).get();
  if (!pedido) return;

  // Al confirmar por primera vez se descuenta el inventario de las referencias
  // que tengan control de stock. Al cancelar, se devuelve exactamente lo mismo.
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).all();

  // La bandera se toma con un UPDATE condicional: si dos pestañas confirman a la
  // vez, sólo una encuentra `inventario_descontado = 0` y descuenta.
  if (estado === 'confirmado' && !pedido.inventarioDescontado) {
    const tomado = await db
      .update(orders)
      .set({ inventarioDescontado: true })
      .where(and(eq(orders.id, id), eq(orders.inventarioDescontado, false)))
      .returning({ id: orders.id })
      .get();

    if (tomado) {
      try {
        await db.transaction(async (tx) => {
          for (const item of items) {
            if (!item.productId) continue;
            // Sin `max(0, …)`: el stock puede quedar negativo y así queda a la
            // vista que se vendió más de lo que había. Recortarlo a 0 haría que
            // la devolución al cancelar inflara el inventario.
            await tx
              .update(products)
              .set({
                stock: sql`case when ${products.stock} is null then null else ${products.stock} - ${item.cantidad} end`,
              })
              .where(eq(products.id, item.productId));
          }
        });
      } catch {
        // Si el descuento falla, se suelta la bandera para poder reintentarlo.
        await db.update(orders).set({ inventarioDescontado: false }).where(eq(orders.id, id));
        return;
      }
    }
  }

  if (estado === 'cancelado' && pedido.inventarioDescontado) {
    const soltado = await db
      .update(orders)
      .set({ inventarioDescontado: false })
      .where(and(eq(orders.id, id), eq(orders.inventarioDescontado, true)))
      .returning({ id: orders.id })
      .get();

    if (soltado) {
      try {
        await db.transaction(async (tx) => {
          for (const item of items) {
            if (!item.productId) continue;
            await tx
              .update(products)
              .set({
                stock: sql`case when ${products.stock} is null then null else ${products.stock} + ${item.cantidad} end`,
              })
              .where(eq(products.id, item.productId));
          }

          // Un pedido cancelado no debe consumir el cupón que usó.
          if (pedido.cupon) {
            await tx
              .update(coupons)
              .set({ usos: sql`max(0, ${coupons.usos} - 1)` })
              .where(eq(coupons.codigo, pedido.cupon));
          }
        });
      } catch {
        await db.update(orders).set({ inventarioDescontado: true }).where(eq(orders.id, id));
        return;
      }
    }
  }

  await db
    .update(orders)
    .set({ estado, updatedAt: new Date().toISOString() })
    .where(eq(orders.id, id));

  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath('/admin/inventario');
  refrescarTienda();
}

export async function cambiarEstadoPago(id: number, estadoPago: string) {
  await guardia();
  if (!['pendiente', 'pagado', 'reembolsado'].includes(estadoPago)) return;
  await db
    .update(orders)
    .set({ estadoPago, updatedAt: new Date().toISOString() })
    .where(eq(orders.id, id));
  revalidatePath(`/admin/pedidos/${id}`);
}

/* ═══════════════════════════ CATEGORÍAS / MARCAS ═════════════════ */
export async function guardarCategoria(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const id = Number(formulario.get('id')) || null;
  const nombre = String(formulario.get('nombre') ?? '').trim();
  if (!nombre) return error('El nombre es obligatorio');

  const valores = {
    nombre,
    descripcion: String(formulario.get('descripcion') ?? '').trim() || null,
    imagen: String(formulario.get('imagen') ?? '').trim() || null,
    filtro: String(formulario.get('filtro') ?? '').trim() || null,
    orden: Number(formulario.get('orden')) || 0,
    activa: formulario.get('activa') === 'on',
    destacadaHome: formulario.get('destacadaHome') === 'on',
  };

  if (id) await db.update(categories).set(valores).where(eq(categories.id, id));
  else
    await db.insert(categories).values({
      ...valores,
      slug: await slugCategoriaLibre(slugify(nombre)),
      tipo: 'coleccion',
    });

  revalidatePath('/admin/categorias');
  refrescarTienda();
  return ok('Categoría guardada');
}

async function slugCategoriaLibre(base: string) {
  let candidato = base || 'categoria';
  let intento = 2;
  while (await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, candidato)).get()) {
    candidato = `${base}-${intento}`;
    intento += 1;
  }
  return candidato;
}

export async function eliminarCategoria(id: number) {
  await guardia();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath('/admin/categorias');
  refrescarTienda();
}

export async function guardarMarca(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const id = Number(formulario.get('id')) || null;
  const nombre = String(formulario.get('nombre') ?? '').trim();
  if (!nombre) return error('El nombre es obligatorio');

  const valores = {
    nombre,
    descripcion: String(formulario.get('descripcion') ?? '').trim() || null,
    origen: String(formulario.get('origen') ?? '').trim() || null,
    logo: String(formulario.get('logo') ?? '').trim() || null,
  };

  let reclasificados = 0;
  try {
    if (id) {
      const anterior = await db.select().from(brands).where(eq(brands.id, id)).get();
      await db.update(brands).set(valores).where(eq(brands.id, id));

      // Si cambia la clasificación de la marca, sus referencias la siguen,
      // salvo las que el negocio ya clasificó a mano de otra forma.
      if (anterior && anterior.origen !== valores.origen) {
        const referencias = await db
          .select({
            id: products.id,
            codigo: products.codigo,
            nombre: products.nombre,
            genero: products.genero,
            tipo: products.tipo,
            familiaOlfativa: products.familiaOlfativa,
            tags: products.tags,
          })
          .from(products)
          .where(eq(products.marcaId, id))
          .all();

        for (const referencia of referencias) {
          if (referencia.tipo !== null && referencia.tipo !== anterior.origen) continue;
          await db
            .update(products)
            .set({
              tipo: valores.origen,
              buscador: indiceBuscador({ ...referencia, tipo: valores.origen, marca: nombre }),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(products.id, referencia.id));
          reclasificados += 1;
        }
      }
    } else {
      await db.insert(brands).values({ ...valores, slug: await slugMarcaLibre(slugify(nombre)) });
    }
  } catch {
    return error('No se pudo guardar la marca. Revisa que el nombre no esté repetido.');
  }

  revalidatePath('/admin/marcas');
  refrescarTienda(['/arabes']);
  return ok(
    reclasificados
      ? `Marca guardada · ${reclasificados} ${reclasificados === 1 ? 'referencia reclasificada' : 'referencias reclasificadas'}`
      : 'Marca guardada',
  );
}

async function slugMarcaLibre(base: string) {
  let candidato = base || 'marca';
  let intento = 2;
  while (await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, candidato)).get()) {
    candidato = `${base}-${intento}`;
    intento += 1;
  }
  return candidato;
}

export async function eliminarMarca(id: number) {
  await guardia();
  await db.delete(brands).where(eq(brands.id, id));
  revalidatePath('/admin/marcas');
  refrescarTienda();
}

/** Asigna una marca a varias referencias a la vez. */
export async function asignarMarcaMasivo(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const marcaId = Number(formulario.get('marcaId'));
  const ids = formulario
    .getAll('ids')
    .map((valor) => Number(valor))
    .filter((valor) => Number.isInteger(valor));

  if (!Number.isInteger(marcaId) || ids.length === 0) return error('Selecciona marca y referencias');

  const marca = await db.select({ nombre: brands.nombre }).from(brands).where(eq(brands.id, marcaId)).get();
  if (!marca) return error('La marca ya no existe');

  // El índice del buscador incluye la marca: si no se recalcula, las referencias
  // dejan de aparecer al buscar por el nombre de la marca recién asignada.
  const afectados = await db
    .select({
      id: products.id,
      codigo: products.codigo,
      nombre: products.nombre,
      genero: products.genero,
      tipo: products.tipo,
      familiaOlfativa: products.familiaOlfativa,
      tags: products.tags,
    })
    .from(products)
    .where(inArray(products.id, ids))
    .all();

  for (const producto of afectados) {
    await db
      .update(products)
      .set({
        marcaId,
        buscador: indiceBuscador({ ...producto, marca: marca.nombre }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, producto.id));
  }

  revalidatePath('/admin/marcas');
  refrescarTienda();
  return ok(`${afectados.length} referencias actualizadas`);
}

/* ═══════════════════════════════ BANNERS ═════════════════════════ */
export async function guardarBanner(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const id = Number(formulario.get('id')) || null;
  const valores = {
    ubicacion: String(formulario.get('ubicacion') ?? 'hero'),
    titulo: String(formulario.get('titulo') ?? '').trim() || null,
    subtitulo: String(formulario.get('subtitulo') ?? '').trim() || null,
    texto: String(formulario.get('texto') ?? '').trim() || null,
    ctaTexto: String(formulario.get('ctaTexto') ?? '').trim() || null,
    ctaUrl: String(formulario.get('ctaUrl') ?? '').trim() || null,
    ctaSecundarioTexto: String(formulario.get('ctaSecundarioTexto') ?? '').trim() || null,
    ctaSecundarioUrl: String(formulario.get('ctaSecundarioUrl') ?? '').trim() || null,
    imagen: String(formulario.get('imagen') ?? '').trim() || null,
    activo: formulario.get('activo') === 'on',
    orden: Number(formulario.get('orden')) || 0,
  };

  if (id) await db.update(banners).set(valores).where(eq(banners.id, id));
  else await db.insert(banners).values(valores);

  revalidatePath('/admin/banners');
  refrescarTienda();
  return ok('Banner guardado');
}

export async function eliminarBanner(id: number) {
  await guardia();
  await db.delete(banners).where(eq(banners.id, id));
  revalidatePath('/admin/banners');
  refrescarTienda();
}

/* ═══════════════════════════════ CONTENIDO ═══════════════════════ */
export async function guardarContenido(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const clave = String(formulario.get('clave') ?? '');
  const contenido = String(formulario.get('contenido') ?? '');

  const bloque = await db.select().from(contentBlocks).where(eq(contentBlocks.clave, clave)).get();
  if (!bloque) return error('El bloque no existe');

  await db
    .update(contentBlocks)
    .set({ contenido, actualizadoEn: new Date().toISOString() })
    .where(eq(contentBlocks.clave, clave));

  revalidatePath('/admin/contenido');
  refrescarTienda([
    '/nosotros',
    '/envios',
    '/preguntas-frecuentes',
    '/politicas',
    '/terminos',
    '/privacidad',
    '/cambios-y-devoluciones',
    '/mayoristas',
  ]);
  return ok('Contenido actualizado');
}

/* ═══════════════════════════════ CUPONES ═════════════════════════ */
export async function guardarCupon(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();
  const id = Number(formulario.get('id')) || null;
  const codigo = String(formulario.get('codigo') ?? '').trim().toUpperCase();
  const valor = Number(formulario.get('valor'));
  const tipo = String(formulario.get('tipo') ?? 'porcentaje');

  if (!codigo) return error('El código es obligatorio');
  if (!Number.isFinite(valor) || valor <= 0) return error('El valor debe ser mayor que cero');
  if (tipo === 'porcentaje' && valor > 100) return error('El porcentaje no puede superar 100');

  const valores = {
    codigo,
    tipo,
    valor,
    descripcion: String(formulario.get('descripcion') ?? '').trim() || null,
    compraMinima: Number(formulario.get('compraMinima')) || 0,
    usosMaximos: Number(formulario.get('usosMaximos')) || null,
    expiraEn: String(formulario.get('expiraEn') ?? '').trim() || null,
    activo: formulario.get('activo') === 'on',
  };

  try {
    if (id) await db.update(coupons).set(valores).where(eq(coupons.id, id));
    else await db.insert(coupons).values(valores);
  } catch {
    return error('Ya existe un cupón con ese código');
  }

  revalidatePath('/admin/promociones');
  return ok('Cupón guardado');
}

export async function eliminarCupon(id: number) {
  await guardia();
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath('/admin/promociones');
}

/* ═══════════════════════════════ RESEÑAS ═════════════════════════ */
export async function moderarResena(id: number, estado: 'aprobada' | 'rechazada' | 'pendiente') {
  await guardia();
  const resena = await db.select().from(reviews).where(eq(reviews.id, id)).get();
  if (!resena) return;
  await db.update(reviews).set({ estado }).where(eq(reviews.id, id));

  const producto = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, resena.productId))
    .get();

  revalidatePath('/admin/resenas');
  if (producto) revalidatePath(`/perfumes/${producto.slug}`);
}

export async function eliminarResena(id: number) {
  await guardia();
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath('/admin/resenas');
}

/* ═══════════════════════════════ SOLICITUDES ═════════════════════ */
export async function marcarSolicitud(id: number, atendido: boolean) {
  await guardia();
  await db.update(leads).set({ atendido }).where(eq(leads.id, id));
  revalidatePath('/admin/solicitudes');
}

export async function eliminarSolicitud(id: number) {
  await guardia();
  await db.delete(leads).where(eq(leads.id, id));
  revalidatePath('/admin/solicitudes');
}

/* ═══════════════════════════════ CONFIGURACIÓN ═══════════════════ */
export async function guardarConfiguracion(_previo: Estado, formulario: FormData): Promise<Estado> {
  await guardia();

  const claves = await db.select({ clave: settings.clave, tipo: settings.tipo }).from(settings).all();

  // Los IDs de analítica acaban dentro de un script: se exige el formato exacto
  // para que un pegado con comillas no pueda inyectar código en la tienda.
  for (const [clave, formato] of Object.entries(FORMATOS_ANALITICA)) {
    const valor = String(formulario.get(clave) ?? '').trim();
    if (valor && !formato.test(valor)) {
      return error(
        clave === 'ga4_id'
          ? 'El ID de Google Analytics debe ser sólo el identificador, del tipo G-XXXXXXXXXX (no pegues el script completo).'
          : 'El ID del Meta Pixel debe ser sólo el número de identificación.',
      );
    }
  }

  for (const { clave, tipo } of claves) {
    if (tipo === 'bool') {
      await db
        .update(settings)
        .set({ valor: formulario.get(clave) === 'on' ? '1' : '0' })
        .where(eq(settings.clave, clave));
      continue;
    }
    if (!formulario.has(clave)) continue;
    await db
      .update(settings)
      .set({ valor: String(formulario.get(clave) ?? '').trim() })
      .where(eq(settings.clave, clave));
  }

  revalidatePath('/admin/configuracion');
  refrescarTienda(['/contacto', '/mayoristas']);
  return ok('Configuración guardada');
}

/* ═══════════════════════════════ CUENTA ══════════════════════════ */
export async function cambiarPassword(_previo: Estado, formulario: FormData): Promise<Estado> {
  const sesion = await assertAdmin();

  const actual = String(formulario.get('actual') ?? '');
  const nueva = String(formulario.get('nueva') ?? '');
  const repetida = String(formulario.get('repetida') ?? '');

  if (nueva.length < 10) return error('La nueva contraseña debe tener al menos 10 caracteres');
  if (nueva !== repetida) return error('Las contraseñas nuevas no coinciden');

  const usuario = await db.select().from(users).where(eq(users.id, sesion.uid)).get();
  if (!usuario || !(await verifyPassword(actual, usuario.passwordHash))) {
    return error('La contraseña actual no es correcta');
  }

  // Subir la version invalida cualquier cookie emitida antes de este cambio.
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(nueva), sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, sesion.uid));

  return ok('Contraseña actualizada. Vuelve a entrar para seguir usando el panel.');
}
