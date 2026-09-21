import type { Metadata } from 'next';
import { LeadForm } from '@/components/forms/LeadForm';
import { Indice } from '@/components/ui/Bits';
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

  // Sólo los datos que el negocio ya publicó en el panel; los vacíos no se muestran.
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
    <div data-surface="claro">
      <header className="shell pb-12 pt-16 lg:pb-20 lg:pt-28">
        <Indice className="mb-6 lg:mb-8">Estamos para ayudarte</Indice>
        <h1 className="display-lg">Contacto</h1>
        <p className="lead mt-6 lg:mt-8">
          Cuéntanos qué buscas y te ayudamos a elegir. También resolvemos dudas de pedidos,
          envíos y distribución.
        </p>
      </header>

      <div className="shell pb-20 lg:pb-32">
        <div className="grid gap-16 border-t border-[var(--surface-line)] pt-12 lg:grid-cols-12 lg:gap-x-10 lg:pt-20">
          {/* Canales a la izquierda (4 columnas y una de aire), formulario a la derecha (7). */}
          <div className="lg:col-span-4">
            <h2 className="display-md">Escríbenos</h2>

            {wa && (
              <div className="mt-8">
                <p className="max-w-sm text-[var(--surface-muted)]">
                  ¿Prefieres WhatsApp? Es la vía más rápida y te asesoramos antes de comprar.
                </p>
                {/* A lo ancho de la columna: en 1024 px mide 288 px y el texto no debe partirse. */}
                <ExternalButton
                  href={wa}
                  target="_blank"
                  variante="contorno"
                  tamano="lg"
                  className="mt-5 w-full"
                >
                  Escribir por WhatsApp
                </ExternalButton>
              </div>
            )}

            {(datos.length > 0 || redes.length > 0) && (
              <dl className="mt-10 border-t border-[var(--surface-line)]">
                {datos.map((dato) => (
                  <div
                    key={dato.etiqueta}
                    className="grid gap-1 border-b border-[var(--surface-line)] py-4 sm:grid-cols-[6.5rem_1fr] sm:items-baseline sm:gap-6"
                  >
                    <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)]">
                      {dato.etiqueta}
                    </dt>
                    <dd className="min-w-0 break-words">
                      {dato.href ? (
                        <a
                          href={dato.href}
                          className="inline-flex min-h-11 items-center underline decoration-[var(--surface-line)] underline-offset-4 transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current"
                        >
                          {dato.valor}
                        </a>
                      ) : (
                        dato.valor
                      )}
                    </dd>
                  </div>
                ))}

                {redes.length > 0 && (
                  <div className="grid gap-1 border-b border-[var(--surface-line)] py-4 sm:grid-cols-[6.5rem_1fr] sm:items-baseline sm:gap-6">
                    <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--surface-muted)]">
                      Síguenos
                    </dt>
                    <dd>
                      <ul className="flex flex-wrap gap-x-6">
                        {redes.map((red) => (
                          <li key={red.etiqueta}>
                            <a
                              href={red.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center underline decoration-[var(--surface-line)] underline-offset-4 transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current"
                            >
                              {red.etiqueta}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
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
    </div>
  );
}
