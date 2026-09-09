import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { brands, productImages, products } from '@/db/schema';
import { ProductForm } from '@/components/admin/ProductForm';
import { ImageManager } from '@/components/admin/ImageManager';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await db
    .select({ nombre: products.nombre })
    .from(products)
    .where(eq(products.id, Number(id)))
    .get();
  return { title: producto?.nombre ?? 'Referencia' };
}

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [producto, imagenes, marcas] = await Promise.all([
    db.select().from(products).where(eq(products.id, productId)).get(),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.orden))
      .all(),
    db.select({ id: brands.id, nombre: brands.nombre }).from(brands).orderBy(asc(brands.nombre)).all(),
  ]);

  if (!producto) notFound();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
            {producto.codigo}
          </p>
          <h1 className="display-md mt-1">{producto.nombre}</h1>
        </div>
        <Link
          href={`/perfumes/${producto.slug}`}
          target="_blank"
          className="border border-[var(--surface-line)] px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] transition-colors hover:border-vino hover:text-vino"
        >
          Ver en la tienda ↗
        </Link>
      </header>

      <ImageManager productId={producto.id} imagenes={imagenes} />
      <ProductForm producto={producto} marcas={marcas} />
    </div>
  );
}
