'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Facetas } from '@/lib/catalog';
import { Button } from '@/components/ui/Button';
import { GENERO_ETIQUETA, TIPO_ETIQUETA, formatCOP } from '@/lib/format';
import { normalizar } from '@/lib/text';
import { useFocusTrap } from '@/lib/use-focus-trap';

type Props = {
  facetas: Facetas;
  total: number;
  /** Dimensiones que la ruta ya fija (ej. /arabes fija el tipo) y no se muestran. */
  bloqueadas?: string[];
  /** Resultados renderizados en el servidor: rejilla y paginación, o el estado vacío. */
  children: ReactNode;
};

/** `corta` es el texto del botón de la barra móvil, donde no cabe la etiqueta completa. */
const ORDENES = [
  { valor: '', etiqueta: 'Destacados', corta: 'Destacados' },
  { valor: 'novedades', etiqueta: 'Novedades', corta: 'Novedades' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor', corta: 'Menor precio' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor', corta: 'Mayor precio' },
  { valor: 'nombre', etiqueta: 'Nombre A–Z', corta: 'Nombre A–Z' },
];

type Orden = (typeof ORDENES)[number];
type Chip = { clave: string; etiqueta: string; quitar: () => void };

const fragancias = (total: number) => `${total} ${total === 1 ? 'fragancia' : 'fragancias'}`;

/** «maison-alhambra» → «Maison Alhambra»: por si la marca elegida ya no sale en las facetas. */
const humanizar = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');

/**
 * Filtros, orden y maqueta del cuerpo del catálogo.
 *  - Escritorio: columna lateral fija (sticky) con grupos plegables, y sobre la
 *    rejilla los filtros activos a la izquierda y el orden a la derecha.
 *  - Móvil: barra fija bajo la cabecera con «Filtrar» (abre el cajón) y el
 *    orden; debajo, los filtros activos con su «×».
 * Cada cambio reescribe la URL (router.push dentro de una transición) y el
 * servidor devuelve la lista nueva: la URL es siempre la fuente de verdad.
 */
export function ProductFilters({ facetas, total, bloqueadas = [], children }: Props) {
  const router = useRouter();
  const ruta = usePathname();
  const parametros = useSearchParams();
  const [pendiente, iniciarTransicion] = useTransition();
  const [abiertoMovil, setAbiertoMovil] = useState(false);
  const cajon = useRef<HTMLDivElement>(null);
  const resultados = useRef<HTMLDivElement>(null);
  const idCajon = useId();
  useFocusTrap(cajon, abiertoMovil);

  const seleccion = useMemo(
    () => ({
      genero: parametros.getAll('genero'),
      marca: parametros.getAll('marca'),
      tipo: parametros.getAll('tipo'),
      familia: parametros.getAll('familia'),
      disponibles: parametros.get('disponibles') === '1',
      precioMin: parametros.get('precioMin') ?? '',
      precioMax: parametros.get('precioMax') ?? '',
      orden: parametros.get('orden') ?? '',
    }),
    [parametros],
  );

  // Cajón móvil abierto: sin scroll de fondo, Escape lo cierra y, si la ventana
  // pasa a escritorio (donde el cajón no existe), se cierra solo.
  useEffect(() => {
    if (!abiertoMovil) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbiertoMovil(false);
    };
    const escritorio = window.matchMedia('(min-width: 1024px)');
    const alCambiar = () => {
      if (escritorio.matches) setAbiertoMovil(false);
    };
    document.addEventListener('keydown', alPulsar);
    escritorio.addEventListener('change', alCambiar);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener('keydown', alPulsar);
      escritorio.removeEventListener('change', alCambiar);
    };
  }, [abiertoMovil]);

  // El revelado global (RevealScript) sólo busca [data-reveal] al cambiar de
  // ruta. Al filtrar, ordenar o paginar la ruta es la misma y las fichas nuevas
  // se quedarían con opacidad 0: se revelan aquí (con su fundido de entrada).
  const consultaPrevia = useRef<string | null>(null);
  useEffect(() => {
    const consulta = parametros.toString();
    if (consultaPrevia.current !== null && consultaPrevia.current !== consulta) {
      resultados.current
        ?.querySelectorAll('[data-reveal]:not(.is-in)')
        .forEach((nodo) => nodo.classList.add('is-in'));
    }
    consultaPrevia.current = consulta;
  }, [parametros]);

  const actualizar = (mutar: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(parametros.toString());
    mutar(params);
    params.delete('pagina');
    iniciarTransicion(() => {
      router.push(`${ruta}${params.toString() ? `?${params}` : ''}`, { scroll: false });
    });
  };

  const alternar = (clave: string, valor: string) => {
    actualizar((params) => {
      const actuales = params.getAll(clave);
      params.delete(clave);
      const nuevos = actuales.includes(valor)
        ? actuales.filter((item) => item !== valor)
        : [...actuales, valor];
      for (const item of nuevos) params.append(clave, item);
    });
  };

  const limpiar = () =>
    actualizar((params) => {
      for (const clave of ['genero', 'marca', 'tipo', 'familia', 'disponibles', 'precioMin', 'precioMax']) {
        params.delete(clave);
      }
    });

  const quitarPrecio = () =>
    actualizar((params) => {
      params.delete('precioMin');
      params.delete('precioMax');
    });

  const cambiarOrden = (valor: string) =>
    actualizar((params) => {
      if (valor) params.set('orden', valor);
      else params.delete('orden');
    });

  const libre = (clave: string) => !bloqueadas.includes(clave);

  // Un chip por filtro que de verdad aplica, en el orden de los grupos. Los que
  // fija la ruta (el género en /hombre, por ejemplo) no se muestran ni se cuentan.
  // Los Set evitan chips repetidos si la URL trae un valor dos veces.
  const chips: Chip[] = [];
  if (libre('genero')) {
    for (const valor of new Set(seleccion.genero)) {
      if (GENERO_ETIQUETA[valor]) {
        chips.push({ clave: `genero-${valor}`, etiqueta: GENERO_ETIQUETA[valor], quitar: () => alternar('genero', valor) });
      }
    }
  }
  if (libre('tipo')) {
    for (const valor of new Set(seleccion.tipo)) {
      if (TIPO_ETIQUETA[valor]) {
        chips.push({ clave: `tipo-${valor}`, etiqueta: TIPO_ETIQUETA[valor], quitar: () => alternar('tipo', valor) });
      }
    }
  }
  const minimo = seleccion.precioMin !== '' && Number.isFinite(Number(seleccion.precioMin)) ? Number(seleccion.precioMin) : null;
  const maximo = seleccion.precioMax !== '' && Number.isFinite(Number(seleccion.precioMax)) ? Number(seleccion.precioMax) : null;
  if (minimo != null || maximo != null) {
    const tramo = facetas.rangosPrecio.find(
      (item) =>
        (item.min != null ? String(item.min) : '') === seleccion.precioMin &&
        (item.max != null ? String(item.max) : '') === seleccion.precioMax,
    );
    const desde = formatCOP(minimo);
    const hasta = formatCOP(maximo);
    chips.push({
      clave: 'precio',
      etiqueta: tramo?.etiqueta ?? (desde && hasta ? `${desde} – ${hasta}` : desde ? `Desde ${desde}` : `Hasta ${hasta}`),
      quitar: quitarPrecio,
    });
  }
  if (libre('marca')) {
    for (const slug of new Set(seleccion.marca)) {
      const nombre = facetas.marcas.find((marca) => marca.slug === slug)?.nombre ?? humanizar(slug);
      chips.push({ clave: `marca-${slug}`, etiqueta: nombre, quitar: () => alternar('marca', slug) });
    }
  }
  for (const valor of new Set(seleccion.familia)) {
    chips.push({ clave: `familia-${valor}`, etiqueta: valor, quitar: () => alternar('familia', valor) });
  }
  if (seleccion.disponibles) {
    chips.push({
      clave: 'disponibles',
      etiqueta: 'Con stock',
      quitar: () => actualizar((params) => params.delete('disponibles')),
    });
  }
  const activos = chips.length;

  const verGenero = libre('genero') && facetas.generos.length > 1;
  const verTipo = libre('tipo') && facetas.tipos.length > 1;
  const verPrecio = facetas.rangosPrecio.length > 0;
  const verMarca = libre('marca') && facetas.marcas.length > 0;
  const verFamilia = facetas.familias.length > 0;
  // Filtrar por stock sólo tiene sentido si el negocio controla inventario.
  const verStock = facetas.conStock > 0 || seleccion.disponibles;
  const hayGrupos = verGenero || verTipo || verPrecio || verMarca || verFamilia || verStock;
  // Sin resultados ni filtros que quitar, la barra no sirve de nada.
  const mostrarBarra = total > 0 || activos > 0;

  const ordenActual = ORDENES.find((opcion) => opcion.valor === seleccion.orden) ?? ORDENES[0];

  const panel = (
    <div>
      {verGenero && (
        <Grupo titulo="Género" activos={seleccion.genero.length}>
          {facetas.generos.map((item) => (
            <Casilla
              key={item.valor}
              etiqueta={GENERO_ETIQUETA[item.valor] ?? item.valor}
              total={item.total}
              activo={seleccion.genero.includes(item.valor)}
              onChange={() => alternar('genero', item.valor)}
            />
          ))}
        </Grupo>
      )}

      {verTipo && (
        <Grupo titulo="Tipo de perfumería" activos={seleccion.tipo.length}>
          {facetas.tipos.map((item) => (
            <Casilla
              key={item.valor}
              etiqueta={TIPO_ETIQUETA[item.valor] ?? item.valor}
              total={item.total}
              activo={seleccion.tipo.includes(item.valor)}
              onChange={() => alternar('tipo', item.valor)}
            />
          ))}
        </Grupo>
      )}

      {verPrecio && (
        <Grupo titulo="Precio" activos={minimo != null || maximo != null ? 1 : 0}>
          {facetas.rangosPrecio.map((tramo) => {
            const activo =
              seleccion.precioMin === (tramo.min != null ? String(tramo.min) : '') &&
              seleccion.precioMax === (tramo.max != null ? String(tramo.max) : '');
            return (
              <Casilla
                key={tramo.etiqueta}
                etiqueta={tramo.etiqueta}
                total={tramo.total}
                activo={activo}
                onChange={() =>
                  actualizar((params) => {
                    params.delete('precioMin');
                    params.delete('precioMax');
                    // Un solo tramo a la vez: volver a pulsarlo lo quita.
                    if (activo) return;
                    if (tramo.min != null) params.set('precioMin', String(tramo.min));
                    if (tramo.max != null) params.set('precioMax', String(tramo.max));
                  })
                }
              />
            );
          })}
          {facetas.precio.min != null && facetas.precio.max != null && (
            <p className="pt-2 text-[0.8125rem] leading-snug text-[var(--surface-muted)]">
              Desde {formatCOP(facetas.precio.min)} hasta {formatCOP(facetas.precio.max)}.
            </p>
          )}
        </Grupo>
      )}

      {verMarca && (
        // Plegado de entrada (la lista es larga), salvo que ya haya una marca elegida.
        <Grupo titulo="Marca" abiertoInicial={seleccion.marca.length > 0} activos={seleccion.marca.length}>
          <ListaMarcas
            marcas={facetas.marcas}
            elegidas={seleccion.marca}
            onAlternar={(slug) => alternar('marca', slug)}
          />
        </Grupo>
      )}

      {verFamilia && (
        <Grupo titulo="Familia olfativa" activos={seleccion.familia.length}>
          {facetas.familias.map((item) => (
            <Casilla
              key={item.valor}
              etiqueta={item.valor}
              total={item.total}
              activo={seleccion.familia.includes(item.valor)}
              onChange={() => alternar('familia', item.valor)}
            />
          ))}
        </Grupo>
      )}

      {verStock && (
        <Grupo titulo="Disponibilidad" activos={seleccion.disponibles ? 1 : 0}>
          <Casilla
            etiqueta="Sólo con stock disponible"
            activo={seleccion.disponibles}
            onChange={() =>
              actualizar((params) => {
                if (seleccion.disponibles) params.delete('disponibles');
                else params.set('disponibles', '1');
              })
            }
          />
        </Grupo>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`lg:border-t lg:border-[var(--surface-line)] lg:pt-10 ${
          hayGrupos ? 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-14 xl:gap-x-20' : ''
        }`}
      >
        {hayGrupos && (
          <aside
            aria-label="Filtros del catálogo"
            className="scroll-row hidden lg:sticky lg:top-[calc(var(--header-h)_+_1.5rem)] lg:-mx-1 lg:block lg:max-h-[calc(100dvh_-_var(--header-h)_-_3rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:px-1 lg:pb-8"
          >
            <div className="flex min-h-11 items-center justify-between gap-4 border-b border-[var(--surface-line)] pb-3">
              <h2 className="text-[1.375rem]">Filtros</h2>
              {activos > 0 && (
                <button type="button" onClick={limpiar} className={`${ENLACE_LIMPIAR} min-h-9`}>
                  Limpiar ({activos})
                </button>
              )}
            </div>
            {panel}
          </aside>
        )}

        <div className="min-w-0">
          {mostrarBarra && (
            <div className="sticky top-[var(--header-h)] z-30 -mx-5 flex border-y border-[var(--surface-line)] bg-[var(--surface-bg)]/95 backdrop-blur-md md:-mx-10 lg:static lg:mx-0 lg:min-h-11 lg:items-center lg:gap-8 lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
              {hayGrupos && (
                <>
                  <button
                    type="button"
                    onClick={() => setAbiertoMovil(true)}
                    aria-haspopup="dialog"
                    aria-expanded={abiertoMovil}
                    aria-controls={idCajon}
                    className="flex min-h-14 flex-1 items-center justify-center gap-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] focus-visible:outline-offset-[-3px] lg:hidden"
                  >
                    <IconoFiltros />
                    Filtrar
                    {activos > 0 && (
                      <>
                        <span
                          aria-hidden="true"
                          className="inline-flex h-5 min-w-5 items-center justify-center bg-[var(--acento)] px-1 text-[0.625rem] tabular-nums tracking-normal text-[var(--surface-bg)]"
                        >
                          {activos}
                        </span>
                        <span className="sr-only">
                          ({activos} {activos === 1 ? 'filtro activo' : 'filtros activos'})
                        </span>
                      </>
                    )}
                  </button>
                  <span aria-hidden="true" className="my-3 w-px bg-[var(--surface-line)] lg:hidden" />
                </>
              )}

              {/* En escritorio los filtros activos van en la misma línea que el orden. */}
              <div className="hidden min-w-0 lg:block lg:flex-1">
                {activos > 0 && <ListaChips chips={chips} onLimpiar={limpiar} />}
              </div>

              <SelectorOrden actual={ordenActual} onCambiar={cambiarOrden} />
            </div>
          )}

          {activos > 0 && <ListaChips chips={chips} onLimpiar={limpiar} className="mt-5 lg:hidden" />}

          <p role="status" aria-live="polite" className="sr-only">
            {pendiente ? 'Actualizando resultados…' : fragancias(total)}
          </p>

          <div
            ref={resultados}
            aria-busy={pendiente || undefined}
            className={`mt-8 transition-opacity duration-300 ease-[var(--ease-silk)] lg:mt-10 ${
              pendiente ? 'opacity-50' : ''
            }`}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Cajón móvil */}
      {hayGrupos && (
        <div
          aria-hidden={!abiertoMovil}
          inert={!abiertoMovil}
          className={`fixed inset-0 z-70 lg:hidden ${abiertoMovil ? '' : 'pointer-events-none'}`}
        >
          <div
            onClick={() => setAbiertoMovil(false)}
            className={`absolute inset-0 bg-noir/55 transition-opacity duration-400 ease-[var(--ease-silk)] ${
              abiertoMovil ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            ref={cajon}
            id={idCajon}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros del catálogo"
            data-surface="claro"
            className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] shadow-2xl transition-transform duration-400 ease-[var(--ease-silk)] ${
              abiertoMovil ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex min-h-16 shrink-0 items-center gap-2 border-b border-[var(--surface-line)] pl-5 pr-2">
              <h2 className="flex-1 text-[1.5rem]">Filtros</h2>
              {activos > 0 && (
                <button type="button" onClick={limpiar} className={`${ENLACE_LIMPIAR} min-h-11 px-2`}>
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => setAbiertoMovil(false)}
                aria-label="Cerrar filtros"
                className="flex size-11 items-center justify-center transition-colors duration-300 hover:text-[var(--acento)]"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5">{panel}</div>

            <div className="shrink-0 border-t border-[var(--surface-line)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <Button onClick={() => setAbiertoMovil(false)} className="w-full">
                {pendiente ? 'Actualizando…' : total > 0 ? `Ver ${fragancias(total)}` : 'Cerrar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ENLACE_LIMPIAR =
  'inline-flex items-center text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)] underline decoration-[var(--surface-line)] underline-offset-[0.55em] transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current';

/** Grupo plegable (patrón acordeón: título con botón y aria-expanded). */
function Grupo({
  titulo,
  abiertoInicial = true,
  activos = 0,
  children,
}: {
  titulo: string;
  abiertoInicial?: boolean;
  /** Filtros elegidos dentro del grupo: se indican en el título cuando está plegado. */
  activos?: number;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const id = useId();

  return (
    <div className="border-b border-[var(--surface-line)] last:border-b-0">
      <h3 className="font-[family-name:var(--font-sans)]">
        <button
          type="button"
          id={`${id}-titulo`}
          aria-expanded={abierto}
          aria-controls={`${id}-contenido`}
          onClick={() => setAbierto((valor) => !valor)}
          className="flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left text-[0.6875rem] font-medium uppercase leading-snug tracking-[0.24em] transition-colors duration-300 hover:text-[var(--acento)]"
        >
          <span>
            {titulo}
            {!abierto && activos > 0 && (
              <>
                <span aria-hidden="true" className="text-[var(--surface-muted)]">
                  {' '}
                  · {activos}
                </span>
                <span className="sr-only">
                  , {activos} {activos === 1 ? 'elegido' : 'elegidos'}
                </span>
              </>
            )}
          </span>
          <svg
            aria-hidden="true"
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="shrink-0 text-[var(--surface-muted)]"
          >
            <path d="M1 6h10" />
            {!abierto && <path d="M6 1v10" />}
          </svg>
        </button>
      </h3>
      <div
        id={`${id}-contenido`}
        role="group"
        aria-labelledby={`${id}-titulo`}
        hidden={!abierto}
        className="pb-5"
      >
        {children}
      </div>
    </div>
  );
}

/** Casilla cuadrada fina; el contador va en gris con cifras tabulares. */
function Casilla({
  etiqueta,
  total,
  activo,
  onChange,
}: {
  etiqueta: string;
  total?: number;
  activo: boolean;
  onChange: () => void;
}) {
  return (
    // 44 px de alto en el cajón táctil; en la columna de escritorio, más compacta.
    <label className="group/casilla relative flex min-h-11 cursor-pointer items-center gap-3 text-base lg:min-h-9 lg:text-[0.9375rem]">
      <input type="checkbox" checked={activo} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`flex size-4 shrink-0 items-center justify-center border transition-colors duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--foco)] ${
          activo
            ? 'border-[var(--acento)] bg-[var(--acento)] text-[var(--surface-bg)]'
            : 'border-[var(--surface-control)] group-hover/casilla:border-[var(--surface-fg)]'
        }`}
      >
        {activo && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
        )}
      </span>
      <span className="flex-1 leading-snug transition-colors duration-300 group-hover/casilla:text-[var(--acento)]">
        {etiqueta}
      </span>
      {total != null && (
        <span className="text-[0.75rem] tabular-nums text-[var(--surface-muted)]">{total}</span>
      )}
    </label>
  );
}

/** Lista de marcas con un campo para acotarla (sin tildes ni mayúsculas). */
function ListaMarcas({
  marcas,
  elegidas,
  onAlternar,
}: {
  marcas: Facetas['marcas'];
  elegidas: string[];
  onAlternar: (slug: string) => void;
}) {
  const [filtro, setFiltro] = useState('');
  const id = useId();
  const termino = normalizar(filtro);
  const visibles = termino ? marcas.filter((marca) => normalizar(marca.nombre).includes(termino)) : marcas;

  return (
    <>
      <div className="relative mb-2">
        <label htmlFor={id} className="sr-only">
          Buscar marca
        </label>
        <svg
          aria-hidden="true"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[var(--surface-muted)]"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          id={id}
          type="search"
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value)}
          placeholder="Buscar marca"
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full border-b border-[var(--surface-control)] bg-transparent pl-7 text-base outline-hidden transition-[border-color,box-shadow] duration-300 ease-[var(--ease-silk)] placeholder:text-[var(--surface-muted)] focus:border-[var(--foco)] focus:shadow-[inset_0_-1px_0_var(--foco)] [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>
      {/* En escritorio la lista se desplaza sola; en el cajón móvil desplaza el cajón entero. */}
      <div className="scroll-row lg:-ml-1 lg:max-h-72 lg:overflow-y-auto lg:overscroll-contain lg:pl-1 lg:pr-2">
        {visibles.length > 0 ? (
          visibles.map((marca) => (
            <Casilla
              key={marca.slug}
              etiqueta={marca.nombre}
              total={marca.total}
              activo={elegidas.includes(marca.slug)}
              onChange={() => onAlternar(marca.slug)}
            />
          ))
        ) : (
          <p className="py-3 text-[0.875rem] text-[var(--surface-muted)]">
            Ninguna marca coincide con «{filtro.trim()}».
          </p>
        )}
      </div>
    </>
  );
}

/** Filtros activos: uno por chip, con su «×», y «Limpiar todo» al final. */
function ListaChips({
  chips,
  onLimpiar,
  className = '',
}: {
  chips: Chip[];
  onLimpiar: () => void;
  className?: string;
}) {
  return (
    <ul aria-label="Filtros activos" className={`flex flex-wrap items-center gap-2 ${className}`}>
      {chips.map((chip) => (
        <li key={chip.clave}>
          <button
            type="button"
            onClick={chip.quitar}
            aria-label={`Quitar filtro: ${chip.etiqueta}`}
            className="group/chip inline-flex min-h-11 items-center gap-2.5 border border-[var(--surface-line)] pl-3.5 pr-3 text-[0.875rem] leading-none transition-colors duration-300 hover:border-[var(--surface-control)] lg:min-h-9"
          >
            {chip.etiqueta}
            <svg
              aria-hidden="true"
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="text-[var(--surface-muted)] transition-colors duration-300 group-hover/chip:text-[var(--acento)]"
            >
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={onLimpiar} className={`${ENLACE_LIMPIAR} min-h-11 px-2 lg:min-h-9`}>
          Limpiar todo
        </button>
      </li>
    </ul>
  );
}

/**
 * Orden: el <select> nativo va encima, invisible, y abre el selector del sistema
 * (la rueda de iOS, la hoja de Android) conservando su accesibilidad. Lo que se
 * ve es tipografía de la casa. Tiene 16 px para que iOS no amplíe la página.
 */
function SelectorOrden({ actual, onCambiar }: { actual: Orden; onCambiar: (valor: string) => void }) {
  return (
    <div className="relative flex min-h-14 flex-1 items-center justify-center gap-2.5 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-[-3px] has-[select:focus-visible]:outline-[var(--foco)] lg:min-h-11 lg:flex-none lg:justify-end lg:has-[select:focus-visible]:outline-offset-4">
      <span
        aria-hidden="true"
        className="flex items-center gap-2.5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] lg:hidden"
      >
        <IconoOrden />
        {actual.corta}
      </span>
      <span aria-hidden="true" className="hidden items-center gap-3 lg:flex">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Ordenar por
        </span>
        <span className="text-[0.9375rem]">{actual.etiqueta}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M2.5 4.5L6 8l3.5-3.5" />
        </svg>
      </span>
      <select
        aria-label="Ordenar por"
        value={actual.valor}
        onChange={(evento) => onCambiar(evento.target.value)}
        className="absolute inset-0 size-full cursor-pointer appearance-none text-base opacity-0"
      >
        {ORDENES.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}

function IconoFiltros() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M3 7h11M18 7h3M3 17h4M11 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

function IconoOrden() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 4v16M4.5 7.5L8 4l3.5 3.5M16 20V4M12.5 16.5L16 20l3.5-3.5" />
    </svg>
  );
}
