import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { products } from '@/db/schema';

export const dynamic = 'force-dynamic';

/** Contador de visitas por referencia. No almacena datos del visitante. */
export async function POST(request: Request) {
  try {
    const cuerpo = (await request.json()) as { productId?: unknown };
    const id = Number(cuerpo.productId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await db
      .update(products)
      .set({ vistas: sql`${products.vistas} + 1` })
      .where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
