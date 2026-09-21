'use client';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EnlaceFlecha, Indice } from '@/components/ui/Bits';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useConfig } from '@/components/ConfigProvider';
import { trackEvento } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/whatsapp';
import type { ProductoVista } from '@/lib/catalog';
import { etiquetaDe } from './preguntas';

export type ItemResultado = ProductoVista & { motivos: string[] };
export type Resultado = { conAtributos: boolean; items: ItemResultado[] };

/**
 * «Tu selección»: el cierre del buscador.
 * Tres referencias protagonistas en composición editorial (una grande y dos a
 * su lado); si la API devuelve más, se despliegan bajo demanda en la rejilla.
 */
export function ResultadoFinder({
  resultado,
  resumen,
  tituloRef,
  onReiniciar,
}: {
  resultado: Resultado;
  /** Las respuestas en palabras: «Mujer · Elegancia · De noche · Intensa». */
  resumen: string;
  tituloRef: RefObject<HTMLHeadingElement | null>;
  onReiniciar: () => void;
}) {
  const { whatsapp } = useConfig();
  const [verMas, setVerMas] = useState(false);
  const masRef = useRef<HTMLDivElement>(null);
  const idMas = useId();

  const { items, conAtributos } = resultado;
  const principal = items[0];
  const acompanantes = items.slice(1, 3);
  const resto = items.slice(3);

  useRevelado(masRef, verMas);

  // El mensaje lleva las respuestas: quien atiende no tiene que volver a preguntarlas.
  const urlWhatsapp = whatsappUrl(
    whatsapp,
    `Hola, usé el buscador de fragancias de la tienda${resumen ? ` (${resumen})` : ''} y quiero asesoría para elegir.`,
  );

  const aviso = !principal
    ? 'No encontramos referencias con esos criterios. Escríbenos y te ayudamos a elegir, o recorre el catálogo completo.'
    : conAtributos
      ? 'Ordenadas según lo que nos contaste. Si quieres afinar más, te asesoramos personalmente.'
      : // Honestidad: sin atributos cargados el orden sólo mira el género.
        'Aún estamos cargando los atributos de aroma de cada perfume: por ahora el orden sólo tiene en cuenta para quién es, todavía no la personalidad ni la ocasión. Si quieres afinar la elección, te asesoramos personalmente.';

  return (
    <div className="pt-12 lg:pt-16">
      {/* Titular a la izquierda; la nota, como apunte al margen. */}
      <div className="grid animate-[ylane-fade-up_0.6s_var(--ease-silk)_both] gap-y-8 motion-reduce:animate-none lg:grid-cols-12 lg:items-end lg:gap-x-8">
        <div className="lg:col-span-7">
          <Indice>Tu selección</Indice>
          <h2 ref={tituloRef} tabIndex={-1} className="display-lg mt-5 outline-none">
            {principal ? 'Estas fragancias podrían ser para ti.' : 'Sin coincidencias por ahora.'}
          </h2>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="max-w-md text-base leading-relaxed text-[var(--surface-muted)]">{aviso}</p>
          {urlWhatsapp ? (
            <a
              href={urlWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvento('Contact', { canal: 'whatsapp', origen: 'buscador' })}
              className="link-flecha group mt-4"
            >
              Escríbenos por WhatsApp
              <span className="sr-only"> (se abre en otra pestaña)</span>
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          ) : (
            <EnlaceFlecha href="/contacto" className="mt-4">
              Escríbenos
            </EnlaceFlecha>
          )}
        </div>
      </div>

      {principal && (
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-12 md:gap-x-8 lg:mt-20">
          {/* Protagonista: la primera recomendación, más grande. */}
          <div className="col-span-2 animate-[ylane-fade-up_0.8s_var(--ease-silk)_both] [animation-delay:120ms] motion-reduce:animate-none sm:max-w-md md:col-span-6 md:max-w-none lg:col-span-5">
            <ProductCard
              producto={principal}
              tamano="grande"
              prioridad
              sizes="(max-width: 767px) 100vw, 42vw"
            />
            <Motivos motivos={principal.motivos} />
          </div>

          {/* Las dos siguientes, al pie de la protagonista: el hueco de arriba es aire a propósito. */}
          {acompanantes.length > 0 && (
            <div className="col-span-2 grid animate-[ylane-fade-up_0.8s_var(--ease-silk)_both] grid-cols-2 gap-x-4 gap-y-12 [animation-delay:240ms] motion-reduce:animate-none sm:gap-x-6 md:col-span-6 md:gap-x-8 md:self-end lg:col-start-7">
              {acompanantes.map((producto) => (
                <div key={producto.id}>
                  <ProductCard producto={producto} sizes="(max-width: 767px) 50vw, 24vw" />
                  <Motivos motivos={producto.motivos} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-20 border-t border-[var(--surface-line)] pt-8 lg:mt-28">
        {resto.length > 0 && (
          <>
            <button
              type="button"
              aria-expanded={verMas}
              aria-controls={idMas}
              onClick={() => setVerMas((abierto) => !abierto)}
              className="link-flecha"
            >
              {verMas ? 'Ver menos opciones' : 'Ver más opciones'}
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                {verMas ? <path d="M5 12h14" /> : <path d="M12 5v14M5 12h14" />}
              </svg>
            </button>
            <div id={idMas} ref={masRef} hidden={!verMas} className="mt-10 lg:mt-14">
              <ProductGrid productos={resto} columnas={4} />
            </div>
          </>
        )}

        <div
          className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
            resto.length > 0 ? 'mt-14 lg:mt-20' : ''
          }`}
        >
          <Button variante="contorno" tamano="lg" onClick={onReiniciar}>
            Volver a empezar
          </Button>
          <ButtonLink href="/perfumes" tamano="lg">
            Ver catálogo completo
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

/** Por qué se recomienda: sólo con coincidencias reales (la API no inventa motivos). */
function Motivos({ motivos }: { motivos: string[] }) {
  if (motivos.length === 0) return null;
  return (
    <p className="mt-3 text-[0.6875rem] font-medium uppercase leading-relaxed tracking-[0.22em] text-[var(--acento)]">
      <span className="sr-only">Coincide en: </span>
      {motivos.slice(0, 3).map(etiquetaDe).join(' · ')}
    </p>
  );
}

/**
 * La rejilla desplegable llega después de que el revelado global (RevealScript)
 * recorrió la página: sin esto, sus fichas con data-reveal se quedarían en
 * opacidad 0. Mismo criterio que el global, incluida la red de seguridad.
 */
function useRevelado(zonaRef: RefObject<HTMLElement | null>, activo: boolean) {
  useEffect(() => {
    const zona = zonaRef.current;
    if (!activo || !zona) return;
    const pendientes = Array.from(zona.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (pendientes.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('is-in');
            observador.unobserve(entrada.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    for (const elemento of pendientes) observador.observe(elemento);

    const seguro = window.setTimeout(() => {
      for (const elemento of pendientes) elemento.classList.add('is-in');
    }, 2500);

    return () => {
      observador.disconnect();
      window.clearTimeout(seguro);
    };
  }, [zonaRef, activo]);
}
