'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCarrito } from './CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { ProductPlaceholder } from '@/components/product/ProductPlaceholder';
import { EmptyState } from '@/components/ui/Bits';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';
import { formatCOP } from '@/lib/format';
import { calcularEnvio, calcularTotal } from '@/lib/envio';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';

export function CartPage() {
  const { items, hidratado, cambiarCantidad, quitar, subtotal, vaciar } = useCarrito();
  const config = useConfig();

  if (!hidratado) {
    return (
      <div className="h-64 animate-pulse border border-[var(--surface-line)]" aria-hidden="true" />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        titulo="Tu carrito está vacío"
        texto="Explora el catálogo y agrega la fragancia que buscas."
      >
        <ButtonLink href="/perfumes">Ver catálogo</ButtonLink>
      </EmptyState>
    );
  }

  const envio = calcularEnvio(subtotal, { costo: config.envioCosto, gratisDesde: config.envioGratisDesde });
  const costoEnvio = envio.costo;
  const total = calcularTotal(subtotal, 0, costoEnvio);

  const enlaceWhatsapp = whatsappUrl(
    config.whatsapp,
    mensajePedido(
      items.map((item) => ({ nombre: item.nombre, cantidad: item.cantidad, precio: item.precio })),
      total,
    ),
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
      <div>
        <ul className="divide-y divide-[var(--surface-line)] border-y border-[var(--surface-line)]">
          {items.map((item) => (
            <li key={item.id} className="flex gap-5 py-6">
              <Link
                href={`/perfumes/${item.slug}`}
                className="relative size-24 shrink-0 overflow-hidden bg-noir-soft sm:size-28"
              >
                {item.imagen ? (
                  <Image src={item.imagen} alt={item.nombre} fill sizes="112px" className="object-cover" />
                ) : (
                  <ProductPlaceholder codigo={item.codigo} compacto className="size-full" />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                {item.marca && (
                  <p className="text-[0.58rem] uppercase tracking-[0.22em] text-champagne/80">
                    {item.marca}
                  </p>
                )}
                <Link
                  href={`/perfumes/${item.slug}`}
                  className="font-[family-name:var(--font-display)] text-lg hover:text-champagne"
                >
                  {item.nombre}
                </Link>
                <p className="mt-1 text-[0.72rem] uppercase tracking-[0.14em] text-[var(--surface-muted)]">
                  Ref. {item.codigo}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center border border-[var(--surface-line)]">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                      aria-label={`Quitar una unidad de ${item.nombre}`}
                      className="px-3 py-1.5 text-[var(--surface-muted)] transition-colors hover:text-champagne"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                      aria-label={`Agregar una unidad de ${item.nombre}`}
                      className="px-3 py-1.5 text-[var(--surface-muted)] transition-colors hover:text-champagne"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="text-[0.95rem]">{formatCOP(item.precio * item.cantidad)}</span>
                    <button
                      type="button"
                      onClick={() => quitar(item.id)}
                      className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--surface-muted)] transition-colors hover:text-champagne"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/perfumes"
            className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--surface-muted)] underline-offset-4 transition-colors hover:text-champagne hover:underline"
          >
            ← Seguir comprando
          </Link>
          <button
            type="button"
            onClick={vaciar}
            className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--surface-muted)] transition-colors hover:text-champagne"
          >
            Vaciar carrito
          </button>
        </div>
      </div>

      <aside className="h-fit border border-[var(--surface-line)] p-6 lg:sticky lg:top-28">
        <h2 className="eyebrow mb-5">Resumen</h2>
        <dl className="space-y-3 text-[0.9rem]">
          <div className="flex justify-between">
            <dt className="text-[var(--surface-muted)]">Subtotal</dt>
            <dd>{formatCOP(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--surface-muted)]">Envío</dt>
            <dd>
              {costoEnvio == null
                ? 'Se coordina contigo'
                : costoEnvio === 0
                  ? 'Gratis'
                  : formatCOP(costoEnvio)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[var(--surface-line)] pt-3">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em]">Total</dt>
            <dd className="font-[family-name:var(--font-display)] text-xl">{formatCOP(total)}</dd>
          </div>
        </dl>

        {envio.faltaParaGratis != null && envio.faltaParaGratis > 0 && (
          <p className="mt-4 text-[0.75rem] text-[var(--surface-muted)]">
            Te faltan {formatCOP(envio.faltaParaGratis)} para envío gratis.
          </p>
        )}

        <ButtonLink href="/checkout" tamano="lg" className="mt-6 w-full">
          Finalizar compra
        </ButtonLink>

        {enlaceWhatsapp && (
          <ExternalButton
            href={enlaceWhatsapp}
            target="_blank"
            variante="contorno"
            className="mt-3 w-full"
          >
            Pedir por WhatsApp
          </ExternalButton>
        )}
      </aside>
    </div>
  );
}
