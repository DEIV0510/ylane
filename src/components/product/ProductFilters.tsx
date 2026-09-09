'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Facetas } from '@/lib/catalog';
import { GENERO_ETIQUETA, TIPO_ETIQUETA, formatCOP } from '@/lib/format';

type Props = {
  facetas: Facetas;
  total: number;
  /** Dimensiones que la ruta ya fija (ej. /arabes fija el tipo) y no se muestran. */
  bloqueadas?: string[];
};

const ORDENES = [
  { valor: '', etiqueta: 'Recomendados' },
  { valor: 'novedades', etiqueta: 'Novedades' },
  { valor: 'nombre', etiqueta: 'Nombre A–Z' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
];

export function ProductFilters({ facetas, total, bloqueadas = [] }: Props) {
  const router = useRouter();
  const ruta = usePathname();
  const parametros = useSearchParams();
  const [pendiente, iniciarTransicion] = useTransition();
  const [abiertoMovil, setAbiertoMovil] = useState(false);

  const seleccion = useMemo(
    () => ({
      genero: parametros.getAll('genero'),
      marca: parametros.getAll('marca'),
      tipo: parametros.getAll('tipo'),
      familia: parametros.getAll('familia'),
      disponibles: parametros.get('disponibles') === '1',
      orden: parametros.get('orden') ?? '',
      q: parametros.get('q') ?? '',
    }),
    [parametros],
  );

  useEffect(() => {
    if (!abiertoMovil) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abiertoMovil]);

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

  const activos =
    seleccion.genero.length +
    seleccion.marca.length +
    seleccion.tipo.length +
    seleccion.familia.length +
    (seleccion.disponibles ? 1 : 0);

  const limpiar = () =>
    actualizar((params) => {
      for (const clave of ['genero', 'marca', 'tipo', 'familia', 'disponibles']) params.delete(clave);
    });

  const panel = (
    <div className="space-y-8">
      {!bloqueadas.includes('genero') && facetas.generos.length > 1 && (
        <Grupo titulo="Género">
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

      {!bloqueadas.includes('tipo') && facetas.tipos.length > 1 && (
        <Grupo titulo="Tipo de perfumería">
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

      {!bloqueadas.includes('marca') && facetas.marcas.length > 0 && (
        <Grupo titulo="Marca" desplazable>
          {facetas.marcas.map((item) => (
            <Casilla
              key={item.slug}
              etiqueta={item.nombre}
              total={item.total}
              activo={seleccion.marca.includes(item.slug)}
              onChange={() => alternar('marca', item.slug)}
            />
          ))}
        </Grupo>
      )}

      {facetas.familias.length > 0 && (
        <Grupo titulo="Familia olfativa">
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

      <Grupo titulo="Disponibilidad">
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

      {facetas.precio.min != null && facetas.precio.max != null && (
        <Grupo titulo="Precio">
          <p className="text-[0.78rem] text-[var(--surface-muted)]">
            {facetas.conPrecio} referencias con precio publicado, entre{' '}
            {formatCOP(facetas.precio.min)} y {formatCOP(facetas.precio.max)}.
          </p>
        </Grupo>
      )}

      {activos > 0 && (
        <button
          type="button"
          onClick={limpiar}
          className="w-full border border-[var(--surface-line)] py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--surface-muted)] transition-colors hover:border-champagne hover:text-champagne"
        >
          Limpiar filtros ({activos})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Barra superior: ocupa el ancho completo de la rejilla del catálogo */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--surface-line)] py-3 lg:col-span-2">
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
          {pendiente ? 'Actualizando…' : `${total} ${total === 1 ? 'referencia' : 'referencias'}`}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAbiertoMovil(true)}
            className="flex items-center gap-2 border border-[var(--surface-line)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-colors hover:border-champagne hover:text-champagne lg:hidden"
          >
            Filtros{activos > 0 ? ` (${activos})` : ''}
          </button>

          <label className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            <span className="hidden sm:inline">Ordenar</span>
            <select
              value={seleccion.orden}
              onChange={(evento) =>
                actualizar((params) => {
                  if (evento.target.value) params.set('orden', evento.target.value);
                  else params.delete('orden');
                })
              }
              className="border border-[var(--surface-line)] bg-transparent px-3 py-2 text-[0.68rem] tracking-normal text-[var(--surface-fg)] outline-none focus:border-champagne"
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor} className="bg-noir text-marfil">
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Panel de escritorio */}
      <aside className="hidden lg:block lg:self-start lg:sticky lg:top-28">{panel}</aside>

      {/* Panel móvil */}
      <div
        aria-hidden={!abiertoMovil}
        className={`fixed inset-0 z-70 lg:hidden ${abiertoMovil ? '' : 'pointer-events-none'}`}
      >
        <div
          onClick={() => setAbiertoMovil(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
            abiertoMovil ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col border-r border-[var(--surface-line)] bg-noir-soft transition-transform duration-400 ease-[var(--ease-silk)] ${
            abiertoMovil ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--surface-line)] px-5 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-marfil">Filtros</p>
            <button
              type="button"
              onClick={() => setAbiertoMovil(false)}
              aria-label="Cerrar filtros"
              className="p-1 text-marfil-dim hover:text-champagne"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 text-marfil">{panel}</div>
          <button
            type="button"
            onClick={() => setAbiertoMovil(false)}
            className="border-t border-[var(--surface-line)] bg-vino py-4 text-[0.7rem] uppercase tracking-[0.2em] text-marfil"
          >
            Ver {total} referencias
          </button>
        </div>
      </div>
    </>
  );
}

function Grupo({
  titulo,
  children,
  desplazable = false,
}: {
  titulo: string;
  children: React.ReactNode;
  desplazable?: boolean;
}) {
  return (
    <div>
      <h3 className="eyebrow mb-3">{titulo}</h3>
      <div className={desplazable ? 'max-h-64 space-y-1.5 overflow-y-auto pr-2 scroll-row' : 'space-y-1.5'}>
        {children}
      </div>
    </div>
  );
}

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
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[0.82rem] transition-colors hover:text-champagne">
      <input type="checkbox" checked={activo} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`flex size-4 shrink-0 items-center justify-center border transition-colors ${
          activo ? 'border-champagne bg-champagne text-noir' : 'border-current/35'
        }`}
      >
        {activo && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
        )}
      </span>
      <span className="flex-1">{etiqueta}</span>
      {total != null && <span className="text-[0.7rem] text-[var(--surface-muted)]">{total}</span>}
    </label>
  );
}
