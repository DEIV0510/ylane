import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import { jsonLd } from '@/lib/jsonld';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducto, relacionados } from '@/lib/catalog';
import {
  descuentoPct,
  formatCOP,
  GENERO_ETIQUETA,
  nombreSinMarca,
  TIPO_ETIQUETA,
} from '@/lib/format';
import { siteUrl } from '@/lib/settings';
import { SectionHeader, Stars } from '@/components/ui/Bits';
import { BuyBox } from '@/components/product/BuyBox';
import { FIN_FICHA_ID } from '@/components/product/ficha';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductGrid } from '@/components/product/ProductGrid';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';
import { Reviews } from '@/components/product/Reviews';
import { RegistrarVista } from '@/components/product/RegistrarVista';

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) return { title: 'Producto no encontrado' };

  const titulo = producto.seoTitle?.trim() || producto.nombre;
  const descripcion =
    producto.seoDescription?.trim() ||
    producto.descripcionCorta?.trim() ||
    `${producto.nombre} en YLANE PERFUMES. Referencia ${producto.codigo}.`;
  const imagen = producto.imagenes[0]?.url;

  return {
    title: titulo,
    description: descripcion.slice(0, 160),
    alternates: { canonical: `/perfumes/${producto.slug}` },
    openGraph: {
      type: 'website',
      title: `${titulo} · YLANE PERFUMES`,
      description: descripcion.slice(0, 200),
      url: `${siteUrl()}/perfumes/${producto.slug}`,
      images: imagen ? [{ url: imagen }] : undefined,
    },
  };
}

/* ── Composición ────────────────────────────────────────────────────
   Móvil: migas, galería e información en una sola columna.
   Tableta: esa columna centrada (34rem), como una página de revista.
   Escritorio: rejilla de 12, galería fija en 7 e información en 5 con aire.
   Las migas son una pieza aparte de la rejilla: en móvil van arriba del
   todo y en escritorio encabezan la columna de información.            */
const COLUMNA_INFO =
  'md:mx-auto md:max-w-[34rem] lg:col-span-5 lg:col-start-8 lg:mx-0 lg:max-w-none lg:pl-6 xl:pl-12';

const MIGA = 'inline-flex min-h-11 items-center transition-colors duration-300 hover:text-[var(--acento)]';

type Fila = [string, string];

/** Texto recortado o null: un campo vacío (o con sólo espacios) no se muestra. */
function texto(valor: string | null | undefined): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

/** Sólo las filas que el negocio ya diligenció. */
function filas(lista: [string, string | null | undefined][]): Fila[] {
  return lista.flatMap(([titulo, valor]) => {
    const limpio = texto(valor);
    return limpio ? [[titulo, limpio] as Fila] : [];
  });
}

function capitalizar(valor: string): string {
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}

function unir(lista: string[] | null | undefined): string | null {
  const limpia = (lista ?? []).map((valor) => valor.trim()).filter(Boolean);
  return limpia.length ? limpia.map(capitalizar).join(' · ') : null;
}

/** Primera frase de la descripción: la breve cuando el panel no trae una propia. */
function primeraFrase(valor: string | null | undefined): string | null {
  const limpio = texto(valor);
  if (!limpio) return null;
  const frase = limpio.match(/^[\s\S]*?[.!?…](?=\s|$)/)?.[0] ?? limpio;
  return frase.length > 220 ? `${frase.slice(0, 217).trimEnd()}…` : frase;
}

function parrafos(valor: string): string[] {
  return valor
    .split(/\n+/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean);
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProducto(slug);
  if (!producto) notFound();

  const sugeridos = await relacionados({
    id: producto.id,
    marcaId: producto.marcaId,
    tipo: producto.tipo,
    genero: producto.genero,
  });

  const precio = formatCOP(producto.precio);
  const anterior = formatCOP(producto.precioAnterior);
  const descuento = descuentoPct(producto.precio, producto.precioAnterior);
  const agotado = producto.stock != null && producto.stock <= 0;
  const pocasUnidades = producto.stock != null && producto.stock > 0 && producto.stock <= 3;

  // La marca va encima, en versalitas. En el h1 se oculta a la vista pero se
  // conserva para lectores de pantalla y buscadores («Afnan 9 PM Elixir»).
  const nombreVisible = nombreSinMarca(producto.nombre, producto.marca);
  const corte = producto.nombre.lastIndexOf(nombreVisible);
  const prefijoOculto = corte > 0 ? producto.nombre.slice(0, corte) : '';

  // Sin género confirmado no se muestra ninguno: sería inventarlo.
  const meta = [
    GENERO_ETIQUETA[producto.genero],
    texto(producto.concentracion),
    `Ref. ${producto.codigo}`,
  ].filter((dato): dato is string => Boolean(dato));

  const descripcionBreve = texto(producto.descripcionCorta) ?? primeraFrase(producto.descripcion);
  const descripcionLarga = texto(producto.descripcion);

  const olfativa = filas([
    ['Familia olfativa', producto.familiaOlfativa],
    ['Intensidad', producto.intensidad ? capitalizar(producto.intensidad.trim()) : null],
    ['Notas de salida', producto.notasSalida],
    ['Notas de corazón', producto.notasCorazon],
    ['Notas de fondo', producto.notasFondo],
    ['Personalidad', unir(producto.personalidad)],
    ['Ocasión', unir(producto.ocasion)],
  ]);

  const ficha = filas([
    ['Marca', producto.marca],
    ['Tipo', producto.tipo ? TIPO_ETIQUETA[producto.tipo] : null],
    ['Concentración', producto.concentracion],
    ['Presentación', producto.presentacion],
    ['Duración', producto.duracion],
    ['Origen', producto.origenPais],
    ['Referencia', producto.codigo],
  ]);

  const cercanos = sugeridos.slice(0, 4);
  // «Más de {marca}» sólo si las cuatro son de la casa; si no, el título mentiría.
  const todasDeLaMarca =
    Boolean(producto.marca && producto.marcaSlug) &&
    cercanos.every((otro) => otro.marcaSlug === producto.marcaSlug);

  const datosEstructurados = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    sku: producto.codigo,
    description: producto.descripcionCorta ?? producto.descripcion ?? undefined,
    ...(producto.marca ? { brand: { '@type': 'Brand', name: producto.marca } } : {}),
    ...(producto.imagenes.length ? { image: producto.imagenes.map((imagen) => imagen.url) } : {}),
    ...(producto.precio != null
      ? {
          offers: {
            '@type': 'Offer',
            price: producto.precio,
            priceCurrency: 'COP',
            availability: agotado
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
            url: `${siteUrl()}/perfumes/${producto.slug}`,
          },
        }
      : {}),
    ...(producto.rating != null && producto.totalResenas > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(producto.rating.toFixed(1)),
            reviewCount: producto.totalResenas,
          },
        }
      : {}),
  };

  return (
    <div data-surface="claro">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(datosEstructurados) }}
      />
      <RegistrarVista productId={producto.id} />

      <div className="shell pb-16 pt-2 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:pb-24 lg:pt-10 xl:gap-x-16">
        <nav aria-label="Ruta de navegación" className={`${COLUMNA_INFO} lg:row-start-1`}>
          <ol className="flex flex-wrap items-center gap-x-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            <li>
              <Link href="/" className={MIGA}>
                Inicio
              </Link>
            </li>
            <li className="flex items-center gap-x-2.5">
              <span aria-hidden="true">/</span>
              <Link href="/perfumes" className={MIGA}>
                Perfumes
              </Link>
            </li>
            {producto.marca && producto.marcaSlug && (
              <li className="flex items-center gap-x-2.5">
                <span aria-hidden="true">/</span>
                <Link href={`/marcas/${producto.marcaSlug}`} className={MIGA}>
                  {producto.marca}
                </Link>
              </li>
            )}
            {/* En móvil el nombre ya está en el h1, justo debajo: no se repite. */}
            <li className="hidden min-h-11 min-w-0 max-w-full items-center gap-x-2.5 md:flex">
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="truncate text-[var(--surface-fg)]">
                {producto.nombre}
              </span>
            </li>
          </ol>
        </nav>

        <div className="md:mx-auto md:max-w-[34rem] lg:sticky lg:top-[calc(var(--header-h)_+_1.5rem)] lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none lg:self-start">
          <ProductGallery
            imagenes={producto.imagenes}
            nombre={producto.nombre}
            codigo={producto.codigo}
            marca={producto.marca}
            tipo={producto.tipo}
            concentracion={producto.concentracion}
          />
        </div>

        <div className={`${COLUMNA_INFO} mt-8 min-w-0 lg:row-start-2 lg:mt-14 xl:mt-20`}>
          {producto.marca &&
            (producto.marcaSlug ? (
              <Link
                href={`/marcas/${producto.marcaSlug}`}
                className="-my-3 flex min-h-11 w-fit items-center text-[0.75rem] font-medium uppercase tracking-[0.3em] text-[var(--acento)] transition-colors duration-300 hover:text-[var(--surface-fg)]"
              >
                {producto.marca}
              </Link>
            ) : (
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.3em] text-[var(--acento)]">
                {producto.marca}
              </p>
            ))}

          <h1 className="mt-4 text-[length:clamp(2.2rem,3.4vw,3.2rem)] leading-[1.04]">
            {prefijoOculto && <span className="sr-only">{prefijoOculto}</span>}
            {nombreVisible}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            {meta.map((dato, indice) => (
              <Fragment key={dato}>
                {indice > 0 && <span aria-hidden="true">·</span>}
                <span>{dato}</span>
              </Fragment>
            ))}
            {producto.rating != null && producto.totalResenas > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href="#opiniones"
                  className="inline-flex items-center gap-2 normal-case tracking-normal transition-colors duration-300 hover:text-[var(--acento)]"
                >
                  <Stars valor={producto.rating} className="text-[var(--acento)]" />
                  <span aria-hidden="true">({producto.totalResenas})</span>
                  <span className="sr-only">
                    , {producto.totalResenas} {producto.totalResenas === 1 ? 'opinión' : 'opiniones'}
                  </span>
                </a>
              </>
            )}
          </p>

          <div className="mt-8">
            {precio ? (
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <span className="text-[1.875rem] font-light leading-none tabular-nums lg:text-[2.125rem]">
                  {precio}
                </span>
                {anterior && (
                  <span className="text-base tabular-nums text-[var(--surface-muted)]">
                    <span className="sr-only">Antes </span>
                    <s>{anterior}</s>
                  </span>
                )}
                {descuento != null && (
                  <span className="self-center bg-vino px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-marfil">
                    −{descuento}%
                  </span>
                )}
              </p>
            ) : (
              <>
                <p className="text-[1.5rem] font-light leading-tight">Precio por confirmar</p>
                <p className="mt-2 text-base text-[var(--surface-muted)]">
                  Esta referencia todavía no tiene precio publicado. Escríbenos y te lo cotizamos.
                </p>
              </>
            )}

            {/* Disponibilidad sólo con inventario controlado (stock NULL = sin control). */}
            {producto.stock != null && (
              <p
                className={`mt-4 flex items-center gap-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] ${
                  pocasUnidades ? 'text-[var(--acento)]' : 'text-[var(--surface-muted)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 rotate-45 ${agotado ? 'border border-current' : 'bg-current'}`}
                />
                {agotado
                  ? 'Sin unidades disponibles'
                  : pocasUnidades
                    ? producto.stock === 1
                      ? 'Última unidad'
                      : `Últimas ${producto.stock} unidades`
                    : 'Disponible'}
              </p>
            )}
          </div>

          {descripcionBreve && <p className="lead mt-6">{descripcionBreve}</p>}

          <div className="mt-9">
            <BuyBox
              producto={{
                id: producto.id,
                codigo: producto.codigo,
                slug: producto.slug,
                nombre: producto.nombre,
                marca: producto.marca,
                precio: producto.precio,
                imagen: producto.imagenes[0]?.url ?? null,
                stock: producto.stock,
              }}
            />
          </div>

          {olfativa.length > 0 && (
            <section aria-labelledby="informacion-olfativa" className="mt-14">
              <h2
                id="informacion-olfativa"
                className="eyebrow font-[family-name:var(--font-sans)] leading-normal"
              >
                Información olfativa
              </h2>
              <dl className="mt-5 border-t border-[var(--surface-line)]">
                {olfativa.map(([titulo, valor]) => (
                  <div
                    key={titulo}
                    className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-5 gap-y-1 border-b border-[var(--surface-line)] py-4 max-[359px]:grid-cols-1"
                  >
                    <dt className="pt-[0.3rem] text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--surface-muted)]">
                      {titulo}
                    </dt>
                    <dd className="leading-relaxed">{valor}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div
            className={`border-t border-[var(--surface-line)] ${olfativa.length > 0 ? 'mt-10' : 'mt-14'}`}
          >
            <Acordeon titulo="Detalles">
              <dl>
                {ficha.map(([titulo, valor]) => (
                  <div
                    key={titulo}
                    className="flex items-baseline justify-between gap-6 border-b border-[var(--surface-line)] py-3 last:border-b-0"
                  >
                    <dt className="text-[var(--surface-muted)]">{titulo}</dt>
                    <dd className="text-right">{valor}</dd>
                  </div>
                ))}
              </dl>
              {ficha.length <= 4 && (
                <p className="mt-4 text-base leading-relaxed text-[var(--surface-muted)] lg:text-[0.875rem]">
                  Estamos completando la ficha técnica de esta referencia. Si necesitas un dato
                  puntual, escríbenos y te lo confirmamos.
                </p>
              )}
            </Acordeon>

            {descripcionLarga && (
              <Acordeon titulo="Sobre esta fragancia">
                <div className="max-w-[36rem] space-y-4 leading-[1.75] text-[var(--surface-muted)]">
                  {parrafos(descripcionLarga).map((parrafo, indice) => (
                    <p key={indice}>{parrafo}</p>
                  ))}
                </div>
              </Acordeon>
            )}
          </div>
        </div>
      </div>

      <div className="shell">
        <Reviews
          productId={producto.id}
          resenas={producto.resenas}
          rating={producto.rating}
          total={producto.totalResenas}
        />
      </div>

      {cercanos.length > 0 && (
        <section data-surface="lino" className="section-y">
          <div className="shell">
            <div data-reveal>
              <SectionHeader
                eyebrow="Para seguir descubriendo"
                titulo={todasDeLaMarca ? `Más de ${producto.marca}` : 'Afines'}
                enlace={todasDeLaMarca ? `/marcas/${producto.marcaSlug}` : '/perfumes'}
                enlaceTexto={todasDeLaMarca ? `Ver todo ${producto.marca}` : 'Ver el catálogo'}
              />
            </div>
            <div className="mt-12 lg:mt-16">
              <ProductGrid productos={cercanos} columnas={4} />
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed
        actual={{
          slug: producto.slug,
          codigo: producto.codigo,
          nombre: producto.nombre,
          marca: producto.marca,
          precio: producto.precio,
          imagen: producto.imagenes[0]?.url ?? null,
        }}
      />

      {/* Fin de la ficha: la barra de compra móvil se retira al llegar aquí. */}
      <div id={FIN_FICHA_ID} aria-hidden="true" />
    </div>
  );
}

/** Acordeón nativo (details): accesible con teclado y sin JavaScript. */
function Acordeon({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <details className="group border-b border-[var(--surface-line)]">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-[family-name:var(--font-display)] text-[1.25rem] leading-tight transition-colors duration-300 hover:text-[var(--acento)] [&::-webkit-details-marker]:hidden">
        {titulo}
        <span aria-hidden="true" className="relative size-3 shrink-0">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-[var(--ease-silk)] group-open:scale-y-0" />
        </span>
      </summary>
      <div className="pb-7">{children}</div>
    </details>
  );
}
