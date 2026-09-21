'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useCarrito } from '@/components/cart/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { Button, ButtonLink } from '@/components/ui/Button';
import { trackEvento } from '@/lib/analytics';
import { formatCOP, nombreSinMarca } from '@/lib/format';
import { mensajeProducto, whatsappUrl } from '@/lib/whatsapp';
import { BarraCompra } from './BarraCompra';
import { FIN_FICHA_ID } from './ficha';

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
 * Alto de la cabecera compacta (--header-h), la que está visible al bajar:
 * el botón «sale» de la pantalla cuando queda tapado por ella.
 */
function altoCabecera(): number {
  const raiz = document.documentElement;
  const valor = getComputedStyle(raiz).getPropertyValue('--header-h').trim();
  const numero = Number.parseFloat(valor);
  if (Number.isNaN(numero)) return 56;
  return valor.endsWith('rem') ? numero * Number.parseFloat(getComputedStyle(raiz).fontSize) : numero;
}

export function BuyBox({ producto }: { producto: Producto }) {
  const [cantidad, setCantidad] = useState(1);
  const { agregar } = useCarrito();
  const config = useConfig();
  const router = useRouter();
  const idCantidad = useId();
  const principal = useRef<HTMLDivElement>(null);
  const [botonFuera, setBotonFuera] = useState(false);
  const [enElPie, setEnElPie] = useState(false);

  const agotado = producto.stock != null && producto.stock <= 0;
  const maximo = producto.stock && producto.stock > 0 ? Math.min(producto.stock, 20) : 20;
  const comprable = producto.precio != null && !agotado;

  const enlaceWhatsapp = whatsappUrl(
    config.whatsapp,
    mensajeProducto(producto.nombre, producto.codigo, `${config.siteUrl}/perfumes/${producto.slug}`),
  );

  // La barra móvil sólo aparece cuando el botón principal ya quedó ARRIBA de la
  // pantalla (si al cargar está más abajo, todavía no se ha visto: no se duplica)
  // y se retira al llegar al final de la ficha para no tapar el pie de página.
  useEffect(() => {
    if (!comprable || typeof IntersectionObserver === 'undefined') return;
    const boton = principal.current;
    if (!boton) return;
    const fin = document.getElementById(FIN_FICHA_ID);

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const techo = entrada.rootBounds?.top ?? 0;
          if (entrada.target === boton) {
            setBotonFuera(!entrada.isIntersecting && entrada.boundingClientRect.bottom <= techo);
          } else {
            setEnElPie(entrada.isIntersecting || entrada.boundingClientRect.top < techo);
          }
        }
      },
      { rootMargin: `-${Math.round(altoCabecera())}px 0px 0px 0px` },
    );

    observador.observe(boton);
    if (fin) observador.observe(fin);
    return () => observador.disconnect();
  }, [comprable]);

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
    <div>
      {comprable && (
        <div className="mb-5 flex items-center justify-between gap-6">
          <span
            id={idCantidad}
            className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)]"
          >
            Cantidad
          </span>
          <div
            role="group"
            aria-labelledby={idCantidad}
            className="flex items-center border border-[var(--surface-control)]"
          >
            <BotonCantidad
              etiqueta="Disminuir cantidad"
              enLimite={cantidad <= 1}
              onClick={() => setCantidad((valor) => Math.max(1, valor - 1))}
            >
              <path d="M5 12h14" />
            </BotonCantidad>
            <output aria-live="polite" className="min-w-10 text-center text-base tabular-nums">
              {cantidad}
            </output>
            <BotonCantidad
              etiqueta="Aumentar cantidad"
              enLimite={cantidad >= maximo}
              onClick={() => setCantidad((valor) => Math.min(maximo, valor + 1))}
            >
              <path d="M12 5v14M5 12h14" />
            </BotonCantidad>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {producto.precio != null ? (
          <div ref={principal}>
            <AddToCartButton producto={producto} cantidad={cantidad} tamano="lg" />
          </div>
        ) : (
          <ButtonLink href="/contacto" variante="principal" tamano="lg" className="w-full">
            Consultar esta referencia
          </ButtonLink>
        )}

        {comprable && (
          <Button type="button" variante="contorno" tamano="lg" className="w-full" onClick={comprarAhora}>
            Comprar ahora
          </Button>
        )}
      </div>

      {enlaceWhatsapp && (
        <div className="mt-3 flex justify-center">
          <a
            href={enlaceWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvento('Contact', { canal: 'whatsapp', origen: 'ficha' })}
            className="link-flecha"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
            </svg>
            Consultar por WhatsApp
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>
      )}

      {comprable && (
        <BarraCompra
          producto={producto}
          cantidad={cantidad}
          nombre={nombreSinMarca(producto.nombre, producto.marca)}
          precio={formatCOP(producto.precio) ?? ''}
          visible={botonFuera && !enElPie}
        />
      )}
    </div>
  );
}

/** Botón − / + de 44 px. En el límite no se deshabilita (perdería el foco): sólo se atenúa. */
function BotonCantidad({
  etiqueta,
  enLimite,
  onClick,
  children,
}: {
  etiqueta: string;
  enLimite: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      aria-disabled={enLimite}
      className={`flex size-11 items-center justify-center transition-[color,opacity] duration-300 hover:text-[var(--acento)] ${
        enLimite ? 'opacity-40' : ''
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}
