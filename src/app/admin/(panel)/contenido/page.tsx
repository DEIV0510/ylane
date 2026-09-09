import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { contentBlocks } from '@/db/schema';
import { BloqueContenido } from '@/components/admin/BloqueContenido';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Páginas y textos' };

const PLANTILLAS: Record<string, string> = {
  envios: [
    '## Cobertura',
    '',
    'Describe a qué ciudades envías y con qué transportadora.',
    '',
    '## Tiempos de entrega',
    '',
    'Indica los días hábiles estimados por zona.',
    '',
    '## Costo del envío',
    '',
    'Explica cómo se calcula el costo y si hay envío gratis desde algún monto.',
  ].join('\n'),
  politicas: [
    '## Alcance',
    '',
    'Define qué cubre esta política.',
    '',
    '## Compras y pagos',
    '',
    'Explica cómo se confirma un pedido y qué formas de pago aceptas.',
    '',
    '## Garantías',
    '',
    'Indica qué garantías ofreces y bajo qué condiciones.',
  ].join('\n'),
  terminos: [
    '## Uso del sitio',
    '',
    'Condiciones de uso de la tienda.',
    '',
    '## Precios y disponibilidad',
    '',
    'Aclara que los precios y la disponibilidad pueden cambiar sin previo aviso.',
    '',
    '## Responsabilidad',
    '',
    'Define los límites de responsabilidad del negocio.',
  ].join('\n'),
  privacidad: [
    '## Datos que recogemos',
    '',
    'Nombre, teléfono, correo y dirección para gestionar los pedidos.',
    '',
    '## Para qué los usamos',
    '',
    'Explica el uso: contacto, despacho y seguimiento del pedido.',
    '',
    '## Tus derechos',
    '',
    'Indica cómo puede alguien pedir la eliminación o corrección de sus datos.',
  ].join('\n'),
  cambios: [
    '## Plazos',
    '',
    'Define el plazo para solicitar un cambio o una devolución.',
    '',
    '## Condiciones',
    '',
    'Estado en el que debe estar el producto para aceptar el cambio.',
    '',
    '## Cómo solicitarlo',
    '',
    'Explica el paso a paso para pedir un cambio.',
  ].join('\n'),
};

export default async function ContenidoPage() {
  const bloques = await db
    .select()
    .from(contentBlocks)
    .orderBy(asc(contentBlocks.grupo), asc(contentBlocks.clave))
    .all();

  const grupos = [...new Set(bloques.map((bloque) => bloque.grupo))];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Contenido
        </p>
        <h1 className="display-md mt-1">Páginas y textos</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Formato: <code className="text-vino">## Título</code> para encabezados,{' '}
          <code className="text-vino">- </code> para viñetas, línea en blanco entre párrafos. Las
          páginas legales están vacías a propósito: el contenido lo define el negocio.
        </p>
      </header>

      {grupos.map((grupo) => (
        <section key={grupo} className="space-y-4">
          <h2 className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
            {grupo}
          </h2>
          {bloques
            .filter((bloque) => bloque.grupo === grupo)
            .map((bloque) => (
              <BloqueContenido
                key={bloque.clave}
                bloque={bloque}
                plantilla={PLANTILLAS[bloque.clave]}
              />
            ))}
        </section>
      ))}
    </div>
  );
}
