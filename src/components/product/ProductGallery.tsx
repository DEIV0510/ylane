'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductPlaceholder } from './ProductPlaceholder';

export type ImagenProducto = { id: number; url: string; alt: string | null; tipo: string };

/*
 * En escritorio la galería queda fija (sticky) junto a la información. Un
 * elemento fijo más alto que la pantalla escondería su parte de abajo, así que
 * se limita el ancho del escenario y el 4:5 fija el alto: nunca pasa de la
 * altura visible menos la cabecera y un margen para la nota inferior.
 */
const TOPE_ESCRITORIO = 'lg:max-w-[calc((100dvh_-_var(--header-h)_-_5rem)_*_0.8)]';

export function ProductGallery({
  imagenes,
  nombre,
  codigo,
  marca = null,
  tipo = null,
  concentracion = null,
}: {
  imagenes: ImagenProducto[];
  nombre: string;
  codigo: string;
  marca?: string | null;
  tipo?: string | null;
  concentracion?: string | null;
}) {
  const [activa, setActiva] = useState(0);
  const varias = imagenes.length > 1;

  // Sin fotografía: la etiqueta tipográfica de la casa, nunca un frasco inventado.
  if (imagenes.length === 0) {
    return (
      <figure>
        <div className={`aspect-4/5 w-full ${TOPE_ESCRITORIO}`}>
          <ProductPlaceholder
            codigo={codigo}
            nombre={nombre}
            marca={marca}
            tipo={tipo}
            concentracion={concentracion}
            className="size-full"
          />
        </div>
        <figcaption className="mt-3 text-[0.6875rem] tracking-[0.04em] text-[var(--surface-muted)]">
          Fotografía del producto próximamente
        </figcaption>
      </figure>
    );
  }

  return (
    <div className={varias ? 'lg:grid lg:grid-cols-[4rem_minmax(0,1fr)] lg:gap-5' : ''}>
      {/* Fotos fieles: sin recortes (contain) y fundidas con el escenario claro. */}
      <div
        className={`stage relative aspect-4/5 w-full overflow-hidden ${TOPE_ESCRITORIO} ${
          varias ? 'lg:col-start-2 lg:row-start-1' : ''
        }`}
      >
        {imagenes.map((imagen, indice) => (
          <Image
            key={imagen.id}
            src={imagen.url}
            alt={indice === activa ? (imagen.alt ?? nombre) : ''}
            aria-hidden={indice !== activa}
            fill
            priority={indice === 0}
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 544px, 46vw"
            className={`object-contain p-[6%] mix-blend-multiply transition-opacity duration-500 ease-[var(--ease-silk)] ${
              indice === activa ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {varias && (
        /* Tira de miniaturas: horizontal bajo la foto en móvil, vertical a la
           izquierda en escritorio. El relleno de 6 px (compensado con margen
           negativo) evita que el desplazamiento recorte el anillo de foco. */
        <ul
          aria-label="Imágenes del producto"
          className="no-scrollbar -mx-1.5 mt-1.5 flex gap-2.5 overflow-x-auto p-1.5 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:mt-0 lg:flex-col lg:overflow-visible lg:p-0"
        >
          {imagenes.map((imagen, indice) => (
            <li key={imagen.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiva(indice)}
                aria-label={`Ver imagen ${indice + 1} de ${nombre}`}
                aria-current={indice === activa}
                className={`stage relative block size-16 overflow-hidden border transition-colors duration-300 ${
                  indice === activa
                    ? 'border-[var(--surface-fg)]'
                    : 'border-transparent hover:border-[var(--surface-control)]'
                }`}
              >
                <Image
                  src={imagen.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1.5 mix-blend-multiply"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
