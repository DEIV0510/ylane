import Image from 'next/image';
import Link from 'next/link';
import type { ItemCarrito } from './CartProvider';
import { ProductPlaceholder } from '@/components/product/ProductPlaceholder';
import { formatCOP, nombreSinMarca } from '@/lib/format';

/*
 * Piezas del carrito que comparten el cajón, la página del carrito y el
 * resumen del checkout. Llevan manejadores de eventos: sólo se importan desde
 * componentes de cliente.
 */

/** Acción de texto discreta («Quitar», «Vaciar carrito»), con objetivo táctil de 44 px. */
export const ACCION_DISCRETA =
  'inline-flex min-h-11 items-center text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--surface-muted)] underline decoration-[color:var(--surface-line)] underline-offset-[0.5em] transition-colors duration-300 ease-[var(--ease-silk)] hover:text-[var(--acento)] hover:decoration-current';

type Producto = Pick<ItemCarrito, 'codigo' | 'nombre' | 'marca' | 'imagen'>;

/**
 * Miniatura sobre el escenario claro. Es decorativa: el nombre del producto
 * siempre va escrito al lado, así que el lector de pantalla no lo oye dos veces.
 */
export function Miniatura({
  producto,
  sizes,
  className = '',
}: {
  producto: Producto;
  sizes: string;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`stage relative aspect-4/5 shrink-0 overflow-hidden ${className}`}>
      {producto.imagen ? (
        // La foto del negocio, fiel: sin recortes y fundida con el escenario.
        <Image
          src={producto.imagen}
          alt=""
          fill
          sizes={sizes}
          className="object-contain p-[9%] mix-blend-multiply"
        />
      ) : (
        <ProductPlaceholder
          codigo={producto.codigo}
          nombre={producto.nombre}
          marca={producto.marca}
          compacto
          className="size-full"
        />
      )}
    </div>
  );
}

const BOTON_CANTIDAD =
  'flex size-11 items-center justify-center transition-colors duration-300 ease-[var(--ease-silk)] hover:text-[var(--acento)] active:bg-[var(--surface-input)]';

/** Selector − n +. Cada botón mide 44 px; el número se anuncia al cambiar. */
export function Cantidad({
  nombre,
  cantidad,
  alRestar,
  alSumar,
}: {
  nombre: string;
  cantidad: number;
  alRestar: () => void;
  alSumar: () => void;
}) {
  return (
    <div
      role="group"
      aria-label={`Cantidad de ${nombre}`}
      className="inline-flex items-center border border-[var(--surface-control)]"
    >
      <button
        type="button"
        onClick={alRestar}
        aria-label={`Quitar una unidad de ${nombre}`}
        className={BOTON_CANTIDAD}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span aria-live="polite" aria-atomic="true" className="min-w-8 text-center text-[0.9375rem] tabular-nums">
        <span className="sr-only">Cantidad: </span>
        {cantidad}
      </span>
      <button
        type="button"
        onClick={alSumar}
        aria-label={`Agregar una unidad de ${nombre}`}
        className={BOTON_CANTIDAD}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Línea de producto: miniatura, marca en versalitas, nombre en Jost e importe
 * alineado a la derecha, como en un documento. Debajo, cantidad y «Quitar».
 *  - `cajon`: compacta, para el panel lateral.
 *  - `pagina`: más aire y la referencia visible.
 */
export function LineaCarrito({
  item,
  variante = 'cajon',
  alRestar,
  alSumar,
  alQuitar,
  alNavegar,
}: {
  item: ItemCarrito;
  variante?: 'cajon' | 'pagina';
  alRestar: () => void;
  alSumar: () => void;
  alQuitar: () => void;
  /** Se llama al abrir la ficha del producto (el cajón se cierra al navegar). */
  alNavegar?: () => void;
}) {
  const pagina = variante === 'pagina';
  const enlace = `/perfumes/${item.slug}`;
  const referencia = pagina && item.codigo ? item.codigo : null;
  const variasUnidades = item.cantidad > 1;

  return (
    <li className={`flex ${pagina ? 'gap-5 py-7 sm:gap-7 sm:py-8' : 'gap-4 py-5'}`}>
      {/* La miniatura también lleva a la ficha (objetivo táctil amplio). Al
          teclado y al lector de pantalla les basta el enlace del nombre. */}
      <Link href={enlace} onClick={alNavegar} tabIndex={-1} aria-hidden="true" className="self-start">
        <Miniatura
          producto={item}
          sizes={pagina ? '112px' : '80px'}
          className={pagina ? 'w-24 sm:w-28' : 'w-[4.5rem] sm:w-20'}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {item.marca && (
              <p className="text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]">
                {item.marca}
              </p>
            )}
            <h3
              className={`mt-1 font-[family-name:var(--font-sans)] font-normal leading-snug tracking-normal ${
                pagina ? 'text-[1.0625rem]' : 'text-base sm:text-[0.9375rem]'
              }`}
            >
              <Link
                href={enlace}
                onClick={alNavegar}
                className="transition-colors duration-300 ease-[var(--ease-silk)] hover:text-[var(--acento)]"
              >
                {nombreSinMarca(item.nombre, item.marca)}
              </Link>
            </h3>
            {(referencia || variasUnidades) && (
              <p className="mt-1 text-[0.8125rem] tabular-nums text-[var(--surface-muted)]">
                {referencia && <>Ref. {referencia}</>}
                {referencia && variasUnidades && <span aria-hidden="true"> · </span>}
                {variasUnidades && (
                  <>
                    {formatCOP(item.precio)}
                    <span aria-hidden="true"> c/u</span>
                    <span className="sr-only"> por unidad</span>
                  </>
                )}
              </p>
            )}
          </div>

          <p className={`shrink-0 tabular-nums ${pagina ? 'text-[1.0625rem]' : 'text-[0.9375rem]'}`}>
            <span className="sr-only">Importe: </span>
            {formatCOP(item.precio * item.cantidad)}
          </p>
        </div>

        <div className={`mt-auto flex items-center justify-between gap-3 ${pagina ? 'pt-5' : 'pt-3'}`}>
          <Cantidad nombre={item.nombre} cantidad={item.cantidad} alRestar={alRestar} alSumar={alSumar} />
          <button
            type="button"
            onClick={alQuitar}
            aria-label={`Quitar ${item.nombre} de tu selección`}
            className={`${ACCION_DISCRETA} -mr-2 px-2`}
          >
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
}
