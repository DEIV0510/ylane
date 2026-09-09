'use client';

/**
 * Capa de eventos para Google Analytics 4 y Meta Pixel.
 * No se carga ningún script si no hay ID configurado, así que en desarrollo
 * (o antes de que el negocio entregue sus IDs) estas llamadas no hacen nada.
 */
type Parametros = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const EVENTOS_GA4: Record<string, string> = {
  PageView: 'page_view',
  ViewContent: 'view_item',
  Search: 'search',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
  Lead: 'generate_lead',
  Contact: 'contact',
};

export function trackEvento(nombre: keyof typeof EVENTOS_GA4 | string, parametros: Parametros = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', EVENTOS_GA4[nombre] ?? nombre, parametros);
    window.fbq?.('track', nombre, parametros);
  } catch {
    /* la analítica nunca debe romper la tienda */
  }
}
