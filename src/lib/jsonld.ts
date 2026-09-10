/**
 * Serializa datos estructurados para incrustarlos en un <script type="application/ld+json">.
 *
 * `JSON.stringify` a secas no basta: si un campo del producto contiene la
 * secuencia que cierra la etiqueta, el navegador da por terminado el script y
 * el resto se interpreta como HTML. Como el nombre y la descripción se editan
 * desde el panel, hay que escaparlo siempre.
 *
 * También se escapan U+2028 y U+2029: JSON los admite dentro de una cadena,
 * pero JavaScript los trata como salto de línea y rompería el bloque.
 */
const PATRON = /[<>&\u2028\u2029]/g;

function escapar(caracter: string): string {
  const codigo = caracter.codePointAt(0) ?? 0;
  return `\\u${codigo.toString(16).padStart(4, '0')}`;
}

export function jsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(PATRON, escapar);
}
