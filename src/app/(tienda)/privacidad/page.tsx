import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo tratamos tus datos en YLANE PERFUMES.',
  alternates: { canonical: '/privacidad' },
};

export default function Pagina() {
  return (
    <ContentPage
      clave="privacidad"
      titulo="Política de privacidad"
      eyebrow="Legal"
    />
  );
}
