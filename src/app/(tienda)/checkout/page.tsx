import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { getSettings } from '@/lib/settings';
import { metodosDisponibles } from '@/lib/payments';

export const metadata: Metadata = {
  title: 'Finalizar compra',
  description: 'Completa tus datos para registrar el pedido.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const ajustes = await getSettings();
  const metodos = metodosDisponibles(ajustes);

  return (
    <div data-surface="oscuro" className="shell py-14 lg:py-20">
      <p className="eyebrow mb-3">Último paso</p>
      <h1 className="display-lg">Finalizar compra</h1>
      <div className="mt-12">
        <CheckoutForm metodos={metodos} />
      </div>
    </div>
  );
}
