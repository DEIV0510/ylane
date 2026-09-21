'use client';

import { useState } from 'react';
import { useCarrito } from './CartProvider';
import { trackEvento } from '@/lib/analytics';

type Producto = {
  id: number;
  codigo: string;
  slug: string;
  nombre: string;
  marca: string | null;
  precio: number | null;
  imagen: string | null;
  stock: number | null;
};

/**
 * La única acción de la tarjeta de producto.
 *  - Con ratón: una franja que aparece al pasar sobre la foto.
 *  - En pantallas táctiles: un botón cuadrado discreto en la esquina.
 * Sin precio o sin unidades no se muestra: la tarjeta entera ya lleva a la ficha.
 */
export function QuickAdd({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const agotado = producto.stock != null && producto.stock <= 0;
  if (producto.precio == null || agotado) return null;

  const accion = () => {
    agregar(
      {
        id: producto.id,
        codigo: producto.codigo,
        slug: producto.slug,
        nombre: producto.nombre,
        marca: producto.marca,
        precio: producto.precio as number,
        imagen: producto.imagen,
        stock: producto.stock,
      },
      1,
    );
    trackEvento('AddToCart', {
      content_ids: [producto.codigo],
      content_name: producto.nombre,
      value: producto.precio ?? 0,
      currency: 'COP',
    });
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1600);
  };

  const etiqueta = `Agregar ${producto.nombre} al carrito`;

  return (
    <>
      {/* Escritorio: franja que sube al pasar el ratón o al llegar con el teclado. */}
      <button
        type="button"
        onClick={accion}
        aria-label={etiqueta}
        className="absolute inset-x-0 bottom-0 z-10 hidden h-12 translate-y-full items-center justify-center gap-2 bg-tinta/92 text-[0.66rem] font-medium uppercase tracking-[0.22em] text-marfil opacity-0 backdrop-blur-sm transition-[transform,opacity,background-color] duration-500 ease-[var(--ease-silk)] hover:bg-vino focus-visible:translate-y-0 focus-visible:opacity-100 can-hover:flex can-hover:group-hover/card:translate-y-0 can-hover:group-hover/card:opacity-100"
      >
        {agregado ? 'Agregado' : 'Agregar al carrito'}
        <span aria-hidden="true">{agregado ? '✓' : '+'}</span>
      </button>

      {/* Táctil: botón cuadrado de 44 px en la esquina de la foto. */}
      <button
        type="button"
        onClick={accion}
        aria-label={etiqueta}
        className="absolute bottom-2 right-2 z-10 hidden size-11 items-center justify-center bg-marfil/90 text-tinta shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] transition-colors active:bg-vino active:text-marfil no-hover:flex"
      >
        {agregado ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M5 12.5l4.2 4.2L19 7" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
    </>
  );
}
