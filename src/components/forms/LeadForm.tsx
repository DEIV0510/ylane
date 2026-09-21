'use client';

import { useActionState } from 'react';
import { enviarSolicitud } from '@/app/actions/publicas';
import { Button } from '@/components/ui/Button';
import { trackEvento } from '@/lib/analytics';
import { AvisoError, CLASE_CAMPO, CLASE_ETIQUETA, CLASE_GRUPO } from './Campo';

type Campo = {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
  ancho?: 'completo' | 'medio';
  multilinea?: boolean;
  placeholder?: string;
};

/** Autocompletado del navegador para los campos conocidos: menos teclado en el móvil. */
const AUTOCOMPLETADO: Record<string, string> = {
  nombre: 'name',
  empresa: 'organization',
  telefono: 'tel',
  email: 'email',
  ciudad: 'address-level2',
};

/**
 * Formulario de solicitud (mayoristas y contacto). Etiquetas siempre visibles y
 * campos de 48 px; el envío, el evento Lead y los avisos accesibles no dependen
 * del estilo.
 */
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
        className="border-t border-[var(--surface-line)] pt-10 outline-none"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 40 40"
          className="size-10 text-[var(--acento)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="18.6" />
          <path d="M13 20.6l4.7 4.7L27.4 15.2" />
        </svg>
        <p className="mt-7 font-[family-name:var(--font-display)] text-[2rem] leading-tight">Gracias.</p>
        <p className="mt-3 max-w-md text-[var(--surface-muted)]">{mensajeExito}</p>
      </div>
    );
  }

  // El servidor exige un WhatsApp o un correo: se dice antes de enviar, no después.
  const pideMedio = campos.some((campo) => campo.nombre === 'telefono' || campo.nombre === 'email');
  const hayObligatorios = campos.some((campo) => campo.requerido);

  return (
    <form
      action={(datos) => {
        trackEvento('Lead', { tipo });
        return accion(datos);
      }}
      className="grid gap-x-6 gap-y-8 sm:grid-cols-2"
    >
      <input type="hidden" name="tipo" value={tipo} />

      {(hayObligatorios || pideMedio) && (
        <p className="text-[0.875rem] leading-relaxed text-[var(--surface-muted)] sm:col-span-2">
          {/* El asterisco es visual: el lector de pantalla ya anuncia «obligatorio». */}
          {hayObligatorios && (
            <span aria-hidden="true">
              Los campos con <span className="text-[var(--acento)]">*</span> son obligatorios.{' '}
            </span>
          )}
          {pideMedio && 'Déjanos un WhatsApp o un correo para responderte.'}
        </p>
      )}

      {campos.map((campo) => (
        <label
          key={campo.nombre}
          className={`${CLASE_GRUPO} ${campo.ancho === 'completo' || campo.multilinea ? 'sm:col-span-2' : ''}`}
        >
          <span className={CLASE_ETIQUETA}>
            {campo.etiqueta}
            {campo.requerido && (
              <span aria-hidden="true" className="text-[var(--acento)]">
                {' '}*
              </span>
            )}
          </span>
          {campo.multilinea ? (
            <textarea
              name={campo.nombre}
              required={campo.requerido}
              rows={4}
              maxLength={1500}
              placeholder={campo.placeholder}
              className={`${CLASE_CAMPO} resize-y`}
            />
          ) : (
            <input
              name={campo.nombre}
              type={campo.tipo ?? 'text'}
              required={campo.requerido}
              placeholder={campo.placeholder}
              autoComplete={AUTOCOMPLETADO[campo.nombre]}
              className={CLASE_CAMPO}
            />
          )}
        </label>
      ))}

      {estado && !estado.ok && <AvisoError className="sm:col-span-2">{estado.error}</AvisoError>}

      <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:gap-8">
        {/* shrink-0: la nota se parte en líneas; el botón nunca. */}
        <Button type="submit" tamano="lg" disabled={pendiente} className="w-full shrink-0 sm:w-auto">
          {pendiente ? 'Enviando…' : textoBoton}
        </Button>
        <p className="text-[0.8125rem] leading-relaxed text-[var(--surface-muted)]">
          Usamos tus datos únicamente para responder esta solicitud.
        </p>
      </div>
    </form>
  );
}
