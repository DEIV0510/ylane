'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCOP } from '@/lib/format';
import { ProductPlaceholder } from './ProductPlaceholder';

export type VistoReciente = {
  slug: string;
  codigo: string;
  nombre: string;
  marca: string | null;
  precio: number | null;
  imagen: string | null;
};

const CLAVE = 'ylane_vistos_v1';
const MAXIMO = 8;
/** Cuántas se muestran como mucho: es un recordatorio, no otra rejilla. */
const VISIBLES = 6;

/**
 * Registra la ficha actual y muestra las anteriores. Todo vive en el navegador.
 * Se pinta después de montar (depende de localStorage), así que no lleva
 * data-reveal: el revelado global ya habría recogido sus elementos antes.
 */
export function RecentlyViewed({ actual }: { actual?: VistoReciente }) {
  const [items, setItems] = useState<VistoReciente[]>([]);

  useEffect(() => {
    let guardados: VistoReciente[] = [];
    try {
      const bruto = window.localStorage.getItem(CLAVE);
      if (bruto) {
        const datos = JSON.parse(bruto);
        if (Array.isArray(datos)) guardados = datos.filter((item) => item?.slug && item?.nombre);
      }
    } catch {
      guardados = [];
    }

    setItems(guardados.filter((item) => item.slug !== actual?.slug).slice(0, MAXIMO));

    if (actual) {
      const nuevos = [actual, ...guardados.filter((item) => item.slug !== actual.slug)].slice(0, MAXIMO);
      try {
        window.localStorage.setItem(CLAVE, JSON.stringify(nuevos));
      } catch {
        /* sin almacenamiento disponible */
      }
    }
  }, [actual]);

  if (items.length < 2) return null;

  return (
    <section data-surface="claro" aria-labelledby="vistos-recientemente" className="py-12 lg:py-16">
      <div className="shell lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10 xl:gap-x-16">
        <h2
          id="vistos-recientemente"
          className="font-[family-name:var(--font-sans)] text-[0.6875rem] font-medium uppercase leading-normal tracking-[0.3em] text-[var(--surface-muted)] lg:col-span-3"
        >
          Vistos recientemente
        </h2>

        {/* Miniaturas pequeñas en una sola fila: 3 en móvil, 5 en tableta, 6 en escritorio. Sin carrusel. */}
        <ul className="mt-6 grid grid-cols-3 gap-x-4 sm:flex sm:gap-5 lg:col-span-9 lg:mt-0">
          {items.slice(0, VISIBLES).map((item, indice) => (
            <li
              key={item.slug}
              className={`min-w-0 sm:w-24 sm:shrink-0 ${indice >= 3 ? 'max-sm:hidden' : ''} ${
                indice >= 5 ? 'max-lg:hidden' : ''
              }`}
            >
              <Link href={`/perfumes/${item.slug}`} className="group block">
                <span aria-hidden="true" className="stage relative block aspect-4/5 overflow-hidden">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-contain p-[8%] mix-blend-multiply"
                    />
                  ) : (
                    <ProductPlaceholder
                      codigo={item.codigo}
                      nombre={item.nombre}
                      marca={item.marca}
                      compacto
                      className="size-full"
                    />
                  )}
                </span>
                <span className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-snug transition-colors duration-300 group-hover:text-[var(--acento)]">
                  {item.nombre}
                </span>
                <span className="mt-0.5 block text-[0.75rem] tabular-nums text-[var(--surface-muted)]">
                  {formatCOP(item.precio) ?? 'Precio por confirmar'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
