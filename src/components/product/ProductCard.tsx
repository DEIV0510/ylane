import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Bits';
import { descuentoPct, formatCOP, GENERO_ETIQUETA } from '@/lib/format';
import type { ProductoVista } from '@/lib/catalog';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductPlaceholder } from './ProductPlaceholder';

export function ProductCard({
  producto,
  prioridad = false,
  compacto = false,
}: {
  producto: ProductoVista;
  prioridad?: boolean;
  compacto?: boolean;
}) {
  const precio = formatCOP(producto.precio);
  const anterior = formatCOP(producto.precioAnterior);
  const descuento = descuentoPct(producto.precio, producto.precioAnterior);
  const agotado = producto.stock != null && producto.stock <= 0;

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        href={`/perfumes/${producto.slug}`}
        className="relative block aspect-4/5 w-full overflow-hidden bg-noir-soft"
      >
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.imagenAlt ?? producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={prioridad}
            className="object-cover transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-[1.04]"
          />
        ) : (
          <ProductPlaceholder
            codigo={producto.codigo}
            nombre={producto.nombre}
            compacto={compacto}
            className="size-full transition-transform duration-700 ease-[var(--ease-silk)] group-hover:scale-[1.04]"
          />
        )}

        <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <span className="absolute left-0 top-0 flex flex-col items-start gap-1 p-2.5">
          {descuento != null && <Badge tono="vino">-{descuento}%</Badge>}
          {producto.nuevo && <Badge tono="champagne">Nuevo</Badge>}
          {producto.bestseller && <Badge tono="neutro">Best seller</Badge>}
          {producto.tipo === 'arabe' && <Badge tono="neutro">Árabe</Badge>}
        </span>

        {agotado && (
          <span className="absolute inset-x-0 bottom-0 bg-noir/85 py-2 text-center text-[0.6rem] uppercase tracking-[0.25em] text-marfil-dim">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <p className="text-[0.6rem] uppercase tracking-[0.24em] text-champagne/80">
          {producto.marca ?? GENERO_ETIQUETA[producto.genero] ?? ''}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] leading-snug">
          <Link href={`/perfumes/${producto.slug}`} className="transition-colors hover:text-champagne">
            {producto.nombre}
          </Link>
        </h3>

        <div className="mt-auto pt-3">
          {precio ? (
            <p className="flex items-baseline gap-2">
              <span className="text-[0.95rem] tracking-wide">{precio}</span>
              {anterior && (
                <span className="text-[0.75rem] text-[var(--surface-muted)] line-through">
                  {anterior}
                </span>
              )}
            </p>
          ) : (
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
              Precio por confirmar
            </p>
          )}

          <div className="mt-3">
            <AddToCartButton
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
              compacto
            />
          </div>
        </div>
      </div>
    </article>
  );
}
