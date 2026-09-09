'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { coupons, customers, leads, orderItems, orders, products, reviews } from '@/db/schema';

/* ──────────────────────────────────────────────────────────────────
   Acciones públicas (sin sesión).
   Todo se valida en el servidor: los precios NUNCA se toman del
   cliente, se releen de la base de datos antes de crear el pedido.
   ────────────────────────────────────────────────────────────────── */

export type Resultado<T = undefined> =
  | { ok: true; datos?: T }
  | { ok: false; error: string; campos?: Record<string, string> };

const textoCorto = z.string().trim().min(1).max(120);
const telefono = z
  .string()
  .trim()
  .min(7, 'Teléfono demasiado corto')
  .max(20)
  .regex(/^[\d+\s()-]+$/, 'El teléfono sólo puede tener números');

/* ── Reseñas ─────────────────────────────────────────────────────── */
const esquemaResena = z.object({
  productId: z.coerce.number().int().positive(),
  nombre: textoCorto,
  email: z.string().trim().email('Correo no válido').max(160).optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1).max(5),
  comentario: z.string().trim().min(10, 'Cuéntanos un poco más').max(1200),
});

export async function enviarResena(_previo: unknown, formulario: FormData): Promise<Resultado> {
  const analisis = esquemaResena.safeParse(Object.fromEntries(formulario));
  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' };
  }
  const datos = analisis.data;

  const producto = await db
    .select({ id: products.id, slug: products.slug })
    .from(products)
    .where(eq(products.id, datos.productId))
    .get();
  if (!producto) return { ok: false, error: 'El producto no existe' };

  await db.insert(reviews).values({
    productId: producto.id,
    nombre: datos.nombre,
    email: datos.email || null,
    rating: datos.rating,
    comentario: datos.comentario,
    estado: 'pendiente', // toda reseña pasa por moderación en /admin
  });

  revalidatePath(`/perfumes/${producto.slug}`);
  return { ok: true };
}

/* ── Solicitudes (mayoristas y contacto) ─────────────────────────── */
const esquemaLead = z.object({
  tipo: z.enum(['mayorista', 'contacto']),
  nombre: textoCorto,
  empresa: z.string().trim().max(120).optional(),
  telefono: telefono.optional().or(z.literal('')),
  email: z.string().trim().email('Correo no válido').max(160).optional().or(z.literal('')),
  ciudad: z.string().trim().max(80).optional(),
  cantidad: z.string().trim().max(80).optional(),
  mensaje: z.string().trim().max(1500).optional(),
});

export async function enviarSolicitud(_previo: unknown, formulario: FormData): Promise<Resultado> {
  const analisis = esquemaLead.safeParse(Object.fromEntries(formulario));
  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos' };
  }
  const datos = analisis.data;
  if (!datos.telefono && !datos.email) {
    return { ok: false, error: 'Déjanos al menos un WhatsApp o un correo para responderte' };
  }

  await db.insert(leads).values({
    tipo: datos.tipo,
    nombre: datos.nombre,
    empresa: datos.empresa || null,
    telefono: datos.telefono || null,
    email: datos.email || null,
    ciudad: datos.ciudad || null,
    cantidad: datos.cantidad || null,
    mensaje: datos.mensaje || null,
  });

  return { ok: true };
}

/* ── Pedidos ─────────────────────────────────────────────────────── */
const esquemaPedido = z.object({
  nombre: textoCorto,
  apellido: z.string().trim().max(120).optional(),
  telefono,
  email: z.string().trim().email('Correo no válido').max(160).optional().or(z.literal('')),
  departamento: z.string().trim().max(80).optional(),
  ciudad: z.string().trim().max(80).optional(),
  direccion: z.string().trim().max(200).optional(),
  notas: z.string().trim().max(800).optional(),
  metodoPago: z.string().trim().max(40).default('whatsapp'),
  cupon: z.string().trim().max(40).optional(),
  items: z
    .array(z.object({ id: z.coerce.number().int().positive(), cantidad: z.coerce.number().int().min(1).max(99) }))
    .min(1, 'Tu carrito está vacío')
    .max(50),
});

export type PedidoCreado = { numero: string; total: number };

export async function crearPedido(entrada: unknown): Promise<Resultado<PedidoCreado>> {
  const analisis = esquemaPedido.safeParse(entrada);
  if (!analisis.success) {
    return { ok: false, error: analisis.error.issues[0]?.message ?? 'Revisa los datos del pedido' };
  }
  const datos = analisis.data;

  // Los precios se releen de la base: nunca se confía en el cliente.
  const ids = datos.items.map((item) => item.id);
  const referencias = await db
    .select({
      id: products.id,
      codigo: products.codigo,
      nombre: products.nombre,
      precio: products.precio,
      stock: products.stock,
      activo: products.activo,
    })
    .from(products)
    .where(inArray(products.id, ids))
    .all();

  const lineas: { productId: number; codigo: string; nombre: string; precio: number; cantidad: number }[] = [];
  for (const item of datos.items) {
    const referencia = referencias.find((fila) => fila.id === item.id);
    if (!referencia || !referencia.activo) {
      return { ok: false, error: 'Una de las referencias ya no está disponible. Actualiza tu carrito.' };
    }
    if (referencia.precio == null) {
      return {
        ok: false,
        error: `“${referencia.nombre}” todavía no tiene precio publicado. Escríbenos por WhatsApp para cotizarlo.`,
      };
    }
    if (referencia.stock != null && referencia.stock < item.cantidad) {
      return {
        ok: false,
        error: `No tenemos ${item.cantidad} unidades de “${referencia.nombre}”. Ajusta la cantidad.`,
      };
    }
    lineas.push({
      productId: referencia.id,
      codigo: referencia.codigo,
      nombre: referencia.nombre,
      precio: referencia.precio,
      cantidad: item.cantidad,
    });
  }

  const subtotal = lineas.reduce((total, linea) => total + linea.precio * linea.cantidad, 0);

  // Cupón (opcional), validado contra la base.
  let descuento = 0;
  let cuponAplicado: string | null = null;
  if (datos.cupon) {
    const cupon = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.codigo, datos.cupon.toUpperCase()), eq(coupons.activo, true)))
      .get();
    if (!cupon) return { ok: false, error: 'El cupón no es válido' };
    if (cupon.expiraEn && new Date(cupon.expiraEn) < new Date()) {
      return { ok: false, error: 'El cupón ya venció' };
    }
    if (cupon.usosMaximos != null && cupon.usos >= cupon.usosMaximos) {
      return { ok: false, error: 'El cupón alcanzó su límite de usos' };
    }
    if ((cupon.compraMinima ?? 0) > subtotal) {
      return { ok: false, error: 'Tu pedido no alcanza el mínimo del cupón' };
    }
    descuento =
      cupon.tipo === 'porcentaje'
        ? Math.round((subtotal * cupon.valor) / 100)
        : Math.round(cupon.valor);
    descuento = Math.min(descuento, subtotal);
    cuponAplicado = cupon.codigo;
  }

  const total = Math.max(0, subtotal - descuento);
  const numero = generarNumero();

  const cliente = await db
    .insert(customers)
    .values({
      nombre: datos.nombre,
      apellido: datos.apellido || null,
      telefono: datos.telefono,
      email: datos.email || null,
      departamento: datos.departamento || null,
      ciudad: datos.ciudad || null,
      direccion: datos.direccion || null,
    })
    .returning({ id: customers.id })
    .get();

  const pedido = await db
    .insert(orders)
    .values({
      numero,
      customerId: cliente.id,
      nombre: datos.nombre,
      apellido: datos.apellido || null,
      telefono: datos.telefono,
      email: datos.email || null,
      departamento: datos.departamento || null,
      ciudad: datos.ciudad || null,
      direccion: datos.direccion || null,
      notas: datos.notas || null,
      subtotal,
      envio: 0,
      descuento,
      total,
      cupon: cuponAplicado,
      metodoPago: datos.metodoPago,
      estado: 'pendiente',
    })
    .returning({ id: orders.id })
    .get();

  await db.insert(orderItems).values(
    lineas.map((linea) => ({
      orderId: pedido.id,
      productId: linea.productId,
      codigo: linea.codigo,
      nombre: linea.nombre,
      precio: linea.precio,
      cantidad: linea.cantidad,
    })),
  );

  if (cuponAplicado) {
    await db
      .update(coupons)
      .set({ usos: sql`${coupons.usos} + 1` })
      .where(eq(coupons.codigo, cuponAplicado));
  }

  return { ok: true, datos: { numero, total } };
}

function generarNumero(): string {
  const ahora = new Date();
  const fecha = `${ahora.getFullYear()}`.slice(2) + String(ahora.getMonth() + 1).padStart(2, '0');
  const aleatorio = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `YL-${fecha}-${aleatorio}`;
}

/* ── Consulta de pedido por número + teléfono ────────────────────── */
export type PedidoConsultado = {
  numero: string;
  estado: string;
  estadoPago: string;
  creado: string;
  nombre: string;
  ciudad: string | null;
  direccion: string | null;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  items: { nombre: string; codigo: string; cantidad: number; precio: number }[];
};

export async function consultarPedido(
  _previo: unknown,
  formulario: FormData,
): Promise<Resultado<PedidoConsultado>> {
  const numero = String(formulario.get('numero') ?? '')
    .trim()
    .toUpperCase();
  const telefonoIngresado = String(formulario.get('telefono') ?? '').replace(/\D/g, '');

  if (!numero || telefonoIngresado.length < 7) {
    return { ok: false, error: 'Ingresa el número de pedido y tu teléfono' };
  }

  const pedido = await db.select().from(orders).where(eq(orders.numero, numero)).get();
  // Se compara siempre, exista o no el pedido, para no revelar cuáles existen.
  if (!pedido || pedido.telefono.replace(/\D/g, '') !== telefonoIngresado) {
    return { ok: false, error: 'No encontramos un pedido con esos datos' };
  }

  const items = await db
    .select({
      nombre: orderItems.nombre,
      codigo: orderItems.codigo,
      cantidad: orderItems.cantidad,
      precio: orderItems.precio,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, pedido.id))
    .all();

  return {
    ok: true,
    datos: {
      numero: pedido.numero,
      estado: pedido.estado,
      estadoPago: pedido.estadoPago,
      creado: pedido.createdAt,
      nombre: pedido.nombre,
      ciudad: pedido.ciudad,
      direccion: pedido.direccion,
      subtotal: pedido.subtotal,
      descuento: pedido.descuento,
      envio: pedido.envio,
      total: pedido.total,
      items,
    },
  };
}
