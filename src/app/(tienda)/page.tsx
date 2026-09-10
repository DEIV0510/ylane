import Link from 'next/link';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { banners, categories, orderItems, products } from '@/db/schema';
import { Hero } from '@/components/home/Hero';
import { CategoryCard, type CategoriaHome } from '@/components/home/CategoryCard';
import { ProductRow } from '@/components/product/ProductGrid';
import { SectionHeader, Divider } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';
import { contarProductos, productosPorIds, seleccion } from '@/lib/catalog';
import { getContenido, parsearTarjetas } from '@/lib/content';

export const revalidate = 120;

export default async function HomePage() {
  const [heroBanner, promoBanner, referencias, cats, bloques] = await Promise.all([
    db
      .select()
      .from(banners)
      .where(and(eq(banners.ubicacion, 'hero'), eq(banners.activo, true)))
      .orderBy(banners.orden)
      .get(),
    db
      .select()
      .from(banners)
      .where(and(eq(banners.ubicacion, 'promo'), eq(banners.activo, true)))
      .orderBy(banners.orden)
      .get(),
    contarProductos(),
    categoriasDestacadas(),
    getContenido(['home_intro', 'home_confianza']),
  ]);

  const [destacados, arabes, novedades, nicho, masVendidos] = await Promise.all([
    seleccion({ flag: 'destacado', limite: 8 }),
    seleccion({ tipo: ['arabe'], limite: 10 }),
    seleccion({ orden: 'novedades', limite: 10 }),
    seleccion({ tipo: ['nicho'], limite: 10 }),
    productosMasVendidos(),
  ]);

  // Si el negocio todavía no marcó destacados, se muestra una entrada del catálogo.
  const seleccionYlane = destacados.length >= 4 ? destacados : await seleccion({ limite: 10 });
  const confianza = parsearTarjetas(bloques.home_confianza ?? '');

  return (
    <>
      <Hero banner={heroBanner ?? null} referencias={referencias} />

      {/* ── Categorías ─────────────────────────────────────────── */}
      <section data-surface="oscuro" className="shell py-20 lg:py-28">
        <SectionHeader
          eyebrow="Colecciones"
          titulo="Descubre tu fragancia"
          texto={bloques.home_intro ?? undefined}
          enlace="/perfumes"
          enlaceTexto="Ver todo el catálogo"
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cats.map((categoria) => (
            <CategoryCard
              key={categoria.slug}
              categoria={categoria}
              ancha={categoria.slug === 'arabes'}
            />
          ))}
        </div>
      </section>

      {/* ── Selección YLANE ────────────────────────────────────── */}
      {seleccionYlane.length > 0 && (
        <section data-surface="oscuro" className="border-t border-[var(--surface-line)] py-20 lg:py-24">
          <div className="shell">
            <SectionHeader
              eyebrow="Selección YLANE"
              titulo="Lo que recomendamos"
              enlace="/perfumes"
            />
            <div className="mt-10">
              <ProductRow productos={seleccionYlane} />
            </div>
          </div>
        </section>
      )}

      {/* ── Perfumería árabe (banda destacada) ─────────────────── */}
      {arabes.length > 0 && (
        <section data-surface="vino" className="grain relative overflow-hidden py-20 lg:py-28">
          <div className="shell relative">
            <SectionHeader
              eyebrow={promoBanner?.subtitulo ?? 'La especialidad de la casa'}
              titulo={promoBanner?.titulo ?? 'Perfumería árabe'}
              texto={promoBanner?.texto ?? undefined}
              enlace={promoBanner?.ctaUrl ?? '/arabes'}
              enlaceTexto={promoBanner?.ctaTexto ?? 'Ver la colección'}
            />
            <div className="mt-10">
              <ProductRow productos={arabes} />
            </div>
          </div>
        </section>
      )}

      {/* ── Más vendidos: sólo si hay pedidos reales ───────────── */}
      {masVendidos.length >= 4 && (
        <section data-surface="oscuro" className="border-t border-[var(--surface-line)] py-20 lg:py-24">
          <div className="shell">
            <SectionHeader eyebrow="Los que más salen" titulo="Más vendidos" enlace="/perfumes?orden=novedades" />
            <div className="mt-10">
              <ProductRow productos={masVendidos} />
            </div>
          </div>
        </section>
      )}

      {/* ── Buscador de fragancias ─────────────────────────────── */}
      <section data-surface="claro" className="py-20 lg:py-28">
        <div className="shell grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div data-reveal className="max-w-xl">
            <p className="eyebrow">Asesoría</p>
            <h2 className="display-lg mt-3">¿No sabes cuál elegir?</h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
              Responde cuatro preguntas y te mostramos las referencias de nuestro catálogo
              que mejor encajan con lo que buscas. Si quieres afinar más, te acompañamos por
              WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/descubre" tamano="lg">
                Descubrir mi fragancia
              </ButtonLink>
              <ButtonLink href="/perfumes" variante="contorno" tamano="lg">
                Ver catálogo completo
              </ButtonLink>
            </div>
          </div>
          <ol data-reveal className="grid gap-4 sm:grid-cols-2 lg:w-[26rem]">
            {[
              ['01', '¿Para quién?', 'Hombre, mujer o unisex.'],
              ['02', '¿Qué transmitir?', 'Elegante, seductor, fresco…'],
              ['03', '¿Cuándo?', 'Día, noche, trabajo, cita.'],
              ['04', '¿Qué intensidad?', 'Suave, media o intensa.'],
            ].map(([numero, titulo, texto]) => (
              <li key={numero} className="border border-[var(--surface-line)] p-5">
                <span className="font-[family-name:var(--font-display)] text-2xl text-vino">
                  {numero}
                </span>
                <p className="mt-2 text-[0.9rem] font-medium">{titulo}</p>
                <p className="mt-1 text-[0.8rem] text-[var(--surface-muted)]">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Novedades + Nicho ──────────────────────────────────── */}
      {novedades.length > 0 && (
        <section data-surface="oscuro" className="py-20 lg:py-24">
          <div className="shell">
            <SectionHeader eyebrow="Recién ingresadas" titulo="Nuevas en catálogo" enlace="/perfumes?orden=novedades" />
            <div className="mt-10">
              <ProductRow productos={novedades} />
            </div>
          </div>
        </section>
      )}

      {nicho.length > 0 && (
        <section data-surface="oscuro" className="border-t border-[var(--surface-line)] py-20 lg:py-24">
          <div className="shell">
            <SectionHeader eyebrow="Selectivo" titulo="Colección nicho" enlace="/perfumes?tipo=nicho" />
            <div className="mt-10">
              <ProductRow productos={nicho} />
            </div>
          </div>
        </section>
      )}

      {/* ── Confianza ──────────────────────────────────────────── */}
      {confianza.length > 0 && (
        <section data-surface="claro" className="py-20 lg:py-24">
          <div className="shell">
            <SectionHeader
              eyebrow="Compra con confianza"
              titulo="Cómo trabajamos"
              align="center"
              className="mx-auto"
            />
            <div className="mt-12 grid gap-px border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-2 lg:grid-cols-4">
              {confianza.map((item) => (
                <div key={item.titulo} data-reveal className="bg-[var(--surface-bg)] p-7">
                  <span className="block size-1.5 rotate-45 bg-vino" aria-hidden="true" />
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl">{item.titulo}</h3>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-[var(--surface-muted)]">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Mayoristas ─────────────────────────────────────────── */}
      <section data-surface="oscuro" className="border-t border-[var(--surface-line)] py-20 lg:py-28">
        <div className="shell">
          <Divider className="mb-12" />
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Mayoristas</p>
            <h2 className="display-lg mt-4">Crece con YLANE</h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
              ¿Quieres comenzar o hacer crecer tu negocio de perfumería? Trabajamos con
              revendedores y distribuidores en todo el país.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/mayoristas" tamano="lg">
                Solicitar información mayorista
              </ButtonLink>
              <Link
                href="/nosotros"
                className="inline-flex items-center justify-center px-6 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-marfil-dim underline-offset-4 transition-colors hover:text-champagne hover:underline"
              >
                Conocer YLANE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Datos de apoyo ─────────────────────────────────────────────── */
const RUTA_CATEGORIA: Record<string, string> = {
  mujer: '/mujer',
  hombre: '/hombre',
  unisex: '/unisex',
  arabes: '/arabes',
  nicho: '/perfumes?tipo=nicho',
  'best-sellers': '/perfumes?flag=bestseller',
};

async function categoriasDestacadas(): Promise<CategoriaHome[]> {
  const filas = await db
    .select()
    .from(categories)
    .where(and(eq(categories.activa, true), eq(categories.destacadaHome, true)))
    .orderBy(categories.orden)
    .all();

  const conteos = await Promise.all(
    filas.map(async (categoria) => {
      const filtro = categoria.filtro ?? '';
      const condicion = filtro.startsWith('genero:')
        ? eq(products.genero, filtro.slice(7))
        : filtro.startsWith('tipo:')
          ? eq(products.tipo, filtro.slice(5))
          : filtro === 'flag:bestseller'
            ? eq(products.bestseller, true)
            : filtro === 'flag:destacado'
              ? eq(products.destacado, true)
              : filtro === 'flag:nuevo'
                ? eq(products.nuevo, true)
                : sql`1 = 1`;

      const fila = await db
        .select({ total: count() })
        .from(products)
        .where(and(eq(products.activo, true), condicion))
        .get();

      return {
        slug: categoria.slug,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        imagen: categoria.imagen,
        href: RUTA_CATEGORIA[categoria.slug] ?? `/perfumes?categoria=${categoria.slug}`,
        total: fila?.total ?? 0,
      };
    }),
  );

  // Una tarjeta que lleva a un listado vacío es un enlace roto para el cliente:
  // «Best Sellers» y demás colecciones sólo aparecen cuando tienen referencias.
  return conteos.filter((categoria) => categoria.total > 0);
}

/** Se calcula con pedidos reales; si todavía no hay ventas, la sección no aparece. */
async function productosMasVendidos() {
  const filas = await db
    .select({ productId: orderItems.productId, unidades: sql<number>`sum(${orderItems.cantidad})` })
    .from(orderItems)
    .groupBy(orderItems.productId)
    .orderBy(desc(sql`sum(${orderItems.cantidad})`))
    .limit(10)
    .all();

  const ids = filas.map((fila) => fila.productId).filter((id): id is number => id != null);
  if (ids.length < 4) return [];
  return productosPorIds(ids);
}
