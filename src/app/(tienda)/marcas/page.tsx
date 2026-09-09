import type { Metadata } from 'next';
import Link from 'next/link';
import { listarMarcas } from '@/lib/catalog';
import { TIPO_ETIQUETA } from '@/lib/format';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Marcas',
  description:
    'Marcas disponibles en YLANE PERFUMES: perfumería árabe, casas de diseñador y nicho.',
  alternates: { canonical: '/marcas' },
};

const ORDEN_GRUPOS = ['arabe', 'nicho', 'disenador', 'comercial'] as const;

export default async function MarcasPage() {
  const marcas = await listarMarcas();
  const grupos = ORDEN_GRUPOS.map((origen) => ({
    origen,
    items: marcas.filter((marca) => marca.origen === origen),
  })).filter((grupo) => grupo.items.length > 0);

  const sinClasificar = marcas.filter(
    (marca) => !ORDEN_GRUPOS.includes(marca.origen as (typeof ORDEN_GRUPOS)[number]),
  );

  return (
    <div data-surface="oscuro">
      <header className="border-b border-[var(--surface-line)]">
        <div className="shell py-14 lg:py-20">
          <p className="eyebrow mb-3">Distribución</p>
          <h1 className="display-lg">Marcas</h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
            {marcas.length} marcas dentro del catálogo de YLANE. Comercializamos y distribuimos
            fragancias de terceros: no fabricamos perfumes.
          </p>
        </div>
      </header>

      <div className="shell space-y-16 py-14 lg:py-20">
        {grupos.map((grupo) => (
          <section key={grupo.origen} data-reveal>
            <h2 className="eyebrow mb-6">
              {grupo.origen === 'arabe'
                ? 'Perfumería árabe'
                : grupo.origen === 'nicho'
                  ? 'Nicho'
                  : grupo.origen === 'disenador'
                    ? 'Diseñador'
                    : 'Comercial'}
            </h2>
            <ul className="grid grid-cols-2 gap-px border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-3 lg:grid-cols-4">
              {grupo.items.map((marca) => (
                <li key={marca.slug}>
                  <Link
                    href={`/marcas/${marca.slug}`}
                    className="group flex h-full flex-col justify-between gap-4 bg-[var(--surface-bg)] p-5 transition-colors hover:bg-noir-lift"
                  >
                    <span className="font-[family-name:var(--font-display)] text-lg leading-snug transition-colors group-hover:text-champagne">
                      {marca.nombre}
                    </span>
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
                      {marca.total} {marca.total === 1 ? 'referencia' : 'referencias'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {sinClasificar.length > 0 && (
          <section data-reveal>
            <h2 className="eyebrow mb-6">Otras marcas</h2>
            <ul className="flex flex-wrap gap-2">
              {sinClasificar.map((marca) => (
                <li key={marca.slug}>
                  <Link
                    href={`/marcas/${marca.slug}`}
                    className="inline-flex border border-[var(--surface-line)] px-4 py-2 text-[0.8rem] transition-colors hover:border-champagne hover:text-champagne"
                  >
                    {marca.nombre} · {marca.total}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="border-t border-[var(--surface-line)] pt-8 text-[0.8rem] text-[var(--surface-muted)]">
          Hay referencias del catálogo cuya marca todavía no está asignada. Se van completando
          desde el panel de administración; mientras tanto puedes encontrarlas en{' '}
          <Link href="/perfumes" className="text-champagne hover:underline">
            el catálogo completo
          </Link>
          . Clasificación: {ORDEN_GRUPOS.map((tipo) => TIPO_ETIQUETA[tipo]).join(' · ')}.
        </p>
      </div>
    </div>
  );
}
