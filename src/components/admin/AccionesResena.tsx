'use client';

import { useTransition } from 'react';
import { eliminarResena, moderarResena } from '@/app/actions/admin';

export function AccionesResena({ id, estado }: { id: number; estado: string }) {
  const [pendiente, iniciar] = useTransition();

  return (
    <div className="flex shrink-0 gap-4 text-[0.68rem] uppercase tracking-[0.12em]">
      {estado !== 'aprobada' && (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => iniciar(() => void moderarResena(id, 'aprobada'))}
          className="text-vino hover:underline disabled:opacity-50"
        >
          Aprobar
        </button>
      )}
      {estado !== 'rechazada' && (
        <button
          type="button"
          disabled={pendiente}
          onClick={() => iniciar(() => void moderarResena(id, 'rechazada'))}
          className="text-[var(--surface-muted)] hover:text-vino disabled:opacity-50"
        >
          Rechazar
        </button>
      )}
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          if (window.confirm('¿Eliminar esta reseña definitivamente?')) {
            iniciar(() => void eliminarResena(id));
          }
        }}
        className="text-red-700 hover:underline disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
