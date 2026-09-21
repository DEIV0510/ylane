import type { Metadata } from 'next';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Ofertas en perfumes',
  description: 'Perfumes con precio rebajado en YLANE PERFUMES.',
  alternates: { canonical: '/ofertas' },
};

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      eyebrow="Precio rebajado"
      titulo="Ofertas"
      descripcion="Referencias con precio rebajado. Sólo aparecen aquí mientras la promoción esté activa."
      params={params}
      base={{ flag: 'oferta' }}
      bloqueadas={[]}
      rutaBase="/ofertas"
      vacio={{
        titulo: 'Sin ofertas activas',
        texto:
          'En este momento no hay referencias con precio rebajado. Cuando haya una promoción, aparecerá aquí.',
      }}
    />
  );
}
