'use client';

import { useActionState } from 'react';
import { consultarPedido } from '@/app/actions/publicas';
import { Button } from '@/components/ui/Button';
import { formatCOP, formatFecha } from '@/lib/format';

const ETAPAS = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'] as const;

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function ConsultaPedido() {
  const [estado, accion, pendiente] = useActionState(consultarPedido, null);

  if (estado?.ok && estado.datos) {
    const pedido = estado.datos;
    const indiceEtapa = ETAPAS.indexOf(pedido.estado as (typeof ETAPAS)[number]);

    return (
      <div className="border border-[var(--surface-line)] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-[family-name:var(--font-display)] text-2xl">{pedido.numero}</p>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-champagne">
            {ETIQUETA_ESTADO[pedido.estado] ?? pedido.estado}
          </p>
        </div>
        <p className="mt-1 text-[0.78rem] text-[var(--surface-muted)]">
          Registrado el {formatFecha(pedido.creado)} · {pedido.nombre}
        </p>

        {pedido.estado !== 'cancelado' && (
          <ol className="mt-7 flex gap-1" aria-label="Estado del pedido">
            {ETAPAS.map((etapa, indice) => (
              <li key={etapa} className="flex-1">
                <span
                  className={`block h-0.5 ${indice <= indiceEtapa ? 'bg-champagne' : 'bg-[var(--surface-line)]'}`}
                />
                <span
                  className={`mt-2 block text-[0.58rem] uppercase tracking-[0.12em] ${
                    indice <= indiceEtapa ? 'text-champagne' : 'text-[var(--surface-muted)]'
                  }`}
                >
                  {ETIQUETA_ESTADO[etapa]}
                </span>
              </li>
            ))}
          </ol>
        )}

        <ul className="mt-8 divide-y divide-[var(--surface-line)] border-y border-[var(--surface-line)]">
          {pedido.items.map((item) => (
            <li key={item.codigo} className="flex justify-between gap-4 py-3 text-[0.88rem]">
              <span>
                {item.cantidad} × {item.nombre}
                <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-[var(--surface-muted)]">
                  Ref. {item.codigo}
                </span>
              </span>
              <span>{formatCOP(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 text-[0.88rem]">
          <div className="flex justify-between">
            <dt className="text-[var(--surface-muted)]">Subtotal</dt>
            <dd>{formatCOP(pedido.subtotal)}</dd>
          </div>
          {pedido.descuento > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--surface-muted)]">Descuento</dt>
              <dd>−{formatCOP(pedido.descuento)}</dd>
            </div>
          )}
          {pedido.envio > 0 && (
            <div className="flex justify-between">
              <dt className="text-[var(--surface-muted)]">Envío</dt>
              <dd>{formatCOP(pedido.envio)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--surface-line)] pt-2">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em]">Total</dt>
            <dd className="font-[family-name:var(--font-display)] text-lg">
              {formatCOP(pedido.total)}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form action={accion} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Número de pedido
        </span>
        <input
          name="numero"
          required
          placeholder="YL-0000-XXXXX"
          className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm uppercase outline-none transition-colors placeholder:normal-case placeholder:text-[var(--surface-muted)] focus:border-champagne"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Teléfono del pedido
        </span>
        <input
          name="telefono"
          required
          type="tel"
          inputMode="tel"
          className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
        />
      </label>

      {estado && !estado.ok && (
        <p role="alert" className="text-sm text-red-300">
          {estado.error}
        </p>
      )}

      <Button type="submit" tamano="lg" className="w-full" disabled={pendiente}>
        {pendiente ? 'Buscando…' : 'Consultar'}
      </Button>
    </form>
  );
}
