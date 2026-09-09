import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { CategoriaFila, CategoriaFormulario } from '@/components/admin/Categorias';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categorías' };

export default async function CategoriasPage() {
  const lista = await db.select().from(categories).orderBy(asc(categories.orden)).all();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Categorías</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Las categorías se arman con un filtro del catálogo. Formatos válidos:{' '}
          <code className="text-vino">genero:DAMA</code>,{' '}
          <code className="text-vino">tipo:arabe</code>,{' '}
          <code className="text-vino">flag:destacado</code>,{' '}
          <code className="text-vino">flag:bestseller</code>,{' '}
          <code className="text-vino">flag:nuevo</code>.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Nueva categoría
        </h2>
        <CategoriaFormulario />
      </section>

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Categorías existentes
        </h2>
        <ul className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
          {lista.map((categoria) => (
            <CategoriaFila key={categoria.id} categoria={categoria} />
          ))}
        </ul>
      </section>
    </div>
  );
}
