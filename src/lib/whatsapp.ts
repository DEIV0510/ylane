/**
 * Enlaces de WhatsApp.
 * El número vive en un único lugar (configuración de la tienda, tabla
 * `settings`, clave `whatsapp`). Ningún componente lo escribe a mano.
 * Si no está configurado, `whatsappUrl` devuelve null y la interfaz oculta
 * los botones en vez de dejar enlaces rotos.
 */
export function normalizarNumero(numero: string | undefined | null): string {
  return (numero ?? '').replace(/\D/g, '');
}

export function whatsappUrl(numero: string | undefined | null, mensaje: string): string | null {
  const limpio = normalizarNumero(numero);
  if (limpio.length < 8) return null;
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeProducto(nombre: string, codigo: string, url?: string): string {
  const base = `Hola, estoy interesado en ${nombre} (ref. ${codigo}).`;
  return url ? `${base}\n${url}` : base;
}

export type LineaPedido = { nombre: string; cantidad: number; precio: number | null };

export function mensajePedido(items: LineaPedido[], total: number | null, numero?: string): string {
  const lineas = items.map(
    (item) =>
      `• ${item.cantidad} × ${item.nombre}${
        item.precio != null ? ` — ${formatoSimple(item.precio * item.cantidad)}` : ''
      }`,
  );
  const encabezado = numero
    ? `Hola, quiero confirmar este pedido (${numero}):`
    : 'Hola, quiero realizar este pedido:';
  const cierre = total != null ? `\nTotal: ${formatoSimple(total)}` : '';
  return `${encabezado}\n${lineas.join('\n')}${cierre}`;
}

function formatoSimple(valor: number): string {
  return `$${valor.toLocaleString('es-CO')}`;
}
