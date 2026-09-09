'use client';

import { useTransition } from 'react';
import { cambiarEstadoPago, cambiarEstadoPedido } from '@/app/actions/admin';
import { ESTADOS_PEDIDO } from '@/lib/format';

const PAGOS = ['pendiente', 'pagado', 'reembolsado'];

export function EstadoPedidoControl({
  id,
  estado,
  estadoPago,
  inventarioDescontado,
}: {
  id: number;
  estado: string;
  estadoPago: string;
  inventarioDescontado: boolean;
}) {
  const [pendiente, iniciar] = useTransition();

  return (
    <section className="space-y-4 border border-[var(--surface-line)] p-5">
      <div>
        <p className="mb-2 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Estado del pedido
        </p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_PEDIDO.map((opcion) => (
            <button
              key={opcion}
              type="button"
              disabled={pendiente || opcion === estado}
              onClick={() => iniciar(() => void cambiarEstadoPedido(id, opcion))}
              className={`border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors disabled:opacity-100 ${
                opcion === estado
                  ? 'border-vino bg-vino text-marfil'
                  : 'border-[var(--surface-line)] hover:border-vino hover:text-vino disabled:opacity-50'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Estado del pago
        </p>
        <div className="flex flex-wrap gap-2">
          {PAGOS.map((opcion) => (
            <button
              key={opcion}
              type="button"
              disabled={pendiente || opcion === estadoPago}
              onClick={() => iniciar(() => void cambiarEstadoPago(id, opcion))}
              className={`border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
                opcion === estadoPago
                  ? 'border-vino bg-vino text-marfil'
                  : 'border-[var(--surface-line)] hover:border-vino hover:text-vino disabled:opacity-50'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[0.75rem] text-[var(--surface-muted)]">
        {inventarioDescontado
          ? 'El inventario de este pedido ya fue descontado. Si lo cancelas, se devuelve automáticamente.'
          : 'El inventario se descuenta al marcar el pedido como confirmado (sólo en las referencias con stock definido).'}
      </p>
    </section>
  );
}
