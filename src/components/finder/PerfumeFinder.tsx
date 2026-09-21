'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { EnlaceFlecha } from '@/components/ui/Bits';
import { Button } from '@/components/ui/Button';
import type { ProductoVista } from '@/lib/catalog';
import { PASOS, etiquetaDe, type Clave, type Genero } from './preguntas';
import { ResultadoFinder, type Resultado } from './ResultadoFinder';

type Respuestas = Partial<Record<Clave, string | string[]>>;

// /api/recomendaciones ya devuelve `concentracion` e `imagen2`; si una respuesta
// antigua (caché) no los trae, se completan con null para la ficha.
type ItemApi = Omit<ProductoVista, 'concentracion' | 'imagen2'> &
  Partial<Pick<ProductoVista, 'concentracion' | 'imagen2'>> & { motivos?: string[] };

const TOTAL = PASOS.length;
/** Salida de una pregunta: 100 ms para ver la elección marcada + 250 ms de fundido. */
const SALIDA_MS = 350;
const MENSAJE_ERROR = 'No pudimos calcular la recomendación. Intenta de nuevo.';

const dosCifras = (numero: number) => String(numero).padStart(2, '0');

function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * «Descubre tu fragancia»: una pregunta por pantalla y las opciones como
 * palabras. Las preguntas de una sola respuesta avanzan solas al elegir; las
 * de varias piden «Continuar». La última calcula la selección.
 */
export function PerfumeFinder({ generoInicial }: { generoInicial?: Genero }) {
  // Con ?para= (enlace de la portada) la primera respuesta ya viene dada.
  const [paso, setPaso] = useState(generoInicial ? 1 : 0);
  const [respuestas, setRespuestas] = useState<Respuestas>(
    generoInicial ? { genero: generoInicial } : {},
  );
  const [saliendo, setSaliendo] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const raizRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const enfocar = useRef(false);
  const enCurso = useRef(false);
  const temporizador = useRef<number | undefined>(undefined);

  const id = useId();
  const idPregunta = `${id}-pregunta`;
  const idAyuda = `${id}-ayuda`;

  const actual = PASOS[paso];
  const valorActual = respuestas[actual.clave];
  const esUltimo = paso === TOTAL - 1;
  const respondido = actual.multiple
    ? Array.isArray(valorActual) && valorActual.length > 0
    : Boolean(valorActual);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  // Al cambiar de pantalla, el foco va al nuevo título (el lector de pantalla
  // lo anuncia) y, si la anterior quedó desplazada en el móvil, la vista sube.
  useEffect(() => {
    if (!enfocar.current) return;
    enfocar.current = false;
    tituloRef.current?.focus({ preventScroll: true });
    if (window.scrollY > 0) raizRef.current?.scrollIntoView({ block: 'start' });
  }, [paso, resultado]);

  // Lo ya respondido, en palabras: orienta durante el recorrido y resume la
  // selección. A la vista se abrevia (quien marca las siete opciones no debe
  // ver cinco líneas de etiquetas); el texto completo va al lector y a WhatsApp.
  const partes = (resultado ? PASOS : PASOS.slice(0, paso))
    .map((item) => {
      const valor = respuestas[item.clave];
      return (Array.isArray(valor) ? valor : valor ? [valor] : []).map(etiquetaDe);
    })
    .filter((lista) => lista.length > 0);
  const resumen = partes.map((lista) => lista.join(', ')).join(' · ');
  const resumenCorto = partes
    .map((lista) =>
      lista.length > 2 ? `${lista.slice(0, 2).join(', ')} +${lista.length - 2}` : lista.join(', '),
    )
    .join(' · ');

  const progreso = resultado ? 1 : (paso + 1) / TOTAL;

  const irA = (siguiente: number) => {
    setError('');
    enfocar.current = true;
    if (prefiereMenosMovimiento()) {
      setPaso(siguiente);
      return;
    }
    setSaliendo(true);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => {
      setPaso(siguiente);
      setSaliendo(false);
    }, SALIDA_MS);
  };

  const calcular = async (datos: Respuestas) => {
    if (enCurso.current) return;
    enCurso.current = true;
    setCargando(true);
    setError('');
    try {
      const respuesta = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!respuesta.ok) throw new Error('error');
      const cuerpo = (await respuesta.json()) as { conAtributos?: boolean; items?: ItemApi[] };
      if (!Array.isArray(cuerpo.items)) throw new Error('respuesta');
      enfocar.current = true;
      setResultado({
        conAtributos: Boolean(cuerpo.conAtributos),
        items: cuerpo.items.map((item) => ({
          ...item,
          concentracion: item.concentracion ?? null,
          imagen2: item.imagen2 ?? null,
          motivos: item.motivos ?? [],
        })),
      });
    } catch {
      setError(MENSAJE_ERROR);
    } finally {
      enCurso.current = false;
      setCargando(false);
    }
  };

  const elegir = (valor: string) => {
    if (saliendo || cargando) return;
    if (!actual.multiple) {
      const nuevas = { ...respuestas, [actual.clave]: valor };
      setRespuestas(nuevas);
      if (esUltimo) void calcular(nuevas);
      else irA(paso + 1);
      return;
    }
    setError('');
    setRespuestas((previas) => {
      const seleccion = Array.isArray(previas[actual.clave]) ? (previas[actual.clave] as string[]) : [];
      return {
        ...previas,
        [actual.clave]: seleccion.includes(valor)
          ? seleccion.filter((item) => item !== valor)
          : [...seleccion, valor],
      };
    });
  };

  const continuar = () => {
    if (!respondido || saliendo || cargando) return;
    if (esUltimo) void calcular(respuestas);
    else irA(paso + 1);
  };

  const atras = () => {
    if (paso === 0 || saliendo || cargando) return;
    irA(paso - 1);
  };

  // El botón de reintento desaparece al limpiar el error: el foco pasa antes
  // al título para que el teclado no se pierda en el documento.
  const reintentar = () => {
    tituloRef.current?.focus({ preventScroll: true });
    void calcular(respuestas);
  };

  const reiniciar = () => {
    window.clearTimeout(temporizador.current);
    enfocar.current = true;
    setSaliendo(false);
    setPaso(0);
    setRespuestas({});
    setResultado(null);
    setError('');
  };

  return (
    <div
      ref={raizRef}
      className="shell relative flex flex-1 scroll-mt-[var(--header-h)] flex-col pb-16 pt-6 lg:pb-24 lg:pt-10"
    >
      {/* Cabecera del recorrido: nombre de la página y lo ya respondido. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h1 className="font-[family-name:var(--font-sans)] text-[0.6875rem] font-medium uppercase leading-none tracking-[0.3em] text-[var(--surface-muted)]">
          Descubre tu fragancia
        </h1>
        {resumen && (
          <p className="text-[0.6875rem] uppercase leading-snug tracking-[0.2em] text-[var(--surface-muted)]">
            <span className="sr-only">Tus respuestas: {resumen}</span>
            <span aria-hidden="true">{resumenCorto}</span>
          </p>
        )}
      </div>

      {/* Progreso: un hilo que se llena. En texto lo dice el número de la pregunta. */}
      <div aria-hidden="true" className="relative mt-4 h-px overflow-hidden bg-[var(--surface-line)]">
        <span
          className="absolute inset-0 origin-left bg-[var(--acento)] transition-transform duration-500 ease-[var(--ease-silk)]"
          style={{ transform: `scaleX(${progreso})` }}
        />
      </div>

      {resultado ? (
        <ResultadoFinder
          resultado={resultado}
          resumen={resumen}
          tituloRef={tituloRef}
          onReiniciar={reiniciar}
        />
      ) : (
        <div className="flex flex-1 flex-col pt-8 sm:pt-12 lg:justify-center-safe lg:pb-6">
          {/* Salida: pausa breve para ver la elección y fundido corto.
              (En Tailwind 4 `translate-*` usa la propiedad `translate`, no `transform`.) */}
          <div
            className={
              saliendo
                ? '-translate-y-1 opacity-0 transition-[opacity,translate] delay-100 duration-[250ms] ease-[var(--ease-silk)]'
                : undefined
            }
          >
            <div
              key={paso}
              className="grid animate-[ylane-fade-up_0.4s_var(--ease-silk)_both] gap-y-10 motion-reduce:animate-none lg:grid-cols-12 lg:gap-x-8"
            >
              <div className="lg:col-span-6">
                <p
                  aria-hidden="true"
                  className="font-[family-name:var(--font-display)] text-[1.125rem] leading-none tracking-[0.04em] lg:text-[1.375rem]"
                >
                  <span className="text-[var(--acento)]">{dosCifras(paso + 1)}</span>
                  <span className="text-[var(--surface-muted)]"> / {dosCifras(TOTAL)}</span>
                </p>
                <h2
                  id={idPregunta}
                  ref={tituloRef}
                  tabIndex={-1}
                  className="display-xl mt-5 outline-none lg:mt-7"
                >
                  <span className="sr-only">
                    Pregunta {paso + 1} de {TOTAL}:{' '}
                  </span>
                  {actual.pregunta}
                </h2>
                {actual.ayuda && (
                  <p
                    id={idAyuda}
                    className="mt-5 max-w-sm text-base leading-relaxed text-[var(--surface-muted)] lg:mt-7 lg:text-[1.0625rem]"
                  >
                    {actual.ayuda}
                  </p>
                )}
              </div>

              <div className="lg:col-span-6 lg:col-start-7 xl:col-span-5 xl:col-start-8">
                <div
                  role="group"
                  aria-labelledby={idPregunta}
                  aria-describedby={actual.ayuda ? idAyuda : undefined}
                  className={`@container ${
                    actual.multiple ? 'grid grid-cols-2 gap-x-5 sm:gap-x-8' : 'flex flex-col'
                  }`}
                >
                  {actual.opciones.map((opcion) => (
                    <OpcionPalabra
                      key={opcion.valor}
                      etiqueta={opcion.etiqueta}
                      activo={
                        actual.multiple
                          ? Array.isArray(valorActual) && valorActual.includes(opcion.valor)
                          : valorActual === opcion.valor
                      }
                      compacta={actual.multiple}
                      onElegir={() => elegir(opcion.valor)}
                    />
                  ))}
                </div>

                {error && (
                  <div className="mt-8 border-l border-[var(--acento)] pl-5">
                    <p role="alert" className="text-base leading-relaxed">
                      {error}
                    </p>
                    <Button variante="contorno" className="mt-4" onClick={reintentar}>
                      Intentar de nuevo
                    </Button>
                  </div>
                )}

                <div className="mt-8 flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-3 lg:mt-10">
                  {paso > 0 ? (
                    <button
                      type="button"
                      onClick={atras}
                      disabled={cargando}
                      className="group -ml-2 inline-flex min-h-11 items-center gap-3 px-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)] transition-colors duration-300 hover:text-[var(--acento)] disabled:opacity-40"
                    >
                      <svg
                        aria-hidden="true"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        className="transition-transform duration-300 ease-[var(--ease-silk)] can-hover:group-hover:-translate-x-0.5"
                      >
                        <path d="M19 12H5M11 6l-6 6 6 6" />
                      </svg>
                      Atrás
                    </button>
                  ) : (
                    <EnlaceFlecha href="/perfumes">Prefiero ver el catálogo</EnlaceFlecha>
                  )}

                  <div className="ml-auto flex items-center gap-6">
                    <div>
                      <p
                        role="status"
                        className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]"
                      >
                        {cargando ? 'Calculando…' : ''}
                      </p>
                      {cargando && (
                        <span aria-hidden="true" className="mt-2 block h-px overflow-hidden bg-[var(--surface-line)]">
                          <span className="shimmer block size-full" />
                        </span>
                      )}
                    </div>
                    {actual.multiple && (
                      <Button tamano="lg" onClick={continuar} disabled={!respondido || cargando}>
                        {esUltimo ? 'Ver recomendaciones' : 'Continuar'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Una opción como palabra en Bodoni. El tamaño sale del ancho de la columna
 * (cqw), medido con las métricas de la fuente: «Sofisticación» (5,9 em), la más
 * larga, cabe a dos columnas junto a la marca incluso en pantallas de 320 px.
 * Elegida: color de acento, hilo que se dibuja sobre la línea y una marca fina
 * (la marca da una señal que no depende sólo del color).
 */
function OpcionPalabra({
  etiqueta,
  activo,
  compacta,
  onElegir,
}: {
  etiqueta: string;
  activo: boolean;
  /** Rejilla de dos columnas (preguntas de varias respuestas). */
  compacta: boolean;
  onElegir: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onElegir}
      className={`group relative flex min-h-14 w-full min-w-0 items-center justify-between gap-2 border-b border-[var(--surface-line)] text-left ${
        compacta ? 'py-3.5' : 'py-4 lg:py-5'
      }`}
    >
      <span
        className={`min-w-0 hyphens-auto break-words font-[family-name:var(--font-display)] leading-[1.1] tracking-[-0.01em] transition-[color,opacity] duration-300 ease-[var(--ease-silk)] ${
          compacta ? 'text-[clamp(1.0625rem,6.4cqw,2.5rem)]' : 'text-[clamp(2rem,11cqw,2.75rem)]'
        } ${activo ? 'text-[var(--acento)]' : 'opacity-80 can-hover:group-hover:opacity-100'}`}
      >
        {etiqueta}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={`size-3.5 shrink-0 text-[var(--acento)] transition-opacity duration-300 lg:size-4 ${
          activo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <path d="M5 12.5l4.2 4.2L19 7" />
      </svg>
      {/* Hilo sobre la línea de la fila: completo al elegir, un anticipo al pasar el ratón. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-[var(--acento)] transition-transform duration-500 ease-[var(--ease-silk)] ${
          activo ? 'scale-x-100' : 'scale-x-0 can-hover:group-hover:scale-x-[0.18]'
        }`}
      />
    </button>
  );
}
