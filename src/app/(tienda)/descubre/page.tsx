import type { Metadata } from 'next';
import { PerfumeFinder } from '@/components/finder/PerfumeFinder';

export const metadata: Metadata = {
  title: 'Descubre tu fragancia',
  description:
    'Responde cuatro preguntas y te mostramos las referencias del catálogo de YLANE que mejor encajan contigo.',
  alternates: { canonical: '/descubre' },
};

export default function DescubrePage() {
  return (
    <div data-surface="oscuro" className="grain relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgba(90,16,28,0.4),transparent_65%)]"
      />
      <div className="shell relative py-16 lg:py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow mb-3">Asesoría</p>
          <h1 className="display-lg">Descubre tu fragancia</h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
            Cuatro preguntas rápidas para acotar el catálogo a lo que de verdad estás buscando.
          </p>
        </div>
        <PerfumeFinder />
      </div>
    </div>
  );
}
