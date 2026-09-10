'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCarrito } from './CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { formatCOP } from '@/lib/format';
import { calcularEnvio, calcularTotal } from '@/lib/envio';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';
import { ProductPlaceholder } from '@/components/product/ProductPlaceholder';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { trackEvento } from '@/lib/analytics';

export function CartDrawer() {
  const { items, abierto, cerrar, cambiarCantidad, quitar, subtotal, unidades } = useCarrito();
  const config = useConfig();
  const panel = useRef<HTMLElement>(null);
  useFocusTrap(panel, abierto);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alPulsar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = anterior;
    };
  }, [abierto, cerrar]);

  const envio = calcularEnvio(subtotal, { costo: config.envioCosto, gratisDesde: config.envioGratisDesde });
  const total = calcularTotal(subtotal, 0, envio.costo);

  const enlaceWhatsapp = whatsappUrl(
    config.whatsapp,
    mensajePedido(items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })), total),
  );

  return (
    <>
      <div
        aria-hidden={!abierto}
        onClick={cerrar}
        className={`fixed inset-0 z-60 bg-black/70 backdrop-blur-[2px] transition-opacity duration-400 ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        aria-hidden={!abierto}
        inert={!abierto}
        className={`fixed right-0 top-0 z-70 flex h-dvh w-full max-w-[26rem] flex-col border-l border-[var(--surface-line)] bg-noir-soft text-marfil transition-transform duration-500 ease-[var(--ease-silk)] ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-[var(--surface-line)] px-6 py-5">
          <p className="text-[0.68rem] uppercase tracking-[0.28em]">
            Tu carrito {unidades > 0 && <span className="text-champagne">({unidades})</span>}
          </p>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar carrito"
            className="-mr-2 flex size-11 items-center justify-center text-marfil-dim transition-colors hover:text-champagne"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="size-2 rotate-45 bg-champagne/70" aria-hidden="true" />
            <p className="font-[family-name:var(--font-display)] text-xl">Tu carrito está vacío</p>
            <p className="text-sm text-[var(--surface-muted)]">
              Explora la selección y agrega tu próxima fragancia.
            </p>
            <Link
              href="/perfumes"
              onClick={cerrar}
              className="border border-current/35 px-6 py-3 text-[0.68rem] uppercase tracking-[0.2em] transition-colors hover:border-champagne hover:text-champagne"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[var(--surface-line)] overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link
                    href={`/perfumes/${item.slug}`}
                    onClick={cerrar}
                    className="relative size-20 shrink-0 overflow-hidden bg-noir"
                  >
                    {item.imagen ? (
                      <Image src={item.imagen} alt={item.nombre} fill sizes="80px" className="object-cover" />
                    ) : (
                      <ProductPlaceholder codigo={item.codigo} compacto className="size-full" />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    {item.marca && (
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-champagne/80">
                        {item.marca}
                      </p>
                    )}
                    <Link
                      href={`/perfumes/${item.slug}`}
                      onClick={cerrar}
                      className="truncate font-[family-name:var(--font-display)] text-[0.95rem] hover:text-champagne"
                    >
                      {item.nombre}
                    </Link>
                    <p className="mt-1 text-[0.8rem] text-marfil-dim">{formatCOP(item.precio)}</p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[var(--surface-line)]">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                          aria-label={`Quitar una unidad de ${item.nombre}`}
                          className="px-2.5 py-1 text-marfil-dim transition-colors hover:text-champagne"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-[0.8rem]">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                          aria-label={`Agregar una unidad de ${item.nombre}`}
                          className="px-2.5 py-1 text-marfil-dim transition-colors hover:text-champagne"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitar(item.id)}
                        className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--surface-muted)] transition-colors hover:text-champagne"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-[var(--surface-line)] px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--surface-muted)]">
                  Subtotal
                </span>
                <span className="font-[family-name:var(--font-display)] text-xl">
                  {formatCOP(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-[0.7rem] text-[var(--surface-muted)]">
                {envio.costo == null
                  ? 'El envío se coordina contigo al confirmar el pedido.'
                  : envio.costo === 0
                    ? `Envío gratis · Total ${formatCOP(total)}`
                    : `Envío ${formatCOP(envio.costo)} · Total ${formatCOP(total)}`}
              </p>

              <Link
                href="/checkout"
                onClick={() => {
                  trackEvento('InitiateCheckout', { value: subtotal, currency: 'COP' });
                  cerrar();
                }}
                className="mt-4 flex w-full items-center justify-center border border-vino bg-vino px-6 py-3.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-marfil transition-colors hover:bg-vino-glow"
              >
                Finalizar compra
              </Link>

              {enlaceWhatsapp && (
                <a
                  href={enlaceWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvento('Contact', { canal: 'whatsapp', origen: 'carrito' })}
                  className="mt-2 flex w-full items-center justify-center border border-current/30 px-6 py-3 text-[0.68rem] uppercase tracking-[0.2em] transition-colors hover:border-champagne hover:text-champagne"
                >
                  Pedir por WhatsApp
                </a>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
