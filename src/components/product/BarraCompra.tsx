'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useConfig } from '@/components/ConfigProvider';
import { whatsappUrl } from '@/lib/whatsapp';

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
 * Barra de compra fija en pantallas menores a lg. La gobierna BuyBox: aparece
 * cuando el botón principal queda por encima de la pantalla y se retira al
 * llegar al pie. Es negra como la cabecera, para que se lea como parte del
 * marco de la tienda y no como un bloque más de la ficha.
 *
 * Se monta en un portal sobre <body>: así ningún `transform` o contención de
 * un ancestro la vuelve relativa a su contenedor, y hereda la superficie
 * oscura de la raíz aunque la ficha sea clara.
 */
export function BarraCompra({
  producto,
  cantidad,
  nombre,
  precio,
  visible,
}: {
  producto: Producto;
  cantidad: number;
  /** Nombre corto (sin la marca). */
  nombre: string;
  precio: string;
  visible: boolean;
}) {
  const { whatsapp } = useConfig();
  const [montada, setMontada] = useState(false);

  useEffect(() => setMontada(true), []);

  if (!montada) return null;

  // El botón flotante de WhatsApp (bottom-5 right-5, 52 px: de 20 a 72 px del
  // borde inferior) queda encima de la barra. Con 72 px de alto el círculo cae
  // entero dentro de ella, y el contenido le deja libre su hueco a la derecha.
  const conFlotante = whatsappUrl(whatsapp, '') !== null;

  return createPortal(
    <div
      data-surface="oscuro"
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-[var(--surface-line)] bg-noir/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-[translate,opacity] duration-500 ease-[var(--ease-silk)] lg:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div
        className={`flex min-h-[4.5rem] items-center gap-4 py-3 pl-5 md:pl-10 ${
          conFlotante ? 'pr-[5.25rem]' : 'pr-5 md:pr-10'
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] leading-snug">{nombre}</p>
          <p className="text-[0.8125rem] tabular-nums text-[var(--surface-muted)]">
            {precio}
            {cantidad > 1 && <span> · {cantidad} unidades</span>}
          </p>
        </div>
        <AddToCartButton
          producto={producto}
          cantidad={cantidad}
          etiqueta="Agregar"
          etiquetaAccesible={`Agregar ${producto.nombre} al carrito`}
          variante="claro"
          tamano="md"
          anchoCompleto={false}
          className="shrink-0"
        />
      </div>
    </div>,
    document.body,
  );
}
