import type { Metadata } from 'next';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Perfumes para hombre',
  description: 'Catálogo de perfumería masculina en YLANE PERFUMES: fragancias de diseñador, árabes y nicho.',
  alternates: { canonical: '/hombre' },
};

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      eyebrow="Hombre"
      titulo="Perfumería masculina"
      descripcion="Fragancias masculinas seleccionadas por YLANE: de diseñador, árabes y nicho."
      params={params}
      base={{ genero: ['CABALLERO'] }}
      bloqueadas={['genero']}
      rutaBase="/hombre"
    />
  );
}
