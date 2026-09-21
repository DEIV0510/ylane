'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
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

export function AddToCartButton({
  producto,
  cantidad = 1,
  compacto = false,
  className = '',
  etiqueta = 'Agregar al carrito',
  etiquetaAccesible,
  variante,
  tamano,
  anchoCompleto = true,
}: {
  producto: Producto;
  cantidad?: number;
  compacto?: boolean;
  className?: string;
  /** Texto visible. La barra móvil usa uno corto («Agregar»). */
  etiqueta?: string;
  /** Nombre accesible cuando el texto visible no basta; debe empezar por él (WCAG 2.5.3). */
  etiquetaAccesible?: string;
  variante?: 'principal' | 'claro' | 'contorno';
  tamano?: 'sm' | 'md' | 'lg';
  anchoCompleto?: boolean;
}) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const agotado = producto.stock != null && producto.stock <= 0;
  const ancho = anchoCompleto ? 'w-full' : '';

  // Sin precio cargado todavía no se puede calcular un total: se invita a la ficha.
  if (producto.precio == null) {
    return (
      <Link
        href={`/perfumes/${producto.slug}`}
        className={`inline-flex min-h-11 items-center justify-center border border-[var(--surface-control)] px-4 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 hover:border-[var(--acento)] hover:text-[var(--acento)] ${ancho} ${className}`}
      >
        Ver detalles
      </Link>
    );
  }

  if (agotado) {
    return (
      <Button
        variante="contorno"
        tamano={tamano ?? (compacto ? 'sm' : 'md')}
        disabled
        className={`${ancho} ${className}`}
      >
        Agotado
      </Button>
    );
  }

  return (
    <Button
      variante={variante ?? (compacto ? 'contorno' : 'principal')}
      tamano={tamano ?? (compacto ? 'sm' : 'lg')}
      className={`${ancho} ${className}`}
      aria-label={agregado ? undefined : etiquetaAccesible}
      onClick={() => {
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
          cantidad,
        );
        trackEvento('AddToCart', {
          content_ids: [producto.codigo],
          content_name: producto.nombre,
          value: (producto.precio ?? 0) * cantidad,
          currency: 'COP',
        });
        setAgregado(true);
        window.setTimeout(() => setAgregado(false), 1600);
      }}
    >
      {agregado ? (
        <>
          Agregado
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.2 4.2L19 7" />
          </svg>
        </>
      ) : (
        etiqueta
      )}
    </Button>
  );
}
