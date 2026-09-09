import Link from 'next/link';
import { facetas as calcularFacetas, listarProductos, type Filtros } from '@/lib/catalog';
import { EmptyState } from '@/components/ui/Bits';
import { ProductFilters } from './ProductFilters';
import { ProductGrid } from './ProductGrid';

export type ParametrosBusqueda = Record<string, string | string[] | undefined>;

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
}: {
  titulo: string;
  eyebrow?: string;
  descripcion?: string;
  params: ParametrosBusqueda;
  base?: Partial<Filtros>;
  bloqueadas?: string[];
  rutaBase: string;
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
  const urlPagina = (numero: number) => {
    const copia = new URLSearchParams(consulta.toString());
    if (numero > 1) copia.set('pagina', String(numero));
    return `${rutaBase}${copia.toString() ? `?${copia}` : ''}`;
  };

  return (
    <div data-surface="oscuro">
      <header className="border-b border-[var(--surface-line)]">
        <div className="shell py-14 lg:py-20">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="display-lg">{titulo}</h1>
          {descripcion && (
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
              {descripcion}
            </p>
          )}
          {filtros.q && (
            <p className="mt-4 text-[0.85rem] text-[var(--surface-muted)]">
              Resultados para <span className="text-champagne">“{filtros.q}”</span>
            </p>
          )}
        </div>
      </header>

      <div className="shell grid gap-x-14 gap-y-10 py-10 lg:grid-cols-[16rem_1fr] lg:py-14">
        <ProductFilters facetas={facetas} total={resultado.total} bloqueadas={bloqueadas} />

        <div className="min-w-0">
          {resultado.items.length === 0 ? (
            <EmptyState
              titulo="No encontramos referencias"
              texto="Prueba con otros filtros o busca por marca, nombre o código."
            >
              <Link
                href={rutaBase}
                className="mt-2 border border-current/35 px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] transition-colors hover:border-champagne hover:text-champagne"
              >
                Quitar filtros
              </Link>
            </EmptyState>
          ) : (
            <>
              <ProductGrid productos={resultado.items} prioridadPrimeros={4} />

              {resultado.paginas > 1 && (
                <nav
                  aria-label="Paginación"
                  className="mt-14 flex flex-wrap items-center justify-center gap-2"
                >
                  {resultado.pagina > 1 && (
                    <Link
                      href={urlPagina(resultado.pagina - 1)}
                      className="border border-[var(--surface-line)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-colors hover:border-champagne hover:text-champagne"
                    >
                      Anterior
                    </Link>
                  )}
                  {paginasVisibles(resultado.pagina, resultado.paginas).map((numero, indice) =>
                    numero === null ? (
                      <span key={`hueco-${indice}`} className="px-2 text-[var(--surface-muted)]">
                        …
                      </span>
                    ) : (
                      <Link
                        key={numero}
                        href={urlPagina(numero)}
                        aria-current={numero === resultado.pagina ? 'page' : undefined}
                        className={`min-w-10 border px-3 py-2 text-center text-[0.72rem] transition-colors ${
                          numero === resultado.pagina
                            ? 'border-champagne bg-champagne text-noir'
                            : 'border-[var(--surface-line)] hover:border-champagne hover:text-champagne'
                        }`}
                      >
                        {numero}
                      </Link>
                    ),
                  )}
                  {resultado.pagina < resultado.paginas && (
                    <Link
                      href={urlPagina(resultado.pagina + 1)}
                      className="border border-[var(--surface-line)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] transition-colors hover:border-champagne hover:text-champagne"
                    >
                      Siguiente
                    </Link>
                  )}
                </nav>
              )}

              <p className="mt-6 text-center text-[0.72rem] text-[var(--surface-muted)]">
                Página {resultado.pagina} de {resultado.paginas} · {resultado.total} referencias
              </p>
            </>
          )}
        </div>
      </div>
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
