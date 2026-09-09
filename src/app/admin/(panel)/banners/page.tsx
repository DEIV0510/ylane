import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { banners } from '@/db/schema';
import { BannerFila, BannerFormulario } from '@/components/admin/Banners';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Banners' };

export default async function BannersPage() {
  const lista = await db.select().from(banners).orderBy(asc(banners.ubicacion), asc(banners.orden)).all();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Contenido
        </p>
        <h1 className="display-md mt-1">Banners</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Controla el hero de la portada y la banda promocional. Si dejas la imagen vacía, se usa
          la composición gráfica de la marca.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Nuevo banner
        </h2>
        <BannerFormulario />
      </section>

      <section className="space-y-4">
        <h2 className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Banners existentes
        </h2>
        {lista.map((banner) => (
          <BannerFila key={banner.id} banner={banner} />
        ))}
      </section>
    </div>
  );
}
