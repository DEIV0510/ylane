import Image from 'next/image';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui/Bits';

export type Coleccion = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  href: string;
  total: number;
};

/**
 * 03 — Colecciones. Un mosaico de tamaños distintos, no seis tarjetas iguales:
 * Árabes es la protagonista (alta), el resto se reparte en piezas de otra
 * proporción. Si el negocio sube una imagen para la categoría, manda esa.
 */
const FOTOS: Record<string, string> = {
  arabes: '/editorial/coleccion-arabes.jpg',
  mujer: '/editorial/coleccion-mujer.jpg',
  hombre: '/editorial/coleccion-hombre.jpg',
  unisex: '/editorial/coleccion-unisex.jpg',
  nicho: '/editorial/coleccion-nicho.jpg',
};

const LUGAR: Record<string, { clases: string; sizes: string; protagonista?: boolean }> = {
  arabes: {
    clases: 'col-span-2 aspect-[4/5] lg:col-span-5 lg:row-span-2 lg:aspect-auto',
    sizes: '(max-width: 1024px) 100vw, 40vw',
    protagonista: true,
  },
  mujer: { clases: 'aspect-[3/4] lg:col-span-3 lg:aspect-auto', sizes: '(max-width: 1024px) 50vw, 24vw' },
  hombre: { clases: 'aspect-[3/4] lg:col-span-4 lg:aspect-auto', sizes: '(max-width: 1024px) 50vw, 32vw' },
  unisex: {
    clases: 'col-span-2 aspect-[16/10] lg:col-span-5 lg:aspect-auto',
    sizes: '(max-width: 1024px) 100vw, 40vw',
  },
  nicho: {
    clases: 'col-span-2 aspect-[16/7] lg:col-span-2 lg:aspect-auto',
    sizes: '(max-width: 1024px) 100vw, 16vw',
  },
};

export function Colecciones({ colecciones, intro }: { colecciones: Coleccion[]; intro?: string }) {
  const piezas = ['arabes', 'mujer', 'hombre', 'unisex', 'nicho']
    .map((slug) => colecciones.find((coleccion) => coleccion.slug === slug))
    .filter((coleccion): coleccion is Coleccion => Boolean(coleccion));

  if (piezas.length === 0) return null;
  // El mosaico está pensado para las cinco; si falta alguna se usa una rejilla simple.
  const completo = piezas.length === 5;

  return (
    <section data-surface="lino" className="section-y">
      <div className="shell">
        <SectionHeader
          indice="03"
          eyebrow="Colecciones"
          titulo="Explora por colección."
          texto={intro}
          enlace="/marcas"
          enlaceTexto="Ver todas las marcas"
        />

        <div
          className={`mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-16 ${
            completo ? 'lg:grid-cols-12 lg:grid-rows-[23rem_19rem]' : 'lg:grid-cols-3'
          }`}
        >
          {piezas.map((coleccion, indice) => {
            const lugar = LUGAR[coleccion.slug];
            const protagonista = Boolean(lugar?.protagonista);
            return (
              <Link
                key={coleccion.slug}
                href={coleccion.href}
                aria-label={`${coleccion.nombre}: ${coleccion.total} ${coleccion.total === 1 ? 'referencia' : 'referencias'}`}
                data-reveal
                style={{ transitionDelay: `${indice * 70}ms` }}
                className={`group relative isolate flex overflow-hidden bg-noir text-marfil ${
                  completo ? lugar?.clases : 'aspect-[3/4]'
                }`}
              >
                <Image
                  src={coleccion.imagen || FOTOS[coleccion.slug] || FOTOS.nicho}
                  alt=""
                  fill
                  sizes={completo ? lugar?.sizes : '(max-width: 1024px) 50vw, 33vw'}
                  className="-z-10 object-cover transition-transform duration-[1400ms] ease-[var(--ease-silk)] can-hover:group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-linear-to-t from-noir/88 via-noir/25 to-noir/5"
                />

                <span className={`mt-auto flex w-full items-end justify-between gap-4 ${protagonista ? 'p-6 lg:p-9' : 'p-4 sm:p-5 lg:p-6'}`}>
                  <span className="min-w-0">
                    <span className="block text-[0.6rem] font-medium uppercase tracking-[0.26em] text-champagne">
                      {coleccion.total} {coleccion.total === 1 ? 'referencia' : 'referencias'}
                    </span>
                    <span
                      className={`mt-2 block font-[family-name:var(--font-display)] leading-[0.95] ${
                        protagonista ? 'text-[2.6rem] lg:text-[4rem]' : 'text-[1.6rem] lg:text-[2rem]'
                      }`}
                    >
                      {coleccion.nombre}
                    </span>
                    {protagonista && coleccion.descripcion && (
                      <span className="mt-4 block max-w-xs text-[0.9rem] leading-relaxed text-marfil/80">
                        {coleccion.descripcion}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mb-1 shrink-0 text-champagne transition-transform duration-500 ease-[var(--ease-silk)] can-hover:group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
