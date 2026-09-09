import type { Metadata } from 'next';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';
import { contarProductos } from '@/lib/catalog';

export const revalidate = 120;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}): Promise<Metadata> {
  const params = await searchParams;
  const consulta = typeof params.q === 'string' ? params.q : '';
  const total = await contarProductos();

  return {
    title: consulta ? `Búsqueda: ${consulta}` : 'Catálogo de perfumes',
    description: consulta
      ? `Resultados de "${consulta}" en el catálogo de YLANE PERFUMES.`
      : `Explora ${total} referencias de perfumería árabe, de diseñador y nicho en YLANE PERFUMES.`,
    alternates: { canonical: '/perfumes' },
    robots: consulta ? { index: false, follow: true } : undefined,
  };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      eyebrow="Catálogo completo"
      titulo="Todos los perfumes"
      descripcion="Perfumería árabe, de diseñador, comercial y nicho. Filtra por género, marca o tipo para encontrar tu próxima fragancia."
      params={params}
      rutaBase="/perfumes"
    />
  );
}
