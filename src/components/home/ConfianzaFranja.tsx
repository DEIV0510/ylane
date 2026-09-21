import type { ReactNode } from 'react';

/**
 * 09 — Confianza. Una franja fina, no una sección de iconos: cuatro puntos
 * con iconos de línea muy discretos. El texto se edita en el panel
 * (Contenido → «Compra con confianza»), una línea por punto: Título | Texto.
 */
const TRAZO = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONOS: { clave: RegExp; icono: ReactNode }[] = [
  {
    clave: /segur|confirm|pago|compra/i,
    icono: (
      <svg viewBox="0 0 24 24" {...TRAZO}>
        <path d="M12 3l7 3v5.5c0 4.2-3 7.7-7 8.5-4-.8-7-4.3-7-8.5V6l7-3z" />
        <path d="M9 12l2.2 2.2L15.5 10" />
      </svg>
    ),
  },
  {
    clave: /atenci|asesor|personal/i,
    icono: (
      <svg viewBox="0 0 24 24" {...TRAZO}>
        <path d="M4.5 6.5h15v9h-8l-4 3v-3h-3z" />
        <path d="M8.5 10.5h7M8.5 13h4.5" />
      </svg>
    ),
  },
  {
    clave: /env[ií]o|entreg|despach/i,
    icono: (
      <svg viewBox="0 0 24 24" {...TRAZO}>
        <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
        <path d="M4 8l8 4 8-4M12 12v8" />
      </svg>
    ),
  },
  {
    clave: /cat[aá]logo|selecci|curad/i,
    icono: (
      <svg viewBox="0 0 24 24" {...TRAZO}>
        <path d="M12 3.5l1.9 6.6 6.6 1.9-6.6 1.9L12 20.5l-1.9-6.6L3.5 12l6.6-1.9z" />
      </svg>
    ),
  },
];

export function ConfianzaFranja({ puntos }: { puntos: { titulo: string; texto: string }[] }) {
  if (puntos.length === 0) return null;

  return (
    <section data-surface="lino" aria-label="Compra con confianza">
      <ul className="shell grid grid-cols-2 gap-x-6 gap-y-8 py-12 lg:grid-cols-4 lg:gap-0 lg:py-14">
        {puntos.slice(0, 4).map((punto) => {
          const icono = ICONOS.find((item) => item.clave.test(punto.titulo))?.icono ?? ICONOS[3].icono;
          return (
            <li
              key={punto.titulo}
              className="flex gap-4 lg:border-l lg:border-[var(--surface-line)] lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="mt-0.5 block size-5 shrink-0 text-vino" aria-hidden="true">
                {icono}
              </span>
              <span>
                <span className="block text-[0.66rem] font-medium uppercase tracking-[0.22em]">
                  {punto.titulo}
                </span>
                {punto.texto && (
                  <span className="mt-1.5 block text-[0.84rem] leading-relaxed text-[var(--surface-muted)]">
                    {punto.texto}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
