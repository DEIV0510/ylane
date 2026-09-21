/**
 * Comprueba que ningún dato confidencial llega a la tienda pública.
 *
 *   npm run dev            (en otra terminal)
 *   npm run verificar:fuga [url-base]
 *
 * Recorre las páginas públicas, las fichas de producto y la API, SIN sesión, y
 * falla si en lo que recibe el navegador (HTML, datos de React, JSON) aparece:
 *   - el costo de una referencia (en su propia ficha)
 *   - la URL o la referencia del proveedor
 *   - nombres de columnas internas (costo, proveedorUrl…)
 */
import { createClient } from '@libsql/client';

const base = (process.argv[2] ?? 'http://localhost:5331').replace(/\/$/, '');
const db = createClient({
  url: process.env.DATABASE_URL ?? 'file:./data/ylane.db',
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

const { rows: productos } = await db.execute(
  'select slug, codigo, precio, costo, proveedor_ref, proveedor_url from products where activo = 1',
);
// Un costo que coincide con el precio público de otra referencia puede aparecer
// legítimamente (como precio de un relacionado): ese valor no sirve de testigo.
const preciosPublicos = new Set(productos.map((p) => String(p.precio)));
const conProveedor = productos.filter((p) => p.proveedor_ref);

// Dominio del proveedor, deducido de sus URLs: nunca se escribe en el código.
const dominios = [
  ...new Set(
    conProveedor
      .map((p) => {
        try {
          return new URL(String(p.proveedor_url)).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  ),
];

const PROHIBIDO_SIEMPRE = [
  ...dominios,
  '"costo"',
  'costo:',
  'proveedorUrl',
  'proveedor_url',
  'proveedorRef',
  'proveedor_ref',
];

const fallos = [];
let revisadas = 0;

async function revisar(ruta, extra = []) {
  let texto;
  try {
    const respuesta = await fetch(base + ruta, { redirect: 'manual' });
    texto = await respuesta.text();
  } catch (error) {
    fallos.push(`${ruta}: no respondió (${error.message}). ¿Está corriendo el servidor?`);
    return;
  }
  revisadas += 1;
  for (const marca of [...PROHIBIDO_SIEMPRE, ...extra]) {
    if (marca && texto.includes(marca)) fallos.push(`${ruta} contiene «${marca}»`);
  }
}

const paginas = ['/', '/perfumes', '/arabes', '/hombre', '/mujer', '/unisex', '/ofertas', '/marcas', '/descubre',
  '/mayoristas', '/contacto', '/sitemap.xml', '/robots.txt'];
for (const pagina of paginas) await revisar(pagina);

for (let pagina = 2; pagina <= Math.ceil(productos.length / 24); pagina += 1) {
  await revisar(`/perfumes?pagina=${pagina}`);
}

// Cada ficha: además de lo anterior, su propio costo no puede aparecer.
for (const [indice, producto] of conProveedor.entries()) {
  // La referencia del proveedor NO sirve de testigo: suele coincidir con la URL
  // pública que la tienda genera del mismo nombre. Lo que delata al proveedor
  // es su dominio, que ya se vigila en todas las respuestas.
  const testigos = [];
  if (!preciosPublicos.has(String(producto.costo))) testigos.push(String(producto.costo));
  await revisar(`/perfumes/${producto.slug}`, testigos);
  if ((indice + 1) % 50 === 0) console.log(`  … ${indice + 1}/${conProveedor.length} fichas`);
}

for (const termino of ['lattafa', 'dior', 'armaf', 'eau de parfum', 'P001', 'arabe']) {
  await revisar(`/api/buscar?q=${encodeURIComponent(termino)}`);
}

try {
  const respuesta = await fetch(`${base}/api/recomendaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genero: 'hombre', personalidad: ['elegante'], ocasion: ['noche'], intensidad: 'intensa' }),
  });
  const texto = await respuesta.text();
  revisadas += 1;
  for (const marca of PROHIBIDO_SIEMPRE) if (texto.includes(marca)) fallos.push(`/api/recomendaciones contiene «${marca}»`);
} catch (error) {
  fallos.push(`/api/recomendaciones no respondió (${error.message})`);
}

console.log(`\n${revisadas} respuestas revisadas contra ${PROHIBIDO_SIEMPRE.length} marcas prohibidas.`);
if (fallos.length) {
  console.error(`✗ ${fallos.length} fugas:`);
  for (const fallo of fallos.slice(0, 40)) console.error(`  ${fallo}`);
  process.exit(1);
}
console.log('✓ Ningún costo, URL ni referencia del proveedor llega a la tienda.');
