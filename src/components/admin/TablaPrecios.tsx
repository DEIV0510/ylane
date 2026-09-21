'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { guardarPreciosMasivo } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';
import { formatCOP } from '@/lib/format';

type Fila = {
  id: number;
  codigo: string;
  nombre: string;
  marca: string | null;
  precio: number | null;
  precioAnterior: number | null;
  costo: number | null;
  stock: number | null;
};

export function TablaPrecios({
  filas,
  total,
  pagina,
  paginas,
}: {
  filas: Fila[];
  total: number;
  pagina: number;
  paginas: number;
}) {
  const [estado, accion] = useActionState(guardarPreciosMasivo, null);

  if (filas.length === 0) {
    return (
      <p className="border border-[var(--surface-line)] p-8 text-center text-[0.85rem] text-[var(--surface-muted)]">
        No hay referencias con esos criterios.
      </p>
    );
  }

  return (
    <form action={accion} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.78rem] text-[var(--surface-muted)]">
          Mostrando {filas.length} de {total} · página {pagina} de {paginas}
        </p>
        <SubmitButton>Guardar cambios de esta página</SubmitButton>
      </div>

      <Aviso estado={estado} />

      <div className="overflow-x-auto border border-[var(--surface-line)]">
        <table className="w-full min-w-[60rem] text-left text-[0.84rem]">
          <thead className="border-b border-[var(--surface-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Referencia</th>
              <th className="px-3 py-3 font-medium">Marca</th>
              <th className="w-36 px-3 py-3 font-medium">Precio (COP)</th>
              <th className="w-36 px-3 py-3 font-medium">Precio anterior</th>
              <th className="w-36 px-3 py-3 font-medium">Costo</th>
              <th className="w-28 px-3 py-3 font-medium">Margen</th>
              <th className="w-28 px-3 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-line)]">
            {filas.map((fila) => (
              <tr key={fila.id}>
                <td className="px-3 py-2">
                  <Link href={`/admin/productos/${fila.id}`} className="hover:text-vino">
                    {fila.nombre}
                  </Link>
                  <span className="block text-[0.7rem] text-[var(--surface-muted)]">{fila.codigo}</span>
                </td>
                <td className="px-3 py-2 text-[var(--surface-muted)]">{fila.marca ?? '—'}</td>
                <td className="px-3 py-2">
                  <input
                    name={`precio_${fila.id}`}
                    defaultValue={fila.precio ?? ''}
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={`Precio de ${fila.nombre}`}
                    className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-2 py-1.5 text-sm outline-none focus:border-vino"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    name={`precioAnterior_${fila.id}`}
                    defaultValue={fila.precioAnterior ?? ''}
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={`Precio anterior de ${fila.nombre}`}
                    className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-2 py-1.5 text-sm outline-none focus:border-vino"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    name={`costo_${fila.id}`}
                    defaultValue={fila.costo ?? ''}
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={`Costo de ${fila.nombre}`}
                    className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-2 py-1.5 text-sm outline-none focus:border-vino"
                  />
                </td>
                <td className="px-3 py-2 text-[var(--surface-muted)]">
                  {fila.precio != null && fila.costo != null ? formatCOP(fila.precio - fila.costo) : '—'}
                </td>
                <td className="px-3 py-2">
                  <input
                    name={`stock_${fila.id}`}
                    defaultValue={fila.stock ?? ''}
                    inputMode="numeric"
                    placeholder="—"
                    aria-label={`Stock de ${fila.nombre}`}
                    className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-2 py-1.5 text-sm outline-none focus:border-vino"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubmitButton>Guardar cambios de esta página</SubmitButton>
    </form>
  );
}
