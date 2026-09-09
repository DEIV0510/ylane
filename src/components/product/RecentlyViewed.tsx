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

/** Registra la ficha actual y muestra las anteriores. Todo vive en el navegador. */
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
    <section className="border-t border-[var(--surface-line)] pt-12">
      <p className="eyebrow mb-6">Vistos recientemente</p>
      <div className="scroll-row flex gap-5 overflow-x-auto pb-3">
        {items.map((item) => (
          <Link key={item.slug} href={`/perfumes/${item.slug}`} className="group w-36 shrink-0">
            <span className="relative block aspect-4/5 overflow-hidden bg-noir-soft">
              {item.imagen ? (
                <Image src={item.imagen} alt={item.nombre} fill sizes="144px" className="object-cover" />
              ) : (
                <ProductPlaceholder codigo={item.codigo} compacto className="size-full" />
              )}
            </span>
            <span className="mt-2 block truncate text-[0.8rem] transition-colors group-hover:text-champagne">
              {item.nombre}
            </span>
            <span className="block text-[0.72rem] text-[var(--surface-muted)]">
              {formatCOP(item.precio) ?? 'Consultar'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
