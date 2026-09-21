/**
 * Marca el final de la ficha de producto (justo antes del pie de página).
 * La barra de compra móvil se retira al llegar aquí para no tapar el pie.
 *
 * Vive en un módulo propio, sin 'use client': una constante exportada desde un
 * módulo de cliente llega al servidor como referencia, no como el texto.
 */
export const FIN_FICHA_ID = 'fin-ficha';
