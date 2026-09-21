import Link from 'next/link';
import { facetas as calcularFacetas, listarProductos, type Filtros } from '@/lib/catalog';
import { EmptyState } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';
import { BuscadorCatalogo } from './BuscadorCatalogo';
import { EncabezadoCatalogo } from './EncabezadoCatalogo';
import { ProductFilters } from './ProductFilters';
import { ProductGrid } from './ProductGrid';

export type ParametrosBusqueda = Record<string, string | string[] | undefined>;

/** Claves de la URL que son filtros elegidos por el cliente (no búsqueda, orden ni página). */
const CLAVES_FILTRO = ['genero', 'tipo', 'marca', 'familia', 'precioMin', 'precioMax', 'disponibles'];

/** Convierte los parámetros de la URL en filtros validados. */
export function filtrosDesdeUrl(params: ParametrosBusqueda, base: Partial<Filtros> = {}): Filtros {
  const lista = (clave: string): string[] => {
    const valor = params[clave];
    if (!valor) return [];
    return Array.isArray(valor) ? valor : [valor];
  };
  const numero = (clave: string): number | undefined => {
    const valor = params[clave];
    const texto = Array.isArray(valor) ? valor[0] : valor;
    const parseado = Number(texto);
    return texto && Number.isFinite(parseado) ? parseado : undefined;
  };
  const texto = (clave: string): string | undefined => {
    const valor = params[clave];
    const item = Array.isArray(valor) ? valor[0] : valor;
    return item?.trim() || undefined;
  };

  const GENEROS_VALIDOS = ['DAMA', 'CABALLERO', 'UNISEX'];
  const TIPOS_VALIDOS = ['arabe', 'nicho', 'disenador', 'comercial'];

  return {
    q: texto('q'),
    genero: base.genero ?? lista('genero').filter((valor) => GENEROS_VALIDOS.includes(valor)),
    tipo: base.tipo ?? lista('tipo').filter((valor) => TIPOS_VALIDOS.includes(valor)),
    marca: base.marca ?? lista('marca'),
    familia: lista('familia'),
    precioMin: numero('precioMin'),
    precioMax: numero('precioMax'),
    disponibles: texto('disponibles') === '1',
    flag: base.flag ?? texto('flag'),
    orden: texto('orden'),
    pagina: numero('pagina') ?? 1,
    porPagina: base.porPagina,
  };
}

export async function CatalogView({
  titulo,
  eyebrow,
  descripcion,
  params,
  base = {},
  bloqueadas = [],
  rutaBase,
  imagen,
  buscador = false,
  volver,
  vacio,
}: {
  titulo: string;
  eyebrow?: string;
  descripcion?: string;
  params: ParametrosBusqueda;
  base?: Partial<Filtros>;
  bloqueadas?: string[];
  rutaBase: string;
  /** Foto editorial del encabezado (sólo presentacional). */
  imagen?: string;
  /** Buscador grande en el encabezado: sólo en el catálogo completo. */
  buscador?: boolean;
  /** Enlace de regreso sobre el índice (de una marca al listado de marcas). */
  volver?: { href: string; etiqueta: string };
  /** Textos para cuando la colección misma está vacía (no por los filtros). */
  vacio?: { titulo: string; texto: string };
}) {
  const filtros = filtrosDesdeUrl(params, base);
  const [resultado, facetas] = await Promise.all([
    listarProductos(filtros),
    calcularFacetas(filtros),
  ]);

  const consulta = new URLSearchParams();
  for (const [clave, valor] of Object.entries(params)) {
    if (clave === 'pagina' || valor == null) continue;
    for (const item of Array.isArray(valor) ? valor : [valor]) consulta.append(clave, item);
  }
  const enlace = (copia: URLSearchParams) => `${rutaBase}${copia.toString() ? `?${copia}` : ''}`;
  const urlPagina = (numero: number) => {
    const copia = new URLSearchParams(consulta);
    if (numero > 1) copia.set('pagina', String(numero));
    return enlace(copia);
  };
  /** La URL actual sin esas claves (y en la primera página). */
  const urlSin = (claves: string[]) => {
    const copia = new URLSearchParams(consulta);
    for (const clave of claves) copia.delete(clave);
    return enlace(copia);
  };

  // Filtros que de verdad aplican: los que fija la ruta (base) no cuentan.
  const libre = (clave: string) => !bloqueadas.includes(clave);
  const hayFiltros =
    (libre('genero') && Boolean(filtros.genero?.length)) ||
    (libre('tipo') && Boolean(filtros.tipo?.length)) ||
    (libre('marca') && Boolean(filtros.marca?.length)) ||
    Boolean(filtros.familia?.length) ||
    filtros.precioMin != null ||
    filtros.precioMax != null ||
    Boolean(filtros.disponibles);
  const coleccionVacia = resultado.total === 0 && !hayFiltros && !filtros.q;

  return (
    <div data-surface="claro">
      <EncabezadoCatalogo
        eyebrow={eyebrow}
        titulo={titulo}
        descripcion={descripcion}
        total={resultado.total}
        imagen={imagen}
        volver={volver}
      >
        {buscador && (
          // La clave reinicia el campo cuando cambia la búsqueda (p. ej. al quitarla).
          <BuscadorCatalogo
            key={filtros.q ?? ''}
            accion={rutaBase}
            consulta={filtros.q}
            orden={filtros.orden}
          />
        )}
        {filtros.q && (
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-base text-[var(--surface-muted)]">
            <span>
              Resultados para <span className="text-[var(--surface-fg)]">“{filtros.q}”</span>
            </span>
            <Link
              href={urlSin(['q'])}
              className="group inline-flex min-h-11 items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-fg)] underline decoration-[var(--surface-line)] underline-offset-[0.55em] transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current"
            >
              Quitar búsqueda
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </Link>
          </p>
        )}
      </EncabezadoCatalogo>

      <div className="shell pb-24 lg:pb-32">
        {coleccionVacia ? (
          // La colección no tiene referencias (p. ej. ninguna oferta activa):
          // sin filtros ni orden, que aquí no servirían de nada.
          <section className="border-t border-[var(--surface-line)] pt-10 lg:pt-14">
            <h2 className="sr-only">Resultados</h2>
            <EmptyState
              titulo={vacio?.titulo ?? 'Todavía no hay referencias aquí'}
              texto={vacio?.texto ?? 'Por ahora esta sección no tiene fragancias publicadas.'}
            >
              {rutaBase !== '/perfumes' && (
                <ButtonLink href="/perfumes" variante="contorno" className="mt-2">
                  Ver el catálogo
                </ButtonLink>
              )}
            </EmptyState>
          </section>
        ) : (
          <ProductFilters facetas={facetas} total={resultado.total} bloqueadas={bloqueadas}>
            <h2 className="sr-only">Resultados</h2>
            {resultado.items.length === 0 ? (
              <SinResultados
                q={filtros.q}
                hayFiltros={hayFiltros}
                fueraDeRango={resultado.total > 0}
                urlQuitarFiltros={urlSin(CLAVES_FILTRO)}
                urlQuitarBusqueda={urlSin(['q'])}
                urlPrimera={urlPagina(1)}
              />
            ) : (
              <>
                <ProductGrid productos={resultado.items} columnas={3} prioridadPrimeros={3} />
                <Paginacion
                  pagina={resultado.pagina}
                  paginas={resultado.paginas}
                  porPagina={resultado.porPagina}
                  total={resultado.total}
                  urlPagina={urlPagina}
                />
              </>
            )}
          </ProductFilters>
        )}
      </div>
    </div>
  );
}

/** Estado vacío con la salida más útil según lo que dejó la lista sin resultados. */
function SinResultados({
  q,
  hayFiltros,
  fueraDeRango,
  urlQuitarFiltros,
  urlQuitarBusqueda,
  urlPrimera,
}: {
  q?: string;
  hayFiltros: boolean;
  fueraDeRango: boolean;
  urlQuitarFiltros: string;
  urlQuitarBusqueda: string;
  urlPrimera: string;
}) {
  if (fueraDeRango) {
    // ?pagina=99 con resultados: la página pedida ya no existe.
    return (
      <EmptyState titulo="Esta página no existe" texto="La lista es más corta de lo que indica el enlace.">
        <ButtonLink href={urlPrimera} variante="contorno" className="mt-2">
          Ir a la primera página
        </ButtonLink>
      </EmptyState>
    );
  }

  if (hayFiltros) {
    return (
      <EmptyState
        titulo="Sin coincidencias"
        texto={
          q
            ? 'Ninguna fragancia cumple a la vez la búsqueda y los filtros elegidos. Intenta quitar alguno.'
            : 'Ninguna fragancia cumple todos los filtros elegidos. Intenta quitar alguno.'
        }
      >
        <ButtonLink href={urlQuitarFiltros} variante="contorno" className="mt-2">
          Quitar filtros
        </ButtonLink>
      </EmptyState>
    );
  }

  return (
    <EmptyState
      titulo="Sin coincidencias"
      texto={`No encontramos fragancias para “${q ?? ''}”. Revisa la ortografía o busca por marca, nombre o código.`}
    >
      <ButtonLink href={urlQuitarBusqueda} variante="contorno" className="mt-2">
        Ver todas las fragancias
      </ButtonLink>
    </EmptyState>
  );
}

const PASO =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 px-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] transition-colors duration-300 hover:text-[var(--acento)]';

/**
 * Paginación tipográfica: «Anterior · 1 2 … 13 · Siguiente», sin cajas.
 * En móvil los números se resumen en «7 / 13» para que quepa en una línea.
 */
function Paginacion({
  pagina,
  paginas,
  porPagina,
  total,
  urlPagina,
}: {
  pagina: number;
  paginas: number;
  porPagina: number;
  total: number;
  urlPagina: (numero: number) => string;
}) {
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <div className="mt-20 flex flex-col-reverse items-center gap-5 border-t border-[var(--surface-line)] pt-6 sm:flex-row sm:justify-between lg:mt-28">
      <p className="text-[0.8125rem] tabular-nums text-[var(--surface-muted)]">
        Mostrando {desde}–{hasta} de {total}
      </p>

      {paginas > 1 && (
        <nav aria-label="Paginación">
          <ul className="flex items-center">
            {pagina > 1 && (
              <>
                <li>
                  <Link href={urlPagina(pagina - 1)} rel="prev" className={PASO}>
                    <span aria-hidden="true">←</span>
                    {/* En pantallas muy estrechas sólo la flecha, para no desbordar. */}
                    <span className="max-[380px]:sr-only">Anterior</span>
                  </Link>
                </li>
                <li aria-hidden="true" className="px-1 text-[var(--surface-muted)] max-sm:hidden">
                  ·
                </li>
              </>
            )}

            {paginasVisibles(pagina, paginas).map((numero, indice) =>
              numero === null ? (
                <li
                  key={`hueco-${indice}`}
                  aria-hidden="true"
                  className="w-7 text-center text-[var(--surface-muted)] max-sm:hidden"
                >
                  …
                </li>
              ) : (
                <li key={numero} className="max-sm:hidden">
                  <Link
                    href={urlPagina(numero)}
                    aria-label={`Página ${numero}`}
                    aria-current={numero === pagina ? 'page' : undefined}
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center text-[0.9375rem] tabular-nums transition-colors duration-300 ${
                      numero === pagina
                        ? 'text-[var(--surface-fg)] underline decoration-[var(--acento)] decoration-[1.5px] underline-offset-[0.6em]'
                        : 'text-[var(--surface-muted)] hover:text-[var(--surface-fg)]'
                    }`}
                  >
                    {numero}
                  </Link>
                </li>
              ),
            )}

            <li className="px-4 text-[0.875rem] tabular-nums text-[var(--surface-muted)] sm:hidden">
              <span aria-hidden="true">
                {pagina} / {paginas}
              </span>
              <span className="sr-only">
                Página {pagina} de {paginas}
              </span>
            </li>

            {pagina < paginas && (
              <>
                <li aria-hidden="true" className="px-1 text-[var(--surface-muted)] max-sm:hidden">
                  ·
                </li>
                <li>
                  <Link href={urlPagina(pagina + 1)} rel="next" className={`${PASO} sm:-mr-3`}>
                    <span className="max-[380px]:sr-only">Siguiente</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}

function paginasVisibles(actual: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, indice) => indice + 1);
  const paginas = new Set<number>([1, total, actual, actual - 1, actual + 1]);
  const ordenadas = [...paginas].filter((numero) => numero >= 1 && numero <= total).sort((a, b) => a - b);
  const resultado: (number | null)[] = [];
  let anterior = 0;
  for (const numero of ordenadas) {
    if (anterior && numero - anterior > 1) resultado.push(null);
    resultado.push(numero);
    anterior = numero;
  }
  return resultado;
}
