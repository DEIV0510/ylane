import Link from 'next/link';
import { Indice } from '@/components/ui/Bits';

const OPCIONES = [
  { valor: 'hombre', etiqueta: 'Hombre' },
  { valor: 'mujer', etiqueta: 'Mujer' },
  { valor: 'unisex', etiqueta: 'Unisex' },
];

/**
 * 06 — Descubre tu fragancia. Distinta a todo lo demás: sin tarjetas ni
 * fotos, sólo tipografía. La primera pregunta del buscador de fragancias ya
 * se responde aquí y lleva directo a la segunda (/descubre?para=…).
 */
export function DescubreTeaser() {
  return (
    <section data-surface="oscuro" className="relative isolate overflow-hidden section-y">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 size-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(90,16,28,0.42),transparent)]"
      />

      <div className="shell grid gap-y-14 lg:grid-cols-12 lg:items-end lg:gap-x-10">
        <div data-reveal className="lg:col-span-5">
          <Indice numero="06">Descubre tu fragancia</Indice>
          <h2 className="display-xl mt-6">
            Tu perfume, <span className="italic text-champagne">en cuatro preguntas.</span>
          </h2>
          <p className="lead mt-6">
            Cuéntanos para quién es, qué quieres transmitir y cuándo lo usarás. Te mostramos las
            referencias del catálogo que mejor encajan.
          </p>
        </div>

        <div data-reveal className="lg:col-span-6 lg:col-start-7">
          <p className="flex items-center gap-4 text-[0.66rem] uppercase tracking-[0.3em] text-[var(--surface-muted)]">
            <span className="font-[family-name:var(--font-display)] text-[0.95rem] tracking-normal text-champagne">
              01 / 04
            </span>
            ¿Para quién?
          </p>
          <ul className="mt-6 border-t border-[var(--surface-line)]">
            {OPCIONES.map((opcion) => (
              <li key={opcion.valor} className="border-b border-[var(--surface-line)]">
                <Link
                  href={`/descubre?para=${opcion.valor}`}
                  className="group flex min-h-[5.5rem] items-center justify-between gap-6 py-4 transition-colors lg:min-h-[7rem]"
                >
                  <span className="font-[family-name:var(--font-display)] text-[clamp(2.4rem,5.4vw,4.75rem)] leading-none transition-[color,transform] duration-500 ease-[var(--ease-silk)] can-hover:group-hover:translate-x-3 can-hover:group-hover:italic can-hover:group-hover:text-champagne">
                    {opcion.etiqueta}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-[1.25rem] text-champagne transition-[opacity,transform] duration-500 ease-[var(--ease-silk)] can-hover:-translate-x-2 can-hover:opacity-0 can-hover:group-hover:translate-x-0 can-hover:group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/descubre"
            className="mt-6 inline-flex min-h-11 items-center text-[0.66rem] uppercase tracking-[0.22em] text-[var(--surface-muted)] underline-offset-4 transition-colors hover:text-champagne hover:underline"
          >
            Empezar desde el principio
          </Link>
        </div>
      </div>
    </section>
  );
}
