import { formatCOP } from '@/lib/format';

/**
 * Importes del pedido compuestos como un documento: hilos finos entre filas,
 * cifras tabulares a la derecha y doble regla antes del total.
 * Lo comparten la página del carrito y el checkout; los importes llegan ya
 * calculados con lib/envio, la misma fórmula que usa el servidor al grabar.
 */
export function ResumenImportes({
  subtotal,
  costoEnvio,
  total,
  unidades,
  className = '',
}: {
  subtotal: number;
  /** null = el envío se coordina aparte y no entra en el total. */
  costoEnvio: number | null;
  total: number;
  unidades?: number;
  className?: string;
}) {
  return (
    <dl className={`border-t border-[var(--surface-control)] text-[0.9375rem] ${className}`}>
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--surface-line)] py-4">
        <dt className="text-[var(--surface-muted)]">
          Subtotal
          {unidades != null && (
            <span className="tabular-nums">
              {' '}
              · {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
            </span>
          )}
        </dt>
        <dd className="tabular-nums">{formatCOP(subtotal)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 py-4">
        <dt className="text-[var(--surface-muted)]">Envío</dt>
        <dd className="text-right tabular-nums">
          {costoEnvio == null ? 'Se coordina contigo' : costoEnvio === 0 ? 'Gratis' : formatCOP(costoEnvio)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t-[3px] border-double border-[var(--surface-control)] pt-5">
        <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.24em]">Total</dt>
        <dd className="font-[family-name:var(--font-display)] text-[2rem] leading-none tabular-nums">
          {formatCOP(total)}
        </dd>
      </div>
    </dl>
  );
}
