'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export function SubmitButton({
  children = 'Guardar',
  className = '',
  variante = 'principal',
}: {
  children?: ReactNode;
  className?: string;
  variante?: 'principal' | 'contorno';
}) {
  const { pending } = useFormStatus();
  const estilos =
    variante === 'principal'
      ? 'bg-vino text-marfil border-vino hover:bg-vino-glow'
      : 'border-current/30 hover:border-vino hover:text-vino';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center border px-6 py-2.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors disabled:opacity-50 ${estilos} ${className}`}
    >
      {pending ? 'Guardando…' : children}
    </button>
  );
}

export function Aviso({ estado }: { estado: { ok: boolean; mensaje: string } | null }) {
  if (!estado) return null;
  return (
    <p
      role="status"
      className={`border px-4 py-2.5 text-[0.82rem] ${
        estado.ok ? 'border-emerald-600/40 bg-emerald-600/10 text-emerald-800' : 'border-red-500/40 bg-red-500/10 text-red-700'
      }`}
    >
      {estado.mensaje}
    </p>
  );
}

export function Campo({
  nombre,
  etiqueta,
  valor,
  tipo = 'text',
  ayuda,
  requerido = false,
  placeholder,
  className = '',
}: {
  nombre: string;
  etiqueta: string;
  valor?: string | number | null;
  tipo?: string;
  ayuda?: string;
  requerido?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
        {etiqueta}
        {requerido && <span className="text-vino"> *</span>}
      </span>
      <input
        name={nombre}
        type={tipo}
        defaultValue={valor ?? ''}
        required={requerido}
        placeholder={placeholder}
        className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-vino"
      />
      {ayuda && <span className="mt-1 block text-[0.7rem] text-[var(--surface-muted)]">{ayuda}</span>}
    </label>
  );
}

export function AreaTexto({
  nombre,
  etiqueta,
  valor,
  filas = 4,
  ayuda,
  placeholder,
  className = '',
}: {
  nombre: string;
  etiqueta: string;
  valor?: string | null;
  filas?: number;
  ayuda?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
        {etiqueta}
      </span>
      <textarea
        name={nombre}
        rows={filas}
        defaultValue={valor ?? ''}
        placeholder={placeholder}
        className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-vino"
      />
      {ayuda && <span className="mt-1 block text-[0.7rem] text-[var(--surface-muted)]">{ayuda}</span>}
    </label>
  );
}

export function Selector({
  nombre,
  etiqueta,
  valor,
  opciones,
  className = '',
}: {
  nombre: string;
  etiqueta: string;
  valor?: string | null;
  opciones: { valor: string; etiqueta: string }[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
        {etiqueta}
      </span>
      <select
        name={nombre}
        defaultValue={valor ?? ''}
        className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-vino"
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Interruptor({
  nombre,
  etiqueta,
  activo = false,
  ayuda,
}: {
  nombre: string;
  etiqueta: string;
  activo?: boolean;
  ayuda?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <input
        type="checkbox"
        name={nombre}
        defaultChecked={activo}
        className="mt-0.5 size-4 accent-[var(--color-vino)]"
      />
      <span>
        <span className="block text-[0.85rem]">{etiqueta}</span>
        {ayuda && <span className="block text-[0.72rem] text-[var(--surface-muted)]">{ayuda}</span>}
      </span>
    </label>
  );
}

export function BotonConfirmacion({
  children,
  mensaje,
  className = '',
}: {
  children: ReactNode;
  mensaje: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(evento) => {
        if (!window.confirm(mensaje)) evento.preventDefault();
      }}
      className={`text-[0.7rem] uppercase tracking-[0.14em] text-red-700 transition-colors hover:text-red-900 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
