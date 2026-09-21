import type { Metadata } from 'next';
import { jsonLd } from '@/lib/jsonld';
import { getBloque, parsearFaq } from '@/lib/content';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';
import { EnlaceFlecha, Indice } from '@/components/ui/Bits';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Resolvemos las dudas más comunes sobre comprar en YLANE PERFUMES.',
  alternates: { canonical: '/preguntas-frecuentes' },
};

export default async function FaqPage() {
  const [contenido, ajustes] = await Promise.all([getBloque('faq'), getSettings()]);
  const preguntas = parsearFaq(contenido);
  const wa = whatsappUrl(ajustes.whatsapp, 'Hola, tengo una pregunta sobre YLANE PERFUMES.');

  const datosEstructurados = preguntas.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: preguntas.map((item) => ({
          '@type': 'Question',
          name: item.pregunta,
          acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
        })),
      }
    : null;

  return (
    <div data-surface="claro">
      {datosEstructurados && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(datosEstructurados) }}
        />
      )}

      <div className="shell section-y">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          {/* El titular acompaña la lectura en escritorio; las preguntas llevan el peso. */}
          <header className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <Indice className="mb-6 lg:mb-8">Ayuda</Indice>
              <h1 className="display-lg">Preguntas frecuentes</h1>
              <p className="lead mt-6 lg:mt-8">
                Resolvemos las dudas más comunes sobre comprar en YLANE PERFUMES.
              </p>
            </div>
          </header>

          <div className="lg:col-span-7 lg:col-start-6">
            {preguntas.length > 0 ? (
              <>
                <div className="border-t border-[var(--surface-line)]">
                  {preguntas.map((item) => (
                    <details key={item.pregunta} className="group/pregunta border-b border-[var(--surface-line)]">
                      <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-6 font-[family-name:var(--font-display)] text-[1.25rem] leading-snug transition-colors duration-300 can-hover:hover:text-[var(--acento)] lg:text-[1.375rem] [&::-webkit-details-marker]:hidden">
                        <span>{item.pregunta}</span>
                        {/* Más que se vuelve menos: la barra vertical se pliega, nada gira. */}
                        <span aria-hidden="true" className="relative mt-[0.5em] size-3.5 shrink-0 text-[var(--acento)]">
                          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-[var(--ease-silk)] group-open/pregunta:scale-y-0" />
                        </span>
                      </summary>
                      <p className="max-w-[62ch] pb-8 pr-10 text-[var(--surface-muted)]">{item.respuesta}</p>
                    </details>
                  ))}
                </div>

                <div className="mt-16 lg:mt-24">
                  <h2 className="display-md">¿No encontraste tu respuesta?</h2>
                  <p className="mt-4 max-w-md text-[var(--surface-muted)]">
                    Escríbenos y te ayudamos a elegir o resolvemos cualquier duda del pedido.
                  </p>
                  <Acciones wa={wa} />
                </div>
              </>
            ) : (
              <div className="border-t border-[var(--surface-line)] pt-10">
                <h2 className="display-md">Todavía no hay preguntas publicadas.</h2>
                <p className="mt-4 max-w-md text-[var(--surface-muted)]">
                  Escríbenos y te respondemos directamente.
                </p>
                <Acciones wa={wa} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Una sola acción principal: WhatsApp si está configurado; si no, el formulario. */
function Acciones({ wa }: { wa: string | null }) {
  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
      {wa ? (
        <>
          <ExternalButton href={wa} target="_blank" tamano="lg" className="w-full sm:w-auto">
            Escribir por WhatsApp
          </ExternalButton>
          <EnlaceFlecha href="/contacto" className="self-start sm:self-auto">
            Formulario de contacto
          </EnlaceFlecha>
        </>
      ) : (
        <ButtonLink href="/contacto" tamano="lg" className="w-full sm:w-auto">
          Formulario de contacto
        </ButtonLink>
      )}
    </div>
  );
}
