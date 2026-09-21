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

  // El encabezado vive dentro del formulario: al confirmar pasa a ser
  // «Pedido registrado» y no quedan dos títulos apilados.
  return (
    <div data-surface="claro">
      <div className="shell pt-10 sm:pt-14 lg:pt-20">
        <CheckoutForm metodos={metodos} />
      </div>
    </div>
  );
}
