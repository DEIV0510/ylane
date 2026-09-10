import type { ReactNode } from 'react';
import Link from 'next/link';

/* ── Etiqueta pequeña sobre las tarjetas ────────────────────────────── */
export function Badge({
  children,
  tono = 'champagne',
  className = '',
}: {
  children: ReactNode;
  tono?: 'champagne' | 'vino' | 'neutro';
  className?: string;
}) {
  const tonos = {
    champagne: 'bg-champagne text-noir',
    vino: 'bg-vino text-marfil',
    neutro: 'bg-black/55 text-marfil backdrop-blur-sm',
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.2em] ${tonos[tono]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Encabezado de sección ──────────────────────────────────────────── */
export function SectionHeader({
  eyebrow,
  titulo,
  texto,
  enlace,
  enlaceTexto = 'Ver todo',
  align = 'left',
  className = '',
}: {
  eyebrow?: string;
  titulo: string;
  texto?: string;
  enlace?: string;
  enlaceTexto?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centrado = align === 'center';
  return (
    <div
      className={`flex flex-col gap-4 ${
        centrado ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      } ${className}`}
    >
      <div className={centrado ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="display-lg">{titulo}</h2>
        {texto && (
          <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">{texto}</p>
        )}
      </div>
      {enlace && (
        <Link
          href={enlace}
          className="group inline-flex shrink-0 items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-champagne transition-colors hover:text-champagne-soft"
        >
          {enlaceTexto}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      )}
    </div>
  );
}

/* ── Estrellas de valoración ────────────────────────────────────────── */
export function Stars({
  valor,
  size = 12,
  className = '',
  etiquetado = true,
}: {
  valor: number;
  size?: number;
  className?: string;
  /** Añade el equivalente textual. Desactívalo si el texto ya está al lado. */
  etiquetado?: boolean;
}) {
  const llenas = Math.round(valor);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {etiquetado && <span className="sr-only">{valor.toFixed(1)} de 5 estrellas</span>}
      {[1, 2, 3, 4, 5].map((indice) => (
        <svg
          key={indice}
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={indice <= llenas ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}

/* ── Separador con rombo ────────────────────────────────────────────── */
export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-[var(--surface-line)]" />
      <span className="size-1.5 rotate-45 bg-champagne/70" />
      <span className="h-px flex-1 bg-[var(--surface-line)]" />
    </div>
  );
}

/* ── Estado vacío ───────────────────────────────────────────────────── */
export function EmptyState({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 border border-[var(--surface-line)] px-6 py-16 text-center">
      <span className="size-2 rotate-45 bg-champagne/70" aria-hidden="true" />
      <h3 className="display-md">{titulo}</h3>
      {texto && <p className="max-w-md text-sm text-[var(--surface-muted)]">{texto}</p>}
      {children}
    </div>
  );
}
