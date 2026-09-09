import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel YLANE' },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Segunda barrera (después del middleware): se revalida contra la base.
  const usuario = await requireAdmin();

  return (
    <div data-surface="claro" className="flex min-h-dvh flex-col lg:flex-row">
      <AdminNav nombre={usuario.nombre || usuario.email} />
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
