const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** Precio en pesos. `null` = todavía sin precio asignado en el panel. */
export function formatCOP(valor: number | null | undefined): string | null {
  if (valor == null || Number.isNaN(valor)) return null;
  return cop.format(valor);
}

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function descuentoPct(precio: number | null, anterior: number | null): number | null {
  if (!precio || !anterior || anterior <= precio) return null;
  return Math.round(((anterior - precio) / anterior) * 100);
}

export const GENERO_ETIQUETA: Record<string, string> = {
  DAMA: 'Mujer',
  CABALLERO: 'Hombre',
  UNISEX: 'Unisex',
};

export const TIPO_ETIQUETA: Record<string, string> = {
  arabe: 'Árabe',
  nicho: 'Nicho',
  disenador: 'Diseñador',
  comercial: 'Comercial',
};

export const ESTADOS_PEDIDO = [
  'pendiente',
  'confirmado',
  'preparando',
  'enviado',
  'entregado',
  'cancelado',
] as const;

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];
