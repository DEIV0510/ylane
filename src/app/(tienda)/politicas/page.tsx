import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Políticas',
  description: 'Políticas de la tienda YLANE PERFUMES.',
  alternates: { canonical: '/politicas' },
};

export default function Pagina() {
  return (
    <ContentPage
      clave="politicas"
      titulo="Políticas de la tienda"
      eyebrow="Legal"
    />
  );
}
