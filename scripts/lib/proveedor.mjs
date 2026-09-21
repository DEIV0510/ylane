/**
 * Reglas para el catálogo del proveedor.
 *
 * El archivo trae: No., Marca, Producto, Precio sugerido, Precio partner,
 * Margen, Disponibilidad, URL y Página. NO trae género, notas, tamaño ni fotos.
 *
 * Igual que con el primer Excel, aquí no se inventa nada. Sólo se deduce lo
 * que el propio dato permite afirmar, y cada deducción deja constancia de su
 * fuente para el informe:
 *   - concentración → sólo si está escrita en el nombre ("Eau de Parfum"…)
 *   - género        → si el nombre lo dice ("Pour Homme", "Woman"…) o si el
 *                     primer Excel del negocio trae ESE MISMO perfume con un
 *                     género inequívoco. Si no, queda sin asignar.
 *   - clasificación → a partir de la marca, con el mapa documentado abajo.
 */
import { readSheetRows } from './xlsx.mjs';

export const GENERO_SIN_ASIGNAR = 'SIN_GENERO';

/* ── Lectura ──────────────────────────────────────────────────────── */
const CABECERAS = {
  numero: ['no.', 'no', 'n°', '#'],
  marca: ['marca'],
  producto: ['producto', 'nombre'],
  sugerido: ['precio sugerido'],
  partner: ['precio partner'],
  margen: ['margen'],
  disponibilidad: ['disponibilidad'],
  url: ['url'],
};

function clasificarCabecera(texto) {
  const limpio = String(texto).trim().toLowerCase();
  for (const [clave, variantes] of Object.entries(CABECERAS)) {
    if (variantes.some((v) => limpio === v || limpio.startsWith(`${v} `) || limpio.startsWith(`${v}(`))) {
      return clave;
    }
  }
  return null;
}

export function leerCatalogoProveedor(ruta) {
  const filas = readSheetRows(ruta);

  // La cabecera no está en la primera fila: se busca la que nombra las columnas.
  const indiceCabecera = filas.findIndex((fila) => {
    const valores = Object.values(fila.cells).map((v) => String(v).toLowerCase());
    return valores.includes('producto') && valores.includes('marca');
  });
  if (indiceCabecera < 0) throw new Error('No encontré la fila de cabecera (Marca / Producto).');

  const columnas = {};
  for (const [letra, titulo] of Object.entries(filas[indiceCabecera].cells)) {
    const clave = clasificarCabecera(titulo);
    if (clave && !columnas[clave]) columnas[clave] = letra;
  }
  for (const requerida of ['marca', 'producto', 'sugerido', 'partner', 'url']) {
    if (!columnas[requerida]) throw new Error(`Falta la columna "${requerida}" en el catálogo del proveedor.`);
  }

  const numero = (valor) => {
    if (valor == null || valor === '') return null;
    const n = Number(String(valor).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? Math.round(n) : null;
  };

  return filas
    .slice(indiceCabecera + 1)
    .map((fila) => ({
      fila: fila.row,
      numero: numero(fila.cells[columnas.numero]),
      marca: String(fila.cells[columnas.marca] ?? '').trim(),
      producto: String(fila.cells[columnas.producto] ?? '').trim(),
      sugerido: numero(fila.cells[columnas.sugerido]),
      partner: numero(fila.cells[columnas.partner]),
      margen: numero(fila.cells[columnas.margen]),
      disponibilidad: String(fila.cells[columnas.disponibilidad] ?? '').trim(),
      url: String(fila.cells[columnas.url] ?? '').trim(),
    }))
    .filter((fila) => fila.producto || fila.url);
}

/** Referencia estable del proveedor: el último tramo de la URL del producto. */
export function referenciaDesdeUrl(url) {
  try {
    const partes = new URL(url).pathname.split('/').filter(Boolean);
    const indice = partes.indexOf('products');
    return indice >= 0 && partes[indice + 1] ? partes[indice + 1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/* ── Normalización ────────────────────────────────────────────────── */
export function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[’'`´]/g, '')
    .replace(/&/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ── Concentración: sólo si el nombre la dice ─────────────────────── */
/** @type {[RegExp, string][]} */
const CONCENTRACIONES = [
  [/\beau de parfum intense\b/, 'Eau de Parfum Intense'],
  [/\bextrait de parfum\b/, 'Extrait de Parfum'],
  [/\bparfum concentre\b/, 'Parfum Concentré'],
  [/\beau de parfum\b|\bedp\b/, 'Eau de Parfum'],
  [/\beau de toilette\b|\bedt\b/, 'Eau de Toilette'],
  [/\bextrait\b/, 'Extrait'],
  [/\bparfum$/, 'Parfum'],
];

export function concentracionDesdeNombre(nombre) {
  const texto = normalizar(nombre);
  for (const [patron, etiqueta] of CONCENTRACIONES) {
    if (patron.test(texto)) return etiqueta;
  }
  return null;
}

/* ── Género ───────────────────────────────────────────────────────── */
const MARCAS_DAMA = [
  'pour femme', 'femme', 'woman', 'women', 'her', 'girl', 'donna', 'pour elle', 'elle', 'lady', 'miss',
];
const MARCAS_CABALLERO = [
  'pour homme', 'homme', 'man', 'men', 'him', 'uomo', 'boy', 'gentleman',
];

const contiene = (texto, palabra) => new RegExp(`(^|\\s)${palabra}(\\s|$)`).test(texto);

function generoPorPalabras(nombre) {
  const texto = normalizar(nombre).replace(/[^a-z0-9 ]+/g, ' ');
  const dama = MARCAS_DAMA.find((p) => contiene(texto, p));
  const caballero = MARCAS_CABALLERO.find((p) => contiene(texto, p));
  if (dama && !caballero) return { genero: 'DAMA', fuente: `el nombre dice "${dama}"` };
  if (caballero && !dama) return { genero: 'CABALLERO', fuente: `el nombre dice "${caballero}"` };
  return null;
}

/*
 * Para cruzar con el primer Excel se compara el CONJUNTO de palabras, después
 * de unificar alias de marca y quitar sólo la concentración. Es estricto a
 * propósito: "Sí" y "Sí Intense", o "Le Male" y "Le Male Elixir", son
 * perfumes distintos y no deben emparejarse.
 */
const ALIAS = [
  [/^ch /, 'carolina herrera '],
  [/^ck /, 'calvin klein '],
  [/\bysl\b/g, 'yves saint laurent'],
  [/\bjean paul(?! gaultier)\b/g, 'jean paul gaultier'],
  [/\bgiorgio armani\b/g, 'armani'],
  [/\bemporio armani\b/g, 'armani'],
  [/^emporio /, 'armani '],
  [/\bbvlgary\b/g, 'bvlgari'],
  [/\bn[oº]\.? ?5\b/g, 'no5'],
  [/\bbond n[oº]?\.? ?9\b/g, 'bond no9'],
  [/\b(one|1) million\b/g, '1million'],
  [/\bbade ?e\b/g, 'badee'],
  [/\bpolo\b/g, 'ralph lauren polo'],
  [/\bthank u,? next\b/g, 'thank u next'],
];
const QUITAR = [
  /\beau de parfum\b/g, /\beau de toilette\b/g, /\bextrait de parfum\b/g,
  /\bparfum concentre\b/g, /\bedp\b/g, /\bedt\b/g, /\bby\b/g,
];

export function claveComparacion(nombre) {
  let texto = normalizar(nombre);
  for (const [patron, reemplazo] of ALIAS) texto = texto.replace(patron, reemplazo);
  for (const patron of QUITAR) texto = texto.replace(patron, ' ');
  const palabras = texto
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(' ')
    .filter(Boolean);
  return [...new Set(palabras)].sort().join(' ');
}

/*
 * El "núcleo" de un nombre es su clave sin las palabras de marca. Sirve para
 * detectar que un mismo perfume aparece en el primer Excel con dos géneros bajo
 * nombres distintos: "Euphoria" (dama) y "CK Euphoria" (caballero) comparten
 * núcleo, así que "Calvin Klein Euphoria EDP" no puede heredar ninguno.
 */
const PALABRAS_DE_MARCA = new Set(
  [
    'afnan', 'ahli', 'al', 'haramain', 'ariana', 'grande', 'armaf', 'armani', 'giorgio', 'emporio',
    'azzaro', 'bharara', 'bond', 'no9', 'burberry', 'bvlgari', 'kilian', 'byredo', 'calvin', 'klein',
    'carolina', 'herrera', 'chanel', 'chloe', 'coach', 'creed', 'diesel', 'dior', 'dkny', 'dolce',
    'gabbana', 'dumont', 'french', 'avenue', 'gucci', 'guerlain', 'hermes', 'hugo', 'boss', 'ilmin',
    'initio', 'issey', 'miyake', 'jean', 'paul', 'gaultier', 'jimmy', 'choo', 'jo', 'milano', 'kayali',
    'lacoste', 'lancome', 'lattafa', 'le', 'labo', 'loewe', 'louis', 'vuitton', 'maison', 'alhambra',
    'francis', 'kurkdjian', 'margiela', 'marc', 'jacobs', 'mast', 'michael', 'kors', 'montale',
    'montblanc', 'mont', 'blanc', 'moschino', 'narciso', 'rodriguez', 'nautica', 'nishane', 'nusuk',
    'orientica', 'paco', 'rabanne', 'parfums', 'marly', 'paris', 'hilton', 'prada', 'ralph', 'lauren',
    'rasasi', 'swiss', 'arabian', 'thierry', 'mugler', 'tom', 'ford', 'tommy', 'hilfiger', 'valentino',
    'versace', 'victorias', 'secret', 'viktor', 'rolf', 'xerjoff', 'yves', 'saint', 'laurent',
  ],
);

function nucleo(clave) {
  return clave
    .split(' ')
    .filter((palabra) => !PALABRAS_DE_MARCA.has(palabra))
    .join(' ');
}

/*
 * Revisión manual: el primer Excel da un género, pero lo más probable es que se
 * refiera a otra versión del perfume. Aquí sólo se RETIENE una asignación
 * (queda sin género para revisar); nunca se impone una.
 */
const REVISAR_GENERO = {
  'thierry mugler angel eau de parfum':
    'el primer Excel lo trae como caballero (C087), pero Angel Eau de Parfum suele ser la versión femenina: revisar',
};

/** Índice del primer Excel: clave → géneros distintos con los que aparece. */
export function indiceCatalogoAnterior(productos) {
  const porClave = new Map();
  const porNucleo = new Map();

  for (const producto of productos) {
    if (!producto.nombre || producto.nombre === producto.codigo) continue;
    const clave = claveComparacion(producto.nombre);

    if (!porClave.has(clave)) porClave.set(clave, { generos: new Set(), codigos: [] });
    porClave.get(clave).generos.add(producto.genero);
    porClave.get(clave).codigos.push(producto.codigo);

    const n = nucleo(clave);
    if (!n) continue;
    if (!porNucleo.has(n)) porNucleo.set(n, { generos: new Set(), codigos: [] });
    porNucleo.get(n).generos.add(producto.genero);
    porNucleo.get(n).codigos.push(producto.codigo);
  }

  return { porClave, porNucleo };
}

export function derivarGenero(nombre, indiceAnterior) {
  const porPalabras = generoPorPalabras(nombre);
  if (porPalabras) return porPalabras;

  const revision = REVISAR_GENERO[normalizar(nombre)];
  if (revision) return { genero: GENERO_SIN_ASIGNAR, fuente: revision };

  const clave = claveComparacion(nombre);
  const coincidencia = indiceAnterior.porClave.get(clave);
  if (!coincidencia) return { genero: GENERO_SIN_ASIGNAR, fuente: 'sin dato' };

  if (coincidencia.generos.size > 1) {
    return {
      genero: GENERO_SIN_ASIGNAR,
      fuente: `el primer Excel lo trae con dos géneros (${coincidencia.codigos.join(', ')})`,
    };
  }

  // El mismo nombre base con otro género en otra variante del primer Excel.
  const mismoNucleo = indiceAnterior.porNucleo.get(nucleo(clave));
  if (mismoNucleo && mismoNucleo.generos.size > 1) {
    return {
      genero: GENERO_SIN_ASIGNAR,
      fuente: `el nombre base aparece con dos géneros en el primer Excel (${mismoNucleo.codigos.join(', ')})`,
    };
  }

  const [genero] = coincidencia.generos;
  return { genero, fuente: `primer Excel (${coincidencia.codigos.join(', ')})` };
}

/* ── Clasificación por marca ──────────────────────────────────────── */
// Mapa documentado y editable desde /admin → Marcas. Las marcas que no
// aparecen aquí quedan sin clasificar a propósito.
export const TIPO_POR_MARCA = {
  arabe: [
    'Afnan', 'Ahli', 'Al Haramain', 'Armaf', 'Bharara', 'French Avenue', 'Lattafa',
    'Maison Alhambra', 'Mast Perfume', 'Nusuk', 'Orientica', 'Rasasi', 'Swiss Arabian',
  ],
  nicho: [
    'Bond No. 9', 'By Kilian', 'Byredo', 'Creed', 'Initio', 'Le Labo', 'Louis Vuitton',
    'Maison Francis Kurkdjian', 'Montale', 'Nishane', 'Parfums de Marly', 'Xerjoff',
  ],
  disenador: [
    'Armani', 'Azzaro', 'Burberry', 'Bvlgari', 'Calvin Klein', 'Carolina Herrera', 'Chanel',
    'Chloé', 'Coach', 'Diesel', 'Dior', 'DKNY', 'Dolce & Gabbana', 'Emporio Armani',
    'Giorgio Armani', 'Gucci', 'Guerlain', 'Hermès', 'Hugo Boss', 'Issey Miyake',
    'Jean Paul Gaultier', 'Jimmy Choo', 'Lacoste', 'Lancôme', 'Loewe', 'Maison Margiela',
    'Marc Jacobs', 'Michael Kors', 'Miss Dior', 'Montblanc', 'Moschino', 'Narciso Rodriguez',
    'Paco Rabanne', 'Prada', 'Ralph Lauren', 'Thierry Mugler', 'Tom Ford', 'Tommy Girl',
    'Tommy Hilfiger', 'Valentino', 'Versace', 'Viktor & Rolf', 'Yves Saint Laurent',
  ],
  comercial: [
    'Ariana Grande', 'Billie Eilish', 'Britney Spears', 'Kayali', 'Nautica', 'Paris Hilton',
    "Victoria's Secret",
  ],
};

const TIPO_INDICE = new Map(
  Object.entries(TIPO_POR_MARCA).flatMap(([tipo, marcas]) => marcas.map((m) => [normalizar(m), tipo])),
);

export function tipoDesdeMarca(marca) {
  return TIPO_INDICE.get(normalizar(marca)) ?? null;
}
