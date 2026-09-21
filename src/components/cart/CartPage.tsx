'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useCarrito, type ItemCarrito } from './CartProvider';
import { ACCION_DISCRETA, LineaCarrito } from './LineaCarrito';
import { ResumenImportes } from './ResumenImportes';
import { SeleccionVacia } from './SeleccionVacia';
import { useConfig } from '@/components/ConfigProvider';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';
import { formatCOP } from '@/lib/format';
import { calcularEnvio, calcularTotal } from '@/lib/envio';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';

/** Etiqueta de columna del documento («3 artículos», «Importe»). */
const ETIQUETA_COLUMNA =
  'font-[family-name:var(--font-sans)] text-[0.6875rem] font-medium uppercase leading-normal tracking-[0.24em] text-[var(--surface-muted)]';

/**
 * Página del carrito: las líneas a la izquierda (7 columnas) y el resumen,
 * fijo al desplazar en escritorio, a la derecha. En móvil el resumen cierra
 * la página como una banda lino a todo el ancho.
 */
export function CartPage() {
  const { items, hidratado, cambiarCantidad, quitar, subtotal, unidades, vaciar } = useCarrito();
  const config = useConfig();
  const lista = useRef<HTMLUListElement>(null);
  const vacio = useRef<HTMLDivElement>(null);
  const [aviso, setAviso] = useState('');

  // Quitar una línea borra su botón: el foco pasa a la lista (o al estado
  // vacío) en vez de perderse, y el cambio se anuncia.
  const enfocarLista = (desplazar = false) =>
    window.requestAnimationFrame(() =>
      (lista.current ?? vacio.current)?.focus({ preventScroll: !desplazar }),
    );

  const trasQuitar = (item: ItemCarrito) => {
    setAviso(`${item.nombre} se quitó de tu selección.`);
    enfocarLista();
  };

  const vaciarTodo = () => {
    vaciar();
    setAviso('Tu selección quedó vacía.');
    enfocarLista(true);
  };

  let contenido: ReactNode;

  if (!hidratado) {
    contenido = <Esqueleto />;
  } else if (items.length === 0) {
    contenido = (
      <div
        ref={vacio}
        tabIndex={-1}
        className="scroll-mt-[calc(var(--header-h)+2rem)] border-t border-[var(--surface-control)] pb-24 pt-10 outline-none lg:pb-32 lg:pt-14"
      >
        <SeleccionVacia />
      </div>
    );
  } else {
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

    contenido = (
      <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-8 lg:pb-32">
        <section aria-labelledby="carrito-lineas" className="lg:col-span-7">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--surface-control)] pb-4">
            <h2 id="carrito-lineas" className={`${ETIQUETA_COLUMNA} tabular-nums`}>
              {unidades} {unidades === 1 ? 'artículo' : 'artículos'}
            </h2>
            <p aria-hidden="true" className={`${ETIQUETA_COLUMNA} hidden sm:block`}>
              Importe
            </p>
          </div>

          <ul
            ref={lista}
            tabIndex={-1}
            aria-labelledby="carrito-lineas"
            className="divide-y divide-[var(--surface-line)] border-b border-[var(--surface-line)] outline-none"
          >
            {items.map((item) => (
              <LineaCarrito
                key={item.id}
                item={item}
                variante="pagina"
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8">
            <Link href="/perfumes" className="link-flecha group">
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Seguir comprando
            </Link>
            <button type="button" onClick={vaciarTodo} className={ACCION_DISCRETA}>
              Vaciar carrito
            </button>
          </div>
        </section>

        <aside
          aria-labelledby="carrito-resumen"
          data-surface="lino"
          className="px-5 py-10 max-md:-mx-5 md:px-10 md:max-lg:-mx-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5 lg:self-start lg:p-10 xl:col-span-4 xl:col-start-9"
        >
          <h2 id="carrito-resumen" className="text-[1.75rem] leading-none">
            Resumen
          </h2>

          <ResumenImportes
            className="mt-7"
            subtotal={subtotal}
            costoEnvio={costoEnvio}
            total={total}
            unidades={unidades}
          />

          {envio.faltaParaGratis != null && envio.faltaParaGratis > 0 && (
            <p className="mt-5 text-[0.8125rem] leading-relaxed tabular-nums text-[var(--surface-muted)]">
              Te faltan {formatCOP(envio.faltaParaGratis)} para envío gratis.
            </p>
          )}

          <ButtonLink href="/checkout" tamano="lg" className="mt-8 w-full">
            Finalizar compra
          </ButtonLink>

          {enlaceWhatsapp && (
            <ExternalButton href={enlaceWhatsapp} target="_blank" variante="contorno" className="mt-3 w-full">
              Pedir por WhatsApp
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </ExternalButton>
          )}
        </aside>
      </div>
    );
  }

  return (
    <>
      {/* Siempre montado, para que el aviso se lea aunque la lista se vacíe. */}
      <p role="status" className="sr-only">
        {aviso}
      </p>
      {contenido}
    </>
  );
}

/** Mientras se lee el carrito guardado: la misma composición, sin contenido. */
function Esqueleto() {
  return (
    <div aria-hidden="true" className="grid gap-y-14 pb-24 lg:grid-cols-12 lg:gap-x-8 lg:pb-32">
      <div className="lg:col-span-7">
        <div className="border-b border-[var(--surface-control)] pb-4">
          <div className="h-3 w-24 bg-[var(--surface-line)]" />
        </div>
        {[0, 1].map((fila) => (
          <div key={fila} className="flex gap-5 border-b border-[var(--surface-line)] py-7 sm:gap-7 sm:py-8">
            <div className="stage aspect-4/5 w-24 animate-pulse sm:w-28" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-2.5 w-20 animate-pulse bg-[var(--surface-line)]" />
              <div className="h-4 w-2/3 animate-pulse bg-[var(--surface-line)]" />
            </div>
          </div>
        ))}
      </div>
      <div
        data-surface="lino"
        className="h-80 animate-pulse max-md:-mx-5 md:max-lg:-mx-10 lg:col-span-5 xl:col-span-4 xl:col-start-9"
      />
    </div>
  );
}
