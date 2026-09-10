import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

/* ─── USUARIOS DEL PANEL ─────────────────────────────────── */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  passwordHash: text('password_hash').notNull(),
  rol: text('rol').notNull().default('admin'), // admin | editor
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
  ultimoAcceso: text('ultimo_acceso'),
  // Sube al cambiar la contrasena: invalida las cookies ya emitidas.
  sessionVersion: integer('session_version').notNull().default(1),
  // Freno a la fuerza bruta en el acceso al panel.
  intentosFallidos: integer('intentos_fallidos').notNull().default(0),
  bloqueadoHasta: text('bloqueado_hasta'),
  createdAt: text('created_at').notNull().default(now),
});

/* ─── MARCAS ─────────────────────────────────────────────── */
export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  logo: text('logo'),
  origen: text('origen'), // arabe | disenador | nicho | comercial | null
  destacada: integer('destacada', { mode: 'boolean' }).notNull().default(false),
  orden: integer('orden').notNull().default(0),
});

/* ─── CATEGORÍAS ─────────────────────────────────────────── */
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  imagen: text('imagen'),
  tipo: text('tipo').notNull().default('coleccion'), // genero | coleccion
  filtro: text('filtro'), // clave que usa el catalogo: genero:DAMA, tipo:arabe, flag:destacado
  orden: integer('orden').notNull().default(0),
  activa: integer('activa', { mode: 'boolean' }).notNull().default(true),
  destacadaHome: integer('destacada_home', { mode: 'boolean' }).notNull().default(true),
});

/* ─── PRODUCTOS ──────────────────────────────────────────── */
export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    codigo: text('codigo').notNull().unique(),
    slug: text('slug').notNull().unique(),
    nombre: text('nombre').notNull(),
    marcaId: integer('marca_id').references(() => brands.id, { onDelete: 'set null' }),
    genero: text('genero').notNull(), // DAMA | CABALLERO | UNISEX
    tipo: text('tipo'), // arabe | nicho | disenador | comercial (editable)

    descripcion: text('descripcion'),
    descripcionCorta: text('descripcion_corta'),

    // Precios en pesos colombianos (enteros). NULL = sin precio asignado todavia.
    precio: integer('precio'),
    precioAnterior: integer('precio_anterior'),
    precioMayorista: integer('precio_mayorista'),

    // Inventario. NULL = sin control de stock (no se muestra disponibilidad).
    stock: integer('stock'),
    stockMinimo: integer('stock_minimo').default(3),

    // Ficha tecnica: solo se muestra lo que este diligenciado.
    familiaOlfativa: text('familia_olfativa'),
    concentracion: text('concentracion'),
    presentacion: text('presentacion'),
    notasSalida: text('notas_salida'),
    notasCorazon: text('notas_corazon'),
    notasFondo: text('notas_fondo'),
    duracion: text('duracion'),
    origenPais: text('origen_pais'),

    // Atributos del buscador de fragancias (scoring).
    intensidad: text('intensidad'), // suave | media | intensa
    ocasion: text('ocasion', { mode: 'json' }).$type<string[]>().default([]),
    personalidad: text('personalidad', { mode: 'json' }).$type<string[]>().default([]),
    tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),

    destacado: integer('destacado', { mode: 'boolean' }).notNull().default(false),
    bestseller: integer('bestseller', { mode: 'boolean' }).notNull().default(false),
    nuevo: integer('nuevo', { mode: 'boolean' }).notNull().default(false),
    activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
    requiereRevision: integer('requiere_revision', { mode: 'boolean' }).notNull().default(false),

    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),

    // Texto normalizado (minúsculas, sin tildes) para el buscador.
    buscador: text('buscador').notNull().default(''),

    vistas: integer('vistas').notNull().default(0),
    orden: integer('orden').notNull().default(0),
    createdAt: text('created_at').notNull().default(now),
    updatedAt: text('updated_at').notNull().default(now),
  },
  (t) => [
    index('products_genero_idx').on(t.genero),
    index('products_marca_idx').on(t.marcaId),
    index('products_activo_idx').on(t.activo),
    index('products_tipo_idx').on(t.tipo),
  ],
);

/* ─── IMÁGENES DE PRODUCTO ───────────────────────────────── */
export const productImages = sqliteTable(
  'product_images',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: text('alt'),
    tipo: text('tipo').notNull().default('galeria'), // principal | secundaria | galeria | lifestyle | notas
    orden: integer('orden').notNull().default(0),
  },
  (t) => [index('product_images_product_idx').on(t.productId)],
);

/* ─── RELACIÓN PRODUCTO ↔ CATEGORÍA ──────────────────────── */
export const productCategories = sqliteTable(
  'product_categories',
  {
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('product_categories_pk').on(t.productId, t.categoryId)],
);

/* ─── CLIENTES ───────────────────────────────────────────── */
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellido: text('apellido'),
  telefono: text('telefono').notNull(),
  email: text('email'),
  departamento: text('departamento'),
  ciudad: text('ciudad'),
  direccion: text('direccion'),
  notas: text('notas'),
  createdAt: text('created_at').notNull().default(now),
});

/* ─── PEDIDOS ────────────────────────────────────────────── */
export const orders = sqliteTable(
  'orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    numero: text('numero').notNull().unique(),
    customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    nombre: text('nombre').notNull(),
    apellido: text('apellido'),
    telefono: text('telefono').notNull(),
    email: text('email'),
    departamento: text('departamento'),
    ciudad: text('ciudad'),
    direccion: text('direccion'),
    notas: text('notas'),
    subtotal: integer('subtotal').notNull().default(0),
    envio: integer('envio').notNull().default(0),
    descuento: integer('descuento').notNull().default(0),
    total: integer('total').notNull().default(0),
    cupon: text('cupon'),
    metodoPago: text('metodo_pago').notNull().default('whatsapp'),
    estado: text('estado').notNull().default('pendiente'),
    estadoPago: text('estado_pago').notNull().default('pendiente'),
    // El inventario se descuenta al confirmar el pedido, no al crearlo:
    // así un carrito abandonado no bloquea unidades reales.
    inventarioDescontado: integer('inventario_descontado', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at').notNull().default(now),
    updatedAt: text('updated_at').notNull().default(now),
  },
  (t) => [index('orders_estado_idx').on(t.estado)],
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
    codigo: text('codigo').notNull(),
    nombre: text('nombre').notNull(),
    precio: integer('precio').notNull(),
    cantidad: integer('cantidad').notNull().default(1),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
);

/* ─── RESEÑAS ────────────────────────────────────────────── */
export const reviews = sqliteTable(
  'reviews',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    email: text('email'),
    rating: integer('rating').notNull(),
    titulo: text('titulo'),
    comentario: text('comentario').notNull(),
    estado: text('estado').notNull().default('pendiente'), // pendiente | aprobada | rechazada
    createdAt: text('created_at').notNull().default(now),
  },
  (t) => [index('reviews_product_idx').on(t.productId, t.estado)],
);

/* ─── CUPONES ────────────────────────────────────────────── */
export const coupons = sqliteTable('coupons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  codigo: text('codigo').notNull().unique(),
  descripcion: text('descripcion'),
  tipo: text('tipo').notNull().default('porcentaje'), // porcentaje | fijo
  valor: real('valor').notNull(),
  compraMinima: integer('compra_minima').default(0),
  usosMaximos: integer('usos_maximos'),
  usos: integer('usos').notNull().default(0),
  expiraEn: text('expira_en'),
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(now),
});

/* ─── BANNERS ────────────────────────────────────────────── */
export const banners = sqliteTable('banners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ubicacion: text('ubicacion').notNull().default('hero'), // hero | promo | mayoristas
  titulo: text('titulo'),
  subtitulo: text('subtitulo'),
  texto: text('texto'),
  ctaTexto: text('cta_texto'),
  ctaUrl: text('cta_url'),
  ctaSecundarioTexto: text('cta_secundario_texto'),
  ctaSecundarioUrl: text('cta_secundario_url'),
  imagen: text('imagen'),
  orden: integer('orden').notNull().default(0),
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
});

/* ─── BLOQUES DE CONTENIDO EDITABLE ──────────────────────── */
export const contentBlocks = sqliteTable('content_blocks', {
  clave: text('clave').primaryKey(),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion'),
  contenido: text('contenido').notNull().default(''),
  grupo: text('grupo').notNull().default('paginas'),
  actualizadoEn: text('actualizado_en').notNull().default(now),
});

/* ─── CONFIGURACIÓN (clave/valor) ────────────────────────── */
export const settings = sqliteTable('settings', {
  clave: text('clave').primaryKey(),
  valor: text('valor').notNull().default(''),
  grupo: text('grupo').notNull().default('general'),
  etiqueta: text('etiqueta').notNull().default(''),
  ayuda: text('ayuda'),
  tipo: text('tipo').notNull().default('text'), // text | textarea | bool | number
  orden: integer('orden').notNull().default(0),
});

/* ─── SOLICITUDES (mayoristas / contacto) ────────────────── */
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tipo: text('tipo').notNull().default('mayorista'), // mayorista | contacto
  nombre: text('nombre').notNull(),
  empresa: text('empresa'),
  telefono: text('telefono'),
  email: text('email'),
  ciudad: text('ciudad'),
  cantidad: text('cantidad'),
  mensaje: text('mensaje'),
  atendido: integer('atendido', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(now),
});

export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type ContentBlock = typeof contentBlocks.$inferSelect;
