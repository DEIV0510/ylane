import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';
import { Monograma } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'Acceso al panel',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}) {
  const { destino } = await searchParams;

  return (
    <main
      data-surface="oscuro"
      className="flex min-h-dvh items-center justify-center px-5 py-16"
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Monograma className="mx-auto h-9 w-auto text-champagne" />
          <p
            className="mt-5 font-[family-name:var(--font-display)] text-lg tracking-[0.4em]"
            style={{ paddingLeft: '0.4em' }}
          >
            YLANE
          </p>
          <p className="mt-2 text-[0.6rem] uppercase tracking-[0.35em] text-[var(--surface-muted)]">
            Panel de administración
          </p>
        </div>

        <LoginForm destino={destino} />
      </div>
    </main>
  );
}
