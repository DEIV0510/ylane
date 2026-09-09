/**
 * Importa el catálogo de YLANE desde el archivo Excel del negocio.
 *
 *   node scripts/import-excel.mjs [ruta-del-excel]
 *
 * Salidas:
 *   data/catalogo.json   → fuente de la siembra de la base de datos
 *   docs/IMPORTACION.md  → informe de validación (qué se dedujo y qué falta)
 *
 * Se puede volver a ejecutar con una versión nueva del Excel: el CÓDIGO es la
 * llave única, así que las referencias no se duplican (ver scripts/seed.ts).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSheetRows } from './lib/xlsx.mjs';
import {
  GENEROS,
  TIPO_MANUAL,
  detectarMarca,
  generarDescripcion,
  generarDescripcionCorta,
  slugify,
} from './lib/catalogo.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origen = process.argv[2] ?? join(root, 'data', 'catalogo-ylane.xlsx');

if (!existsSync(origen)) {
  console.error(`✗ No se encontró el archivo Excel: ${origen}`);
  process.exit(1);
}

const filas = readSheetRows(origen);
if (!filas.length) {
  console.error('✗ El archivo Excel no tiene filas.');
  process.exit(1);
}

/* ── Cabecera: se localizan las columnas por nombre, no por posición ── */
const cabecera = filas[0].cells;
const columnas = {};
for (const [letra, titulo] of Object.entries(cabecera)) {
  const clave = String(titulo).trim().toUpperCase();
  if (clave.startsWith('CODIGO') || clave.startsWith('CÓDIGO')) columnas.codigo = letra;
  else if (clave.startsWith('GENERO') || clave.startsWith('GÉNERO')) columnas.genero = letra;
  else if (clave.startsWith('NOMBRE')) columnas.nombre = letra;
}
for (const requerida of ['codigo', 'genero', 'nombre']) {
  if (!columnas[requerida]) {
    console.error(`✗ Falta la columna "${requerida.toUpperCase()}" en el Excel.`);
    process.exit(1);
  }
}

const informe = {
  filasLeidas: filas.length - 1,
  codigosDuplicados: [],
  sinNombre: [],
  sinGenero: [],
  generoDesconocido: [],
  sinMarca: [],
  slugsAjustados: [],
};

const vistos = new Map();
const slugs = new Set();
const productos = [];

for (const fila of filas.slice(1)) {
  const codigo = (fila.cells[columnas.codigo] ?? '').trim();
  const generoBruto = (fila.cells[columnas.genero] ?? '').trim().toUpperCase();
  const nombre = (fila.cells[columnas.nombre] ?? '').trim();

  if (!codigo) continue; // fila vacía al final de la hoja

  if (vistos.has(codigo)) {
    informe.codigosDuplicados.push({ codigo, filas: [vistos.get(codigo), fila.row] });
    continue; // no se duplica la referencia
  }
  vistos.set(codigo, fila.row);

  const genero = GENEROS[generoBruto] ? generoBruto : '';
  if (!generoBruto) informe.sinGenero.push(codigo);
  else if (!genero) informe.generoDesconocido.push({ codigo, valor: generoBruto });

  const requiereRevision = !nombre || !genero;
  if (!nombre) informe.sinNombre.push(codigo);

  // El nombre del Excel NUNCA se modifica. Si viene vacío se usa el propio
  // código como identificador visible y la referencia queda inactiva.
  const nombreFinal = nombre || codigo;

  const marca = nombre ? detectarMarca(nombre) : null;
  if (nombre && !marca) informe.sinMarca.push({ codigo, nombre });

  const tipo = TIPO_MANUAL[codigo] ?? marca?.origen ?? null;

  let slug = slugify(nombreFinal);
  if (!slug) slug = slugify(codigo);
  if (slugs.has(slug)) {
    const conGenero = `${slug}-${GENEROS[genero]?.slug ?? 'ref'}`;
    const nuevo = slugs.has(conGenero) ? `${slug}-${slugify(codigo)}` : conGenero;
    informe.slugsAjustados.push({ codigo, de: slug, a: nuevo });
    slug = nuevo;
  }
  slugs.add(slug);

  productos.push({
    codigo,
    slug,
    nombre: nombreFinal,
    genero: genero || 'UNISEX',
    marca: marca?.nombre ?? null,
    marcaOrigen: marca?.origen ?? null,
    tipo,
    descripcion: nombre
      ? generarDescripcion({ codigo, nombre: nombreFinal, genero: genero || 'UNISEX', tipo, marca: marca?.nombre })
      : '',
    descripcionCorta: nombre
      ? generarDescripcionCorta({ codigo, nombre: nombreFinal, genero: genero || 'UNISEX', marca: marca?.nombre })
      : '',
    activo: !requiereRevision,
    requiereRevision,
    // Campos que el negocio completa desde /admin. Nunca se inventan aquí.
    precio: null,
    precioAnterior: null,
    stock: null,
    familiaOlfativa: null,
    concentracion: null,
    presentacion: null,
    notasSalida: null,
    notasCorazon: null,
    notasFondo: null,
    intensidad: null,
    ocasion: [],
    personalidad: [],
    tags: [],
  });
}

/* ── Marcas deducidas ── */
const marcas = [...new Set(productos.map((p) => p.marca).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'es'))
  .map((nombre) => {
    const ejemplo = productos.find((p) => p.marca === nombre);
    return { nombre, slug: slugify(nombre), origen: ejemplo.marcaOrigen };
  });

const salida = {
  generadoEn: new Date().toISOString(),
  archivoOrigen: origen.replace(/\\/g, '/').split('/').pop(),
  totalProductos: productos.length,
  marcas,
  productos,
};

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'catalogo.json'), `${JSON.stringify(salida, null, 2)}\n`, 'utf8');

/* ── Informe ── */
const porGenero = productos.reduce((acc, p) => ({ ...acc, [p.genero]: (acc[p.genero] ?? 0) + 1 }), {});
const porTipo = productos.reduce(
  (acc, p) => ({ ...acc, [p.tipo ?? 'sin clasificar']: (acc[p.tipo ?? 'sin clasificar'] ?? 0) + 1 }),
  {},
);

const lista = (items, formato) => (items.length ? items.map(formato).join('\n') : '_Ninguno._');

const md = `# Informe de importación del catálogo — YLANE PERFUMES

Generado automáticamente por \`npm run import:excel\` el ${new Date().toLocaleString('es-CO')}.
Archivo de origen: **${salida.archivoOrigen}**

## Resumen

| Dato | Valor |
| --- | --- |
| Filas leídas (sin cabecera) | ${informe.filasLeidas} |
| Referencias importadas | ${productos.length} |
| Códigos duplicados descartados | ${informe.codigosDuplicados.length} |
| Referencias sin nombre en el Excel | ${informe.sinNombre.length} |
| Marcas deducidas | ${marcas.length} |

### Por género
${Object.entries(porGenero).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

### Por clasificación
${Object.entries(porTipo).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

## Qué se dedujo y qué NO

- **Código, género y nombre** se toman tal cual del Excel. No se modifican.
- **Marca**: sólo se asigna cuando el nombre de la marca aparece *literalmente*
  en el nombre del producto. Si no aparece, el campo queda vacío para que se
  complete desde \`/admin\`.
- **Clasificación** (árabe / nicho / diseñador / comercial) se deriva de la marca
  detectada, más los ajustes manuales documentados abajo.
- **NO se generó**: precio, precio anterior, stock, disponibilidad, tamaño,
  concentración, notas olfativas, duración, país de origen ni afirmaciones de
  autenticidad. Todos esos campos quedan vacíos y editables desde el panel.

## Ajustes manuales de clasificación

Referencias de líneas de perfumería árabe reconocidas cuyo nombre en el Excel no
incluye la marca. Se pueden cambiar desde \`/admin\`:

${Object.entries(TIPO_MANUAL)
  .map(([codigo, tipo]) => {
    const p = productos.find((x) => x.codigo === codigo);
    return `- \`${codigo}\` ${p ? p.nombre : '(no encontrado)'} → **${tipo}**`;
  })
  .join('\n')}

## Pendientes de revisión

### Referencias sin nombre en el Excel
Se importaron para no perder la referencia, quedan **inactivas** y con el código
como nombre provisional. Hay que completarlas desde el panel.

${lista(informe.sinNombre, (c) => `- \`${c}\``)}

### Códigos duplicados
${lista(informe.codigosDuplicados, (d) => `- \`${d.codigo}\` (filas ${d.filas.join(', ')})`)}

### Género no reconocido
${lista(informe.generoDesconocido, (d) => `- \`${d.codigo}\`: "${d.valor}"`)}

### Slugs ajustados por colisión
Dos referencias con el mismo nombre (normalmente la versión de hombre y la de
mujer de una misma línea). Se mantienen ambas, con URL distinta:

${lista(informe.slugsAjustados, (d) => `- \`${d.codigo}\`: /${d.de} → /${d.a}`)}

### Referencias sin marca detectada (${informe.sinMarca.length})
El nombre no contiene ninguna marca reconocible. Aparecen en la tienda sin
etiqueta de marca; asígnala desde \`/admin\` cuando la confirmes.

${lista(informe.sinMarca, (d) => `- \`${d.codigo}\` — ${d.nombre}`)}

## Marcas detectadas (${marcas.length})

${marcas.map((m) => `- **${m.nombre}** (${m.origen})`).join('\n')}
`;

mkdirSync(join(root, 'docs'), { recursive: true });
writeFileSync(join(root, 'docs', 'IMPORTACION.md'), md, 'utf8');

console.log(`✓ ${productos.length} referencias importadas → data/catalogo.json`);
console.log(`  Marcas detectadas: ${marcas.length}`);
console.log(`  Sin nombre: ${informe.sinNombre.length} · Sin marca: ${informe.sinMarca.length}`);
console.log(`  Duplicados descartados: ${informe.codigosDuplicados.length}`);
console.log('✓ Informe → docs/IMPORTACION.md');
