import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { FormularioConfiguracion } from '@/components/admin/FormularioConfiguracion';
import { pagoOnlineDisponible, proveedorPago } from '@/lib/payments';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Configuración' };

const TITULOS: Record<string, string> = {
  general: 'General',
  contacto: 'Contacto',
  redes: 'Redes sociales',
  envios: 'Envíos',
  pagos: 'Pagos',
  analitica: 'Analítica',
  seo: 'SEO',
};

export default async function ConfiguracionPage() {
  const claves = await db.select().from(settings).orderBy(asc(settings.grupo), asc(settings.orden)).all();
  const grupos = [...new Set(claves.map((clave) => clave.grupo))];
  const proveedor = proveedorPago();
  const online = pagoOnlineDisponible();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Ajustes
        </p>
        <h1 className="display-md mt-1">Configuración</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Estos datos alimentan la tienda: WhatsApp, redes, envíos, pagos y analítica.
        </p>
      </header>

      <div className="border border-[var(--surface-line)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg">Pasarela de pago</h2>
        <p className="mt-2 text-[0.85rem] text-[var(--surface-muted)]">
          {online
            ? `Proveedor activo: ${proveedor}. Ya puedes activar "Pago online" abajo.`
            : proveedor
              ? `Proveedor seleccionado (${proveedor}) pero faltan las llaves en las variables de entorno.`
              : 'Sin pasarela configurada. El pago online permanece desactivado y el checkout registra el pedido para coordinarlo contigo.'}
        </p>
        <p className="mt-3 text-[0.78rem] text-[var(--surface-muted)]">
          Para activarla necesitas definir en el servidor:{' '}
          <code className="text-vino">PAYMENTS_PROVIDER</code> y las llaves del proveedor
          (Wompi: <code className="text-vino">NEXT_PUBLIC_WOMPI_PUBLIC_KEY</code> y{' '}
          <code className="text-vino">WOMPI_INTEGRITY_SECRET</code>; Bold:{' '}
          <code className="text-vino">NEXT_PUBLIC_BOLD_API_KEY</code> y{' '}
          <code className="text-vino">BOLD_SECRET_KEY</code>). Nunca se guardan en la base de datos
          ni se exponen en el navegador.
        </p>
      </div>

      <FormularioConfiguracion claves={claves} grupos={grupos} titulos={TITULOS} />
    </div>
  );
}
