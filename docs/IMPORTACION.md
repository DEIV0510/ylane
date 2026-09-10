# Informe de importación del catálogo — YLANE PERFUMES

Generado automáticamente por `npm run import:excel` el 10/9/2026, 9:29:58 a. m..
Archivo de origen: **catalogo-ylane.xlsx**

## Resumen

| Dato | Valor |
| --- | --- |
| Filas leídas (sin cabecera) | 259 |
| Referencias importadas | 259 |
| Códigos duplicados descartados | 0 |
| Referencias sin nombre en el Excel | 2 |
| Marcas deducidas | 57 |

### Por género
- **DAMA**: 88
- **CABALLERO**: 103
- **UNISEX**: 68

### Por clasificación
- **disenador**: 160
- **comercial**: 20
- **sin clasificar**: 28
- **nicho**: 29
- **arabe**: 22

## Qué se dedujo y qué NO

- **Código, género y nombre** se toman tal cual del Excel. No se modifican.
- **Marca**: sólo se asigna cuando el nombre de la marca aparece *literalmente*
  en el nombre del producto. Si no aparece, el campo queda vacío para que se
  complete desde `/admin`.
- **Clasificación** (árabe / nicho / diseñador / comercial) se deriva de la marca
  detectada, más los ajustes manuales documentados abajo.
- **NO se generó**: precio, precio anterior, stock, disponibilidad, tamaño,
  concentración, notas olfativas, duración, país de origen ni afirmaciones de
  autenticidad. Todos esos campos quedan vacíos y editables desde el panel.

## Ajustes manuales de clasificación

Referencias de líneas de perfumería árabe reconocidas cuyo nombre en el Excel no
incluye la marca. Se pueden cambiar desde `/admin`:

- `D078` Yara → **arabe**
- `D079` Yara Tous → **arabe**
- `D080` Yara Moi → **arabe**
- `UNI032` Khamrah Dunkan → **arabe**
- `UNI056` Club de Nuit Milestone → **arabe**
- `C097` 9PM Night Out → **arabe**

## Pendientes de revisión

### Referencias sin nombre en el Excel
Se importaron para no perder la referencia, quedan **inactivas** y con el código
como nombre provisional. Hay que completarlas desde el panel.

- `UNI072`
- `UNI073`

### Códigos duplicados
_Ninguno._

### Género no reconocido
_Ninguno._

### Slugs ajustados por colisión
Dos referencias con el mismo nombre (normalmente la versión de hombre y la de
mujer de una misma línea). Se mantienen ambas, con URL distinta:

- `C016`: /ck-in2u → /ck-in2u-hombre
- `C039`: /dolce-gabbana-light-blue → /dolce-gabbana-light-blue-hombre
- `C054`: /issey-miyake → /issey-miyake-hombre
- `C057`: /jean-paul-gaultier-scandal → /jean-paul-gaultier-scandal-hombre
- `C093`: /versace-eros → /versace-eros-hombre

### Referencias sin marca detectada (32)
El nombre no contiene ninguna marca reconocible. Aparecen en la tienda sin
etiqueta de marca; asígnala desde `/admin` cuando la confirmes.

- `D012` — Euphoria
- `D078` — Yara
- `D079` — Yara Tous
- `D080` — Yara Moi
- `D082` — YUM YUM
- `D083` — Noble blush
- `D085` — Donna green extravaganza
- `D086` — Mallow Maddnes
- `C097` — 9PM Night Out
- `UNI009` — Island Bliss
- `UNI010` — Odyssey Mandarin Sky Elixir
- `UNI019` — Sugardaddy
- `UNI022` — Ilmin Il Mexico
- `UNI023` — Ilmin Il Dolce
- `UNI024` — Ilmin Il Femme
- `UNI025` — Ilmin Il Kakuno
- `UNI026` — Ilmin Il Orgasme
- `UNI032` — Khamrah Dunkan
- `UNI037` — Santal 33
- `UNI038` — Summer Hummer
- `UNI043` — Baccarat Rouge
- `UNI056` — Club de Nuit Milestone
- `UNI057` — ARRURU
- `UNI058` — Sex Sea Lorenzo
- `UNI059` — Sungria Lorenzo
- `UNI060` — Black orchid
- `UNI061` — Neroli Portofino
- `UNI066` — Angel Share Senso
- `UNI067` — Pacific Chill Senso
- `UNI068` — THE QUEEN Y THE VIPER
- `UNI070` — Speachless Lorenzo
- `UNI071` — Costa Azzurra

## Marcas detectadas (57)

- **Afnan** (arabe)
- **Ahli** (arabe)
- **Al Haramain** (arabe)
- **Antonio Banderas** (comercial)
- **Ariana Grande** (comercial)
- **Armani** (disenador)
- **Bharara** (arabe)
- **Bond No. 9** (nicho)
- **Burberry** (disenador)
- **Bvlgari** (disenador)
- **Calvin Klein** (disenador)
- **Carolina Herrera** (disenador)
- **Cartier** (disenador)
- **Casamorati** (nicho)
- **Chanel** (disenador)
- **Creed** (nicho)
- **Diesel** (disenador)
- **Dior** (disenador)
- **Dolce & Gabbana** (disenador)
- **Escada** (disenador)
- **Giardini di Toscana** (nicho)
- **Givenchy** (disenador)
- **Guy Laroche** (disenador)
- **Hugo Boss** (disenador)
- **Initio** (nicho)
- **Issey Miyake** (disenador)
- **Jean Paul Gaultier** (disenador)
- **Katy Perry** (comercial)
- **Kim Kardashian** (comercial)
- **Lacoste** (disenador)
- **Lancôme** (disenador)
- **Lattafa** (arabe)
- **Louis Vuitton** (nicho)
- **Maison Crivelli** (nicho)
- **Mancera** (nicho)
- **Mont Blanc** (disenador)
- **Montale** (nicho)
- **Moschino** (disenador)
- **Nautica** (comercial)
- **Nishane** (nicho)
- **Orientica** (arabe)
- **Paco Rabanne** (disenador)
- **Parfums de Marly** (nicho)
- **Paris Hilton** (comercial)
- **Polo** (disenador)
- **Prada** (disenador)
- **Ramón Monegal** (nicho)
- **Roja Parfums** (nicho)
- **Sofía Vergara** (comercial)
- **Swiss Army** (comercial)
- **Thierry Mugler** (disenador)
- **Tommy** (disenador)
- **Valentino** (disenador)
- **Versace** (disenador)
- **Victoria's Secret** (comercial)
- **Xerjoff** (nicho)
- **Yves Saint Laurent** (disenador)
