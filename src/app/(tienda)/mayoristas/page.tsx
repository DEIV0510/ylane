import type { Metadata } from 'next';
import { LeadForm } from '@/components/forms/LeadForm';
import { Divider } from '@/components/ui/Bits';
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

  return (
    <div data-surface="oscuro">
      <section className="grain relative overflow-hidden border-b border-[var(--surface-line)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(100%_70%_at_20%_0%,rgba(90,16,28,0.5),transparent_60%)]"
        />
        <div className="shell relative py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="eyebrow">Mayoristas</p>
            <h1 className="display-xl mt-4">Crece con YLANE</h1>
            <p className="mt-6 font-[family-name:var(--font-display)] text-2xl text-champagne">
              ¿Quieres comenzar o hacer crecer tu negocio de perfumería?
            </p>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-marfil-dim">
              Distribuimos a personas y negocios que quieren montar su propio proyecto. Un solo
              proveedor para {total} referencias entre perfumería árabe, de diseñador y nicho.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#solicitar"
                className="inline-flex items-center justify-center border border-vino bg-vino px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-marfil transition-colors hover:bg-vino-glow"
              >
                Solicitar información mayorista
              </a>
              {wa && (
                <ExternalButton href={wa} target="_blank" variante="contorno" tamano="lg">
                  Hablar por WhatsApp
                </ExternalButton>
              )}
            </div>
          </div>
        </div>
      </section>

      {beneficios.length > 0 && (
        <section className="shell py-16 lg:py-24">
          <h2 className="eyebrow mb-10">Qué encuentras</h2>
          <div className="grid gap-px border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-2 lg:grid-cols-3">
            {beneficios.map((item) => (
              <div key={item.titulo} data-reveal className="bg-[var(--surface-bg)] p-7">
                <span className="block size-1.5 rotate-45 bg-champagne" aria-hidden="true" />
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl">{item.titulo}</h3>
                <p className="mt-2 text-[0.87rem] leading-relaxed text-[var(--surface-muted)]">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="solicitar" className="shell scroll-mt-28 pb-20 lg:pb-28">
        <Divider className="mb-14" />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow mb-3">Solicitud</p>
            <h2 className="display-lg">Cuéntanos de tu negocio</h2>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-[var(--surface-muted)]">
              Déjanos tus datos y te contactamos con la información de distribución, condiciones y
              precios según el volumen que manejes.
            </p>
          </div>

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
      </section>
    </div>
  );
}
