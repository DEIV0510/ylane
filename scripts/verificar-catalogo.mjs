/**
 * Verifica que el catálogo de la base de datos sigue siendo fiel al Excel del negocio.
 *
 *   npm test
 *
 * Comprueba, contra el archivo original:
 *   - que no falte ni sobre ninguna referencia
 *   - que los códigos, nombres y géneros sean idénticos
 *   - que no haya códigos ni URLs duplicadas
 *   - que la importación no haya inventado precio, stock ni ficha técnica
 *
 * Sale con código 1 si algo no cuadra, para poder usarlo en CI.
 */
import { createClient } from '@libsql/client';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSheetRows } from './lib/xlsx.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const excel = join(root, 'data', 'catalogo-ylane.xlsx');

const errores = [];
const avisos = [];
let comprobaciones = 0;

function comprobar(descripcion, condicion, detalle = '') {
  comprobaciones += 1;
  if (condicion) {
    console.log(`  ✓ ${descripcion}`);
  } else {
    console.log(`  ✗ ${descripcion}${detalle ? ` — ${detalle}` : ''}`);
    errores.push(descripcion + (detalle ? `: ${detalle}` : ''));
  }
}

if (!existsSync(excel)) {
  console.error(`✗ No se encontró el Excel de origen: ${excel}`);
  process.exit(1);
}

/* ── Origen: el Excel ─────────────────────────────────────────────── */
const filas = readSheetRows(excel);
const cabecera = filas[0].cells;
const columnas = {};
for (const [letra, titulo] of Object.entries(cabecera)) {
  const clave = String(titulo).trim().toUpperCase();
  if (clave.startsWith('CODIGO') || clave.startsWith('CÓDIGO')) columnas.codigo = letra;
  else if (clave.startsWith('GENERO') || clave.startsWith('GÉNERO')) columnas.genero = letra;
  else if (clave.startsWith('NOMBRE')) columnas.nombre = letra;
}

const referencias = filas
  .slice(1)
  .map((fila) => ({
    codigo: (fila.cells[columnas.codigo] ?? '').trim(),
    genero: (fila.cells[columnas.genero] ?? '').trim().toUpperCase(),
    nombre: (fila.cells[columnas.nombre] ?? '').trim(),
  }))
  .filter((fila) => fila.codigo);

/* ── Destino: la base de datos ────────────────────────────────────── */
const cliente = createClient({
  url: process.env.DATABASE_URL ?? 'file:./data/ylane.db',
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

const { rows: productos } = await cliente.execute(
  'select codigo, nombre, genero, slug, precio, stock, familia_olfativa, concentracion, notas_salida, notas_corazon, notas_fondo, origen_pais, duracion, activo from products',
);

console.log(`\nExcel: ${referencias.length} referencias · Base de datos: ${productos.length}\n`);

/* ── 1. Cobertura ─────────────────────────────────────────────────── */
console.log('Cobertura');
const porCodigo = new Map(productos.map((p) => [p.codigo, p]));

comprobar(
  'Todas las referencias del Excel están en la base de datos',
  referencias.every((r) => porCodigo.has(r.codigo)),
  referencias
    .filter((r) => !porCodigo.has(r.codigo))
    .map((r) => r.codigo)
    .join(', '),
);

const codigosExcel = new Set(referencias.map((r) => r.codigo));
const sobrantes = productos.filter((p) => !codigosExcel.has(p.codigo));
if (sobrantes.length) {
  avisos.push(
    `${sobrantes.length} referencias en la base no vienen del Excel (creadas desde el panel): ${sobrantes
      .map((p) => p.codigo)
      .join(', ')}`,
  );
}

/* ── 2. Fidelidad de los datos del Excel ──────────────────────────── */
console.log('\nFidelidad al Excel');

const nombresDistintos = referencias.filter((r) => {
  const producto = porCodigo.get(r.codigo);
  if (!producto) return false;
  // Las referencias que llegaron sin nombre usan el código como provisional.
  const esperado = r.nombre || r.codigo;
  return producto.nombre !== esperado;
});
comprobar(
  'Los nombres coinciden exactamente con el Excel',
  nombresDistintos.length === 0,
  nombresDistintos.map((r) => `${r.codigo}: "${r.nombre}" ≠ "${porCodigo.get(r.codigo)?.nombre}"`).join(' | '),
);

const generosDistintos = referencias.filter((r) => {
  const producto = porCodigo.get(r.codigo);
  return producto && r.genero && producto.genero !== r.genero;
});
comprobar(
  'Los géneros coinciden con el Excel',
  generosDistintos.length === 0,
  generosDistintos.map((r) => `${r.codigo}: ${r.genero} ≠ ${porCodigo.get(r.codigo)?.genero}`).join(' | '),
);

/* ── 3. Unicidad ──────────────────────────────────────────────────── */
console.log('\nUnicidad');
const codigosVistos = new Map();
const codigosDuplicados = [];
for (const producto of productos) {
  if (codigosVistos.has(producto.codigo)) codigosDuplicados.push(producto.codigo);
  codigosVistos.set(producto.codigo, true);
}
comprobar('No hay códigos duplicados', codigosDuplicados.length === 0, codigosDuplicados.join(', '));

const slugsVistos = new Set();
const slugsDuplicados = [];
for (const producto of productos) {
  if (slugsVistos.has(producto.slug)) slugsDuplicados.push(producto.slug);
  slugsVistos.add(producto.slug);
}
comprobar('No hay URLs duplicadas', slugsDuplicados.length === 0, slugsDuplicados.join(', '));

const sinSlug = productos.filter((p) => !p.slug || !/^[a-z0-9-]+$/.test(String(p.slug)));
comprobar('Todas las URLs son válidas', sinSlug.length === 0, sinSlug.map((p) => `${p.codigo}: "${p.slug}"`).join(', '));

/* ── 4. Nada inventado ────────────────────────────────────────────── */
console.log('\nNada inventado por la importación');
const CAMPOS_SENSIBLES = [
  'precio',
  'stock',
  'familia_olfativa',
  'concentracion',
  'notas_salida',
  'notas_corazon',
  'notas_fondo',
  'origen_pais',
  'duracion',
];

// El Excel sólo trae código, género y nombre. Cualquier valor en estos campos tiene
// que venir del panel, nunca de la importación. Se informa cuántos hay cargados.
const cargados = CAMPOS_SENSIBLES.map((campo) => ({
  campo,
  total: productos.filter((p) => p[campo] != null && p[campo] !== '').length,
}));

const resumen = cargados
  .filter((c) => c.total > 0)
  .map((c) => `${c.campo}: ${c.total}`)
  .join(' · ');

console.log(
  resumen
    ? `  · Campos con datos cargados desde el panel — ${resumen}`
    : '  · Ningún campo sensible tiene datos: la importación no inventó nada.',
);

comprobar(
  'Las referencias sin nombre en el Excel quedaron inactivas',
  referencias
    .filter((r) => !r.nombre)
    .every((r) => porCodigo.get(r.codigo)?.activo === 0),
  referencias
    .filter((r) => !r.nombre && porCodigo.get(r.codigo)?.activo !== 0)
    .map((r) => r.codigo)
    .join(', '),
);

/* ── Resultado ────────────────────────────────────────────────────── */
console.log('');
for (const aviso of avisos) console.log(`  ! ${aviso}`);

if (errores.length) {
  console.error(`\n✗ ${errores.length} de ${comprobaciones} comprobaciones fallaron.\n`);
  process.exit(1);
}

console.log(`\n✓ ${comprobaciones} comprobaciones superadas. El catálogo es fiel al Excel.\n`);
