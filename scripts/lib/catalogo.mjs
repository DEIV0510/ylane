/**
 * Reglas de normalización del catálogo YLANE.
 *
 * PRINCIPIO: el Excel manda. Aquí NO se inventa ningún dato del producto
 * (ni precio, ni stock, ni notas, ni concentración, ni país de origen).
 * Sólo se derivan campos a partir de lo que YA está escrito en el nombre:
 *   - marca  → sólo si el nombre de la marca aparece literalmente en el texto
 *   - tipo   → sólo a partir de la marca detectada (o de la lista de ajustes
 *              manuales de más abajo, que queda documentada y es editable)
 *   - slug   → derivado del nombre
 */

/* ── Marcas reconocidas ──────────────────────────────────────────────
 * `alias` = fragmentos que deben aparecer LITERALMENTE en el nombre.
 * Se evalúan de más largo a más corto para evitar falsos positivos.
 */
export const MARCAS = [
  // Diseñador / comercial
  { nombre: 'Armani', origen: 'disenador', alias: ['Giorgio Armani', 'Emporio', 'Armani'] },
  { nombre: 'Ariana Grande', origen: 'comercial', alias: ['Ariana Grande'] },
  { nombre: 'Antonio Banderas', origen: 'comercial', alias: ['Antonio Banderas'] },
  { nombre: 'Burberry', origen: 'disenador', alias: ['Burberry'] },
  { nombre: 'Bvlgari', origen: 'disenador', alias: ['Bvlgari', 'BVLGARY'] },
  { nombre: 'Calvin Klein', origen: 'disenador', alias: ['CK'] },
  { nombre: 'Carolina Herrera', origen: 'disenador', alias: ['Carolina Herrera', 'CH'] },
  { nombre: 'Cartier', origen: 'disenador', alias: ['Cartier'] },
  { nombre: 'Chanel', origen: 'disenador', alias: ['Chanel'] },
  { nombre: 'Diesel', origen: 'disenador', alias: ['Diesel'] },
  { nombre: 'Dior', origen: 'disenador', alias: ['Dior'] },
  { nombre: 'Dolce & Gabbana', origen: 'disenador', alias: ['Dolce & Gabbana'] },
  { nombre: 'Escada', origen: 'disenador', alias: ['Escada'] },
  { nombre: 'Givenchy', origen: 'disenador', alias: ['Givenchy'] },
  { nombre: 'Guy Laroche', origen: 'disenador', alias: ['Guy Laroche'] },
  { nombre: 'Hugo Boss', origen: 'disenador', alias: ['Hugo Boss'] },
  { nombre: 'Issey Miyake', origen: 'disenador', alias: ['Issey Miyake'] },
  { nombre: 'Jean Paul Gaultier', origen: 'disenador', alias: ['Jean Paul Gaultier', 'Jean Paul'] },
  { nombre: 'Katy Perry', origen: 'comercial', alias: ['Katy Perry'] },
  { nombre: 'Kim Kardashian', origen: 'comercial', alias: ['Kim Kardashian'] },
  { nombre: 'Lacoste', origen: 'disenador', alias: ['Lacoste'] },
  { nombre: 'Lancôme', origen: 'disenador', alias: ['Lancôme', 'Lancome'] },
  { nombre: 'Mont Blanc', origen: 'disenador', alias: ['Mont Blanc'] },
  { nombre: 'Moschino', origen: 'disenador', alias: ['Moschino'] },
  { nombre: 'Nautica', origen: 'comercial', alias: ['Nautica'] },
  { nombre: 'Paco Rabanne', origen: 'disenador', alias: ['Paco Rabanne'] },
  { nombre: 'Paris Hilton', origen: 'comercial', alias: ['Paris Hilton'] },
  { nombre: 'Polo', origen: 'disenador', alias: ['Polo'] },
  { nombre: 'Prada', origen: 'disenador', alias: ['Prada'] },
  { nombre: 'Sofía Vergara', origen: 'comercial', alias: ['Sofía Vergara', 'Sofia Vergara'] },
  { nombre: 'Swiss Army', origen: 'comercial', alias: ['Swiss Army'] },
  { nombre: 'Thierry Mugler', origen: 'disenador', alias: ['Thierry Mugler'] },
  { nombre: 'Tommy', origen: 'disenador', alias: ['Tommy'] },
  { nombre: 'Valentino', origen: 'disenador', alias: ['Valentino'] },
  { nombre: 'Versace', origen: 'disenador', alias: ['Versace'] },
  { nombre: "Victoria's Secret", origen: 'comercial', alias: ['Victoria’s Secret', "Victoria's Secret"] },
  { nombre: 'Yves Saint Laurent', origen: 'disenador', alias: ['Yves Saint Laurent', 'YSL'] },

  // Perfumería árabe / oriental
  { nombre: 'Afnan', origen: 'arabe', alias: ['Afnan'] },
  { nombre: 'Ahli', origen: 'arabe', alias: ['Ahli'] },
  { nombre: 'Al Haramain', origen: 'arabe', alias: ['Al Haramain'] },
  { nombre: 'Bharara', origen: 'arabe', alias: ['Bharara'] },
  { nombre: 'Lattafa', origen: 'arabe', alias: ['Lattafa'] },
  { nombre: 'Orientica', origen: 'arabe', alias: ['Orientica', 'orientica'] },

  // Nicho
  { nombre: 'Bond No. 9', origen: 'nicho', alias: ['Bond Nº9', 'Bond n9', 'BOND N9', 'Bond No 9'] },
  { nombre: 'Casamorati', origen: 'nicho', alias: ['Casamorati'] },
  { nombre: 'Creed', origen: 'nicho', alias: ['Creed'] },
  { nombre: 'Giardini di Toscana', origen: 'nicho', alias: ['Giardini di Toscana'] },
  { nombre: 'Initio', origen: 'nicho', alias: ['Initio'] },
  { nombre: 'Louis Vuitton', origen: 'nicho', alias: ['Louis Vuitton'] },
  { nombre: 'Maison Crivelli', origen: 'nicho', alias: ['Maison Crivelli'] },
  { nombre: 'Mancera', origen: 'nicho', alias: ['Mancera'] },
  { nombre: 'Montale', origen: 'nicho', alias: ['Montale'] },
  { nombre: 'Nishane', origen: 'nicho', alias: ['Nishane'] },
  { nombre: 'Parfums de Marly', origen: 'nicho', alias: ['Parfums de Marly'] },
  { nombre: 'Ramón Monegal', origen: 'nicho', alias: ['Ramón Monegal', 'Ramon Monegal'] },
  { nombre: 'Roja Parfums', origen: 'nicho', alias: ['Roja Parfums'] },
  { nombre: 'Xerjoff', origen: 'nicho', alias: ['Xerjoff'] },
];

/**
 * Ajustes manuales de clasificación (NO de marca).
 * Son referencias que pertenecen a líneas de perfumería árabe reconocidas
 * pero cuyo nombre en el Excel no incluye la marca. Se dejan documentadas
 * y se pueden cambiar en cualquier momento desde /admin.
 */
export const TIPO_MANUAL = {
  D078: 'arabe', // Yara
  D079: 'arabe', // Yara Tous
  D080: 'arabe', // Yara Moi
  UNI032: 'arabe', // Khamrah Dunkan
  UNI056: 'arabe', // Club de Nuit Milestone
  C097: 'arabe', // 9PM Night Out
};

export const GENEROS = {
  DAMA: { etiqueta: 'Mujer', slug: 'mujer', adjetivo: 'femenina' },
  CABALLERO: { etiqueta: 'Hombre', slug: 'hombre', adjetivo: 'masculina' },
  UNISEX: { etiqueta: 'Unisex', slug: 'unisex', adjetivo: 'unisex' },
};

export function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’'"]/g, '')
    .replace(/&/g, ' ')
    .replace(/º/g, 'o')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function detectarMarca(nombre) {
  let mejor = null;
  for (const marca of MARCAS) {
    for (const alias of marca.alias) {
      const patron = new RegExp(`(^|[^\\p{L}])${escapeRegExp(alias)}([^\\p{L}]|$)`, 'iu');
      if (patron.test(nombre)) {
        if (!mejor || alias.length > mejor.aliasLength) {
          mejor = { nombre: marca.nombre, origen: marca.origen, aliasLength: alias.length };
        }
      }
    }
  }
  return mejor ? { nombre: mejor.nombre, origen: mejor.origen } : null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ── Descripciones comerciales ────────────────────────────────────────
 * Se construyen por combinación determinista (a partir del código) para que
 * cada referencia tenga un texto propio y estable entre ejecuciones.
 * Nunca se afirman notas, duración, concentración, origen ni autenticidad.
 */
const APERTURAS = {
  DAMA: [
    '{nombre} forma parte de la selección femenina de YLANE PERFUMES, pensada para quien quiere una firma que se reconozca sin esfuerzo.',
    'Dentro de la selección femenina de YLANE, {nombre} es una elección para quien entiende el perfume como parte de su presencia.',
    '{nombre} es una de las fragancias femeninas que YLANE mantiene en catálogo para quienes buscan carácter más que tendencia.',
    'Para quien busca una fragancia femenina con personalidad propia, {nombre} es una de las referencias disponibles en YLANE.',
    '{nombre} llega a la selección femenina de YLANE para acompañar a quien prefiere que su aroma hable primero.',
    'En perfumería femenina, {nombre} es una de las referencias que YLANE tiene en catálogo.',
  ],
  CABALLERO: [
    '{nombre} forma parte de la selección masculina de YLANE PERFUMES, para quien busca una firma sobria y reconocible.',
    'Dentro de la línea masculina de YLANE, {nombre} es una elección para el hombre que cuida los detalles.',
    '{nombre} es una de las fragancias masculinas que YLANE mantiene en catálogo por su carácter definido.',
    'Para quien busca una fragancia masculina con presencia, {nombre} es una de las referencias disponibles en YLANE.',
    '{nombre} entra en la selección masculina de YLANE pensando en quien quiere una firma constante.',
    'En perfumería masculina, {nombre} es una de las referencias que YLANE tiene en catálogo.',
  ],
  UNISEX: [
    '{nombre} forma parte de la selección unisex de YLANE PERFUMES, para quien elige el aroma sin etiquetas.',
    'Dentro de la línea unisex de YLANE, {nombre} es una elección para quien construye su propia firma.',
    '{nombre} es una de las fragancias unisex que YLANE mantiene en catálogo por su versatilidad.',
    'Para quien prefiere fragancias sin género, {nombre} es una de las referencias disponibles en YLANE.',
    '{nombre} llega a la selección unisex de YLANE para quien busca algo distinto a lo habitual.',
    'En fragancias compartidas, {nombre} es una de las referencias que YLANE tiene en catálogo.',
  ],
  // Sin género confirmado: el texto no puede afirmar para quién es.
  NEUTRO: [
    '{nombre} forma parte de la selección de YLANE PERFUMES, pensada para quien quiere una firma propia.',
    'Dentro del catálogo de YLANE, {nombre} es una elección para quien entiende el perfume como parte de su presencia.',
    '{nombre} es una de las fragancias que YLANE mantiene en catálogo para quienes buscan carácter.',
    'Para quien busca una fragancia con personalidad, {nombre} es una de las referencias disponibles en YLANE.',
    '{nombre} llega a la selección de YLANE para quien prefiere que su aroma hable primero.',
    '{nombre} es una de las referencias que YLANE tiene en catálogo.',
  ],
};

const CONTEXTO_TIPO = {
  arabe: [
    'Pertenece a la línea de perfumería árabe, la especialidad de la casa.',
    'Hace parte de nuestra selección de perfumería árabe, la línea con la que más se identifica YLANE.',
    'Está dentro de la línea árabe del catálogo, una de las principales de la tienda.',
  ],
  nicho: [
    'Pertenece al segmento de perfumería nicho, la parte más selectiva del catálogo.',
    'Hace parte de la selección nicho, pensada para quien ya sabe lo que busca.',
    'Está dentro del segmento nicho del catálogo, para quien quiere salir de lo convencional.',
  ],
  disenador: [
    'Pertenece al segmento de perfumería de diseñador dentro del catálogo.',
    'Hace parte de la línea de casas de diseñador que distribuye YLANE.',
    'Está dentro de la selección de perfumería de diseñador de la tienda.',
  ],
  comercial: [
    'Hace parte de la línea comercial del catálogo.',
    'Pertenece al grupo de referencias de casas ampliamente reconocidas.',
    'Está dentro de las referencias comerciales que YLANE mantiene disponibles.',
  ],
};

const PERFILES = {
  DAMA: [
    'Es una opción para quien busca sentirse arreglada incluso en un día común.',
    'Funciona para quien quiere una fragancia que la acompañe del día a la noche.',
    'Es una elección para quien prefiere sentirse elegante sin exagerar.',
    'Va bien con quien quiere dejar rastro sin necesidad de anunciarlo.',
    'Pensada para quien usa el perfume como el último accesorio antes de salir.',
  ],
  CABALLERO: [
    'Es una opción para quien quiere una fragancia de uso constante y confiable.',
    'Funciona para quien busca proyectar seguridad sin llamar la atención de más.',
    'Es una elección para quien prefiere un aroma que se asocie a su nombre.',
    'Va bien con quien quiere una firma para la oficina y también para la noche.',
    'Pensada para quien no cambia de perfume con facilidad.',
  ],
  UNISEX: [
    'Es una opción para quien comparte perfume o quiere salir de las categorías.',
    'Funciona para quien busca algo que no se parezca a lo que usan todos.',
    'Es una elección para quien arma su propia firma sin seguir reglas.',
    'Va bien con quien colecciona fragancias y busca variedad.',
    'Pensada para quien quiere un aroma que funcione en cualquier ocasión.',
  ],
  NEUTRO: [
    'Es una opción para quien quiere una fragancia que lo represente.',
    'Funciona para quien busca un aroma reconocible.',
    'Es una elección para quien arma su propia firma.',
    'Va bien con quien disfruta descubrir fragancias nuevas.',
    'Pensada para quien usa el perfume como parte de su estilo.',
  ],
};

const CIERRES = [
  'Escríbenos por WhatsApp y te asesoramos antes de comprar.',
  'Si tienes dudas, escríbenos por WhatsApp y te ayudamos a elegir.',
  'Consúltanos por WhatsApp disponibilidad y presentación.',
  'Escríbenos y te contamos todo lo que necesites saber de esta referencia.',
];

const CORTAS = {
  DAMA: [
    'Fragancia femenina de la selección YLANE.',
    'Perfumería femenina seleccionada por YLANE.',
    'Una firma femenina dentro del catálogo YLANE.',
  ],
  CABALLERO: [
    'Fragancia masculina de la selección YLANE.',
    'Perfumería masculina seleccionada por YLANE.',
    'Una firma masculina dentro del catálogo YLANE.',
  ],
  UNISEX: [
    'Fragancia unisex de la selección YLANE.',
    'Perfumería unisex seleccionada por YLANE.',
    'Una fragancia sin género dentro del catálogo YLANE.',
  ],
  NEUTRO: [
    'Fragancia de la selección YLANE.',
    'Perfumería seleccionada por YLANE.',
    'Una firma dentro del catálogo YLANE.',
  ],
};

/** Hash estable (no criptográfico) para escoger variantes de forma determinista. */
function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const pick = (list, seed, offset = 0) => list[(seed + offset) % list.length];

export function generarDescripcion({ codigo, nombre, genero, tipo, marca }) {
  const seed = hash(codigo + nombre);
  const partes = [];
  partes.push(pick(APERTURAS[genero] ?? APERTURAS.NEUTRO, seed).replace('{nombre}', nombre));
  if (tipo && CONTEXTO_TIPO[tipo]) partes.push(pick(CONTEXTO_TIPO[tipo], seed, 3));
  else if (marca) partes.push(`Referencia de ${marca} dentro del catálogo de YLANE PERFUMES.`);
  partes.push(pick(PERFILES[genero] ?? PERFILES.NEUTRO, seed, 5));
  partes.push(pick(CIERRES, seed, 7));
  return partes.join(' ');
}

export function generarDescripcionCorta({ codigo, nombre, genero, marca }) {
  const seed = hash(codigo + nombre + 'corta');
  const base = pick(CORTAS[genero] ?? CORTAS.NEUTRO, seed);
  return marca ? `${marca} · ${base}` : base;
}
