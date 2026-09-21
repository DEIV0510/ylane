import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const numeros = new Intl.NumberFormat('es-CO');

/**
 * Contador protagonista: el número en Bodoni y la unidad en versalitas.
 * Siempre es el total real de resultados, nunca una cifra redonda de adorno.
 */
export function Contador({
  total,
  unidad = ['fragancia', 'fragancias'],
  className = '',
}: {
  total: number;
  /** Singular y plural de lo que se cuenta. */
  unidad?: [string, string];
  className?: string;
}) {
  return (
    <p className={`flex items-baseline gap-3 ${className}`}>
      <span className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5.2vw,4.75rem)] leading-[0.9] tracking-[-0.02em]">
        {numeros.format(total)}
      </span>
      <span className="text-[0.6875rem] font-medium uppercase tracking-[0.3em] text-[var(--surface-muted)]">
        {total === 1 ? unidad[0] : unidad[1]}
      </span>
    </p>
  );
}

/**
 * Encabezado editorial del catálogo, las colecciones y las marcas.
 *  - Sin foto: el título manda a la izquierda y el contador cierra la
 *    composición abajo a la derecha, en la misma línea que el buscador.
 *  - Con foto: texto a la izquierda y una foto estrecha y alta a la derecha.
 *    En móvil la foto no se muestra: ahí lo primero es llegar al producto.
 * `children` va debajo del texto de apoyo (buscador, «Resultados para…»).
 */
export function EncabezadoCatalogo({
  eyebrow,
  titulo,
  descripcion,
  total,
  unidad,
  imagen,
  volver,
  children,
}: {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  total: number;
  unidad?: [string, string];
  /** Foto editorial de ambientación (decorativa: alt vacío). */
  imagen?: string;
  volver?: { href: string; etiqueta: string };
  children?: ReactNode;
}) {
  // Con cero resultados no se muestra un «0» gigante: el estado vacío lo explica.
  const contador = total > 0 ? <Contador total={total} unidad={unidad} /> : null;

  const texto = (
    <>
      {volver && (
        <Link
          href={volver.href}
          className="group -ml-1 mb-6 flex min-h-11 w-fit items-center gap-2.5 px-1 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)] transition-colors duration-300 hover:text-[var(--surface-fg)]"
        >
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-[var(--ease-silk)] group-hover:-translate-x-1"
          >
            ←
          </span>
          {volver.etiqueta}
        </Link>
      )}
      {eyebrow && (
        <p className="indice">
          <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
          <span>{eyebrow}</span>
        </p>
      )}
      <h1 className="display-xl mt-5 break-words lg:mt-7">{titulo}</h1>
      {descripcion && <p className="lead mt-6 lg:mt-8">{descripcion}</p>}
      {children}
    </>
  );

  if (imagen) {
    return (
      <header className="shell pb-12 pt-10 md:grid md:grid-cols-12 md:gap-x-8 md:pt-14 lg:gap-x-10 lg:pb-16 lg:pt-20">
        <div className="flex flex-col md:col-span-7">
          {texto}
          {contador && <div className="mt-10 md:mt-auto md:pt-12">{contador}</div>}
        </div>
        {/* Foto de ambientación: completa en su marco, sin fundidos ni velos. */}
        <div
          data-reveal="fade"
          className="relative hidden aspect-[2/3] overflow-hidden bg-[var(--stage)] md:col-span-4 md:col-start-9 md:block lg:col-span-3 lg:col-start-10"
        >
          <Image
            src={imagen}
            alt=""
            fill
            sizes="(min-width: 1408px) 290px, (min-width: 1024px) 22vw, 30vw"
            className="object-cover"
          />
        </div>
      </header>
    );
  }

  return (
    <header className="shell pb-12 pt-10 md:pt-14 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10 lg:pb-16 lg:pt-20">
      <div className="lg:col-span-8">{texto}</div>
      {contador && (
        <div className="mt-10 lg:col-span-4 lg:mt-0 lg:flex lg:justify-end">{contador}</div>
      )}
    </header>
  );
}
