import type { ProductoVista } from '@/lib/catalog';
import { ProductCard } from './ProductCard';

/**
 * Rejilla de producto con aire: 2 columnas en móvil, 3 en el catálogo y 4 en
 * las secciones cortas de la portada. El espacio entre fichas es deliberado.
 */
export function ProductGrid({
  productos,
  columnas = 3,
  prioridadPrimeros = 0,
  escalonada = false,
  sizes: sizesPropio,
}: {
  productos: ProductoVista[];
  columnas?: 3 | 4;
  prioridadPrimeros?: number;
  /** Desplaza las columnas pares hacia abajo: ritmo editorial para secciones cortas. */
  escalonada?: boolean;
  /** Ancho real de cada ficha si la rejilla no ocupa todo el contenedor (p. ej. junto a filtros). */
  sizes?: string;
}) {
  const clases =
    columnas === 3
      ? 'grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16'
      : 'grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8';

  const sizes =
    sizesPropio ??
    (columnas === 3
      ? '(max-width: 1024px) 50vw, 30vw'
      : '(max-width: 1024px) 50vw, 23vw');

  return (
    <div className={clases}>
      {productos.map((producto, indice) => (
        <div
          key={producto.id}
          data-reveal
          style={{ transitionDelay: `${(indice % columnas) * 70}ms` }}
          className={escalonada && indice % 2 === 1 ? 'lg:translate-y-16 max-lg:mt-10' : ''}
        >
          <ProductCard producto={producto} prioridad={indice < prioridadPrimeros} sizes={sizes} />
        </div>
      ))}
    </div>
  );
}
