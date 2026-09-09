'use client';

import { useEffect } from 'react';
import { trackEvento } from '@/lib/analytics';

/**
 * Suma una visita a la referencia (una vez por sesión y producto) para que el
 * panel pueda mostrar "lo más visto". No guarda ningún dato del visitante.
 */
export function RegistrarVista({ productId }: { productId: number }) {
  useEffect(() => {
    const clave = `ylane_vista_${productId}`;
    let yaContado = false;
    try {
      yaContado = window.sessionStorage.getItem(clave) === '1';
    } catch {
      yaContado = false;
    }
    if (yaContado) return;

    try {
      window.sessionStorage.setItem(clave, '1');
    } catch {
      /* sin almacenamiento: se contará de nuevo, no pasa nada */
    }

    void fetch('/api/vista', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => undefined);

    trackEvento('ViewContent', { content_ids: [String(productId)] });
  }, [productId]);

  return null;
}
