import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variante = 'principal' | 'contorno' | 'suave' | 'texto';
type Tamano = 'sm' | 'md' | 'lg';

const BASE =
  'relative inline-flex items-center justify-center gap-2 text-center font-medium uppercase tracking-[0.18em] transition-all duration-300 ease-[var(--ease-silk)] disabled:cursor-not-allowed disabled:opacity-40';

const VARIANTES: Record<Variante, string> = {
  principal:
    'bg-vino text-marfil border border-vino hover:bg-vino-glow hover:border-vino-glow active:translate-y-px',
  contorno:
    'border border-[var(--surface-control)] text-current hover:border-[var(--acento)] hover:text-[var(--acento)] active:translate-y-px',
  suave: 'bg-champagne text-noir border border-champagne hover:bg-champagne-soft active:translate-y-px',
  texto: 'text-current underline-offset-4 hover:text-champagne hover:underline px-0',
};

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-4 py-2 text-[0.65rem]',
  md: 'px-6 py-3 text-[0.7rem]',
  lg: 'px-8 py-4 text-[0.72rem]',
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
