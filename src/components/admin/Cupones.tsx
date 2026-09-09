'use client';

import { useActionState, useState, useTransition } from 'react';
import { eliminarCupon, guardarCupon } from '@/app/actions/admin';
import { Aviso, Campo, Interruptor, Selector, SubmitButton } from './ui';
import { formatCOP, formatFecha } from '@/lib/format';
import type { Coupon } from '@/db/schema';

const TIPOS = [
  { valor: 'porcentaje', etiqueta: 'Porcentaje (%)' },
  { valor: 'fijo', etiqueta: 'Monto fijo (COP)' },
];

export function CuponFormulario({ cupon }: { cupon?: Coupon }) {
  const [estado, accion] = useActionState(guardarCupon, null);

  return (
    <form action={accion} className="grid gap-4 border border-[var(--surface-line)] p-5 sm:grid-cols-3">
      {cupon && <input type="hidden" name="id" value={cupon.id} />}

      <Campo nombre="codigo" etiqueta="Código" valor={cupon?.codigo} requerido />
      <Selector nombre="tipo" etiqueta="Tipo" valor={cupon?.tipo ?? 'porcentaje'} opciones={TIPOS} />
      <Campo nombre="valor" etiqueta="Valor" valor={cupon?.valor} tipo="number" requerido />

      <Campo
        nombre="compraMinima"
        etiqueta="Compra mínima (COP)"
        valor={cupon?.compraMinima ?? 0}
        tipo="number"
      />
      <Campo
        nombre="usosMaximos"
        etiqueta="Usos máximos"
        valor={cupon?.usosMaximos ?? ''}
        tipo="number"
        ayuda="Vacío = sin límite"
      />
      <Campo
        nombre="expiraEn"
        etiqueta="Expira el"
        valor={cupon?.expiraEn?.slice(0, 10) ?? ''}
        tipo="date"
      />

      <Campo
        nombre="descripcion"
        etiqueta="Descripción interna"
        valor={cupon?.descripcion}
        className="sm:col-span-3"
      />

      <div className="flex flex-wrap items-center gap-6 sm:col-span-3">
        <Interruptor nombre="activo" etiqueta="Activo" activo={cupon?.activo ?? true} />
        <SubmitButton variante={cupon ? 'contorno' : 'principal'}>
          {cupon ? 'Guardar' : 'Crear cupón'}
        </SubmitButton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

export function CuponFila({ cupon }: { cupon: Coupon }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  return (
    <div className="border border-[var(--surface-line)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[0.9rem]">
            {cupon.codigo}
            <span className="ml-2 text-[var(--surface-muted)]">
              {cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : formatCOP(cupon.valor)}
            </span>
            {!cupon.activo && (
              <span className="ml-2 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--surface-muted)]">
                (inactivo)
              </span>
            )}
          </p>
          <p className="text-[0.72rem] text-[var(--surface-muted)]">
            {cupon.usos} usos
            {cupon.usosMaximos ? ` de ${cupon.usosMaximos}` : ''}
            {cupon.expiraEn ? ` · vence ${formatFecha(cupon.expiraEn)}` : ''}
            {cupon.compraMinima ? ` · mínimo ${formatCOP(cupon.compraMinima)}` : ''}
          </p>
        </div>
        <div className="flex gap-4 text-[0.68rem] uppercase tracking-[0.12em]">
          <button
            type="button"
            onClick={() => setEditando((valor) => !valor)}
            className="text-vino hover:underline"
          >
            {editando ? 'Cerrar' : 'Editar'}
          </button>
          <button
            type="button"
            disabled={pendiente}
            onClick={() => {
              if (window.confirm(`¿Eliminar el cupón ${cupon.codigo}?`)) {
                iniciar(() => void eliminarCupon(cupon.id));
              }
            }}
            className="text-red-700 hover:underline disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>
      {editando && (
        <div className="border-t border-[var(--surface-line)] p-3">
          <CuponFormulario cupon={cupon} />
        </div>
      )}
    </div>
  );
}
