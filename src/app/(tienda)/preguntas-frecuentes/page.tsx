import type { Metadata } from 'next';
import { jsonLd } from '@/lib/jsonld';
import Link from 'next/link';
import { getBloque, parsearFaq } from '@/lib/content';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';

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
    <div data-surface="oscuro">
      {datosEstructurados && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(datosEstructurados) }}
        />
      )}

      <header className="border-b border-[var(--surface-line)]">
        <div className="shell py-14 lg:py-20">
          <p className="eyebrow mb-3">Ayuda</p>
          <h1 className="display-lg">Preguntas frecuentes</h1>
        </div>
      </header>

      <div className="shell py-14 lg:py-20">
        <div className="max-w-3xl">
          {preguntas.length > 0 ? (
            <div className="border-t border-[var(--surface-line)]">
              {preguntas.map((item) => (
                <details key={item.pregunta} className="group border-b border-[var(--surface-line)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-[family-name:var(--font-display)] text-lg transition-colors hover:text-champagne">
                    {item.pregunta}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-champagne transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-6 text-[0.92rem] leading-relaxed text-[var(--surface-muted)]">
                    {item.respuesta}
                  </p>
                </details>
              ))}
            </div>
          ) : (
            <p className="text-[var(--surface-muted)]">
              Todavía no hay preguntas publicadas. Escríbenos y te respondemos directamente.
            </p>
          )}

          <div className="mt-12 border border-[var(--surface-line)] p-7">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="mt-2 text-[0.9rem] text-[var(--surface-muted)]">
              Escríbenos y te ayudamos a elegir o resolvemos cualquier duda del pedido.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-vino bg-vino px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-marfil transition-colors hover:bg-vino-glow"
                >
                  Escribir por WhatsApp
                </a>
              )}
              <Link
                href="/contacto"
                className="border border-current/35 px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] transition-colors hover:border-champagne hover:text-champagne"
              >
                Formulario de contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
