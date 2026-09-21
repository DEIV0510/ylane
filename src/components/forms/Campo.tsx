import type { ReactNode } from 'react';

/**
 * Piezas comunes de los formularios públicos (solicitudes y consulta de pedido).
 * Todo sale de las variables de superficie: el mismo campo se lee bien sobre
 * marfil, lino o negro sin tocar una clase.
 */

/** Clase del <label> que envuelve etiqueta y campo (grupo con nombre: no lo activa un ancestro). */
export const CLASE_GRUPO = 'group/campo block';

/** Etiqueta visible encima del campo: toma el color de acento mientras el campo tiene el foco. */
export const CLASE_ETIQUETA =
  'mb-2.5 block text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)] transition-colors duration-300 group-focus-within/campo:text-[var(--acento)]';

/**
 * Campo de línea inferior sobre un fondo apenas marcado: 48 px de alto y texto
 * de 16 px (con menos, iOS amplía la página al enfocar). Con el foco la línea se
 * engrosa y toma el color de foco de la superficie, y el fondo se aclara.
 * `outline-hidden` deja un contorno transparente que sí se ve en alto contraste.
 */
export const CLASE_CAMPO =
  'block min-h-12 w-full border-b border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-base outline-hidden transition-[border-color,box-shadow,background-color] duration-300 ease-[var(--ease-silk)] placeholder:text-[var(--surface-muted)] focus:border-[var(--foco)] focus:bg-[var(--surface-card)] focus:shadow-[inset_0_-1px_0_var(--foco)]';

/** Aviso de error del servidor: icono de línea + texto en el color de la superficie. */
export function AvisoError({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-3 text-[0.9375rem] leading-snug text-[var(--surface-fg)] ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="mt-px size-[1.125rem] shrink-0 text-[var(--acento)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <circle cx="10" cy="10" r="8.3" />
        <path d="M10 5.8v5.4M10 14.1v.1" />
      </svg>
      <span>{children}</span>
    </p>
  );
}
