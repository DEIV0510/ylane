'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as EventoTeclado,
  type MouseEvent as EventoRaton,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCOP, GENERO_ETIQUETA, nombreSinMarca } from '@/lib/format';
import { normalizar } from '@/lib/text';
import { ProductPlaceholder } from '@/components/product/ProductPlaceholder';
import { ButtonLink } from '@/components/ui/Button';
import { trackEvento } from '@/lib/analytics';
import { useFocusTrap } from '@/lib/use-focus-trap';

type Sugerencia = {
  id: number;
  slug: string;
  nombre: string;
  codigo: string;
  genero: string;
  precio: number | null;
  marca: string | null;
  imagen: string | null;
};

type MarcaSugerida = { slug: string; nombre: string; total: number };

/** Última respuesta de la API y el texto que la produjo: si no coincide con el campo, ya es vieja. */
type Resultado = { para: string; items: Sugerencia[]; marcas: MarcaSugerida[]; fallo: boolean };

type AlNavegar = (evento: EventoRaton<HTMLAnchorElement>) => void;
type AlElegir = (termino: string, evento: EventoRaton<HTMLButtonElement>) => void;

/**
 * Colecciones de la tienda. `claves` (sin tildes) son las palabras con las que
 * aparecen al escribir: «dama» lleva a Mujer y «caballero» a Hombre. «Perfumería»
 * no es clave a propósito: casi todas las búsquedas incluyen «perfume».
 */
const COLECCIONES = [
  { nombre: 'Perfumería árabe', href: '/arabes', claves: ['arabe', 'arabes', 'arabia'] },
  { nombre: 'Mujer', href: '/mujer', claves: ['mujer', 'mujeres', 'dama', 'damas', 'femenino', 'femenina'] },
  { nombre: 'Hombre', href: '/hombre', claves: ['hombre', 'hombres', 'caballero', 'caballeros', 'masculino'] },
  { nombre: 'Unisex', href: '/unisex', claves: ['unisex'] },
  { nombre: 'Nicho', href: '/perfumes?tipo=nicho', claves: ['nicho', 'nichos'] },
  { nombre: 'Diseñador', href: '/perfumes?tipo=disenador', claves: ['disenador', 'disenadores'] },
];

/** Comprobadas contra el catálogo: todas devuelven resultados. */
const BUSQUEDAS_FRECUENTES = ['Lattafa', 'Afnan', 'Armaf', 'Al Haramain', 'Dior', 'Oud'];

/** Lo que recorren las flechas del teclado, en el orden en que se lee. */
const RESULTADO = '[data-resultado]';

/**
 * Una colección coincide si alguna palabra escrita es el comienzo de una de sus
 * claves («muj» → Mujer) o, si la clave es larga, empieza por ella
 * («arabian» → Perfumería árabe). Las palabras de una letra no cuentan.
 */
function coleccionesQueCoinciden(texto: string) {
  const palabras = normalizar(texto)
    .split(/\s+/)
    .filter((palabra) => palabra.length >= 2);
  if (!palabras.length) return [];
  return COLECCIONES.filter((coleccion) =>
    palabras.some((palabra) =>
      coleccion.claves.some(
        (clave) => clave.startsWith(palabra) || (clave.length >= 5 && palabra.startsWith(clave)),
      ),
    ),
  );
}

/** «8 perfumes, 1 marca y 1 colección»: lo que el lector de pantalla anuncia al terminar. */
function resumen(perfumes: number, marcas: number, colecciones: number): string {
  const partes = [
    perfumes ? `${perfumes} ${perfumes === 1 ? 'perfume' : 'perfumes'}` : '',
    marcas ? `${marcas} ${marcas === 1 ? 'marca' : 'marcas'}` : '',
    colecciones ? `${colecciones} ${colecciones === 1 ? 'colección' : 'colecciones'}` : '',
  ].filter(Boolean);
  if (partes.length < 2) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

export function SearchOverlay({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const [termino, setTermino] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  // El contenido se monta la primera vez que se abre: las páginas no cargan (ni
  // precargan) enlaces que la mayoría de las visitas nunca llega a ver.
  const [montado, setMontado] = useState(false);
  if (abierto && !montado) setMontado(true);

  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const zona = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, abierto);

  // La cabecera pasa una función nueva en cada render. Se guarda en una ref para
  // que un render de la cabecera no reinicie el efecto ni devuelva el foco al campo.
  const cerrar = useRef(onCerrar);
  useEffect(() => {
    cerrar.current = onCerrar;
  }, [onCerrar]);

  const id = useId();
  const idCampo = `${id}-campo`;
  const idAyuda = `${id}-ayuda`;

  const texto = termino.trim();
  const consultando = texto.length >= 2;
  // Mientras llega la respuesta del texto actual se sigue mostrando la anterior, atenuada.
  const pendiente = consultando && resultado?.para !== texto;
  const colecciones = consultando ? coleccionesQueCoinciden(texto) : [];
  const items = resultado?.items ?? [];
  const marcas = resultado?.marcas ?? [];
  const fallo = resultado?.fallo ?? false;
  const sinResultados =
    resultado != null && !fallo && items.length + marcas.length + colecciones.length === 0;
  const hrefCatalogo = `/perfumes?q=${encodeURIComponent(texto)}`;
  const atenuado = pendiente ? 'opacity-50' : 'opacity-100';

  const anuncio =
    !consultando || pendiente || !resultado
      ? ''
      : fallo
        ? 'No se pudo completar la búsqueda.'
        : sinResultados
          ? `Sin resultados para ${resultado.para}.`
          : `${resumen(items.length, marcas.length, colecciones.length)}.`;

  useEffect(() => {
    if (!abierto) return;
    zona.current?.scrollTo({ top: 0 });
    // El foco va directo al campo, antes de que la trampa de foco elija el primer
    // enfocable (el botón de cerrar): así no parpadea un anillo de foco al abrir.
    const campo = entrada.current;
    campo?.focus({ preventScroll: true });
    // Con ratón, la búsqueda anterior queda seleccionada: escribir la reemplaza.
    if (campo?.value && window.matchMedia('(pointer: fine)').matches) campo.select();
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape' || evento.isComposing) return;
      // Sin esto el campo de búsqueda nativo se vacía con Escape antes de cerrar.
      evento.preventDefault();
      cerrar.current();
    };
    document.addEventListener('keydown', alPulsar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = anterior;
    };
  }, [abierto]);

  // Alto que tapa el teclado del móvil: la lista lo reserva al final, así el
  // último resultado se puede leer por encima del teclado.
  useEffect(() => {
    const vista = window.visualViewport;
    const nodo = panel.current;
    if (!abierto || !vista || !nodo) return;
    const medir = () => {
      const tapado = Math.max(0, window.innerHeight - vista.height - vista.offsetTop);
      nodo.style.setProperty('--teclado', `${Math.round(tapado)}px`);
    };
    medir();
    vista.addEventListener('resize', medir);
    vista.addEventListener('scroll', medir);
    return () => {
      vista.removeEventListener('resize', medir);
      vista.removeEventListener('scroll', medir);
      nodo.style.removeProperty('--teclado');
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    if (texto.length < 2) {
      setResultado(null);
      return;
    }
    const control = new AbortController();
    const temporizador = window.setTimeout(async () => {
      try {
        const respuesta = await fetch(`/api/buscar?q=${encodeURIComponent(texto)}`, {
          signal: control.signal,
        });
        if (!respuesta.ok) throw new Error('respuesta no válida');
        const datos = (await respuesta.json()) as { items?: Sugerencia[]; marcas?: MarcaSugerida[] };
        setResultado({ para: texto, items: datos.items ?? [], marcas: datos.marcas ?? [], fallo: false });
        trackEvento('Search', { search_string: texto });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setResultado({ para: texto, items: [], marcas: [], fallo: true });
        }
      }
    }, 220);

    return () => {
      control.abort();
      window.clearTimeout(temporizador);
    };
  }, [texto, abierto]);

  const irAlCatalogo = () => {
    if (!texto) return;
    onCerrar();
    router.push(hrefCatalogo);
  };

  // Con Ctrl, Cmd o Mayús el enlace se abre aparte: el buscador sigue abierto aquí.
  const alNavegar: AlNavegar = (evento) => {
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    onCerrar();
  };

  const elegirTermino: AlElegir = (valor, evento) => {
    setTermino(valor);
    zona.current?.scrollTo({ top: 0 });
    // Con teclado (detail 0) el foco vuelve al campo; con el dedo se queda en la
    // lista, para no abrir el teclado del móvil encima de los resultados.
    if (evento.detail === 0) entrada.current?.focus();
    else zona.current?.focus({ preventScroll: true });
  };

  const borrar = () => {
    setTermino('');
    entrada.current?.focus();
  };

  const alPulsarEnCampo = (evento: EventoTeclado<HTMLInputElement>) => {
    if (evento.key !== 'ArrowDown') return;
    const primero = zona.current?.querySelector<HTMLElement>(RESULTADO);
    if (!primero) return;
    evento.preventDefault();
    primero.focus();
  };

  // Teclado en la lista: escribir devuelve el foco al campo (la letra cae en la
  // búsqueda) y las flechas recorren los resultados en orden de lectura; subir
  // desde el primero vuelve al campo. Tab sigue funcionando igual.
  const alPulsarEnZona = (evento: EventoTeclado<HTMLDivElement>) => {
    const imprimible =
      evento.key.length === 1 && evento.key !== ' ' && !evento.ctrlKey && !evento.metaKey && !evento.altKey;
    if (imprimible) {
      entrada.current?.focus();
      return;
    }
    const actual = evento.target as HTMLElement;
    if (!actual.matches(RESULTADO)) return;
    const paso =
      evento.key === 'ArrowDown' || evento.key === 'ArrowRight'
        ? 1
        : evento.key === 'ArrowUp' || evento.key === 'ArrowLeft'
          ? -1
          : 0;
    if (paso) {
      evento.preventDefault();
      const lista = Array.from(zona.current?.querySelectorAll<HTMLElement>(RESULTADO) ?? []);
      const destino = lista.indexOf(actual) + paso;
      if (destino < 0) entrada.current?.focus();
      else lista[Math.min(destino, lista.length - 1)]?.focus();
    }
  };

  // En el móvil, deslizar la lista esconde el teclado para ver los resultados completos.
  const alDeslizar = () => {
    if (document.activeElement === entrada.current) zona.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar perfumes"
      aria-hidden={!abierto}
      inert={!abierto}
      data-surface="claro"
      className={`fixed inset-0 z-80 flex flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] transition-opacity ease-[var(--ease-silk)] ${
        abierto ? 'opacity-100 duration-500' : 'pointer-events-none opacity-0 duration-300'
      }`}
    >
      {montado && (
        // Al abrir, el contenido sube apenas mientras aparece (también la primera vez,
        // cuando acaba de montarse). Sin animación si se pide menos movimiento.
        <div
          className={`flex min-h-0 flex-1 flex-col ${
            abierto ? 'animate-[ylane-fade-up_0.5s_var(--ease-silk)_both] motion-reduce:animate-none' : ''
          }`}
        >
          {/* Misma altura que la cabecera: cerrar queda donde estaba la lupa. */}
          <div className="shell flex h-16 shrink-0 items-center justify-between md:h-20">
            <label htmlFor={idCampo} className="eyebrow">
              Buscar
            </label>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar búsqueda"
              className="-mr-3 flex min-h-11 min-w-11 items-center justify-center gap-3 px-3 text-[0.6875rem] font-medium uppercase tracking-[0.24em] transition-colors duration-300 hover:text-[var(--acento)]"
            >
              <span className="hidden sm:inline">Cerrar</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="size-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* El campo va arriba y fuera de la zona que se desplaza: el teclado del móvil nunca lo tapa. */}
          <div className="shell shrink-0 pt-1 md:pt-8 lg:pt-10">
            <form
              role="search"
              action="/perfumes"
              method="get"
              onSubmit={(evento) => {
                evento.preventDefault();
                irAlCatalogo();
              }}
            >
              <div className="flex items-center gap-3 border-b border-[var(--surface-control)] transition-[border-color,box-shadow] duration-300 ease-[var(--ease-silk)] focus-within:border-[var(--foco)] focus-within:shadow-[inset_0_-1px_0_var(--foco)] md:gap-5">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  className="size-[1.375rem] shrink-0 text-[var(--surface-muted)] md:size-7 lg:size-8"
                >
                  <circle cx="11" cy="11" r="7" vectorEffect="non-scaling-stroke" />
                  <path d="M20 20l-3.6-3.6" vectorEffect="non-scaling-stroke" />
                </svg>
                {/*
                  Lo escrito va en Bodoni grande. El texto de ejemplo (placeholder)
                  mide ~14,8 em: sólo en pantallas estrechas se encoge para leerse
                  entero. Ambos comparten la altura de línea y quedan centrados igual.
                */}
                <input
                  ref={entrada}
                  id={idCampo}
                  name="q"
                  type="search"
                  value={termino}
                  onChange={(evento) => setTermino(evento.target.value)}
                  onKeyDown={alPulsarEnCampo}
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={80}
                  placeholder="¿Qué fragancia estás buscando?"
                  aria-describedby={idAyuda}
                  className="min-w-0 flex-1 appearance-none rounded-none bg-transparent py-2 font-[family-name:var(--font-display)] text-[length:var(--campo)] leading-[calc(var(--campo)*1.2)] tracking-[-0.01em] text-[var(--surface-fg)] outline-hidden [--campo:clamp(1.8rem,5vw,3.4rem)] placeholder:text-[length:min(var(--campo),calc((100vw_-_4.625rem)/15.4))] placeholder:text-[var(--surface-muted)] placeholder:opacity-100 md:py-3 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                />
                {termino && (
                  <button
                    type="button"
                    onClick={borrar}
                    aria-label="Borrar búsqueda"
                    className="-mr-2 flex min-h-11 shrink-0 items-center px-2 text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)] transition-colors duration-300 hover:text-[var(--acento)]"
                  >
                    Borrar
                  </button>
                )}
              </div>
              {/* En el móvil la ayuda se retira al buscar: deja sitio a los resultados sobre el teclado. */}
              <p
                id={idAyuda}
                className={`mt-3 text-base text-[var(--surface-muted)] lg:text-[0.9375rem] ${
                  consultando ? 'max-sm:sr-only' : ''
                }`}
              >
                Busca por nombre, marca, código o colección
              </p>
            </form>
          </div>

          <p role="status" className="sr-only">
            {anuncio}
          </p>

          <div
            ref={zona}
            tabIndex={-1}
            onKeyDown={alPulsarEnZona}
            onTouchMove={alDeslizar}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-hidden"
          >
            <div className="shell pb-[calc(4rem_+_var(--teclado,0px)_+_env(safe-area-inset-bottom))] pt-7 md:pt-12 lg:pt-14">
              {!consultando ? (
                <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
                  <section aria-labelledby={`${id}-frecuentes`} className="lg:col-span-4">
                    <Rotulo id={`${id}-frecuentes`}>Sugerencias</Rotulo>
                    <Sugerencias onElegir={elegirTermino} />
                  </section>

                  <section aria-labelledby={`${id}-colecciones`} className="lg:col-span-7 lg:col-start-6">
                    <Rotulo id={`${id}-colecciones`}>Colecciones</Rotulo>
                    <ul className="border-t border-[var(--surface-line)]">
                      {COLECCIONES.map((coleccion) => (
                        <FilaEnlace
                          key={coleccion.href}
                          href={coleccion.href}
                          titulo={coleccion.nombre}
                          grande
                          onClick={alNavegar}
                        />
                      ))}
                    </ul>
                  </section>
                </div>
              ) : fallo ? (
                <div className={`max-w-2xl transition-opacity duration-300 ${atenuado}`}>
                  <h2 className="display-md">No pudimos completar la búsqueda</h2>
                  <p className="mt-4 max-w-xl text-base text-[var(--surface-muted)]">
                    Vuelve a intentarlo en un momento o ábrela directamente en el catálogo.
                  </p>
                  <ButtonLink
                    href={hrefCatalogo}
                    variante="contorno"
                    onClick={alNavegar}
                    data-resultado
                    className="mt-8"
                  >
                    Buscar en el catálogo
                  </ButtonLink>
                </div>
              ) : sinResultados ? (
                <div className={`max-w-2xl transition-opacity duration-300 ${atenuado}`}>
                  <h2 className="display-md [overflow-wrap:anywhere]">
                    Sin resultados para <em>«{resultado?.para}»</em>
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-[var(--surface-muted)]">
                    Revisa cómo está escrito o prueba con la marca, una palabra del nombre o el código de
                    referencia (por ejemplo, P001).
                  </p>
                  <div className="mt-10">
                    <Rotulo>Prueba con</Rotulo>
                    <Sugerencias onElegir={elegirTermino} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-10" aria-busy={pendiente}>
                  {(colecciones.length > 0 || marcas.length > 0) && (
                    <div className="flex flex-col gap-10 lg:col-span-4">
                      {colecciones.length > 0 && (
                        <section aria-labelledby={`${id}-en-colecciones`}>
                          <Rotulo id={`${id}-en-colecciones`}>Colecciones</Rotulo>
                          <ul className="border-t border-[var(--surface-line)]">
                            {colecciones.map((coleccion) => (
                              <FilaEnlace
                                key={coleccion.href}
                                href={coleccion.href}
                                titulo={coleccion.nombre}
                                onClick={alNavegar}
                              />
                            ))}
                          </ul>
                        </section>
                      )}
                      {marcas.length > 0 && (
                        <section aria-labelledby={`${id}-marcas`}>
                          <Rotulo id={`${id}-marcas`}>Marcas</Rotulo>
                          <ul
                            className={`border-t border-[var(--surface-line)] transition-opacity duration-300 ${atenuado}`}
                          >
                            {marcas.map((marca) => (
                              <FilaEnlace
                                key={marca.slug}
                                href={`/marcas/${marca.slug}`}
                                titulo={marca.nombre}
                                detalle={`${marca.total} ${marca.total === 1 ? 'referencia' : 'referencias'}`}
                                onClick={alNavegar}
                              />
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}

                  <section aria-labelledby={`${id}-perfumes`} className="lg:col-span-7 lg:col-start-6">
                    <Rotulo id={`${id}-perfumes`} ocupado={pendiente}>
                      Perfumes
                    </Rotulo>
                    {items.length > 0 ? (
                      <>
                        <ul
                          className={`divide-y divide-[var(--surface-line)] transition-opacity duration-300 ${atenuado}`}
                        >
                          {items.map((item) => (
                            <FilaPerfume key={item.id} item={item} onClick={alNavegar} />
                          ))}
                        </ul>
                        <ButtonLink
                          href={hrefCatalogo}
                          variante="contorno"
                          onClick={alNavegar}
                          data-resultado
                          className="mt-8 w-full sm:w-auto"
                        >
                          Ver todos los resultados
                          <Flecha className="size-4" />
                        </ButtonLink>
                      </>
                    ) : (
                      !pendiente && (
                        <p className="text-base text-[var(--surface-muted)] [overflow-wrap:anywhere]">
                          Ningún perfume coincide con «{texto}».
                        </p>
                      )
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Piezas del buscador ─────────────────────────────────────────────── */

/** Título de bloque: versalitas en el color de acento y un hilo hasta el borde. */
function Rotulo({ id, children, ocupado }: { id?: string; children: ReactNode; ocupado?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-4 lg:mb-6">
      <h2
        id={id}
        className="shrink-0 font-[family-name:var(--font-sans)] text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[var(--acento)]"
      >
        {children}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--surface-line)]" />
      {ocupado !== undefined && (
        // Aviso visual discreto; el lector de pantalla recibe el resumen final por role=status.
        <span
          aria-hidden="true"
          className={`shrink-0 text-[0.6875rem] uppercase tracking-[0.24em] text-[var(--surface-muted)] transition-opacity duration-300 ${
            ocupado ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Buscando…
        </span>
      )}
    </div>
  );
}

function Sugerencias({ onElegir }: { onElegir: AlElegir }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {BUSQUEDAS_FRECUENTES.map((sugerencia) => (
        <li key={sugerencia}>
          <button
            type="button"
            data-resultado
            aria-label={`Buscar ${sugerencia}`}
            onClick={(evento) => onElegir(sugerencia, evento)}
            className="min-h-11 border border-[var(--surface-control)] px-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300 hover:border-[var(--acento)] hover:text-[var(--acento)]"
          >
            {sugerencia}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Fila tipográfica con flecha: colecciones y marcas. `grande` para la lista de inicio. */
function FilaEnlace({
  href,
  titulo,
  detalle,
  grande = false,
  onClick,
}: {
  href: string;
  titulo: string;
  detalle?: string;
  grande?: boolean;
  onClick: AlNavegar;
}) {
  return (
    <li className="border-b border-[var(--surface-line)]">
      <Link
        data-resultado
        href={href}
        onClick={onClick}
        className={`group flex items-center justify-between gap-6 ${
          grande ? 'min-h-14 py-4 lg:py-5' : 'min-h-12 py-3'
        }`}
      >
        <span
          className={`font-[family-name:var(--font-display)] leading-[1.08] transition-[color,translate] duration-500 ease-[var(--ease-silk)] group-hover:translate-x-1.5 group-hover:text-[var(--acento)] group-focus-visible:text-[var(--acento)] ${
            grande ? 'text-[length:clamp(1.75rem,3.4vw,2.75rem)]' : 'text-[1.375rem] lg:text-[1.625rem]'
          }`}
        >
          {titulo}
        </span>
        <span className="flex shrink-0 items-center gap-3 text-[var(--surface-muted)]">
          {detalle && <span className="text-[0.75rem] tabular-nums">{detalle}</span>}
          <Flecha className="size-4 transition-[color,translate] duration-300 group-hover:translate-x-1 group-hover:text-[var(--acento)] lg:size-5" />
        </span>
      </Link>
    </li>
  );
}

/** Perfume: miniatura sobre el escenario, marca, nombre, precio y referencia. */
function FilaPerfume({ item, onClick }: { item: Sugerencia; onClick: AlNavegar }) {
  const precio = formatCOP(item.precio);
  return (
    <li>
      <Link
        data-resultado
        href={`/perfumes/${item.slug}`}
        onClick={onClick}
        className="group flex items-center gap-4 py-3.5 md:gap-5 md:py-4"
      >
        <div className="stage relative aspect-4/5 w-14 shrink-0 overflow-hidden md:w-16">
          {item.imagen ? (
            // El nombre ya está en el enlace: la foto es decorativa para el lector de pantalla.
            <Image
              src={item.imagen}
              alt=""
              fill
              sizes="64px"
              className="object-contain p-[8%] mix-blend-multiply transition-transform duration-500 ease-[var(--ease-silk)] group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0">
              <ProductPlaceholder
                codigo={item.codigo}
                nombre={item.nombre}
                marca={item.marca}
                compacto
                className="size-full"
              />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]">
            {item.marca ?? GENERO_ETIQUETA[item.genero] ?? 'Perfumería'}
          </p>
          <p className="mt-1 text-base leading-snug transition-colors duration-300 group-hover:text-[var(--acento)] group-focus-visible:text-[var(--acento)]">
            {nombreSinMarca(item.nombre, item.marca)}
          </p>
          <p className="mt-1.5 flex items-baseline justify-between gap-4">
            {precio ? (
              <span className="text-[0.9375rem] tabular-nums">{precio}</span>
            ) : (
              <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
                Precio por confirmar
              </span>
            )}
            <span className="shrink-0 text-[0.6875rem] uppercase tabular-nums tracking-[0.16em] text-[var(--surface-muted)]">
              Ref. {item.codigo}
            </span>
          </p>
        </div>
      </Link>
    </li>
  );
}

function Flecha({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12h15.5M13.5 6l6 6-6 6" />
    </svg>
  );
}
