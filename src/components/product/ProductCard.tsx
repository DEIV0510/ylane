import Image from 'next/image';
import Link from 'next/link';
import { descuentoPct, formatCOP, GENERO_ETIQUETA, nombreSinMarca } from '@/lib/format';
import type { ProductoVista } from '@/lib/catalog';
import { QuickAdd } from '@/components/cart/QuickAdd';
import { ProductPlaceholder } from './ProductPlaceholder';

/**
 * Ficha de producto editorial: el producto es el protagonista.
 * Foto grande sobre el escenario claro, marca pequeña, nombre, precio y una
 * sola acción (aparece al pasar el ratón; en táctil, discreta en la esquina).
 * Toda la tarjeta es un único enlace: el del título, estirado con ::after.
 */
export function ProductCard({
  producto,
  prioridad = false,
  tamano = 'normal',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  className = '',
}: {
  producto: ProductoVista;
  prioridad?: boolean;
  /** `grande`: tipografía mayor para la pieza protagonista de una composición. */
  tamano?: 'normal' | 'grande';
  sizes?: string;
  className?: string;
}) {
  const precio = formatCOP(producto.precio);
  const anterior = formatCOP(producto.precioAnterior);
  const descuento = descuentoPct(producto.precio, producto.precioAnterior);
  const agotado = producto.stock != null && producto.stock <= 0;
  const nombre = nombreSinMarca(producto.nombre, producto.marca);
  const grande = tamano === 'grande';

  // Una sola etiqueta como máximo, por orden de importancia para el cliente.
  const etiqueta = agotado
    ? 'Agotado'
    : descuento != null
      ? `−${descuento}%`
      : producto.nuevo
        ? 'Nuevo'
        : null;

  return (
    <article className={`group/card relative flex flex-col ${className}`}>
      <div className="stage relative aspect-4/5 w-full overflow-hidden">
        {producto.imagen ? (
          <>
            <Image
              src={producto.imagen}
              alt={producto.imagenAlt ?? producto.nombre}
              fill
              sizes={sizes}
              priority={prioridad}
              className={`object-contain p-[8%] mix-blend-multiply transition-[transform,opacity] duration-[900ms] ease-[var(--ease-silk)] can-hover:group-hover/card:scale-[1.03] ${
                producto.imagen2 ? 'can-hover:group-hover/card:opacity-0' : ''
              }`}
            />
            {producto.imagen2 && (
              <Image
                src={producto.imagen2}
                alt=""
                aria-hidden="true"
                fill
                sizes={sizes}
                className="object-contain p-[8%] opacity-0 mix-blend-multiply transition-opacity duration-[900ms] ease-[var(--ease-silk)] can-hover:group-hover/card:opacity-100"
              />
            )}
          </>
        ) : (
          <ProductPlaceholder
            codigo={producto.codigo}
            nombre={producto.nombre}
            marca={producto.marca}
            tipo={producto.tipo}
            concentracion={producto.concentracion}
            className="size-full transition-transform duration-[900ms] ease-[var(--ease-silk)] can-hover:group-hover/card:scale-[1.02]"
          />
        )}

        {etiqueta && (
          <span
            className={`absolute left-3 top-3 px-2 py-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] ${
              agotado
                ? 'bg-tinta/80 text-marfil'
                : descuento != null
                  ? 'bg-vino text-marfil'
                  : 'bg-marfil text-tinta'
            }`}
          >
            {etiqueta}
          </span>
        )}

        <QuickAdd
          producto={{
            id: producto.id,
            codigo: producto.codigo,
            slug: producto.slug,
            nombre: producto.nombre,
            marca: producto.marca,
            precio: producto.precio,
            imagen: producto.imagen,
            stock: producto.stock,
          }}
        />
      </div>

      <div className={grande ? 'pt-6' : 'pt-4'}>
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]">
          {producto.marca ?? GENERO_ETIQUETA[producto.genero] ?? 'Perfumería'}
        </p>
        <h3
          className={`mt-1.5 font-[family-name:var(--font-sans)] font-normal leading-snug tracking-normal ${
            grande ? 'text-[1.3rem] lg:text-[1.5rem]' : 'text-[0.95rem]'
          }`}
        >
          <Link
            href={`/perfumes/${producto.slug}`}
            className="outline-none after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
          >
            {nombre}
          </Link>
        </h3>
        <p
          className={`mt-2 flex flex-wrap items-baseline gap-x-2.5 tabular-nums ${
            grande ? 'text-[1.05rem]' : 'text-[0.9rem]'
          }`}
        >
          {precio ? (
            <>
              <span>{precio}</span>
              {anterior && (
                <span className="text-[0.78em] text-[var(--surface-muted)] line-through">{anterior}</span>
              )}
            </>
          ) : (
            <span className="text-[0.72rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
              Precio por confirmar
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
