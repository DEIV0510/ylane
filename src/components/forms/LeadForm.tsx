'use client';

import { useActionState } from 'react';
import { enviarSolicitud } from '@/app/actions/publicas';
import { Button } from '@/components/ui/Button';
import { trackEvento } from '@/lib/analytics';

type Campo = {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
  ancho?: 'completo' | 'medio';
  multilinea?: boolean;
  placeholder?: string;
};

export function LeadForm({
  tipo,
  campos,
  textoBoton = 'Enviar',
  mensajeExito = 'Recibimos tu solicitud. Te contactamos muy pronto.',
}: {
  tipo: 'mayorista' | 'contacto';
  campos: Campo[];
  textoBoton?: string;
  mensajeExito?: string;
}) {
  const [estado, accion, pendiente] = useActionState(enviarSolicitud, null);

  if (estado?.ok) {
    return (
      <div
        role="status"
        tabIndex={-1}
        ref={(nodo) => nodo?.focus()}
        className="border border-champagne/40 p-8 text-center outline-none"
      >
        <span className="mx-auto block size-2 rotate-45 bg-champagne" aria-hidden="true" />
        <p className="mt-5 font-[family-name:var(--font-display)] text-xl">¡Gracias!</p>
        <p className="mt-2 text-[0.9rem] text-[var(--surface-muted)]">{mensajeExito}</p>
      </div>
    );
  }

  return (
    <form
      action={(datos) => {
        trackEvento('Lead', { tipo });
        return accion(datos);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="hidden" name="tipo" value={tipo} />

      {campos.map((campo) => (
        <label
          key={campo.nombre}
          className={campo.ancho === 'completo' || campo.multilinea ? 'sm:col-span-2' : ''}
        >
          <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
            {campo.etiqueta}
            {campo.requerido && <span className="text-champagne"> *</span>}
          </span>
          {campo.multilinea ? (
            <textarea
              name={campo.nombre}
              required={campo.requerido}
              rows={4}
              maxLength={1500}
              placeholder={campo.placeholder}
              className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--surface-muted)] focus:border-champagne"
            />
          ) : (
            <input
              name={campo.nombre}
              type={campo.tipo ?? 'text'}
              required={campo.requerido}
              placeholder={campo.placeholder}
              className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--surface-muted)] focus:border-champagne"
            />
          )}
        </label>
      ))}

      {estado && !estado.ok && (
        <p role="alert" className="text-sm text-red-300 sm:col-span-2">
          {estado.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" tamano="lg" disabled={pendiente}>
          {pendiente ? 'Enviando…' : textoBoton}
        </Button>
        <p className="mt-3 text-[0.72rem] text-[var(--surface-muted)]">
          Usamos tus datos únicamente para responder esta solicitud.
        </p>
      </div>
    </form>
  );
}
