'use client';

import { useState } from 'react';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useCarrito } from '@/components/cart/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { ExternalButton } from '@/components/ui/Button';
import { trackEvento } from '@/lib/analytics';
import { mensajeProducto, whatsappUrl } from '@/lib/whatsapp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export function BuyBox({ producto }: { producto: Producto }) {
  const [cantidad, setCantidad] = useState(1);
  const { agregar } = useCarrito();
  const config = useConfig();
  const router = useRouter();

  const agotado = producto.stock != null && producto.stock <= 0;
  const maximo = producto.stock && producto.stock > 0 ? Math.min(producto.stock, 20) : 20;

  const enlaceWhatsapp = whatsappUrl(
    config.whatsapp,
    mensajeProducto(producto.nombre, producto.codigo, `${config.siteUrl}/perfumes/${producto.slug}`),
  );

  const comprarAhora = () => {
    if (producto.precio == null) return;
    agregar(
      {
        id: producto.id,
        codigo: producto.codigo,
        slug: producto.slug,
        nombre: producto.nombre,
        marca: producto.marca,
        precio: producto.precio,
        imagen: producto.imagen,
        stock: producto.stock,
      },
      cantidad,
    );
    trackEvento('InitiateCheckout', { value: producto.precio * cantidad, currency: 'COP' });
    router.push('/checkout');
  };

  return (
    <div className="space-y-4">
      {producto.precio != null && !agotado && (
        <div className="flex items-center gap-4">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
            Cantidad
          </span>
          <div className="flex items-center border border-[var(--surface-line)]">
            <button
              type="button"
              onClick={() => setCantidad((valor) => Math.max(1, valor - 1))}
              aria-label="Disminuir cantidad"
              className="px-4 py-2.5 text-[var(--surface-muted)] transition-colors hover:text-champagne"
            >
              −
            </button>
            <span className="min-w-10 text-center text-sm">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad((valor) => Math.min(maximo, valor + 1))}
              aria-label="Aumentar cantidad"
              className="px-4 py-2.5 text-[var(--surface-muted)] transition-colors hover:text-champagne"
            >
              +
            </button>
          </div>
        </div>
      )}

      {producto.precio != null ? (
        <AddToCartButton producto={producto} cantidad={cantidad} />
      ) : (
        <Link
          href="/contacto"
          className="flex w-full items-center justify-center border border-vino bg-vino px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-marfil transition-colors hover:bg-vino-glow"
        >
          Consultar esta referencia
        </Link>
      )}

      {producto.precio != null && !agotado && (
        <button
          type="button"
          onClick={comprarAhora}
          className="w-full border border-champagne bg-champagne px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-noir transition-colors hover:bg-champagne-soft"
        >
          Comprar ahora
        </button>
      )}

      {enlaceWhatsapp && (
        <ExternalButton
          href={enlaceWhatsapp}
          target="_blank"
          variante="contorno"
          tamano="lg"
          className="w-full"
          onClick={() => trackEvento('Contact', { canal: 'whatsapp', origen: 'ficha' })}
        >
          Comprar por WhatsApp
        </ExternalButton>
      )}
    </div>
  );
}
