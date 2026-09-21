import type { Metadata } from 'next';
import Link from 'next/link';
import { and, count, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { products } from '@/db/schema';
import { listarMarcas } from '@/lib/catalog';
import { normalizar } from '@/lib/text';
import { EncabezadoCatalogo } from '@/components/product/EncabezadoCatalogo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Marcas',
  description:
    'Marcas disponibles en YLANE PERFUMES: perfumería árabe, casas de diseñador y nicho.',
  alternates: { canonical: '/marcas' },
};

type Marca = Awaited<ReturnType<typeof listarMarcas>>[number];

/** Letra del índice: sin tildes; lo que no empieza por letra va a «#», al final. */
function letraDe(nombre: string): string {
  const inicial = normalizar(nombre).charAt(0).toUpperCase();
  return /^[A-Z]$/.test(inicial) ? inicial : '#';
}

function agruparPorLetra(marcas: Marca[]) {
  const grupos = new Map<string, Marca[]>();
  for (const marca of marcas) {
    const letra = letraDe(marca.nombre);
    grupos.set(letra, [...(grupos.get(letra) ?? []), marca]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letra, items]) => ({
      letra,
      ancla: letra === '#' ? 'otras' : letra.toLowerCase(),
      marcas: items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    }));
}

/**
 * Índice editorial de marcas, de la A a la Z: la letra en Bodoni hace de
 * separador y cada marca lleva su número real de referencias. Sin tarjetas.
 */
export default async function MarcasPage() {
  const [marcas, sinMarca] = await Promise.all([
    listarMarcas(),
    // Referencias activas sin marca: el aviso del final sólo sale si existen.
    db
      .select({ total: count() })
      .from(products)
      .where(and(eq(products.activo, true), isNull(products.marcaId)))
      .get(),
  ]);
  const grupos = agruparPorLetra(marcas);
  const pendientes = sinMarca?.total ?? 0;

  return (
    <div data-surface="claro">
      <EncabezadoCatalogo
        eyebrow="Distribución"
        titulo="Marcas"
        descripcion="Las casas de perfumería del catálogo de YLANE, de la A a la Z. Comercializamos y distribuimos fragancias de terceros: no fabricamos perfumes."
        total={marcas.length}
        unidad={['marca', 'marcas']}
      />

      <div className="shell pb-24 lg:pb-32">
        {grupos.length > 1 && (
          <nav aria-label="Índice alfabético" className="border-t border-[var(--surface-line)] py-4 lg:py-5">
            <ul className="-ml-3 flex flex-wrap">
              {grupos.map((grupo) => (
                <li key={grupo.letra}>
                  <a
                    href={`#letra-${grupo.ancla}`}
                    aria-label={grupo.letra === '#' ? 'Otras marcas' : undefined}
                    className="flex size-11 items-center justify-center font-[family-name:var(--font-display)] text-[1.375rem] leading-none transition-colors duration-300 hover:text-[var(--acento)]"
                  >
                    {grupo.letra}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {grupos.map((grupo) => (
          <section
            key={grupo.letra}
            id={`letra-${grupo.ancla}`}
            aria-labelledby={`titulo-letra-${grupo.ancla}`}
            data-reveal
            className="grid scroll-mt-[calc(var(--header-h)_+_1rem)] grid-cols-[3rem_minmax(0,1fr)] gap-x-5 border-t border-[var(--surface-line)] py-8 last-of-type:border-b sm:grid-cols-[5rem_minmax(0,1fr)] lg:grid-cols-12 lg:gap-x-10 lg:py-12"
          >
            {/* La letra acompaña a su grupo mientras se recorre (sticky dentro de la sección). */}
            <h2
              id={`titulo-letra-${grupo.ancla}`}
              className="sticky top-[calc(var(--header-h)_+_1.25rem)] self-start text-[2.75rem] leading-[0.85] lg:col-span-2 lg:text-[4.5rem]"
            >
              {grupo.letra === '#' ? (
                <>
                  <span aria-hidden="true">#</span>
                  <span className="sr-only">Otras marcas</span>
                </>
              ) : (
                grupo.letra
              )}
            </h2>
            <ul className="grid content-start gap-x-10 sm:grid-cols-2 lg:col-span-10 lg:grid-cols-3">
              {grupo.marcas.map((marca) => (
                <li key={marca.slug}>
                  <Link href={`/marcas/${marca.slug}`} className="group flex min-h-11 items-baseline gap-3 py-2">
                    <span className="text-[1.0625rem] leading-snug transition-colors duration-300 group-hover:text-[var(--acento)]">
                      {marca.nombre}
                    </span>
                    {/* Filete de índice entre el nombre y la cifra. */}
                    <span
                      aria-hidden="true"
                      className="h-px min-w-6 flex-1 -translate-y-[0.3em] bg-[var(--surface-line)] transition-colors duration-300 group-hover:bg-[var(--surface-control)]"
                    />
                    <span className="text-[0.8125rem] tabular-nums text-[var(--surface-muted)]">
                      {marca.total}
                      <span className="sr-only"> {marca.total === 1 ? 'fragancia' : 'fragancias'}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {pendientes > 0 && (
          <p className="mt-12 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--surface-muted)]">
            {pendientes === 1
              ? 'Hay una referencia cuya marca todavía no está asignada; mientras tanto puedes encontrarla en '
              : `Hay ${pendientes} referencias cuya marca todavía no está asignada; mientras tanto puedes encontrarlas en `}
            <Link
              href="/perfumes"
              className="text-[var(--surface-fg)] underline decoration-[var(--surface-line)] underline-offset-4 transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current"
            >
              el catálogo completo
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
