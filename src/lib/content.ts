import 'server-only';
import { cache } from 'react';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { contentBlocks } from '@/db/schema';

/**
 * Bloques de contenido editables desde /admin.
 * Formato "markdown ligero":  `## Título`, `- viñeta`, párrafos separados por
 * línea en blanco. Las listas de tarjetas usan `Título | Texto` por línea.
 */
export const getContenido = cache(async (claves: string[]): Promise<Record<string, string>> => {
  if (!claves.length) return {};
  try {
    const filas = await db
      .select()
      .from(contentBlocks)
      .where(inArray(contentBlocks.clave, claves))
      .all();
    return Object.fromEntries(filas.map((fila) => [fila.clave, fila.contenido]));
  } catch {
    return {};
  }
});

export async function getBloque(clave: string): Promise<string> {
  const bloques = await getContenido([clave]);
  return bloques[clave] ?? '';
}

export type Nodo =
  | { tipo: 'titulo'; texto: string }
  | { tipo: 'parrafo'; texto: string }
  | { tipo: 'lista'; items: string[] };

/** Convierte el markdown ligero en nodos listos para renderizar. */
export function parsearContenido(texto: string): Nodo[] {
  const nodos: Nodo[] = [];
  let parrafo: string[] = [];
  let lista: string[] = [];

  const cerrarParrafo = () => {
    if (parrafo.length) {
      nodos.push({ tipo: 'parrafo', texto: parrafo.join(' ') });
      parrafo = [];
    }
  };
  const cerrarLista = () => {
    if (lista.length) {
      nodos.push({ tipo: 'lista', items: lista });
      lista = [];
    }
  };

  for (const linea of (texto ?? '').split('\n')) {
    const limpia = linea.trim();
    if (!limpia) {
      cerrarParrafo();
      cerrarLista();
      continue;
    }
    if (limpia.startsWith('## ')) {
      cerrarParrafo();
      cerrarLista();
      nodos.push({ tipo: 'titulo', texto: limpia.slice(3).trim() });
      continue;
    }
    if (limpia.startsWith('- ')) {
      cerrarParrafo();
      lista.push(limpia.slice(2).trim());
      continue;
    }
    cerrarLista();
    parrafo.push(limpia);
  }
  cerrarParrafo();
  cerrarLista();
  return nodos;
}

/** Bloques con formato `Título | Texto` (tarjetas de confianza, beneficios…). */
export function parsearTarjetas(texto: string): { titulo: string; texto: string }[] {
  return (texto ?? '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)
    .map((linea) => {
      const [titulo, ...resto] = linea.split('|');
      return { titulo: titulo.trim(), texto: resto.join('|').trim() };
    })
    .filter((item) => item.titulo);
}

/** Preguntas frecuentes: `## pregunta` seguida de su respuesta. */
export function parsearFaq(texto: string): { pregunta: string; respuesta: string }[] {
  const items: { pregunta: string; respuesta: string }[] = [];
  let actual: { pregunta: string; respuesta: string[] } | null = null;

  for (const linea of (texto ?? '').split('\n')) {
    const limpia = linea.trim();
    if (limpia.startsWith('## ')) {
      if (actual) items.push({ pregunta: actual.pregunta, respuesta: actual.respuesta.join(' ') });
      actual = { pregunta: limpia.slice(3).trim(), respuesta: [] };
    } else if (limpia && actual) {
      actual.respuesta.push(limpia);
    }
  }
  if (actual) items.push({ pregunta: actual.pregunta, respuesta: actual.respuesta.join(' ') });
  return items.filter((item) => item.pregunta && item.respuesta);
}
