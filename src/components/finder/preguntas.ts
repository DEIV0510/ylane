/**
 * Preguntas del buscador de fragancias.
 *
 * Los `valor` son el contrato con /api/recomendaciones (src/lib/finder.ts) y
 * no se cambian. Las etiquetas son sustantivos: cada opción se lee como una
 * palabra que se elige, no como el campo de un formulario.
 *
 * Módulo sin 'use client' a propósito: lo usan la página (servidor, para leer
 * ?para=) y el buscador (cliente).
 */

export type Clave = 'genero' | 'personalidad' | 'ocasion' | 'intensidad';

export type Opcion = { valor: string; etiqueta: string };

export type Paso = {
  clave: Clave;
  pregunta: string;
  ayuda?: string;
  multiple: boolean;
  opciones: Opcion[];
};

export const GENEROS = ['hombre', 'mujer', 'unisex'] as const;
export type Genero = (typeof GENEROS)[number];

export const PASOS: Paso[] = [
  {
    clave: 'genero',
    pregunta: '¿Para quién?',
    ayuda: 'Cuatro preguntas para acotar el catálogo a lo que de verdad buscas.',
    multiple: false,
    opciones: [
      { valor: 'hombre', etiqueta: 'Hombre' },
      { valor: 'mujer', etiqueta: 'Mujer' },
      { valor: 'unisex', etiqueta: 'Unisex' },
    ],
  },
  {
    clave: 'personalidad',
    pregunta: '¿Qué quieres transmitir?',
    ayuda: 'Puedes elegir más de una.',
    multiple: true,
    opciones: [
      { valor: 'elegante', etiqueta: 'Elegancia' },
      { valor: 'seductor', etiqueta: 'Sensualidad' },
      { valor: 'fresco', etiqueta: 'Frescura' },
      { valor: 'misterioso', etiqueta: 'Misterio' },
      { valor: 'intenso', etiqueta: 'Intensidad' },
      { valor: 'dulce', etiqueta: 'Dulzura' },
      { valor: 'sofisticado', etiqueta: 'Sofisticación' },
    ],
  },
  {
    clave: 'ocasion',
    pregunta: '¿Cuándo la usarás?',
    ayuda: 'Puedes elegir más de una.',
    multiple: true,
    opciones: [
      { valor: 'dia', etiqueta: 'De día' },
      { valor: 'noche', etiqueta: 'De noche' },
      { valor: 'cita', etiqueta: 'Una cita' },
      { valor: 'trabajo', etiqueta: 'El trabajo' },
      { valor: 'fiesta', etiqueta: 'Una fiesta' },
      { valor: 'evento', etiqueta: 'Un evento' },
    ],
  },
  {
    clave: 'intensidad',
    pregunta: '¿Qué intensidad prefieres?',
    multiple: false,
    opciones: [
      { valor: 'suave', etiqueta: 'Suave' },
      { valor: 'media', etiqueta: 'Media' },
      { valor: 'intensa', etiqueta: 'Intensa' },
    ],
  },
];

// Los valores no se repiten entre preguntas («intenso» ≠ «intensa»), así que
// un solo mapa sirve para los motivos de la API y para el resumen de respuestas.
const ETIQUETAS = new Map(
  PASOS.flatMap((paso) => paso.opciones.map((opcion) => [opcion.valor, opcion.etiqueta] as const)),
);

export function etiquetaDe(valor: string): string {
  return ETIQUETAS.get(valor.toLowerCase()) ?? valor;
}

/** ?para= de la portada: sólo cuenta si es uno de los tres géneros. */
export function generoDesdeParametro(valor: string | string[] | undefined): Genero | undefined {
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.toLowerCase();
  return GENEROS.find((genero) => genero === texto);
}
