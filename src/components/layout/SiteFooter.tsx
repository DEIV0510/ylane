import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';

const COMPRAR = [
  { href: '/hombre', etiqueta: 'Hombre' },
  { href: '/mujer', etiqueta: 'Mujer' },
  { href: '/unisex', etiqueta: 'Unisex' },
  { href: '/arabes', etiqueta: 'Árabes' },
  { href: '/ofertas', etiqueta: 'Ofertas' },
];

const AYUDA = [
  { href: '/contacto', etiqueta: 'Contacto' },
  { href: '/envios', etiqueta: 'Envíos' },
  { href: '/preguntas-frecuentes', etiqueta: 'Preguntas frecuentes' },
  { href: '/cambios-y-devoluciones', etiqueta: 'Cambios y devoluciones' },
  { href: '/politicas', etiqueta: 'Políticas' },
];

const MAYORISTAS = [
  { href: '/mayoristas', etiqueta: 'Distribución' },
  { href: '/mayoristas#solicitar', etiqueta: 'Solicitar información' },
  { href: '/nosotros', etiqueta: 'Sobre YLANE' },
];

export async function SiteFooter() {
  const ajustes = await getSettings();
  const wa = whatsappUrl(ajustes.whatsapp, 'Hola, quiero información sobre YLANE PERFUMES.');

  const redes = [
    { etiqueta: 'Instagram', url: ajustes.instagram },
    { etiqueta: 'TikTok', url: ajustes.tiktok },
    { etiqueta: 'Facebook', url: ajustes.facebook },
    { etiqueta: 'WhatsApp', url: wa ?? '' },
  ].filter((red) => red.url);

  return (
    <footer data-surface="oscuro" className="border-t border-[var(--surface-line)]">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10 lg:py-20">
        <div>
          <Logo className="text-marfil" />
          <p className="mt-5 max-w-xs font-[family-name:var(--font-display)] text-xl leading-snug text-marfil-dim">
            Tu aroma. Tu firma.
          </p>
          <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-[var(--surface-muted)]">
            Tienda online y distribuidora de perfumes. Perfumería árabe, de diseñador y nicho.
          </p>

          {redes.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {redes.map((red) => (
                <li key={red.etiqueta}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.66rem] uppercase tracking-[0.2em] text-marfil-dim transition-colors hover:text-champagne"
                  >
                    {red.etiqueta}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ColumnaFooter titulo="Comprar" enlaces={COMPRAR} />
        <ColumnaFooter titulo="Ayuda" enlaces={AYUDA} />
        <ColumnaFooter titulo="Mayoristas" enlaces={MAYORISTAS} />
      </div>

      <div className="border-t border-[var(--surface-line)]">
        <div className="shell flex flex-col gap-3 py-6 text-[0.68rem] text-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} YLANE PERFUMES. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/terminos" className="transition-colors hover:text-champagne">
              Términos
            </Link>
            <Link href="/privacidad" className="transition-colors hover:text-champagne">
              Privacidad
            </Link>
            {ajustes.email && (
              <a href={`mailto:${ajustes.email}`} className="transition-colors hover:text-champagne">
                {ajustes.email}
              </a>
            )}
          </div>
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
    <div>
      <h2 className="eyebrow mb-5">{titulo}</h2>
      <ul className="space-y-2.5">
        {enlaces.map((enlace) => (
          <li key={enlace.href}>
            <Link
              href={enlace.href}
              className="text-[0.85rem] text-marfil-dim transition-colors hover:text-champagne"
            >
              {enlace.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
