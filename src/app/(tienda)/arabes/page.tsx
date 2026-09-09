import type { Metadata } from 'next';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Perfumería árabe',
  description: 'Colección de perfumería árabe de YLANE PERFUMES: Lattafa, Afnan, Al Haramain, Orientica y más.',
  alternates: { canonical: '/arabes' },
};

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      eyebrow="La especialidad de la casa"
      titulo="Perfumería árabe"
      descripcion="La línea con la que más se identifica YLANE. Intensa, distinta y con carácter propio."
      params={params}
      base={{ tipo: ['arabe'] }}
      bloqueadas={['tipo']}
      rutaBase="/arabes"
    />
  );
}
