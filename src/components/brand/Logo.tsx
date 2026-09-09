import Link from 'next/link';

/**
 * Sistema de marca YLANE.
 *  - `completo`  → YLANE + PERFUMES (cabecera, footer)
 *  - `reducido`  → YLANE
 *  - `isotipo`   → monograma Y (favicon, sellos, avatares)
 * Funciona igual sobre fondo oscuro y sobre fondo claro: hereda `currentColor`.
 */

export function Monograma({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 70" aria-hidden="true" className={className} fill="none">
      <path
        d="M10 14 L21 14 L32 30 L43 14 L54 14 L36 40 L36 52 L46 52 L46 56 L18 56 L18 52 L28 52 L28 40 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MonogramaSello({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center border border-current/45 ${className}`}
      aria-hidden="true"
    >
      <Monograma className="h-1/2 w-auto" />
    </span>
  );
}

type LogoProps = {
  variante?: 'completo' | 'reducido' | 'isotipo';
  className?: string;
  /** Envuelve el logo en un enlace al inicio. */
  href?: string | null;
};

export function Logo({ variante = 'completo', className = '', href = '/' }: LogoProps) {
  const contenido =
    variante === 'isotipo' ? (
      <Monograma className={`h-7 w-auto ${className}`} />
    ) : (
      <span className={`flex flex-col items-start leading-none ${className}`}>
        <span
          className="font-[family-name:var(--font-display)] text-[1.35rem] leading-none tracking-[0.42em] sm:text-[1.5rem]"
          style={{ paddingRight: '0.42em' }}
        >
          YLANE
        </span>
        {variante === 'completo' && (
          <span
            className="mt-[0.35em] text-[0.5rem] font-medium tracking-[0.52em] text-champagne sm:text-[0.55rem]"
            style={{ paddingRight: '0.52em' }}
          >
            PERFUMES
          </span>
        )}
      </span>
    );

  if (!href) return contenido;

  return (
    <Link href={href} aria-label="YLANE PERFUMES — Inicio" className="inline-flex">
      {contenido}
    </Link>
  );
}
