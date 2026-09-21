import type { Metadata } from 'next';
import Image from 'next/image';
import { LeadForm } from '@/components/forms/LeadForm';
import { Indice, SectionHeader } from '@/components/ui/Bits';
import { ExternalButton } from '@/components/ui/Button';
import { getBloque, parsearTarjetas } from '@/lib/content';
import { contarProductos } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Mayoristas',
  description:
    'Distribución de perfumería para revendedores: precios mayoristas, perfumería árabe y catálogo actualizado.',
  alternates: { canonical: '/mayoristas' },
};

const numero = new Intl.NumberFormat('es-CO');

export default async function MayoristasPage() {
  const [beneficiosTexto, ajustes, total] = await Promise.all([
    getBloque('mayoristas_beneficios'),
    getSettings(),
    contarProductos(),
  ]);
  const beneficios = parsearTarjetas(beneficiosTexto);
  const wa = whatsappUrl(
    ajustes.whatsapp,
    'Hola, quiero información sobre precios mayoristas de YLANE PERFUMES.',
  );

  // Ficha técnica: sólo lo que la tienda ya afirma o lo que se puede contar.
  // Con el catálogo vacío no se publica «0 referencias».
  const ficha = [
    ['Catálogo', total > 0 ? `${numero.format(total)} referencias` : null],
    ['Líneas', 'Perfumería árabe, de diseñador, nicho y comercial'],
    ['Modalidades', 'Detal y por mayor'],
    ['Atención', 'Asesoría directa por WhatsApp o correo'],
  ].filter((fila): fila is [string, string] => Boolean(fila[1]));

  return (
    <>
      {/* ── Portada B2B: titular a la izquierda, fotografía completa a la derecha ── */}
      <section data-surface="oscuro" className="pb-20 pt-12 lg:pb-32 lg:pt-20">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-x-10">
            <div className="lg:col-span-5">
              <Indice>¿Quieres revender perfumes?</Indice>
              <h1 className="display-xl mt-8">
                YLANE <em className="block italic text-[var(--acento)]">Mayoristas</em>
              </h1>
              <p className="lead mt-8">Una selección de fragancias para impulsar tu negocio.</p>

              {/* Con WhatsApp la fila no cabe en la columna: el enlace baja en vez de apretar el botón. */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                {/* Ancla nativa (no <Link>): el navegador lleva el foco secuencial al formulario. */}
                <ExternalButton href="#solicitar" tamano="lg" className="w-full sm:w-auto">
                  Solicitar información
                </ExternalButton>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-flecha group self-start sm:self-auto"
                  >
                    Hablar por WhatsApp
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>
                )}
              </div>
            </div>

            {/* La foto se muestra entera, en su proporción: sin recortes ni fundidos. */}
            <div className="-mx-5 md:mx-0 lg:col-span-7">
              <Image
                src="/editorial/mayoristas.jpg"
                alt=""
                width={2000}
                height={1333}
                priority
                sizes="(min-width: 1408px) 730px, (min-width: 1024px) 55vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Ficha técnica de la distribución, como un documento: filas con hilos. */}
          {/* items-baseline: la etiqueta cae sobre la línea base de la primera fila. */}
          <div data-reveal className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-12 lg:items-baseline lg:gap-x-10">
            <h2 className="eyebrow lg:col-span-5">Ficha de distribución</h2>
            <dl className="border-t border-[var(--surface-line)] lg:col-span-7">
              {ficha.map(([termino, valor]) => (
                <div
                  key={termino}
                  className="grid gap-2 border-b border-[var(--surface-line)] py-5 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-8 lg:py-6"
                >
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[var(--acento)]">
                    {termino}
                  </dt>
                  <dd className="font-[family-name:var(--font-display)] text-[1.3rem] leading-snug sm:text-[1.5rem]">
                    {valor}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Beneficios: lista numerada editorial, sin cajas ── */}
      {beneficios.length > 0 && (
        <section data-surface="lino" className="section-y">
          <div className="shell">
            <SectionHeader eyebrow="Para revendedores" titulo="Qué encuentras" />
            <ol className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
              {beneficios.map((item, indice) => (
                <li
                  key={item.titulo}
                  data-reveal
                  style={{ transitionDelay: `${(indice % 3) * 90}ms` }}
                  className="border-t border-[var(--surface-line)] pb-10 pt-6 lg:pb-14"
                >
                  <span
                    aria-hidden="true"
                    className="font-[family-name:var(--font-display)] text-[0.95rem] tabular-nums text-[var(--acento)]"
                  >
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-[1.5rem] leading-tight lg:text-[1.625rem]">
                    {item.titulo}
                  </h3>
                  {item.texto && (
                    <p className="mt-3 max-w-[34ch] text-[var(--surface-muted)]">{item.texto}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Solicitud: texto 5 / formulario 7 ── */}
      <section
        id="solicitar"
        data-surface="claro"
        className="section-y scroll-mt-[var(--header-h)]"
      >
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <Indice>Solicitud</Indice>
              <h2 className="display-lg mt-6">Cuéntanos de tu negocio</h2>
              <p className="lead mt-6">
                Déjanos tus datos y te contactamos con la información de distribución, condiciones
                y precios según el volumen que manejes.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <LeadForm
              tipo="mayorista"
              textoBoton="Solicitar información"
              mensajeExito="Recibimos tu solicitud mayorista. Te contactamos con la información de distribución."
              campos={[
                { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
                { nombre: 'empresa', etiqueta: 'Empresa o negocio' },
                { nombre: 'telefono', etiqueta: 'WhatsApp', tipo: 'tel' },
                { nombre: 'email', etiqueta: 'Correo', tipo: 'email' },
                { nombre: 'ciudad', etiqueta: 'Ciudad' },
                {
                  nombre: 'cantidad',
                  etiqueta: 'Cantidad aproximada',
                  placeholder: 'Ej. 20 unidades al mes',
                },
                {
                  nombre: 'mensaje',
                  etiqueta: 'Mensaje',
                  multilinea: true,
                  placeholder: '¿Qué líneas te interesan? ¿Ya vendes perfumes?',
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
