import Image from 'next/image';
import Link from 'next/link';

/**
 * Sistema de marca YLANE, a partir del logo original (dorado, public/brand).
 *  - `lockup`     → monograma + YLANE PERFUMES en horizontal (cabecera)
 *  - `wordmark`   → YLANE PERFUMES
 *  - `completo`   → logo apilado con el lema (pie de página)
 *  - `monograma`  → la Y-frasco sola (cargador, sellos)
 * El dorado sólo se usa sobre negro o vino. Sobre marfil va `tono="vino"`
 * (sólo existe para el wordmark: el monograma pierde el vidrio del frasco).
 */

const ACTIVOS = {
  monograma: { src: '/brand/ylane-monograma.png', w: 334, h: 401 },
  wordmark: { src: '/brand/ylane-wordmark.png', w: 674, h: 193 },
  wordmarkVino: { src: '/brand/ylane-wordmark-vino.png', w: 674, h: 193 },
  completo: { src: '/brand/ylane-logo.png', w: 674, h: 780 },
} as const;

type Variante = 'lockup' | 'wordmark' | 'completo' | 'monograma';

type LogoProps = {
  variante?: Variante;
  tono?: 'oro' | 'vino';
  className?: string;
  /** Envuelve el logo en un enlace al inicio. `null` lo deja sin enlace. */
  href?: string | null;
  prioridad?: boolean;
};

function Activo({ clave, prioridad }: { clave: keyof typeof ACTIVOS; prioridad?: boolean }) {
  const activo = ACTIVOS[clave];
  return (
    <Image
      src={activo.src}
      width={activo.w}
      height={activo.h}
      alt=""
      aria-hidden="true"
      priority={prioridad}
      sizes="(max-width: 768px) 45vw, 260px"
      className="block h-full w-auto select-none"
      draggable={false}
    />
  );
}

export function Logo({
  variante = 'lockup',
  tono = 'oro',
  className = '',
  href = '/',
  prioridad = false,
}: LogoProps) {
  const wordmark = tono === 'vino' ? 'wordmarkVino' : 'wordmark';

  const contenido =
    variante === 'lockup' ? (
      <span className={`flex items-center gap-[0.6em] ${className}`}>
        <span className="block h-full">
          <Activo clave="monograma" prioridad={prioridad} />
        </span>
        <span className="block h-[52%]">
          <Activo clave={wordmark} prioridad={prioridad} />
        </span>
      </span>
    ) : (
      <span className={`block ${className}`}>
        <Activo
          clave={variante === 'wordmark' ? wordmark : variante === 'completo' ? 'completo' : 'monograma'}
          prioridad={prioridad}
        />
      </span>
    );

  if (!href) {
    return (
      <span role="img" aria-label="YLANE PERFUMES" className="inline-flex">
        {contenido}
      </span>
    );
  }

  return (
    <Link href={href} aria-label="YLANE PERFUMES — Inicio" className="inline-flex">
      {contenido}
    </Link>
  );
}

/** Monograma dorado (imagen del logo original), decorativo. */
export function MonogramaOro({ className = '' }: { className?: string }) {
  return (
    <span className={`block ${className}`} aria-hidden="true">
      <Activo clave="monograma" />
    </span>
  );
}

/**
 * Monograma vectorial de un solo color (hereda `currentColor`).
 * Lo usa el panel de administración, donde el logo dorado no aplica.
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
