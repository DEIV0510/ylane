import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { brands } from '@/db/schema';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';
import { TIPO_ETIQUETA } from '@/lib/format';

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ParametrosBusqueda>;
};

async function obtenerMarca(slug: string) {
  return db.select().from(brands).where(eq(brands.slug, slug)).get();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const marca = await obtenerMarca(slug);
  if (!marca) return { title: 'Marca no encontrada' };

  return {
    title: `${marca.nombre} — perfumes`,
    description:
      marca.descripcion ??
      `Referencias de ${marca.nombre} disponibles en YLANE PERFUMES.`,
    alternates: { canonical: `/marcas/${marca.slug}` },
  };
}

export default async function MarcaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [marca, query] = await Promise.all([obtenerMarca(slug), searchParams]);
  if (!marca) notFound();

  return (
    <CatalogView
      eyebrow={marca.origen ? TIPO_ETIQUETA[marca.origen] : 'Marca'}
      titulo={marca.nombre}
      descripcion={
        marca.descripcion ??
        `Referencias de ${marca.nombre} dentro del catálogo de YLANE PERFUMES.`
      }
      params={query}
      base={{ marca: [marca.slug] }}
      bloqueadas={['marca']}
      rutaBase={`/marcas/${marca.slug}`}
    />
  );
}
