import type { Metadata } from 'next';
import { CartPage } from '@/components/cart/CartPage';

export const metadata: Metadata = {
  title: 'Tu carrito',
  description: 'Revisa las fragancias que agregaste antes de finalizar tu compra.',
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return (
    <div data-surface="oscuro" className="shell py-14 lg:py-20">
      <p className="eyebrow mb-3">Compra</p>
      <h1 className="display-lg">Tu carrito</h1>
      <div className="mt-10">
        <CartPage />
      </div>
    </div>
  );
}
