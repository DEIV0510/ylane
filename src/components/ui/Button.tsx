import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Botones de la casa. Una sola acción principal por pantalla:
 *  - `principal`  vino lleno (sobre negro o marfil)
 *  - `claro`      marfil lleno, texto tinta (sobre vino o sobre fotografía)
 *  - `contorno`   secundaria
 *  - `suave`      champagne (sólo acciones de compra muy puntuales)
 *  - `texto`      enlace
 */
type Variante = 'principal' | 'claro' | 'contorno' | 'suave' | 'texto';
type Tamano = 'sm' | 'md' | 'lg';

const BASE =
  'relative inline-flex items-center justify-center gap-2 text-center font-medium uppercase tracking-[0.2em] transition-[background-color,border-color,color,opacity] duration-300 ease-[var(--ease-silk)] disabled:cursor-not-allowed disabled:opacity-40';

const VARIANTES: Record<Variante, string> = {
  principal: 'bg-vino text-marfil border border-vino hover:bg-vino-glow hover:border-vino-glow',
  claro: 'bg-marfil text-tinta border border-marfil hover:bg-white hover:border-white',
  contorno:
    'border border-[var(--surface-control)] text-current hover:border-[var(--acento)] hover:text-[var(--acento)]',
  suave: 'bg-champagne text-noir border border-champagne hover:bg-champagne-soft',
  texto: 'text-current underline-offset-4 hover:text-[var(--acento)] hover:underline px-0',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'min-h-10 px-4 py-2 text-[0.65rem]',
  md: 'min-h-12 px-7 py-3 text-[0.68rem]',
  lg: 'min-h-14 px-9 py-4 text-[0.7rem]',
};

type Comun = {
  variante?: Variante;
  tamano?: Tamano;
  className?: string;
  children: ReactNode;
};

export function Button({
  variante = 'principal',
  tamano = 'md',
  className = '',
  children,
  ...props
}: Comun & ComponentProps<'button'>) {
  return (
    <button
      className={`${BASE} ${VARIANTES[variante]} ${variante === 'texto' ? '' : TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variante = 'principal',
  tamano = 'md',
  className = '',
  children,
  href,
  ...props
}: Comun & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTES[variante]} ${variante === 'texto' ? '' : TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function ExternalButton({
  variante = 'principal',
  tamano = 'md',
  className = '',
  children,
  ...props
}: Comun & ComponentProps<'a'>) {
  return (
    <a
      className={`${BASE} ${VARIANTES[variante]} ${variante === 'texto' ? '' : TAMANOS[tamano]} ${className}`}
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
