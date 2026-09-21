import { NextResponse } from 'next/server';
import { marcasCoincidentes, sugerencias } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

/**
 * Buscador instantáneo: perfumes y marcas que coinciden con lo que se escribe.
 *
 * Cada campo se copia a mano: lo que no está en esta lista no sale hacia el
 * navegador aunque la consulta del catálogo cambie algún día. Costos y datos del
 * proveedor nunca deben llegar a la tienda (lo vigila `npm run verificar:fuga`).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const termino = (searchParams.get('q') ?? '').slice(0, 80);

  if (termino.trim().length < 2) {
    return NextResponse.json({ items: [], marcas: [] });
  }

  try {
    // Consultas independientes: en paralelo, la respuesta llega antes.
    const [productos, casas] = await Promise.all([
      sugerencias(termino, 8),
      marcasCoincidentes(termino, 4),
    ]);

    const items = productos.map(({ id, slug, nombre, codigo, genero, precio, marca, imagen }) => ({
      id,
      slug,
      nombre,
      codigo,
      genero,
      precio,
      marca,
      imagen,
    }));
    const marcas = casas.map(({ slug, nombre, total }) => ({ slug, nombre, total }));

    return NextResponse.json(
      { items, marcas },
      { headers: { 'Cache-Control': 'private, max-age=20' } },
    );
  } catch {
    return NextResponse.json(
      { items: [], marcas: [], error: 'No se pudo completar la búsqueda' },
      { status: 500 },
    );
  }
}
