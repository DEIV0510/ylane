import type { Metadata } from 'next';
import { CartPage } from '@/components/cart/CartPage';
import { Indice } from '@/components/ui/Bits';

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisa las fragancias que agregaste antes de finalizar tu compra.',
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return (
    <div data-surface="claro">
      <div className="shell pt-10 sm:pt-14 lg:pt-20">
        <header className="max-w-3xl">
          <Indice>Carrito</Indice>
          <h1 className="display-lg mt-5">Tu selección</h1>
        </header>
        <div className="mt-10 lg:mt-14">
          <CartPage />
        </div>
      </div>
    </div>
  );
}
