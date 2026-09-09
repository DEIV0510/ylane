import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PREGUNTAS, recomendar } from '@/lib/finder';

export const dynamic = 'force-dynamic';

const esquema = z.object({
  genero: z.enum(PREGUNTAS.genero).optional(),
  personalidad: z.array(z.enum(PREGUNTAS.personalidad)).max(7).optional(),
  ocasion: z.array(z.enum(PREGUNTAS.ocasion)).max(6).optional(),
  intensidad: z.enum(PREGUNTAS.intensidad).optional(),
});

export async function POST(request: Request) {
  try {
    const analisis = esquema.safeParse(await request.json());
    if (!analisis.success) {
      return NextResponse.json({ error: 'Respuestas no válidas' }, { status: 400 });
    }
    const resultado = await recomendar(analisis.data, 8);
    return NextResponse.json(resultado);
  } catch {
    return NextResponse.json({ error: 'No se pudo calcular la recomendación' }, { status: 500 });
  }
}
