import Image from 'next/image';
import { EnlaceFlecha } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';
import type { Banner } from '@/db/schema';

/** Fotografía por defecto: se reemplaza sola si el negocio sube una desde /admin → Banners. */
const FOTO_POR_DEFECTO = '/editorial/hero-oud.jpg';

/**
 * 01 — Hero. Composición editorial asimétrica: la foto a sangre ocupa la
 * derecha (≈60 %) y el titular se apoya abajo a la izquierda, en el espacio
 * negro que la propia foto deja. En móvil la foto va arriba, más baja, y el
 * texto la pisa con un fundido.
 */
export function Hero({ banner, referencias }: { banner: Banner | null; referencias: number }) {
  const marca = banner?.titulo?.trim() || 'YLANE PERFUMES';
  const lema = banner?.subtitulo?.trim() || 'Tu aroma. Tu firma.';
  const texto = banner?.texto?.trim() || 'Una selección de fragancias para cada personalidad.';
  const foto = banner?.imagen || FOTO_POR_DEFECTO;

  // "Tu aroma. Tu firma." → dos líneas; la segunda, en cursiva y champagne.
  const partes = lema.match(/[^.!?]+[.!?]?/g)?.map((parte) => parte.trim()).filter(Boolean) ?? [lema];

  return (
    <section data-surface="oscuro" className="relative isolate overflow-hidden">
      {/* En móvil la foto empieza debajo de la cabecera: el logo no pisa el frasco. */}
      <div className="relative mt-[calc(var(--header-alto)+var(--barra-h))] h-[50svh] min-h-[20rem] lg:absolute lg:inset-y-0 lg:left-[38%] lg:right-0 lg:mt-0 lg:h-auto">
        <Image
          src={foto}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="animate-reveal-img object-cover object-[50%_42%]"
        />
        {/* Fundidos: hacia abajo en móvil; hacia la izquierda y abajo en escritorio. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-noir via-noir/35 to-noir/40 lg:bg-linear-to-r lg:from-noir lg:via-noir/15 lg:to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 hidden h-40 bg-linear-to-t from-noir to-transparent lg:block"
        />
      </div>

      <div className="shell relative -mt-24 pb-16 lg:mt-0 lg:flex lg:min-h-svh lg:items-end lg:pb-[13vh] lg:pt-[calc(var(--header-alto)+var(--barra-h)+4rem)]">
        <div className="max-w-[40rem]">
          <p className="indice animate-fade-up">{marca}</p>

          <h1 className="display-hero mt-6 animate-fade-up" style={{ animationDelay: '90ms' }}>
            {partes.map((parte, indice) => (
              <span
                key={parte}
                className={`block ${indice > 0 ? 'italic text-champagne' : ''}`}
              >
                {parte}
              </span>
            ))}
          </h1>

          <p
            className="lead mt-7 animate-fade-up text-marfil/80"
            style={{ animationDelay: '180ms' }}
          >
            {texto}
          </p>

          <div
            className="mt-10 flex animate-fade-up flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8"
            style={{ animationDelay: '270ms' }}
          >
            <ButtonLink href={banner?.ctaUrl || '/perfumes'} tamano="lg" className="w-full sm:w-auto">
              {banner?.ctaTexto || 'Explorar fragancias'}
            </ButtonLink>
            <EnlaceFlecha href={banner?.ctaSecundarioUrl || '/descubre'}>
              {banner?.ctaSecundarioTexto || 'Descubrir mi perfume'}
            </EnlaceFlecha>
          </div>
        </div>
      </div>

      {/* Pie del hero: un dato cierto del catálogo, discreto. */}
      <div className="shell pointer-events-none relative hidden lg:block">
        <p className="absolute bottom-8 right-16 text-[0.625rem] uppercase tracking-[0.32em] text-marfil/55 xl:right-16">
          {referencias} fragancias · árabe, diseñador y nicho
        </p>
      </div>
    </section>
  );
}
