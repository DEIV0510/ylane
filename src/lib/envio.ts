/**
 * Cálculo del envío en UN SOLO lugar.
 *
 * Lo usan el cajón del carrito, la página del carrito, el checkout y la acción
 * que graba el pedido en el servidor, para que el cliente y la base de datos
 * nunca vean totales distintos.
 */
export type ConfigEnvio = {
  costo: number | null;
  gratisDesde: number | null;
};

export type ResultadoEnvio = {
  /** null = el envío se cotiza aparte y no entra en el total. */
  costo: number | null;
  gratis: boolean;
  /** Cuánto falta para el envío gratis, si aplica. */
  faltaParaGratis: number | null;
};

export function calcularEnvio(subtotal: number, config: ConfigEnvio): ResultadoEnvio {
  if (config.costo == null) {
    return { costo: null, gratis: false, faltaParaGratis: null };
  }

  const gratis = config.gratisDesde != null && subtotal >= config.gratisDesde;
  const falta =
    config.gratisDesde != null && !gratis ? Math.max(0, config.gratisDesde - subtotal) : null;

  return { costo: gratis ? 0 : config.costo, gratis, faltaParaGratis: falta };
}

/** Total final del pedido. El envío sin cotizar no suma. */
export function calcularTotal(subtotal: number, descuento: number, envio: number | null): number {
  return Math.max(0, subtotal - descuento) + (envio ?? 0);
}

/** Lee la configuración de envío desde la tabla `settings` (valores en texto). */
export function envioDesdeAjustes(ajustes: Record<string, string>): ConfigEnvio {
  const numero = (valor: string | undefined): number | null => {
    if (!valor?.trim()) return null;
    const parseado = Number(valor);
    return Number.isFinite(parseado) && parseado >= 0 ? parseado : null;
  };
  return { costo: numero(ajustes.envio_costo), gratisDesde: numero(ajustes.envio_gratis_desde) };
}
