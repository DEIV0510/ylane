import Image from 'next/image';
import { ProductCard } from '@/components/product/ProductCard';
import { Indice } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';
import type { Banner } from '@/db/schema';
import type { ProductoVista } from '@/lib/catalog';

const FOTO_POR_DEFECTO = '/editorial/arabes-attar.jpg';
const NUMERALES = ['I', 'II', 'III'];

/**
 * 04 — Perfumería árabe, la categoría estratégica. Superficie vino, una foto
 * editorial alta y tres referencias presentadas como una serie numerada
 * (de tres casas distintas), no como una fila de tarjetas.
 * Los textos salen del banner «promo» del panel.
 */
export function PerfumeriaArabe({
  banner,
  productos,
  total,
}: {
  banner: Banner | null;
  productos: ProductoVista[];
  total: number;
}) {
  const eyebrow = banner?.subtitulo?.trim() || 'La especialidad de la casa';
  const titulo = banner?.titulo?.trim() || 'Perfumería árabe';
  const texto = banner?.texto?.trim() || 'Descubre fragancias intensas, sofisticadas y memorables.';

  return (
    <section data-surface="vino" className="grain relative isolate overflow-hidden section-y">
      <span
        aria-hidden="true"
        className="absolute -right-40 top-0 -z-10 size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgba(122,26,42,0.55),transparent)]"
      />

      <div className="shell grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <figure data-reveal className="relative flex flex-col lg:col-span-5">
          {/* En escritorio la foto se estira al alto de la columna de texto y productos. */}
          <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/5] lg:aspect-auto lg:min-h-[34rem] lg:flex-1">
            <Image
              src={banner?.imagen || FOTO_POR_DEFECTO}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 flex items-center justify-between text-[0.625rem] uppercase tracking-[0.28em] text-[var(--surface-muted)]">
            <span>Colección</span>
            <span className="tabular-nums">{total} referencias</span>
          </figcaption>
        </figure>

        <div className="flex flex-col lg:col-span-6 lg:col-start-7">
          <div data-reveal className="max-w-xl lg:pt-4">
            <Indice numero="04">{eyebrow}</Indice>
            <h2 className="display-xl mt-6">{titulo}</h2>
            <p className="lead mt-6 text-marfil/80">{texto}</p>
            <ButtonLink
              href={banner?.ctaUrl || '/arabes'}
              variante="claro"
              tamano="lg"
              className="mt-9 w-full sm:w-auto"
            >
              {banner?.ctaTexto || 'Explorar perfumería árabe'}
            </ButtonLink>
          </div>

          {productos.length > 0 && (
            <ol className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-5 lg:mt-auto lg:pt-16">
              {productos.slice(0, 3).map((producto, indice) => (
                <li
                  key={producto.id}
                  data-reveal
                  style={{ transitionDelay: `${indice * 90}ms` }}
                  // En móvil bastan dos: la serie completa está a un toque, en /arabes.
                  className={indice === 2 ? 'max-sm:hidden' : ''}
                >
                  <span
                    aria-hidden="true"
                    className="mb-4 flex items-center gap-3 font-[family-name:var(--font-display)] text-[1.05rem] italic text-champagne-soft"
                  >
                    {NUMERALES[indice]}
                    <span className="h-px flex-1 bg-current opacity-30" />
                  </span>
                  <ProductCard
                    producto={producto}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 15vw"
                  />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
