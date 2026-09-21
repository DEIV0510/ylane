import Link from 'next/link';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { brands, products } from '@/db/schema';
import { AsignarGenero } from '@/components/admin/AsignarGenero';
import { GENERO_SIN_ASIGNAR } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Asignar género' };

export default async function GenerosPage() {
  const pendientes = await db
    .select({
      id: products.id,
      codigo: products.codigo,
      nombre: products.nombre,
      marca: brands.nombre,
    })
    .from(products)
    .leftJoin(brands, eq(products.marcaId, brands.id))
    .where(and(eq(products.genero, GENERO_SIN_ASIGNAR), eq(products.activo, true)))
    .orderBy(asc(brands.nombre), asc(products.nombre))
    .all();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Asignar género</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          {pendientes.length} referencias activas sin género. El catálogo del proveedor no lo trae, y
          no lo inventamos: mientras no lo asignes, estas referencias salen en el catálogo, en su
          marca y en el buscador, pero no en Hombre, Mujer ni Unisex.{' '}
          <Link href="/admin/productos?filtro=sin-genero" className="text-vino hover:underline">
            Verlas en el listado
          </Link>
        </p>
      </header>

      <AsignarGenero referencias={pendientes} />
    </div>
  );
}
