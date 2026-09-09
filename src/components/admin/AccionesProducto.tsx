'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { alternarBandera, duplicarProducto, eliminarProducto } from '@/app/actions/admin';

export function AccionesProducto({
  id,
  slug,
  activo,
  destacado,
}: {
  id: number;
  slug: string;
  activo: boolean;
  destacado: boolean;
}) {
  const [pendiente, iniciar] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[0.68rem] uppercase tracking-[0.1em]">
      <Link href={`/admin/productos/${id}`} className="text-vino hover:underline">
        Editar
      </Link>
      <Link href={`/perfumes/${slug}`} target="_blank" className="text-[var(--surface-muted)] hover:text-vino">
        Ver
      </Link>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(() => void alternarBandera(id, 'activo'))}
        className="text-[var(--surface-muted)] transition-colors hover:text-vino disabled:opacity-50"
      >
        {activo ? 'Ocultar' : 'Publicar'}
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(() => void alternarBandera(id, 'destacado'))}
        className="text-[var(--surface-muted)] transition-colors hover:text-vino disabled:opacity-50"
      >
        {destacado ? 'Quitar destaque' : 'Destacar'}
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(() => void duplicarProducto(id))}
        className="text-[var(--surface-muted)] transition-colors hover:text-vino disabled:opacity-50"
      >
        Duplicar
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          if (window.confirm('¿Eliminar esta referencia? La acción no se puede deshacer.')) {
            iniciar(() => void eliminarProducto(id));
          }
        }}
        className="text-red-700 transition-colors hover:text-red-900 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
