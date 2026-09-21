import type { Metadata } from 'next';
import { jsonLd } from '@/lib/jsonld';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducto, relacionados } from '@/lib/catalog';
import { descuentoPct, formatCOP, GENERO_ETIQUETA, TIPO_ETIQUETA } from '@/lib/format';
import { siteUrl } from '@/lib/settings';
import { Badge, SectionHeader, Stars } from '@/components/ui/Bits';
import { BuyBox } from '@/components/product/BuyBox';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductRow } from '@/components/product/ProductGrid';
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

  // Sólo se muestran los campos que el negocio ya diligenció.
  const ficha = [
    ['Marca', producto.marca],
    ['Género', GENERO_ETIQUETA[producto.genero]],
    ['Tipo', producto.tipo ? TIPO_ETIQUETA[producto.tipo] : null],
    ['Familia olfativa', producto.familiaOlfativa],
    ['Concentración', producto.concentracion],
    ['Presentación', producto.presentacion],
    ['Intensidad', producto.intensidad],
    ['Duración', producto.duracion],
    ['Origen', producto.origenPais],
    ['Referencia', producto.codigo],
  ].filter((fila): fila is [string, string] => Boolean(fila[1]));

  const notas = [
    ['Salida', producto.notasSalida],
    ['Corazón', producto.notasCorazon],
    ['Fondo', producto.notasFondo],
  ].filter((fila): fila is [string, string] => Boolean(fila[1]));

  const ocasiones = producto.ocasion ?? [];
  const personalidad = producto.personalidad ?? [];

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
    <div data-surface="oscuro">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(datosEstructurados) }}
      />
      <RegistrarVista productId={producto.id} />

      <div className="shell py-8">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--surface-muted)]">
          <Link href="/" className="hover:text-champagne">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/perfumes" className="hover:text-champagne">Perfumes</Link>
          {producto.marcaSlug && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/marcas/${producto.marcaSlug}`} className="hover:text-champagne">
                {producto.marca}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-marfil-dim">{producto.nombre}</span>
        </nav>
      </div>

      <div className="shell grid gap-10 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery
            imagenes={producto.imagenes}
            nombre={producto.nombre}
            codigo={producto.codigo}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {descuento != null && <Badge tono="vino">-{descuento}%</Badge>}
            {producto.nuevo && <Badge>Nuevo</Badge>}
            {producto.bestseller && <Badge tono="neutro">Best seller</Badge>}
            {producto.tipo === 'arabe' && <Badge tono="neutro">Perfumería árabe</Badge>}
          </div>

          {producto.marca && (
            <Link
              href={`/marcas/${producto.marcaSlug}`}
              className="mt-4 block text-[0.66rem] uppercase tracking-[0.26em] text-champagne hover:text-champagne-soft"
            >
              {producto.marca}
            </Link>
          )}

          <h1 className="display-lg mt-2">{producto.nombre}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.72rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            {/* Sin género confirmado no se muestra ninguno: sería inventarlo. */}
            {GENERO_ETIQUETA[producto.genero] && (
              <>
                <span>{GENERO_ETIQUETA[producto.genero]}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>Ref. {producto.codigo}</span>
            {producto.rating != null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-2">
                  <Stars valor={producto.rating} className="text-champagne" />
                  <span className="normal-case tracking-normal">({producto.totalResenas})</span>
                </span>
              </>
            )}
          </div>

          <div className="mt-7 border-y border-[var(--surface-line)] py-6">
            {precio ? (
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-[family-name:var(--font-display)] text-3xl">{precio}</span>
                {anterior && (
                  <span className="text-base text-[var(--surface-muted)] line-through">{anterior}</span>
                )}
              </div>
            ) : (
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl">Precio por confirmar</p>
                <p className="mt-2 text-[0.85rem] text-[var(--surface-muted)]">
                  Esta referencia todavía no tiene precio publicado. Escríbenos y te lo cotizamos.
                </p>
              </div>
            )}

            {agotado ? (
              <p className="mt-3 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
                Sin unidades disponibles
              </p>
            ) : pocasUnidades ? (
              <p className="mt-3 text-[0.72rem] uppercase tracking-[0.18em] text-champagne">
                Últimas {producto.stock} unidades
              </p>
            ) : producto.stock != null ? (
              <p className="mt-3 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
                Disponible
              </p>
            ) : null}
          </div>

          <div className="mt-7">
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

          {producto.descripcion && (
            <div className="mt-10">
              <h2 className="eyebrow mb-3">Sobre esta fragancia</h2>
              <p className="text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
                {producto.descripcion}
              </p>
            </div>
          )}

          {(ocasiones.length > 0 || personalidad.length > 0) && (
            <div className="mt-8 flex flex-wrap gap-2">
              {[...personalidad, ...ocasiones].map((etiqueta) => (
                <span
                  key={etiqueta}
                  className="border border-[var(--surface-line)] px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-[var(--surface-muted)]"
                >
                  {etiqueta}
                </span>
              ))}
            </div>
          )}

          {notas.length > 0 && (
            <div className="mt-10">
              <h2 className="eyebrow mb-4">Notas</h2>
              <dl className="grid gap-3">
                {notas.map(([titulo, valor]) => (
                  <div key={titulo} className="flex gap-4 border-b border-[var(--surface-line)] pb-3">
                    <dt className="w-24 shrink-0 text-[0.7rem] uppercase tracking-[0.16em] text-champagne">
                      {titulo}
                    </dt>
                    <dd className="text-[0.9rem] text-[var(--surface-muted)]">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-10">
            <h2 className="eyebrow mb-4">Ficha</h2>
            <dl className="grid gap-0 border-t border-[var(--surface-line)]">
              {ficha.map(([titulo, valor]) => (
                <div
                  key={titulo}
                  className="flex justify-between gap-4 border-b border-[var(--surface-line)] py-3 text-[0.85rem]"
                >
                  <dt className="text-[var(--surface-muted)]">{titulo}</dt>
                  <dd className="text-right">{valor}</dd>
                </div>
              ))}
            </dl>
            {ficha.length <= 4 && (
              <p className="mt-4 text-[0.78rem] text-[var(--surface-muted)]">
                Estamos completando la ficha técnica de esta referencia. Si necesitas un dato
                puntual, escríbenos y te lo confirmamos.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="shell pb-16">
        <Reviews
          productId={producto.id}
          resenas={producto.resenas}
          rating={producto.rating}
          total={producto.totalResenas}
        />
      </div>

      {sugeridos.length > 0 && (
        <section className="border-t border-[var(--surface-line)] py-16">
          <div className="shell">
            <SectionHeader
              eyebrow="También te puede gustar"
              titulo={producto.marca ? `Más de ${producto.marca}` : 'Referencias afines'}
              enlace={producto.marcaSlug ? `/marcas/${producto.marcaSlug}` : '/perfumes'}
            />
            <div className="mt-10">
              <ProductRow productos={sugeridos} />
            </div>
          </div>
        </section>
      )}

      <div className="shell pb-20">
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
      </div>
    </div>
  );
}
