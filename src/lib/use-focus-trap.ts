'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Mantiene el foco dentro de un panel mientras está abierto y lo devuelve al
 * elemento que lo abrió al cerrarlo (WCAG 2.4.3 y 2.1.2).
 * Con `inert` en el panel cerrado, esto completa la navegación por teclado.
 */
export function useFocusTrap(contenedor: RefObject<HTMLElement | null>, activo: boolean) {
  useEffect(() => {
    if (!activo) return;
    const nodo = contenedor.current;
    if (!nodo) return;

    const anterior = document.activeElement as HTMLElement | null;

    const enfocables = () =>
      Array.from(nodo.querySelectorAll<HTMLElement>(FOCUSABLES)).filter(
        (elemento) => elemento.offsetParent !== null || elemento === document.activeElement,
      );

    // El primer elemento recibe el foco al abrir.
    const inicial = window.setTimeout(() => {
      const lista = enfocables();
      if (lista.length && !nodo.contains(document.activeElement)) lista[0].focus();
    }, 60);

    const alTabular = (evento: KeyboardEvent) => {
      if (evento.key !== 'Tab') return;
      const lista = enfocables();
      if (!lista.length) return;

      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      const foco = document.activeElement;

      if (evento.shiftKey && (foco === primero || !nodo.contains(foco))) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && foco === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alTabular);
    return () => {
      window.clearTimeout(inicial);
      document.removeEventListener('keydown', alTabular);
      // Devolver el foco sólo si sigue dentro del panel que se cierra.
      if (anterior && document.body.contains(anterior)) anterior.focus({ preventScroll: true });
    };
  }, [contenedor, activo]);
}
