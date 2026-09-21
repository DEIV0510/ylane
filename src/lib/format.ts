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

const plano = (texto: string) =>
  texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Nombre para mostrar debajo de la marca: si el nombre empieza repitiéndola
 * ("Afnan 9 PM Elixir", marca Afnan) se muestra "9 PM Elixir".
 * Es sólo presentación: la ficha, el SEO, el carrito y el buscador usan el
 * nombre completo tal como viene del catálogo.
 */
export function nombreSinMarca(nombre: string, marca: string | null | undefined): string {
  if (!marca) return nombre;
  const resto = nombre.slice(marca.length).trim();
  if (resto.length < 2) return nombre;
  return plano(nombre).startsWith(`${plano(marca)} `) ? resto : nombre;
}

export function descuentoPct(precio: number | null, anterior: number | null): number | null {
  if (!precio || !anterior || anterior <= precio) return null;
  return Math.round(((anterior - precio) / anterior) * 100);
}

/**
 * Referencias cuyo género no está confirmado (el catálogo del proveedor no lo
 * trae). No aparecen en Hombre, Mujer ni Unisex, y la tienda no muestra ninguna
 * etiqueta de género para ellas. Sólo el panel las nombra.
 */
export const GENERO_SIN_ASIGNAR = 'SIN_GENERO';

export const GENERO_ETIQUETA: Record<string, string> = {
  DAMA: 'Mujer',
  CABALLERO: 'Hombre',
  UNISEX: 'Unisex',
};

/** Etiquetas del panel: incluyen el género pendiente. */
export const GENERO_ETIQUETA_ADMIN: Record<string, string> = {
  ...GENERO_ETIQUETA,
  [GENERO_SIN_ASIGNAR]: 'Sin asignar',
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
