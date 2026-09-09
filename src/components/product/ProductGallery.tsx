'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductPlaceholder } from './ProductPlaceholder';

export type ImagenProducto = { id: number; url: string; alt: string | null; tipo: string };

export function ProductGallery({
  imagenes,
  nombre,
  codigo,
}: {
  imagenes: ImagenProducto[];
  nombre: string;
  codigo: string;
}) {
  const [activa, setActiva] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="relative aspect-4/5 w-full overflow-hidden bg-noir-soft">
        <ProductPlaceholder codigo={codigo} nombre={nombre} className="size-full" />
        <p className="absolute inset-x-0 bottom-0 bg-noir/80 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Fotografía pendiente
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {imagenes.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
          {imagenes.map((imagen, indice) => (
            <button
              key={imagen.id}
              type="button"
              onClick={() => setActiva(indice)}
              aria-label={`Ver imagen ${indice + 1} de ${nombre}`}
              aria-current={indice === activa}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden border transition-colors md:w-full ${
                indice === activa ? 'border-champagne' : 'border-[var(--surface-line)] hover:border-champagne/60'
              }`}
            >
              <Image src={imagen.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-4/5 flex-1 overflow-hidden bg-noir-soft">
        {imagenes.map((imagen, indice) => (
          <Image
            key={imagen.id}
            src={imagen.url}
            alt={imagen.alt ?? nombre}
            fill
            priority={indice === 0}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className={`object-cover transition-opacity duration-500 ${
              indice === activa ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
