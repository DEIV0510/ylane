/**
 * Asigna fotos reales de producto a partir de carpetas cuyos archivos se
 * llaman "<CODIGO> - <nombre libre>.jpg" (como las que deja el negocio en
 * Desktop/ylane/Botellas_parteN).
 *
 *   node scripts/asignar-fotos.mjs [carpeta...]
 *
 * Sin argumentos, busca automáticamente las subcarpetas "Botellas_parte*"
 * dentro de Desktop/ylane. Por cada foto:
 *   1. Si el código coincide con una referencia del catálogo anterior
 *      (C/D/UNI) que ya está publicada con el MISMO nombre bajo un código
 *      del proveedor (P###), la foto se asigna a esa ficha activa en vez
 *      de duplicar el producto en la tienda.
 *   2. Si no, la foto se copia a public/productos/<codigo>.<ext>, se
 *      registra como imagen principal y el producto se activa (salvo que
 *      todavía no tenga nombre real: esas quedan inactivas a propósito).
 * Se puede volver a ejecutar con carpetas nuevas: una referencia que ya
 * tiene foto principal no se vuelve a tocar.
 */
import { createClient } from '@libsql/client';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXTENSIONES_VALIDAS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function normaliza(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function carpetasPorDefecto() {
  const base = join(homedir(), 'Desktop', 'ylane');
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^Botellas_parte/i.test(e.name))
    .map((e) => join(base, e.name));
}

const carpetas = process.argv.slice(2).length
  ? process.argv.slice(2).map((p) => resolve(p))
  : carpetasPorDefecto();

if (!carpetas.length) {
  console.error('✗ No se indicó ninguna carpeta y no se encontró Desktop/ylane/Botellas_parte*.');
  process.exit(1);
}

/* ── 1. Leer fotos de las carpetas ────────────────────────────────── */
const fotos = new Map(); // codigo -> { ruta, ext, carpeta }
const avisos = [];

for (const carpeta of carpetas) {
  if (!existsSync(carpeta)) {
    avisos.push(`Carpeta no encontrada: ${carpeta}`);
    continue;
  }
  for (const archivo of readdirSync(carpeta)) {
    const ext = extname(archivo).toLowerCase();
    if (!EXTENSIONES_VALIDAS.has(ext)) continue;
    const separador = archivo.indexOf(' - ');
    if (separador === -1) {
      avisos.push(`"${archivo}" no sigue el patrón "CODIGO - Nombre" (se omite)`);
      continue;
    }
    const codigo = archivo.slice(0, separador).trim();
    if (fotos.has(codigo)) {
      avisos.push(`Código "${codigo}" repetido (se usa la primera copia encontrada)`);
      continue;
    }
    fotos.set(codigo, { ruta: join(carpeta, archivo), ext, carpeta: basename(carpeta) });
  }
}

console.log(`Fotos encontradas: ${fotos.size} en ${carpetas.length} carpeta(s)\n`);

/* ── 2. Cargar catálogo actual ────────────────────────────────────── */
const client = createClient({
  url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ylane.db',
  authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
});

const { rows: productos } = await client.execute(
  'SELECT id, codigo, nombre, activo, requiere_revision FROM products',
);
const porCodigo = new Map(productos.map((p) => [p.codigo, p]));

const { rows: imagenes } = await client.execute(
  `SELECT product_id FROM product_images WHERE tipo = 'principal'`,
);
const conFotoPrincipal = new Set(imagenes.map((i) => i.product_id));

// Referencias del proveedor (P###) por nombre normalizado: si una foto del
// catálogo anterior corresponde a una de estas, se usa ahí para no duplicar
// la ficha en la tienda (la vieja se deja inactiva, ya está de más).
const proveedorPorNombre = new Map();
for (const p of productos) {
  if (!/^P\d/.test(p.codigo)) continue;
  const key = normaliza(p.nombre);
  if (!proveedorPorNombre.has(key)) proveedorPorNombre.set(key, []);
  proveedorPorNombre.get(key).push(p);
}

/* ── 3. Procesar cada foto ────────────────────────────────────────── */
const carpetaDestino = join(root, 'public', 'productos');
mkdirSync(carpetaDestino, { recursive: true });

let activados = 0;
let fotoEnProveedor = 0;
let yaTeniaFoto = 0;
let sinNombreTodavia = 0;
const duplicadosDetectados = [];

for (const [codigo, foto] of fotos) {
  const producto = porCodigo.get(codigo);
  if (!producto) {
    avisos.push(`Sin coincidencia en la base: ${codigo} (${basename(foto.ruta)})`);
    continue;
  }

  const otrosConMismoNombre = (proveedorPorNombre.get(normaliza(producto.nombre)) ?? []).filter(
    (p) => p.codigo !== codigo,
  );
  const destinoProveedor = otrosConMismoNombre.find((p) => !conFotoPrincipal.has(p.id));
  const destino = destinoProveedor ?? producto;

  if (conFotoPrincipal.has(destino.id)) {
    yaTeniaFoto += 1;
    continue;
  }

  const archivoDestino = `${destino.codigo}${foto.ext}`;
  copyFileSync(foto.ruta, join(carpetaDestino, archivoDestino));

  await client.execute({
    sql: `INSERT INTO product_images (product_id, url, alt, tipo, orden) VALUES (?, ?, ?, 'principal', 0)`,
    args: [destino.id, `/productos/${archivoDestino}`, destino.nombre],
  });
  conFotoPrincipal.add(destino.id);

  if (destinoProveedor) {
    fotoEnProveedor += 1;
    duplicadosDetectados.push(`${codigo} "${producto.nombre}" → foto puesta en ${destinoProveedor.codigo} (ya activo); ${codigo} sigue inactivo`);
  } else if (!producto.activo && !producto.requiere_revision) {
    await client.execute({ sql: 'UPDATE products SET activo = 1 WHERE id = ?', args: [producto.id] });
    activados += 1;
  } else if (producto.requiere_revision) {
    sinNombreTodavia += 1;
  }
}

console.log(`✓ ${activados} referencias activadas con su foto nueva`);
console.log(`✓ ${fotoEnProveedor} fotos asignadas a la ficha ya activa del proveedor (evita duplicar la fragancia)`);
if (yaTeniaFoto) console.log(`· ${yaTeniaFoto} ya tenían foto principal (sin cambios)`);
if (sinNombreTodavia) console.log(`· ${sinNombreTodavia} con foto nueva pero sin nombre real todavía: siguen inactivas`);

if (duplicadosDetectados.length) {
  console.log(`\nDuplicados resueltos (${duplicadosDetectados.length}):`);
  duplicadosDetectados.forEach((d) => console.log(`  · ${d}`));
}

const codigosAnteriores = productos.filter((p) => /^(C|D|UNI)\d/.test(p.codigo));
const sinFotoTodavia = codigosAnteriores.filter((p) => !conFotoPrincipal.has(p.id));
if (sinFotoTodavia.length) {
  console.log(`\n${sinFotoTodavia.length} referencias del catálogo anterior siguen sin foto:`);
  console.log('  ' + sinFotoTodavia.map((p) => `${p.codigo} (${p.nombre})`).join('\n  '));
}

if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`);
  avisos.forEach((a) => console.log(`  ! ${a}`));
}
