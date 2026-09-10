import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Jost } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { CartProvider } from '@/components/cart/CartProvider';
import { ConfigProvider, type ConfigTienda } from '@/components/ConfigProvider';
import { getAnalyticsIds, getSettings, siteUrl } from '@/lib/settings';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bodoni',
  weight: ['400', '500', '600'],
});

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
  weight: ['300', '400', '500', '600'],
});

export async function generateMetadata(): Promise<Metadata> {
  const ajustes = await getSettings();
  const titulo = ajustes.seo_title || 'YLANE PERFUMES · Tu aroma. Tu firma.';
  const descripcion =
    ajustes.seo_description ||
    'Tienda online y distribuidora de perfumes. Perfumería árabe, de diseñador y nicho.';

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: titulo, template: '%s · YLANE PERFUMES' },
    description: descripcion,
    applicationName: 'YLANE PERFUMES',
    keywords: [
      'perfumes',
      'perfumería árabe',
      'fragancias',
      'distribuidora de perfumes',
      'perfumes nicho',
      'YLANE',
    ],
    openGraph: {
      type: 'website',
      locale: 'es_CO',
      siteName: 'YLANE PERFUMES',
      title: titulo,
      description: descripcion,
      url: siteUrl(),
    },
    twitter: { card: 'summary_large_image', title: titulo, description: descripcion },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#090909',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ajustes = await getSettings();
  const { ga4, pixel } = await getAnalyticsIds();

  const config: ConfigTienda = {
    whatsapp: ajustes.whatsapp ?? '',
    instagram: ajustes.instagram ?? '',
    tiktok: ajustes.tiktok ?? '',
    facebook: ajustes.facebook ?? '',
    email: ajustes.email ?? '',
    telefono: ajustes.telefono ?? '',
    ciudad: ajustes.ciudad ?? '',
    envioCosto: numeroONull(ajustes.envio_costo),
    envioGratisDesde: numeroONull(ajustes.envio_gratis_desde),
    envioNota: ajustes.envio_nota ?? '',
    siteUrl: siteUrl(),
  };

  return (
    <html lang="es" className={`${bodoni.variable} ${jost.variable}`}>
      <body className="min-h-dvh antialiased">
        <ConfigProvider valor={config}>
          <CartProvider>{children}</CartProvider>
        </ConfigProvider>

        {/* Analítica: sólo se carga si hay ID configurado. */}
        {ga4 && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga4)});`}
            </Script>
          </>
        )}
        {pixel && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixel)});fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}

function numeroONull(valor: string | undefined): number | null {
  if (!valor?.trim()) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}
