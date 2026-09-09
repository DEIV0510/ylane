'use client';

import { useTransition } from 'react';
import { eliminarSolicitud, marcarSolicitud } from '@/app/actions/admin';
import { whatsappUrl } from '@/lib/whatsapp';

export function AccionesSolicitud({
  id,
  atendido,
  telefono,
}: {
  id: number;
  atendido: boolean;
  telefono: string | null;
}) {
  const [pendiente, iniciar] = useTransition();
  const wa = whatsappUrl(telefono, 'Hola, te escribimos de YLANE PERFUMES.');

  return (
    <div className="flex shrink-0 flex-wrap gap-4 text-[0.68rem] uppercase tracking-[0.12em]">
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="text-vino hover:underline">
          WhatsApp
        </a>
      )}
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(() => void marcarSolicitud(id, !atendido))}
        className="text-[var(--surface-muted)] hover:text-vino disabled:opacity-50"
      >
        {atendido ? 'Marcar sin atender' : 'Marcar atendida'}
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          if (window.confirm('¿Eliminar esta solicitud?')) {
            iniciar(() => void eliminarSolicitud(id));
          }
        }}
        className="text-red-700 hover:underline disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
