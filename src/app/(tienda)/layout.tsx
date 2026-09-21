import type { CSSProperties } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Loader, RevealScript, WhatsAppButton } from '@/components/layout/Chrome';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getSettings } from '@/lib/settings';

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const ajustes = await getSettings();
  const anuncio = ajustes.anuncio_barra?.trim() ?? '';

  return (
    <div
      data-surface="oscuro"
      className="flex min-h-dvh flex-col"
      // Alto de la barra de anuncio: el hero y el espaciador de la cabecera lo descuentan.
      style={{ '--barra-h': anuncio ? '2rem' : '0px' } as CSSProperties}
    >
      <a
        href="#contenido"
        className="sr-only z-[100] bg-marfil px-4 py-3 text-tinta focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Loader />
      <RevealScript />
      <SiteHeader anuncio={anuncio} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
