import { NextResponse } from 'next/server';
import { sugerencias } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const termino = (searchParams.get('q') ?? '').slice(0, 80);

  if (termino.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await sugerencias(termino, 8);
    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'private, max-age=20' } },
    );
  } catch {
    return NextResponse.json({ items: [], error: 'No se pudo completar la búsqueda' }, { status: 500 });
  }
}
