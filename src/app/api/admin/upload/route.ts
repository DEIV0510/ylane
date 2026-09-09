import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const TAMANO_MAXIMO = 6 * 1024 * 1024; // 6 MB

const EXTENSIONES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/**
 * Subida de imágenes del panel.
 * - Con BLOB_READ_WRITE_TOKEN → Vercel Blob (necesario en producción, donde el
 *   sistema de archivos es de sólo lectura).
 * - Sin token → /public/uploads (suficiente en desarrollo local).
 */
export async function POST(request: Request) {
  const usuario = await getCurrentUser();
  if (!usuario) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const datos = await request.formData();
  const archivo = datos.get('archivo');

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json(
      { error: 'Formato no permitido. Usa JPG, PNG, WebP o AVIF.' },
      { status: 400 },
    );
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return NextResponse.json({ error: 'La imagen supera los 6 MB' }, { status: 400 });
  }

  const extension = EXTENSIONES[archivo.type] ?? 'jpg';
  const nombre = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const subida = await put(`productos/${nombre}`, archivo, {
        access: 'public',
        contentType: archivo.type,
      });
      return NextResponse.json({ url: subida.url });
    }

    const carpeta = join(process.cwd(), 'public', 'uploads');
    await mkdir(carpeta, { recursive: true });
    await writeFile(join(carpeta, nombre), Buffer.from(await archivo.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${nombre}` });
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar la imagen' }, { status: 500 });
  }
}
