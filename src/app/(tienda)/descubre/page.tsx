import type { Metadata } from 'next';
import { PerfumeFinder } from '@/components/finder/PerfumeFinder';
import { generoDesdeParametro } from '@/components/finder/preguntas';

export const metadata: Metadata = {
  title: 'Descubre tu fragancia',
  description:
    'Responde cuatro preguntas y te mostramos las referencias del catálogo de YLANE que mejor encajan contigo.',
  alternates: { canonical: '/descubre' },
};

export default async function DescubrePage({
  searchParams,
}: {
  searchParams: Promise<{ para?: string | string[] }>;
}) {
  // La portada ya pregunta «¿Para quién?» y enlaza con ?para=: se empieza en la segunda.
  const { para } = await searchParams;
  const generoInicial = generoDesdeParametro(para);

  return (
    <section
      data-surface="oscuro"
      className="relative isolate flex min-h-[calc(100svh_-_var(--header-h))] flex-col"
    >
      {/* Halo vino muy tenue y fuera del eje: da profundidad sin competir con la pregunta. */}
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_86%_4%,color-mix(in_oklab,var(--color-vino)_42%,transparent),transparent_72%)]"
      />
      {/* key: si ?para= cambia sin salir de la página, el recorrido empieza de nuevo. */}
      <PerfumeFinder key={generoInicial ?? 'inicio'} generoInicial={generoInicial} />
    </section>
  );
}
