import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';

const TIENDA = [
  { href: '/perfumes', etiqueta: 'Todos los perfumes' },
  { href: '/arabes', etiqueta: 'Perfumería árabe' },
  { href: '/mujer', etiqueta: 'Mujer' },
  { href: '/hombre', etiqueta: 'Hombre' },
  { href: '/unisex', etiqueta: 'Unisex' },
  { href: '/marcas', etiqueta: 'Marcas' },
];

const AYUDA = [
  { href: '/descubre', etiqueta: 'Descubrir mi perfume' },
  { href: '/pedido', etiqueta: 'Consultar mi pedido' },
  { href: '/envios', etiqueta: 'Envíos' },
  { href: '/cambios-y-devoluciones', etiqueta: 'Cambios y devoluciones' },
  { href: '/preguntas-frecuentes', etiqueta: 'Preguntas frecuentes' },
];

const CASA = [
  { href: '/nosotros', etiqueta: 'Sobre YLANE' },
  { href: '/mayoristas', etiqueta: 'Mayoristas' },
  { href: '/contacto', etiqueta: 'Contacto' },
];

const LEGAL = [
  { href: '/terminos', etiqueta: 'Términos' },
  { href: '/privacidad', etiqueta: 'Privacidad' },
  { href: '/politicas', etiqueta: 'Políticas' },
];

export async function SiteFooter() {
  const ajustes = await getSettings();
  const wa = whatsappUrl(ajustes.whatsapp, 'Hola, quiero información sobre YLANE PERFUMES.');

  // Sólo las redes que el negocio configuró: ningún enlace vacío.
  const redes = [
    { etiqueta: 'Instagram', url: ajustes.instagram },
    { etiqueta: 'TikTok', url: ajustes.tiktok },
    { etiqueta: 'Facebook', url: ajustes.facebook },
  ].filter((red) => red.url?.trim());

  return (
    <footer data-surface="oscuro" className="border-t border-[var(--surface-line)]">
      <div className="shell grid gap-14 pb-12 pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-28">
        <div className="flex flex-col items-start lg:col-span-4">
          <Logo variante="completo" className="h-36 lg:h-44" />
          <p className="mt-8 max-w-[18rem] text-[0.9rem] leading-relaxed text-[var(--surface-muted)]">
            Tienda online y distribuidora de perfumes: perfumería árabe, de diseñador y nicho.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
          <ColumnaFooter titulo="Tienda" enlaces={TIENDA} />
          <ColumnaFooter titulo="Ayuda" enlaces={AYUDA} />
          <div className="col-span-2 sm:col-span-1">
            <ColumnaFooter titulo="YLANE" enlaces={CASA} />
            {(wa || ajustes.email || redes.length > 0) && (
              <ul className="mt-8 space-y-1 border-t border-[var(--surface-line)] pt-6">
                {wa && (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center text-[0.85rem] text-champagne transition-colors hover:text-champagne-soft"
                    >
                      Escríbenos por WhatsApp
                    </a>
                  </li>
                )}
                {ajustes.email && (
                  <li>
                    <a
                      href={`mailto:${ajustes.email}`}
                      className="flex min-h-11 items-center break-all text-[0.85rem] text-marfil-dim transition-colors hover:text-champagne"
                    >
                      {ajustes.email}
                    </a>
                  </li>
                )}
                {redes.map((red) => (
                  <li key={red.etiqueta} className="inline-block pr-5">
                    <a
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center text-[0.66rem] uppercase tracking-[0.2em] text-marfil-dim transition-colors hover:text-champagne"
                    >
                      {red.etiqueta}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--surface-line)]">
        <div className="shell flex flex-col gap-4 py-7 text-[0.7rem] text-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} YLANE PERFUMES
            {ajustes.ciudad ? ` · ${ajustes.ciudad}` : ''}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {LEGAL.map((enlace) => (
              <li key={enlace.href}>
                <Link href={enlace.href} className="flex min-h-11 items-center transition-colors hover:text-champagne">
                  {enlace.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function ColumnaFooter({
  titulo,
  enlaces,
}: {
  titulo: string;
  enlaces: { href: string; etiqueta: string }[];
}) {
  return (
    <nav aria-label={titulo}>
      <h2 className="eyebrow mb-5 font-[family-name:var(--font-sans)]">{titulo}</h2>
      <ul>
        {enlaces.map((enlace) => (
          <li key={enlace.href}>
            <Link
              href={enlace.href}
              className="flex min-h-11 items-center text-[0.88rem] text-marfil-dim transition-colors hover:text-champagne"
            >
              {enlace.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
