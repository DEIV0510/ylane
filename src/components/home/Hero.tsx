import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import type { Banner } from '@/db/schema';
import { HeroArt } from './HeroArt';

export function Hero({ banner, referencias }: { banner: Banner | null; referencias: number }) {
  const titulo = banner?.titulo ?? 'YLANE PERFUMES';
  const subtitulo = banner?.subtitulo ?? 'Tu aroma. Tu firma.';
  const texto =
    banner?.texto ??
    'Descubre una selección de fragancias para cada personalidad, ocasión y estilo.';

  return (
    <section className="grain relative overflow-hidden border-b border-[var(--surface-line)]">
      {/* Fondo */}
      <div aria-hidden="true" className="absolute inset-0">
        {banner?.imagen ? (
          <>
            <Image
              src={banner.imagen}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-noir via-noir/85 to-noir/40" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_18%,rgba(90,16,28,0.55),transparent_62%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_10%_100%,rgba(199,166,106,0.10),transparent_60%)]" />
          </>
        )}
      </div>

      <div className="shell relative grid min-h-[86vh] items-center gap-10 py-20 lg:min-h-[92vh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-24">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up">Distribución de perfumería</p>

          <h1
            className="display-xl mt-5 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            {titulo}
          </h1>

          <p
            className="mt-5 animate-fade-up font-[family-name:var(--font-display)] text-2xl italic text-champagne sm:text-3xl"
            style={{ animationDelay: '160ms' }}
          >
            {subtitulo}
          </p>

          <p
            className="mt-6 max-w-md animate-fade-up text-[0.95rem] leading-relaxed text-marfil-dim"
            style={{ animationDelay: '240ms' }}
          >
            {texto}
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '320ms' }}
          >
            <ButtonLink href={banner?.ctaUrl ?? '/perfumes'} tamano="lg">
              {banner?.ctaTexto ?? 'Explorar perfumes'}
            </ButtonLink>
            <ButtonLink
              href={banner?.ctaSecundarioUrl ?? '/descubre'}
              variante="contorno"
              tamano="lg"
            >
              {banner?.ctaSecundarioTexto ?? 'Descubrir mi fragancia'}
            </ButtonLink>
          </div>

          <dl
            className="mt-12 flex animate-fade-up flex-wrap gap-x-10 gap-y-4 border-t border-[var(--surface-line)] pt-6"
            style={{ animationDelay: '400ms' }}
          >
            <Dato valor={`${referencias}`} etiqueta="Referencias en catálogo" />
            <Dato valor="Árabe" etiqueta="Nuestra especialidad" />
            <Dato valor="Detal y mayor" etiqueta="Modalidades de venta" />
          </dl>
        </div>

        {!banner?.imagen && (
          <div className="relative hidden justify-center lg:flex">
            <HeroArt className="h-[34rem] w-auto animate-drift" />
          </div>
        )}
      </div>
    </section>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div>
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="font-[family-name:var(--font-display)] text-2xl text-marfil">{valor}</dd>
      <dd className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
        {etiqueta}
      </dd>
    </div>
  );
}
