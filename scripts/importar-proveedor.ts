/**
 * Importa el catálogo del proveedor.
 *
 *   npm run importar:proveedor [ruta-del-excel]
 *
 * Por defecto lee data/catalogo-proveedor.xlsx. Ese archivo NO se sube al
 * repositorio (es público y el archivo trae el precio de compra y el margen).
 *
 * Qué hace:
 *  - Crea o actualiza cada referencia usando la URL del proveedor como llave,
 *    así que reimportar una versión nueva nunca duplica productos.
 *  - La primera vez, oculta (NO borra) las referencias del primer Excel.
 *  - Escribe docs/IMPORTACION-PROVEEDOR.md sin costos, URLs ni proveedor.
 *
 * Qué NO hace al reimportar: pisar lo que el negocio haya editado en el panel
 * (precio publicado, nombre, género, marca, descripción, fotos). Sólo refresca
 * el costo y la URL, y avisa en el informe de lo que cambió en el proveedor.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { brands, categories, productCategories, products, settings } from '../src/db/schema.ts';
import { slugify, textoBuscador } from '../src/lib/text.ts';
import { generarDescripcion, generarDescripcionCorta } from './lib/catalogo.mjs';
import {
  GENERO_SIN_ASIGNAR,
  TIPO_POR_MARCA,
  concentracionDesdeNombre,
  derivarGenero,
  indiceCatalogoAnterior,
  leerCatalogoProveedor,
  referenciaDesdeUrl,
  tipoDesdeMarca,
} from './lib/proveedor.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origen = process.argv[2] ?? join(root, 'data', 'catalogo-proveedor.xlsx');

if (!existsSync(origen)) {
  console.error(`✗ No encontré el catálogo del proveedor en ${origen}`);
  process.exit(1);
}

const db = drizzle(
  createClient({
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ylane.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
  }),
);

const SINONIMOS_GENERO: Record<string, string> = {
  DAMA: 'mujer dama femenino',
  CABALLERO: 'hombre caballero masculino',
  UNISEX: 'unisex',
};
const SINONIMOS_TIPO: Record<string, string> = {
  arabe: 'arabe arabes oriental',
  nicho: 'nicho',
  disenador: 'disenador diseñador',
  comercial: 'comercial',
};
const CATEGORIA_GENERO: Record<string, string> = {
  DAMA: 'mujer',
  CABALLERO: 'hombre',
  UNISEX: 'unisex',
};

/* ── 1. Leer y validar ────────────────────────────────────────────── */
const filas = leerCatalogoProveedor(origen);

const informe = {
  leidas: filas.length,
  invalidas: [] as string[],
  refsDuplicadas: [] as string[],
  nombresDuplicados: [] as string[],
  margenIncoherente: [] as string[],
  noDisponibles: [] as string[],
};

const vistasRef = new Set<string>();
const vistosNombre = new Set<string>();
const validas: (ReturnType<typeof leerCatalogoProveedor>[number] & { ref: string })[] = [];

for (const fila of filas) {
  const ref = referenciaDesdeUrl(fila.url);
  if (!fila.producto || !fila.marca || !ref || fila.sugerido == null || fila.partner == null) {
    informe.invalidas.push(`fila ${fila.fila}: ${fila.producto || '(sin nombre)'}`);
    continue;
  }
  if (fila.partner > fila.sugerido) {
    informe.invalidas.push(`fila ${fila.fila}: ${fila.producto} (el costo supera el precio sugerido)`);
    continue;
  }
  if (vistasRef.has(ref)) {
    informe.refsDuplicadas.push(`fila ${fila.fila}: ${fila.producto}`);
    continue;
  }
  const nombreClave = fila.producto.toLowerCase();
  if (vistosNombre.has(nombreClave)) informe.nombresDuplicados.push(`fila ${fila.fila}: ${fila.producto}`);
  if (fila.margen != null && fila.margen !== fila.sugerido - fila.partner) {
    informe.margenIncoherente.push(`fila ${fila.fila}: ${fila.producto}`);
  }
  if (fila.disponibilidad && fila.disponibilidad.toLowerCase() !== 'disponible') {
    informe.noDisponibles.push(`${fila.producto} — "${fila.disponibilidad}"`);
  }
  vistasRef.add(ref);
  vistosNombre.add(nombreClave);
  validas.push({ ...fila, ref });
}

/* ── 2. Derivar ───────────────────────────────────────────────────── */
const anterior = JSON.parse(readFileSync(join(root, 'data', 'catalogo.json'), 'utf8')).productos;
const indiceAnterior = indiceCatalogoAnterior(anterior);

type Derivado = (typeof validas)[number] & {
  genero: string;
  fuenteGenero: string;
  tipo: string | null;
  concentracion: string | null;
};

const derivados: Derivado[] = validas.map((fila) => {
  const genero = derivarGenero(fila.producto, indiceAnterior);
  return {
    ...fila,
    genero: genero.genero,
    fuenteGenero: genero.fuente,
    tipo: tipoDesdeMarca(fila.marca),
    concentracion: concentracionDesdeNombre(fila.producto),
  };
});

/* ── 3. Escribir en la base ───────────────────────────────────────── */
async function marcaId(nombre: string, tipo: string | null): Promise<number> {
  const slug = slugify(nombre);
  const existente = await db.select().from(brands).where(eq(brands.slug, slug)).get();
  if (existente) {
    if (!existente.origen && tipo) {
      await db.update(brands).set({ origen: tipo }).where(eq(brands.id, existente.id));
    }
    return existente.id;
  }
  const creada = await db
    .insert(brands)
    .values({ slug, nombre, origen: tipo })
    .returning({ id: brands.id })
    .get();
  return creada.id;
}

async function slugLibre(base: string): Promise<string> {
  let candidato = base || 'perfume';
  let intento = 2;
  while (await db.select({ id: products.id }).from(products).where(eq(products.slug, candidato)).get()) {
    candidato = `${base}-${intento}`;
    intento += 1;
  }
  return candidato;
}

async function siguienteCodigo(): Promise<number> {
  const fila = await db
    .select({ maximo: sql<number | null>`max(cast(substr(${products.codigo}, 2) as integer))` })
    .from(products)
    .where(sql`${products.codigo} glob 'P[0-9]*'`)
    .get();
  return (fila?.maximo ?? 0) + 1;
}

const categoriasPorSlug = new Map(
  (await db.select({ id: categories.id, slug: categories.slug }).from(categories).all()).map((c) => [c.slug, c.id]),
);

let creados = 0;
let actualizados = 0;
const cambiosDePrecio: string[] = [];
const cambiosDeNombre: string[] = [];
const ocultadosPorDisponibilidad: string[] = [];
let proximo = await siguienteCodigo();

for (const item of derivados) {
  const existente = await db.select().from(products).where(eq(products.proveedorRef, item.ref)).get();
  const disponible = !item.disponibilidad || item.disponibilidad.toLowerCase() === 'disponible';

  if (existente) {
    // Reimportación: sólo datos del proveedor. Lo editado en el panel se respeta.
    await db
      .update(products)
      .set({
        costo: item.partner,
        proveedorUrl: item.url,
        ...(disponible ? {} : { activo: false }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, existente.id));

    if (existente.precio != null && existente.precio !== item.sugerido) {
      cambiosDePrecio.push(`${existente.codigo} ${existente.nombre}: publicado ${existente.precio} · sugerido ahora ${item.sugerido}`);
    }
    if (existente.nombre !== item.producto) {
      cambiosDeNombre.push(`${existente.codigo}: "${existente.nombre}" → en el proveedor ahora "${item.producto}"`);
    }
    if (!disponible && existente.activo) ocultadosPorDisponibilidad.push(`${existente.codigo} ${existente.nombre}`);
    actualizados += 1;
    continue;
  }

  const codigo = `P${String(proximo).padStart(3, '0')}`;
  proximo += 1;
  const idMarca = await marcaId(item.marca, item.tipo);
  const generoAsignado = item.genero !== GENERO_SIN_ASIGNAR ? item.genero : null;

  const creado = await db
    .insert(products)
    .values({
      codigo,
      slug: await slugLibre(slugify(item.producto)),
      nombre: item.producto,
      marcaId: idMarca,
      genero: item.genero,
      tipo: item.tipo,
      precio: item.sugerido,
      costo: item.partner,
      proveedorRef: item.ref,
      proveedorUrl: item.url,
      concentracion: item.concentracion,
      descripcion: generarDescripcion({
        codigo,
        nombre: item.producto,
        genero: item.genero,
        tipo: item.tipo,
        marca: item.marca,
      }),
      descripcionCorta: generarDescripcionCorta({
        codigo,
        nombre: item.producto,
        genero: item.genero,
        marca: item.marca,
      }),
      activo: disponible,
      orden: item.numero ?? proximo,
      buscador: textoBuscador([
        codigo,
        item.producto,
        item.marca,
        generoAsignado ? SINONIMOS_GENERO[generoAsignado] : null,
        item.tipo ? SINONIMOS_TIPO[item.tipo] : null,
        item.concentracion,
      ]),
    })
    .returning({ id: products.id })
    .get();

  const destino = [
    generoAsignado ? categoriasPorSlug.get(CATEGORIA_GENERO[generoAsignado]) : undefined,
    item.tipo ? categoriasPorSlug.get(item.tipo === 'arabe' ? 'arabes' : item.tipo) : undefined,
  ].filter((id): id is number => typeof id === 'number');
  for (const categoryId of destino) {
    await db.insert(productCategories).values({ productId: creado.id, categoryId }).onConflictDoNothing();
  }
  creados += 1;
}

/* ── 4. Primer cambio de fuente: ocultar el catálogo anterior ─────── */
const fuente = await db.select().from(settings).where(eq(settings.clave, 'catalogo_fuente')).get();
let ocultadosAnteriores = 0;

if (fuente?.valor !== 'proveedor') {
  const anteriores = await db
    .select({ id: products.id, tags: products.tags })
    .from(products)
    .where(and(isNull(products.proveedorRef), eq(products.activo, true)))
    .all();

  for (const producto of anteriores) {
    const tags = [...new Set([...(producto.tags ?? []), 'catalogo-anterior'])];
    await db.update(products).set({ activo: false, tags }).where(eq(products.id, producto.id));
  }
  ocultadosAnteriores = anteriores.length;

  // Se registra el cambio: en reimportaciones posteriores no se vuelve a tocar
  // el catálogo anterior, aunque el negocio reactive a mano alguna referencia.
  if (fuente) {
    await db.update(settings).set({ valor: 'proveedor' }).where(eq(settings.clave, 'catalogo_fuente'));
  } else {
    await db.insert(settings).values({
      clave: 'catalogo_fuente',
      valor: 'proveedor',
      grupo: 'interno',
      etiqueta: 'Fuente del catálogo',
      ayuda: 'Uso interno: indica que el catálogo activo viene del proveedor.',
    });
  }
}

/* ── 5. Informe (sin costos, URLs ni nombre del proveedor) ────────── */
const cuenta = <T,>(lista: T[], clave: (x: T) => string) =>
  lista.reduce<Record<string, number>>((acc, x) => {
    const k = clave(x);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

const porGenero = cuenta(derivados, (d) => d.genero);
const porTipo = cuenta(derivados, (d) => d.tipo ?? 'sin clasificar');
const porConcentracion = cuenta(derivados, (d) => d.concentracion ?? 'no figura en el nombre');
const sinClasificar = [...new Set(derivados.filter((d) => !d.tipo).map((d) => d.marca))].sort();
const lista = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join('\n') : '_Ninguno._');
const tabla = (obj: Record<string, number>) =>
  Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${k} | ${v} |`)
    .join('\n');

const asignadosPorNombre = derivados.filter((d) => d.fuenteGenero.startsWith('el nombre'));
const asignadosPorExcel = derivados.filter((d) => d.fuenteGenero.startsWith('primer Excel'));
const retenidos = derivados.filter((d) => d.genero === GENERO_SIN_ASIGNAR && d.fuenteGenero !== 'sin dato');
const sinDato = derivados.filter((d) => d.fuenteGenero === 'sin dato');

const sinGeneroPorMarca = Object.entries(
  sinDato.concat(retenidos).reduce<Record<string, string[]>>((acc, d) => {
    (acc[d.marca] ??= []).push(d.producto);
    return acc;
  }, {}),
).sort((a, b) => a[0].localeCompare(b[0], 'es'));

const md = `# Informe de importación — catálogo del proveedor

Generado por \`npm run importar:proveedor\` el ${new Date().toLocaleString('es-CO')}.

> Este informe se publica en el repositorio, así que **no incluye precios de
> compra, márgenes, URLs ni el nombre del proveedor**. Esos datos sólo viven en
> la base de datos y se ven en el panel.

## Resumen

| Dato | Valor |
| --- | --- |
| Filas leídas | ${informe.leidas} |
| Referencias válidas | ${derivados.length} |
| Creadas en esta ejecución | ${creados} |
| Actualizadas (ya existían) | ${actualizados} |
| Filas inválidas | ${informe.invalidas.length} |
| Referencias repetidas descartadas | ${informe.refsDuplicadas.length} |
| Margen incoherente con los precios | ${informe.margenIncoherente.length} |
| Referencias del primer Excel ocultadas | ${ocultadosAnteriores} |

## Qué se tomó del archivo tal cual

- **Nombre** y **marca**: exactamente como vienen.
- **Precio publicado**: el *precio sugerido* del proveedor. Se puede cambiar
  referencia por referencia en *Productos → Precios y stock*.
- **Costo** (confidencial): el *precio partner*. Sólo se ve en el panel y sirve
  para calcular el margen. Nunca sale en la tienda.
- **Disponibilidad**: las no disponibles quedan ocultas.

## Qué se dedujo, y de dónde

### Concentración — sólo si el nombre la dice

| Concentración | Referencias |
| --- | --- |
${tabla(porConcentracion)}

### Género — el archivo del proveedor no lo trae

| Género | Referencias |
| --- | --- |
${tabla(porGenero)}

Reglas, en este orden:

1. **El nombre lo dice** (${asignadosPorNombre.length}): "Pour Homme", "Woman", "Girl", "Uomo"…
2. **El primer Excel del negocio trae ese mismo perfume** con un género
   inequívoco (${asignadosPorExcel.length}). La comparación es estricta: "Sí" y
   "Sí Intense" son perfumes distintos y no se emparejan.
3. Si no, **queda sin asignar** (${sinDato.length + retenidos.length}). Estas referencias aparecen en el
   catálogo general, en su marca y en el buscador, pero no en Hombre, Mujer ni
   Unisex hasta que les asignes género en *Productos → Asignar género*.

#### Retenidas a propósito (${retenidos.length})

El primer Excel da una pista, pero no es segura. Mejor sin género que con uno
equivocado:

${lista(retenidos.map((d) => `${d.producto} — ${d.fuenteGenero}`))}

### Clasificación — a partir de la marca

| Clasificación | Referencias |
| --- | --- |
${tabla(porTipo)}

Marcas sin clasificar a propósito (no hay certeza): ${sinClasificar.join(', ') || 'ninguna'}.
Se clasifican en *Marcas*.

${Object.entries(TIPO_POR_MARCA)
  .map(([tipo, marcas]) => `- **${tipo}**: ${marcas.join(', ')}`)
  .join('\n')}

## Marcas que el archivo escribe de varias formas

El archivo del proveedor se respetó tal cual, así que estas aparecen como marcas
separadas. Si quieres unificarlas, usa *Marcas → Asignar a la marca*:

- Armani · Giorgio Armani · Emporio Armani
- Dior · Miss Dior
- Tommy Hilfiger · Tommy Girl
- Bharara · Mast Perfume

## Cambios detectados respecto a importaciones anteriores

### Precio sugerido distinto del publicado
${lista(cambiosDePrecio)}

### Nombres que cambiaron en el proveedor (no se tocaron en la tienda)
${lista(cambiosDeNombre)}

### Ocultadas porque el proveedor ya no las tiene disponibles
${lista(ocultadosPorDisponibilidad)}

## Validación

### Filas inválidas
${lista(informe.invalidas)}

### Referencias repetidas
${lista(informe.refsDuplicadas)}

### Nombres repetidos (se importaron: tienen URL distinta)
${lista(informe.nombresDuplicados)}

### Margen que no cuadra con precio sugerido − precio partner
${lista(informe.margenIncoherente)}

## Referencias sin género, por marca (${sinDato.length + retenidos.length})

${sinGeneroPorMarca.map(([marca, nombres]) => `**${marca}** (${nombres.length}): ${nombres.join(' · ')}`).join('\n\n')}
`;

mkdirSync(join(root, 'docs'), { recursive: true });
writeFileSync(join(root, 'docs', 'IMPORTACION-PROVEEDOR.md'), md, 'utf8');

console.log(`✓ ${derivados.length} referencias del proveedor · ${creados} creadas · ${actualizados} actualizadas`);
console.log(`  Género: ${Object.entries(porGenero).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log(`  Clasificación: ${Object.entries(porTipo).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
if (ocultadosAnteriores) console.log(`  Catálogo anterior: ${ocultadosAnteriores} referencias ocultadas (no borradas)`);
if (informe.invalidas.length) console.log(`  ⚠ ${informe.invalidas.length} filas inválidas — ver informe`);
console.log('✓ Informe → docs/IMPORTACION-PROVEEDOR.md');
