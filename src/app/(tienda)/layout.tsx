import { CartDrawer } from '@/components/cart/CartDrawer';
import { Loader, RevealScript, WhatsAppButton } from '@/components/layout/Chrome';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getSettings } from '@/lib/settings';

export default async function TiendaLayout({ children }: { children: React.ReactNode }) {
  const ajustes = await getSettings();

  return (
    <div data-surface="oscuro" className="flex min-h-dvh flex-col">
      <Loader />
      <RevealScript />
      <SiteHeader anuncio={ajustes.anuncio_barra ?? ''} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
