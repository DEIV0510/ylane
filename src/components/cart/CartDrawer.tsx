'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCarrito, type ItemCarrito } from './CartProvider';
import { LineaCarrito } from './LineaCarrito';
import { SeleccionVacia } from './SeleccionVacia';
import { useConfig } from '@/components/ConfigProvider';
import { ButtonLink } from '@/components/ui/Button';
import { formatCOP } from '@/lib/format';
import { calcularEnvio, calcularTotal } from '@/lib/envio';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { trackEvento } from '@/lib/analytics';

/**
 * Cajón del carrito: una hoja marfil sobre un velo negro. Cabecera con la
 * cuenta de artículos, líneas separadas por hilos y un pie fijo con el
 * subtotal y una sola acción principal: finalizar la compra.
 */
export function CartDrawer() {
  const { items, abierto, cerrar, cambiarCantidad, quitar, subtotal, unidades } = useCarrito();
  const config = useConfig();
  const panel = useRef<HTMLElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const vacio = useRef<HTMLDivElement>(null);
  const [aviso, setAviso] = useState('');
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

  // Un aviso viejo no debe releerse al volver a abrir el cajón.
  useEffect(() => {
    if (!abierto) setAviso('');
  }, [abierto]);

  const envio = calcularEnvio(subtotal, { costo: config.envioCosto, gratisDesde: config.envioGratisDesde });
  const total = calcularTotal(subtotal, 0, envio.costo);

  const enlaceWhatsapp = whatsappUrl(
    config.whatsapp,
    mensajePedido(items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })), total),
  );

  // Al quitar una línea su botón desaparece: el foco pasa a la lista (o al
  // estado vacío) para no salirse del cajón, y el cambio se anuncia.
  const trasQuitar = (item: ItemCarrito) => {
    setAviso(`${item.nombre} se quitó de tu selección.`);
    window.requestAnimationFrame(() => (lista.current ?? vacio.current)?.focus({ preventScroll: true }));
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={cerrar}
        className={`fixed inset-0 z-60 bg-noir/65 transition-opacity duration-500 ease-[var(--ease-silk)] ${
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
        data-surface="claro"
        className={`fixed right-0 top-0 z-70 flex h-dvh w-full max-w-[27rem] flex-col pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] transition-transform duration-500 ease-[var(--ease-silk)] ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-[var(--surface-line)] py-3 pl-5 pr-3 sm:pl-7 sm:pr-5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-[1.625rem] leading-none">Tu selección</h2>
            {unidades > 0 && (
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] tabular-nums text-[var(--surface-muted)]">
                {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar carrito"
            className="flex size-11 shrink-0 items-center justify-center transition-colors duration-300 ease-[var(--ease-silk)] hover:text-[var(--acento)]"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div
            ref={vacio}
            tabIndex={-1}
            className="flex flex-1 flex-col justify-center overflow-y-auto px-5 pb-20 pt-12 outline-none sm:px-7"
          >
            <SeleccionVacia nivel="p" compacto alNavegar={cerrar} />
          </div>
        ) : (
          <>
            <ul
              ref={lista}
              tabIndex={-1}
              aria-label="Fragancias en tu selección"
              className="flex-1 divide-y divide-[var(--surface-line)] overflow-y-auto overscroll-contain px-5 outline-none sm:px-7"
            >
              {items.map((item) => (
                <LineaCarrito
                  key={item.id}
                  item={item}
                  alNavegar={cerrar}
                  alRestar={() => {
                    cambiarCantidad(item.id, item.cantidad - 1);
                    if (item.cantidad <= 1) trasQuitar(item);
                  }}
                  alSumar={() => cambiarCantidad(item.id, item.cantidad + 1)}
                  alQuitar={() => {
                    quitar(item.id);
                    trasQuitar(item);
                  }}
                />
              ))}
            </ul>

            <footer className="border-t border-[var(--surface-line)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pt-6">
              <dl className="flex items-baseline justify-between gap-4">
                <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]">
                  Subtotal
                </dt>
                <dd className="font-[family-name:var(--font-display)] text-[1.625rem] leading-none tabular-nums">
                  {formatCOP(subtotal)}
                </dd>
              </dl>
              <p className="mt-2 text-[0.8125rem] leading-snug tabular-nums text-[var(--surface-muted)]">
                {envio.costo == null
                  ? 'El envío se coordina contigo al confirmar el pedido.'
                  : envio.costo === 0
                    ? `Envío gratis · Total ${formatCOP(total)}`
                    : `Envío ${formatCOP(envio.costo)} · Total ${formatCOP(total)}`}
              </p>

              <ButtonLink
                href="/checkout"
                tamano="lg"
                className="mt-5 w-full"
                onClick={() => {
                  trackEvento('InitiateCheckout', { value: subtotal, currency: 'COP' });
                  cerrar();
                }}
              >
                Finalizar compra
              </ButtonLink>

              <div
                className={`mt-2 flex flex-wrap items-center gap-x-6 ${
                  enlaceWhatsapp ? 'justify-between' : 'justify-center'
                }`}
              >
                <Link href="/carrito" onClick={cerrar} className="link-flecha">
                  Ver carrito
                </Link>
                {enlaceWhatsapp && (
                  <a
                    href={enlaceWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvento('Contact', { canal: 'whatsapp', origen: 'carrito' })}
                    className="link-flecha"
                  >
                    Pedir por WhatsApp
                    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                )}
              </div>
            </footer>
          </>
        )}

        <p role="status" className="sr-only">
          {aviso}
        </p>
      </aside>
    </>
  );
}
