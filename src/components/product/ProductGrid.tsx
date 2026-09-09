import type { ProductoVista } from '@/lib/catalog';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  productos,
  columnas = 4,
  prioridadPrimeros = 0,
}: {
  productos: ProductoVista[];
  columnas?: 3 | 4;
  prioridadPrimeros?: number;
}) {
  const clases =
    columnas === 3
      ? 'grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={clases}>
      {productos.map((producto, indice) => (
        <div key={producto.id} data-reveal style={{ transitionDelay: `${(indice % 4) * 60}ms` }}>
          <ProductCard producto={producto} prioridad={indice < prioridadPrimeros} />
        </div>
      ))}
    </div>
  );
}

/** Fila horizontal con scroll por gestos: evita cargar rejillas enormes en móvil. */
export function ProductRow({ productos }: { productos: ProductoVista[] }) {
  return (
    <div className="scroll-row -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:-mx-10 md:px-10 xl:-mx-14 xl:px-14">
      {productos.map((producto) => (
        <div
          key={producto.id}
          className="w-[63vw] shrink-0 snap-start sm:w-[38vw] lg:w-[23vw] xl:w-[19rem]"
        >
          <ProductCard producto={producto} compacto />
        </div>
      ))}
    </div>
  );
}
