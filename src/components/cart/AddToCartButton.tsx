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
}: {
  producto: Producto;
  cantidad?: number;
  compacto?: boolean;
  className?: string;
}) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const agotado = producto.stock != null && producto.stock <= 0;

  // Sin precio cargado todavía no se puede calcular un total: se invita a la ficha.
  if (producto.precio == null) {
    return (
      <Link
        href={`/perfumes/${producto.slug}`}
        className={`inline-flex min-h-11 w-full items-center justify-center border border-current/30 px-4 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] transition-colors hover:border-champagne hover:text-champagne ${className}`}
      >
        Ver detalles
      </Link>
    );
  }

  if (agotado) {
    return (
      <Button variante="contorno" tamano={compacto ? 'sm' : 'md'} disabled className={`w-full ${className}`}>
        Agotado
      </Button>
    );
  }

  return (
    <Button
      variante={compacto ? 'contorno' : 'principal'}
      tamano={compacto ? 'sm' : 'lg'}
      className={`w-full ${className}`}
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
      {agregado ? 'Agregado ✓' : 'Agregar al carrito'}
    </Button>
  );
}
