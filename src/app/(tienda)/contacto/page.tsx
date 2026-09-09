import type { Metadata } from 'next';
import { LeadForm } from '@/components/forms/LeadForm';
import { ExternalButton } from '@/components/ui/Button';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escríbenos y te asesoramos para elegir tu próxima fragancia.',
  alternates: { canonical: '/contacto' },
};

export default async function ContactoPage() {
  const ajustes = await getSettings();
  const wa = whatsappUrl(ajustes.whatsapp, 'Hola, quiero información sobre YLANE PERFUMES.');

  const datos = [
    ajustes.telefono && { etiqueta: 'Teléfono', valor: ajustes.telefono, href: `tel:${ajustes.telefono}` },
    ajustes.email && { etiqueta: 'Correo', valor: ajustes.email, href: `mailto:${ajustes.email}` },
    ajustes.ciudad && { etiqueta: 'Ciudad', valor: ajustes.ciudad },
    ajustes.direccion && { etiqueta: 'Dirección', valor: ajustes.direccion },
    ajustes.horario && { etiqueta: 'Horario', valor: ajustes.horario },
  ].filter(Boolean) as { etiqueta: string; valor: string; href?: string }[];

  const redes = [
    { etiqueta: 'Instagram', url: ajustes.instagram },
    { etiqueta: 'TikTok', url: ajustes.tiktok },
    { etiqueta: 'Facebook', url: ajustes.facebook },
  ].filter((red) => red.url);

  return (
    <div data-surface="oscuro">
      <header className="border-b border-[var(--surface-line)]">
        <div className="shell py-14 lg:py-20">
          <p className="eyebrow mb-3">Estamos para ayudarte</p>
          <h1 className="display-lg">Contacto</h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
            Cuéntanos qué buscas y te ayudamos a elegir. También resolvemos dudas de pedidos,
            envíos y distribución.
          </p>
        </div>
      </header>

      <div className="shell grid gap-14 py-14 lg:grid-cols-[1fr_1.2fr] lg:py-20">
        <div className="space-y-10">
          {wa && (
            <div className="border border-[var(--surface-line)] p-7">
              <h2 className="font-[family-name:var(--font-display)] text-xl">
                La vía más rápida es WhatsApp
              </h2>
              <p className="mt-2 text-[0.88rem] text-[var(--surface-muted)]">
                Te respondemos en horario de atención y te asesoramos antes de comprar.
              </p>
              <ExternalButton href={wa} target="_blank" className="mt-5 w-full">
                Escribir por WhatsApp
              </ExternalButton>
            </div>
          )}

          {datos.length > 0 && (
            <dl className="space-y-4">
              {datos.map((dato) => (
                <div key={dato.etiqueta} className="border-b border-[var(--surface-line)] pb-4">
                  <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-champagne">
                    {dato.etiqueta}
                  </dt>
                  <dd className="mt-1 text-[0.95rem]">
                    {dato.href ? (
                      <a href={dato.href} className="transition-colors hover:text-champagne">
                        {dato.valor}
                      </a>
                    ) : (
                      dato.valor
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {redes.length > 0 && (
            <div>
              <p className="eyebrow mb-4">Síguenos</p>
              <ul className="flex flex-wrap gap-3">
                {redes.map((red) => (
                  <li key={red.etiqueta}>
                    <a
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex border border-[var(--surface-line)] px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.16em] transition-colors hover:border-champagne hover:text-champagne"
                    >
                      {red.etiqueta}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {datos.length === 0 && !wa && (
            <p className="text-[0.88rem] text-[var(--surface-muted)]">
              Los datos de contacto se publican desde el panel de administración. Mientras tanto,
              usa el formulario y te respondemos.
            </p>
          )}
        </div>

        <div>
          <h2 className="eyebrow mb-6">Escríbenos</h2>
          <LeadForm
            tipo="contacto"
            textoBoton="Enviar mensaje"
            mensajeExito="Recibimos tu mensaje. Te respondemos lo antes posible."
            campos={[
              { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
              { nombre: 'telefono', etiqueta: 'WhatsApp', tipo: 'tel' },
              { nombre: 'email', etiqueta: 'Correo', tipo: 'email' },
              { nombre: 'ciudad', etiqueta: 'Ciudad' },
              {
                nombre: 'mensaje',
                etiqueta: 'Mensaje',
                multilinea: true,
                requerido: true,
                placeholder: '¿Qué fragancia buscas? ¿Tienes alguna duda?',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
