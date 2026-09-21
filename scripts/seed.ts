/**
 * Siembra la base de datos de YLANE PERFUMES.
 *
 *   npm run db:seed
 *
 * Es idempotente: se puede ejecutar de nuevo tras actualizar el Excel.
 * El CÓDIGO del producto es la llave; las referencias existentes se actualizan
 * (nombre, género, marca) y NUNCA se pisan los datos que el negocio cargó desde
 * el panel (precio, stock, notas, imágenes, atributos...).
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import {
  banners,
  brands,
  categories,
  contentBlocks,
  productCategories,
  products,
  settings,
  users,
} from '../src/db/schema.ts';
import { hashPassword } from '../src/lib/password.ts';
import { textoBuscador } from '../src/lib/text.ts';

const ETIQUETA_GENERO: Record<string, string> = {
  DAMA: 'mujer dama femenino',
  CABALLERO: 'hombre caballero masculino',
  UNISEX: 'unisex',
};

const ETIQUETA_TIPO: Record<string, string> = {
  arabe: 'arabe arabes oriental',
  nicho: 'nicho',
  disenador: 'disenador diseñador',
  comercial: 'comercial',
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const db = drizzle(
  createClient({
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ylane.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
  }),
);

type CatalogoJson = {
  totalProductos: number;
  marcas: { nombre: string; slug: string; origen: string | null }[];
  productos: {
    codigo: string;
    slug: string;
    nombre: string;
    genero: string;
    marca: string | null;
    tipo: string | null;
    descripcion: string;
    descripcionCorta: string;
    activo: boolean;
    requiereRevision: boolean;
  }[];
};

const catalogo: CatalogoJson = JSON.parse(
  readFileSync(join(root, 'data', 'catalogo.json'), 'utf8'),
);

/* ─────────────────────────── USUARIO ADMIN ─────────────────────────── */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      '⚠ ADMIN_EMAIL / ADMIN_PASSWORD no definidos en .env.local — no se creó el usuario del panel.',
    );
    return;
  }
  const existente = await db.select().from(users).where(eq(users.email, email)).get();
  if (existente) {
    console.log(`· Usuario admin ya existe (${email}) — no se modifica la contraseña.`);
    return;
  }
  await db.insert(users).values({
    email,
    nombre: process.env.ADMIN_NAME ?? 'Administrador',
    passwordHash: await hashPassword(password),
    rol: 'admin',
  });
  console.log(`✓ Usuario admin creado: ${email}`);
}

/* ─────────────────────────────── MARCAS ────────────────────────────── */
async function seedBrands() {
  const mapa = new Map<string, number>();
  for (const [indice, marca] of catalogo.marcas.entries()) {
    const existente = await db.select().from(brands).where(eq(brands.slug, marca.slug)).get();
    if (existente) {
      mapa.set(marca.nombre, existente.id);
      continue;
    }
    const creada = await db
      .insert(brands)
      .values({
        slug: marca.slug,
        nombre: marca.nombre,
        origen: marca.origen,
        orden: indice,
      })
      .returning({ id: brands.id })
      .get();
    mapa.set(marca.nombre, creada.id);
  }
  console.log(`✓ ${mapa.size} marcas`);
  return mapa;
}

/* ───────────────────────────── CATEGORÍAS ──────────────────────────── */
const CATEGORIAS = [
  {
    slug: 'mujer',
    nombre: 'Mujer',
    tipo: 'genero',
    filtro: 'genero:DAMA',
    descripcion: 'Perfumería femenina seleccionada por YLANE.',
    orden: 1,
  },
  {
    slug: 'hombre',
    nombre: 'Hombre',
    tipo: 'genero',
    filtro: 'genero:CABALLERO',
    descripcion: 'Perfumería masculina seleccionada por YLANE.',
    orden: 2,
  },
  {
    slug: 'unisex',
    nombre: 'Unisex',
    tipo: 'genero',
    filtro: 'genero:UNISEX',
    descripcion: 'Fragancias sin género para compartir.',
    orden: 3,
  },
  {
    slug: 'arabes',
    nombre: 'Árabes',
    tipo: 'coleccion',
    filtro: 'tipo:arabe',
    descripcion: 'La especialidad de la casa: perfumería árabe.',
    orden: 4,
  },
  {
    slug: 'nicho',
    nombre: 'Nicho',
    tipo: 'coleccion',
    filtro: 'tipo:nicho',
    descripcion: 'La parte más selectiva del catálogo.',
    orden: 5,
  },
  {
    slug: 'disenador',
    nombre: 'Diseñador',
    tipo: 'coleccion',
    filtro: 'tipo:disenador',
    descripcion: 'Casas de diseñador dentro de la distribución YLANE.',
    orden: 6,
    destacadaHome: false,
  },
  {
    slug: 'seleccion-ylane',
    nombre: 'Selección YLANE',
    tipo: 'coleccion',
    filtro: 'flag:destacado',
    descripcion: 'Las referencias que recomendamos de entrada.',
    orden: 7,
    destacadaHome: false,
  },
  {
    slug: 'best-sellers',
    nombre: 'Best Sellers',
    tipo: 'coleccion',
    filtro: 'flag:bestseller',
    descripcion: 'Lo que más sale del catálogo.',
    orden: 8,
  },
  {
    slug: 'novedades',
    nombre: 'Novedades',
    tipo: 'coleccion',
    filtro: 'flag:nuevo',
    descripcion: 'Lo último que entró al catálogo.',
    orden: 9,
    destacadaHome: false,
  },
  {
    slug: 'ofertas',
    nombre: 'Ofertas',
    tipo: 'coleccion',
    filtro: 'flag:oferta',
    descripcion: 'Referencias con precio rebajado.',
    orden: 10,
    destacadaHome: false,
  },
];

async function seedCategories() {
  const mapa = new Map<string, number>();
  for (const categoria of CATEGORIAS) {
    const existente = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categoria.slug))
      .get();
    if (existente) {
      mapa.set(categoria.slug, existente.id);
      continue;
    }
    const creada = await db
      .insert(categories)
      .values({
        slug: categoria.slug,
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        filtro: categoria.filtro,
        descripcion: categoria.descripcion,
        orden: categoria.orden,
        destacadaHome: categoria.destacadaHome ?? true,
      })
      .returning({ id: categories.id })
      .get();
    mapa.set(categoria.slug, creada.id);
  }
  console.log(`✓ ${mapa.size} categorías`);
  return mapa;
}

/* ─────────────────────────────── PRODUCTOS ─────────────────────────── */
async function seedProducts(marcas: Map<string, number>, cats: Map<string, number>) {
  let creados = 0;
  let actualizados = 0;

  for (const [indice, item] of catalogo.productos.entries()) {
    const marcaId = item.marca ? (marcas.get(item.marca) ?? null) : null;
    const existente = await db.select().from(products).where(eq(products.codigo, item.codigo)).get();
    const existentePrevio = existente;
    const buscador = textoBuscador([
      item.codigo,
      item.nombre !== item.codigo ? item.nombre : (existentePrevio?.nombre ?? item.nombre),
      item.marca,
      ETIQUETA_GENERO[item.genero],
      item.tipo ? ETIQUETA_TIPO[item.tipo] : null,
    ]);

    // Si en el Excel la fila no trae nombre, el importador usa el código como
    // provisional. En ese caso NO se pisa lo que el negocio ya corrigió en /admin.
    const nombreDelExcel = item.nombre !== item.codigo;

    let productId: number;
    if (existente) {
      // Sólo se refrescan los campos que provienen del Excel.
      await db
        .update(products)
        .set({
          nombre: nombreDelExcel ? item.nombre : existente.nombre,
          genero: item.genero,
          marcaId: existente.marcaId ?? marcaId,
          tipo: existente.tipo ?? item.tipo,
          buscador,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, existente.id));
      productId = existente.id;
      actualizados += 1;
    } else {
      // El slug del importador puede chocar con el de una referencia creada
      // desde el panel: se busca uno libre en vez de reventar con UNIQUE.
      let slug = item.slug;
      let intento = 2;
      while (await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).get()) {
        slug = `${item.slug}-${intento}`;
        intento += 1;
      }

      const creado = await db
        .insert(products)
        .values({
          codigo: item.codigo,
          slug,
          nombre: item.nombre,
          genero: item.genero,
          marcaId,
          tipo: item.tipo,
          descripcion: item.descripcion,
          descripcionCorta: item.descripcionCorta,
          activo: item.activo,
          requiereRevision: item.requiereRevision,
          buscador,
          orden: indice,
        })
        .returning({ id: products.id })
        .get();
      productId = creado.id;
      creados += 1;
    }

    // Categorías derivadas (género + clasificación).
    const destino = [
      cats.get(
        item.genero === 'DAMA' ? 'mujer' : item.genero === 'CABALLERO' ? 'hombre' : 'unisex',
      ),
      item.tipo ? cats.get(item.tipo === 'disenador' ? 'disenador' : item.tipo) : undefined,
    ].filter((id): id is number => typeof id === 'number');

    for (const categoryId of destino) {
      await db.insert(productCategories).values({ productId, categoryId }).onConflictDoNothing();
    }
  }

  console.log(`✓ productos: ${creados} creados · ${actualizados} actualizados`);
}

/* ─────────────────────────── CONFIGURACIÓN ─────────────────────────── */
const AJUSTES: {
  clave: string;
  valor?: string;
  grupo: string;
  etiqueta: string;
  ayuda?: string;
  tipo?: string;
  orden: number;
}[] = [
  {
    clave: 'whatsapp',
    grupo: 'contacto',
    etiqueta: 'Número de WhatsApp',
    ayuda: 'Formato internacional sin signos. Ejemplo: 573001234567. Mientras esté vacío, los botones de WhatsApp no se muestran en la tienda.',
    orden: 1,
  },
  {
    clave: 'telefono',
    grupo: 'contacto',
    etiqueta: 'Teléfono de contacto',
    orden: 2,
  },
  { clave: 'email', grupo: 'contacto', etiqueta: 'Correo de contacto', orden: 3 },
  { clave: 'ciudad', grupo: 'contacto', etiqueta: 'Ciudad', orden: 4 },
  { clave: 'direccion', grupo: 'contacto', etiqueta: 'Dirección', orden: 5 },
  { clave: 'horario', grupo: 'contacto', etiqueta: 'Horario de atención', orden: 6 },

  { clave: 'instagram', grupo: 'redes', etiqueta: 'Instagram (URL)', orden: 1 },
  { clave: 'tiktok', grupo: 'redes', etiqueta: 'TikTok (URL)', orden: 2 },
  { clave: 'facebook', grupo: 'redes', etiqueta: 'Facebook (URL)', orden: 3 },

  {
    clave: 'envio_costo',
    grupo: 'envios',
    etiqueta: 'Costo de envío (COP)',
    tipo: 'number',
    ayuda: 'Déjalo vacío si el envío se cotiza por WhatsApp.',
    orden: 1,
  },
  {
    clave: 'envio_gratis_desde',
    grupo: 'envios',
    etiqueta: 'Envío gratis desde (COP)',
    tipo: 'number',
    ayuda: 'Déjalo vacío si no aplica.',
    orden: 2,
  },
  {
    clave: 'envio_nota',
    grupo: 'envios',
    etiqueta: 'Nota de envío en el checkout',
    tipo: 'textarea',
    orden: 3,
  },

  {
    clave: 'pago_contraentrega',
    valor: '1',
    grupo: 'pagos',
    etiqueta: 'Pago contra entrega',
    tipo: 'bool',
    orden: 1,
  },
  {
    clave: 'pago_transferencia',
    valor: '1',
    grupo: 'pagos',
    etiqueta: 'Transferencia / Nequi / Daviplata',
    tipo: 'bool',
    orden: 2,
  },
  {
    clave: 'pago_transferencia_datos',
    grupo: 'pagos',
    etiqueta: 'Datos para transferencia',
    tipo: 'textarea',
    ayuda: 'Se muestran al cliente después de confirmar el pedido.',
    orden: 3,
  },
  {
    clave: 'pago_online',
    valor: '0',
    grupo: 'pagos',
    etiqueta: 'Pago online (pasarela)',
    tipo: 'bool',
    ayuda: 'Sólo se activa cuando estén cargadas las llaves de la pasarela en las variables de entorno.',
    orden: 4,
  },

  { clave: 'ga4_id', grupo: 'analitica', etiqueta: 'Google Analytics 4 (ID)', orden: 1 },
  { clave: 'meta_pixel_id', grupo: 'analitica', etiqueta: 'Meta Pixel (ID)', orden: 2 },

  {
    clave: 'seo_title',
    valor: 'YLANE PERFUMES · Tu aroma. Tu firma.',
    grupo: 'seo',
    etiqueta: 'Título del sitio',
    orden: 1,
  },
  {
    clave: 'seo_description',
    valor:
      'Tienda online y distribuidora de perfumes. Perfumería árabe, de diseñador y nicho seleccionada para cada personalidad, ocasión y estilo.',
    grupo: 'seo',
    etiqueta: 'Descripción del sitio',
    tipo: 'textarea',
    orden: 2,
  },
  {
    clave: 'anuncio_barra',
    valor: 'Distribución de perfumería · Escríbenos y te asesoramos',
    grupo: 'general',
    etiqueta: 'Texto de la barra superior',
    ayuda: 'Déjalo vacío para ocultar la barra.',
    orden: 1,
  },
];

async function seedSettings() {
  for (const ajuste of AJUSTES) {
    const existente = await db.select().from(settings).where(eq(settings.clave, ajuste.clave)).get();
    if (existente) continue;
    await db.insert(settings).values({
      clave: ajuste.clave,
      valor: ajuste.valor ?? '',
      grupo: ajuste.grupo,
      etiqueta: ajuste.etiqueta,
      ayuda: ajuste.ayuda ?? null,
      tipo: ajuste.tipo ?? 'text',
      orden: ajuste.orden,
    });
  }
  console.log(`✓ ${AJUSTES.length} claves de configuración`);
}

/* ───────────────────────── CONTENIDO EDITABLE ──────────────────────── */
const CONTENIDOS = [
  {
    clave: 'home_confianza',
    titulo: 'Compra con confianza (home)',
    grupo: 'home',
    descripcion: 'Una línea por bloque, con el formato:  Título | Texto',
    contenido: [
      'Compra segura | Confirmamos la disponibilidad antes de cobrar.',
      'Atención personalizada | Te asesoramos antes de que decidas.',
      'Envíos | Coordinamos la entrega contigo al confirmar el pedido.',
      'Catálogo seleccionado | Perfumería árabe, de diseñador y nicho.',
    ].join('\n'),
  },
  {
    clave: 'home_intro',
    titulo: 'Texto introductorio (home)',
    grupo: 'home',
    contenido:
      'YLANE PERFUMES es una tienda online y distribuidora de fragancias. Reunimos perfumería árabe, de diseñador y nicho en un mismo catálogo para que encuentres la que te representa.',
  },
  {
    clave: 'nosotros',
    titulo: 'Nosotros',
    grupo: 'paginas',
    contenido: [
      '## Quiénes somos',
      '',
      'YLANE PERFUMES es una tienda virtual y distribuidora de perfumes. No fabricamos fragancias: las seleccionamos, las comercializamos y las ponemos a tu alcance.',
      '',
      'Trabajamos principalmente con perfumería árabe, y también con referencias de diseñador, comerciales y nicho.',
      '',
      '## Cómo elegimos',
      '',
      'Cada referencia entra al catálogo porque la elegimos, no porque llene espacio. Nuestro trabajo es ayudarte a encontrar la fragancia que se ajusta a tu personalidad, a la ocasión y a tu estilo.',
      '',
      '## Para revendedores',
      '',
      'Además de la venta al detal, distribuimos a personas y negocios que quieren empezar o hacer crecer su propio proyecto de perfumería.',
    ].join('\n'),
  },
  {
    clave: 'faq',
    titulo: 'Preguntas frecuentes',
    grupo: 'paginas',
    descripcion: 'Cada pregunta empieza con "## ". Debajo va la respuesta.',
    contenido: [
      '## ¿YLANE fabrica los perfumes?',
      'No. YLANE PERFUMES es una tienda online y distribuidora: comercializamos perfumes de distintas marcas, principalmente perfumería árabe, además de referencias de diseñador, comerciales y nicho.',
      '',
      '## ¿Tienen perfumería árabe?',
      'Sí. Es una de nuestras líneas principales y puedes verla completa en la sección Árabes del catálogo.',
      '',
      '## ¿Venden al por mayor?',
      'Sí. En la sección Mayoristas puedes dejarnos tus datos y te contactamos con la información de distribución.',
      '',
      '## ¿Cómo hago un pedido?',
      'Puedes agregar las referencias al carrito y finalizar la compra, o escribirnos directamente por WhatsApp desde cualquier producto para que te asesoremos.',
    ].join('\n'),
  },
  {
    clave: 'envios',
    titulo: 'Envíos',
    grupo: 'paginas',
    descripcion: 'Contenido pendiente de definir por el negocio.',
    contenido: '',
  },
  {
    clave: 'politicas',
    titulo: 'Políticas de la tienda',
    grupo: 'legal',
    descripcion: 'Contenido legal pendiente de definir por el negocio.',
    contenido: '',
  },
  {
    clave: 'terminos',
    titulo: 'Términos y condiciones',
    grupo: 'legal',
    contenido: '',
  },
  {
    clave: 'privacidad',
    titulo: 'Política de privacidad',
    grupo: 'legal',
    contenido: '',
  },
  {
    clave: 'cambios',
    titulo: 'Cambios y devoluciones',
    grupo: 'legal',
    contenido: '',
  },
  {
    clave: 'mayoristas_beneficios',
    titulo: 'Beneficios mayoristas',
    grupo: 'paginas',
    descripcion: 'Una línea por beneficio, con el formato:  Título | Texto',
    contenido: [
      'Precios mayoristas | Escalas de precio según la cantidad que manejes.',
      'Variedad de referencias | Más de 250 referencias en un solo proveedor.',
      'Perfumería árabe | Acceso directo a la especialidad de la casa.',
      'Catálogo actualizado | Te compartimos las entradas nuevas apenas llegan.',
      'Atención personalizada | Un solo contacto directo para tus pedidos.',
      'Opciones de distribución | Coordinamos entregas y envíos según tu ciudad.',
    ].join('\n'),
  },
];

async function seedContent() {
  for (const bloque of CONTENIDOS) {
    const existente = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.clave, bloque.clave))
      .get();
    if (existente) continue;
    await db.insert(contentBlocks).values({
      clave: bloque.clave,
      titulo: bloque.titulo,
      grupo: bloque.grupo,
      descripcion: bloque.descripcion ?? null,
      contenido: bloque.contenido,
    });
  }
  console.log(`✓ ${CONTENIDOS.length} bloques de contenido`);
}

/* ─────────────────────────────── BANNERS ───────────────────────────── */
async function seedBanners() {
  const existente = await db.select().from(banners).get();
  if (existente) {
    console.log('· Banners ya existen');
    return;
  }
  await db.insert(banners).values([
    {
      ubicacion: 'hero',
      titulo: 'YLANE PERFUMES',
      subtitulo: 'Tu aroma. Tu firma.',
      texto: 'Una selección de fragancias para cada personalidad.',
      ctaTexto: 'Explorar fragancias',
      ctaUrl: '/perfumes',
      ctaSecundarioTexto: 'Descubrir mi perfume',
      ctaSecundarioUrl: '/descubre',
      orden: 0,
    },
    {
      ubicacion: 'promo',
      titulo: 'Perfumería árabe',
      subtitulo: 'La especialidad de la casa',
      texto: 'Descubre fragancias intensas, sofisticadas y memorables.',
      ctaTexto: 'Explorar perfumería árabe',
      ctaUrl: '/arabes',
      orden: 0,
    },
  ]);
  console.log('✓ 2 banners');
}

/* ──────────────────────────────── MAIN ─────────────────────────────── */
async function main() {
  console.log(`Sembrando ${catalogo.totalProductos} referencias…\n`);
  await seedAdmin();
  const marcas = await seedBrands();
  const cats = await seedCategories();
  await seedProducts(marcas, cats);
  await seedSettings();
  await seedContent();
  await seedBanners();
  console.log('\n✓ Base de datos lista.');
}

main().catch((error) => {
  console.error('✗ Error sembrando la base de datos:', error);
  process.exit(1);
});
