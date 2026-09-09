import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { brands } from '@/db/schema';
import { ProductForm } from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nueva referencia' };

export default async function NuevoProductoPage() {
  const marcas = await db
    .select({ id: brands.id, nombre: brands.nombre })
    .from(brands)
    .orderBy(asc(brands.nombre))
    .all();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Nueva referencia</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Las imágenes se agregan después de crear la referencia.
        </p>
      </header>

      <ProductForm marcas={marcas} />
    </div>
  );
}
