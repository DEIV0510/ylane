'use client';

import { useActionState } from 'react';
import { consultarPedido } from '@/app/actions/publicas';
import { AvisoError, CLASE_CAMPO, CLASE_ETIQUETA, CLASE_GRUPO } from '@/components/forms/Campo';
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

    // El resultado se lee como un documento: encabezado, estado, líneas y totales.
    return (
      <article aria-labelledby="pedido-consultado" className="border-t border-[var(--surface-fg)] pt-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <p className="eyebrow">Pedido</p>
            {/* El formulario desaparece al responder: el foco pasa al número del pedido. */}
            <h2
              id="pedido-consultado"
              tabIndex={-1}
              ref={(nodo) => nodo?.focus()}
              className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-none outline-none"
            >
              {pedido.numero}
            </h2>
          </div>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--acento)]">
            {ETIQUETA_ESTADO[pedido.estado] ?? pedido.estado}
          </p>
        </header>
        <p className="mt-4 text-[0.875rem] text-[var(--surface-muted)]">
          Registrado el {formatFecha(pedido.creado)} · {pedido.nombre}
        </p>

        {pedido.estado !== 'cancelado' && (
          // En móvil, lista vertical; desde sm, barra de cinco tramos.
          <ol className="mt-10 grid gap-3 sm:grid-cols-5 sm:gap-1.5" aria-label="Estado del pedido">
            {ETAPAS.map((etapa, indice) => {
              const alcanzada = indice <= indiceEtapa;
              const actual = indice === indiceEtapa;
              return (
                <li
                  key={etapa}
                  aria-current={actual ? 'step' : undefined}
                  className="flex items-center gap-4 sm:block"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-px w-8 shrink-0 sm:h-0.5 sm:w-full ${
                      alcanzada ? 'bg-[var(--acento)]' : 'bg-[var(--surface-line)]'
                    }`}
                  />
                  <span
                    className={`block text-[0.6875rem] uppercase tracking-[0.14em] sm:mt-3 ${
                      actual
                        ? 'font-medium text-[var(--acento)]'
                        : alcanzada
                          ? 'text-[var(--surface-fg)]'
                          : 'text-[var(--surface-muted)]'
                    }`}
                  >
                    {ETIQUETA_ESTADO[etapa]}
                    {/* El color no basta: el estado de cada etapa también se dice. */}
                    {!actual && (
                      <span className="sr-only">{alcanzada ? ' (completado)' : ' (pendiente)'}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <ul className="mt-10 border-t border-[var(--surface-line)]">
          {pedido.items.map((item) => (
            <li
              key={item.codigo}
              className="flex items-start justify-between gap-6 border-b border-[var(--surface-line)] py-4"
            >
              <span className="min-w-0">
                <span className="block leading-snug">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="mt-1 block text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
                  Ref. {item.codigo}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{formatCOP(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-3">
          <div className="flex justify-between gap-6">
            <dt className="text-[var(--surface-muted)]">Subtotal</dt>
            <dd className="tabular-nums">{formatCOP(pedido.subtotal)}</dd>
          </div>
          {pedido.descuento > 0 && (
            <div className="flex justify-between gap-6">
              <dt className="text-[var(--surface-muted)]">Descuento</dt>
              <dd className="tabular-nums">−{formatCOP(pedido.descuento)}</dd>
            </div>
          )}
          {pedido.envio > 0 && (
            <div className="flex justify-between gap-6">
              <dt className="text-[var(--surface-muted)]">Envío</dt>
              <dd className="tabular-nums">{formatCOP(pedido.envio)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-6 border-t border-[var(--surface-line)] pt-5">
            <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.22em]">Total</dt>
            <dd className="font-[family-name:var(--font-display)] text-[1.75rem] leading-none tabular-nums">
              {formatCOP(pedido.total)}
            </dd>
          </div>
        </dl>
      </article>
    );
  }

  return (
    <form action={accion} className="space-y-8">
      <label className={CLASE_GRUPO}>
        <span className={CLASE_ETIQUETA}>Número de pedido</span>
        <input
          name="numero"
          required
          placeholder="YL-0000-XXXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className={`${CLASE_CAMPO} uppercase tracking-[0.06em]`}
        />
      </label>
      <label className={CLASE_GRUPO}>
        <span className={CLASE_ETIQUETA}>Teléfono del pedido</span>
        <input
          name="telefono"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={CLASE_CAMPO}
        />
      </label>

      {estado && !estado.ok && <AvisoError>{estado.error}</AvisoError>}

      <Button type="submit" tamano="lg" className="w-full" disabled={pendiente}>
        {pendiente ? 'Buscando…' : 'Consultar'}
      </Button>
    </form>
  );
}
