import { ProductCard } from '@/components/product/ProductCard';
import { EnlaceFlecha, Indice } from '@/components/ui/Bits';
import type { ProductoVista } from '@/lib/catalog';

/**
 * 02 — Selección YLANE. No es un listado: una pieza protagonista (la mitad
 * de la composición) y dos que la acompañan, con el texto en medio.
 */
export function SeleccionYlane({ productos }: { productos: ProductoVista[] }) {
  const [protagonista, ...acompanantes] = productos;
  if (!protagonista) return null;

  return (
    <section data-surface="claro" className="section-y">
      <div className="shell grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div data-reveal className="lg:col-span-6 lg:row-span-2">
          <ProductCard
            producto={protagonista}
            tamano="grande"
            sizes="(max-width: 1024px) 100vw, 46vw"
          />
        </div>

        <header data-reveal className="max-lg:order-first lg:col-span-5 lg:col-start-8 lg:pt-6">
          <Indice numero="02">Selección YLANE</Indice>
          <h2 className="display-lg mt-6">Tres fragancias para empezar.</h2>
          <p className="lead mt-6">
            Estilos distintos, un mismo punto de partida para recorrer el catálogo sin prisa.
          </p>
          <EnlaceFlecha href="/perfumes" className="mt-6">
            Ver todo el catálogo
          </EnlaceFlecha>
        </header>

        {acompanantes.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:col-span-5 lg:col-start-8 lg:self-end">
            {acompanantes.slice(0, 2).map((producto, indice) => (
              <div
                key={producto.id}
                data-reveal
                style={{ transitionDelay: `${indice * 90}ms` }}
                className={indice === 1 ? 'mt-10 lg:mt-16' : ''}
              >
                <ProductCard producto={producto} sizes="(max-width: 1024px) 50vw, 20vw" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
