# Informe de importación — catálogo del proveedor

Generado por `npm run importar:proveedor` el 20/9/2026, 10:07:27 p. m..

> Este informe se publica en el repositorio, así que **no incluye precios de
> compra, márgenes, URLs ni el nombre del proveedor**. Esos datos sólo viven en
> la base de datos y se ven en el panel.

## Resumen

| Dato | Valor |
| --- | --- |
| Filas leídas | 308 |
| Referencias válidas | 308 |
| Creadas en esta ejecución | 0 |
| Actualizadas (ya existían) | 308 |
| Filas inválidas | 0 |
| Referencias repetidas descartadas | 0 |
| Margen incoherente con los precios | 0 |
| Referencias del primer Excel ocultadas | 0 |

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
| Eau de Parfum | 142 |
| no figura en el nombre | 99 |
| Eau de Toilette | 58 |
| Parfum | 4 |
| Eau de Parfum Intense | 2 |
| Parfum Concentré | 1 |
| Extrait | 1 |
| Extrait de Parfum | 1 |

### Género — el archivo del proveedor no lo trae

| Género | Referencias |
| --- | --- |
| SIN_GENERO | 213 |
| DAMA | 41 |
| CABALLERO | 41 |
| UNISEX | 13 |

Reglas, en este orden:

1. **El nombre lo dice** (42): "Pour Homme", "Woman", "Girl", "Uomo"…
2. **El primer Excel del negocio trae ese mismo perfume** con un género
   inequívoco (54). La comparación es estricta: "Sí" y
   "Sí Intense" son perfumes distintos y no se emparejan.
3. Si no, **queda sin asignar** (213). Estas referencias aparecen en el
   catálogo general, en su marca y en el buscador, pero no en Hombre, Mujer ni
   Unisex hasta que les asignes género en *Productos → Asignar género*.

#### Retenidas a propósito (6)

El primer Excel da una pista, pero no es segura. Mejor sin género que con uno
equivocado:

- Calvin Klein Euphoria Eau de Parfum — el nombre base aparece con dos géneros en el primer Excel (D012, C015)
- Dolce & Gabbana Light Blue Eau de Toilette — el primer Excel lo trae con dos géneros (D032, C039)
- Jean Paul Gaultier Scandal Eau de Parfum — el primer Excel lo trae con dos géneros (D043, C057)
- Thierry Mugler Angel Eau de Parfum — el primer Excel lo trae como caballero (C087), pero Angel Eau de Parfum suele ser la versión femenina: revisar
- Versace Eros Eau de Parfum — el primer Excel lo trae con dos géneros (D070, C093)
- Versace Eros Eau de Toilette — el primer Excel lo trae con dos géneros (D070, C093)

### Clasificación — a partir de la marca

| Clasificación | Referencias |
| --- | --- |
| disenador | 135 |
| arabe | 120 |
| nicho | 19 |
| comercial | 18 |
| sin clasificar | 16 |

Marcas sin clasificar a propósito (no hay certeza): Dumont, Ilmin, Jo Milano.
Se clasifican en *Marcas*.

- **arabe**: Afnan, Ahli, Al Haramain, Armaf, Bharara, French Avenue, Lattafa, Maison Alhambra, Mast Perfume, Nusuk, Orientica, Rasasi, Swiss Arabian
- **nicho**: Bond No. 9, By Kilian, Byredo, Creed, Initio, Le Labo, Louis Vuitton, Maison Francis Kurkdjian, Montale, Nishane, Parfums de Marly, Xerjoff
- **disenador**: Armani, Azzaro, Burberry, Bvlgari, Calvin Klein, Carolina Herrera, Chanel, Chloé, Coach, Diesel, Dior, DKNY, Dolce & Gabbana, Emporio Armani, Giorgio Armani, Gucci, Guerlain, Hermès, Hugo Boss, Issey Miyake, Jean Paul Gaultier, Jimmy Choo, Lacoste, Lancôme, Loewe, Maison Margiela, Marc Jacobs, Michael Kors, Miss Dior, Montblanc, Moschino, Narciso Rodriguez, Paco Rabanne, Prada, Ralph Lauren, Thierry Mugler, Tom Ford, Tommy Girl, Tommy Hilfiger, Valentino, Versace, Viktor & Rolf, Yves Saint Laurent
- **comercial**: Ariana Grande, Billie Eilish, Britney Spears, Kayali, Nautica, Paris Hilton, Victoria's Secret

## Marcas que el archivo escribe de varias formas

El archivo del proveedor se respetó tal cual, así que estas aparecen como marcas
separadas. Si quieres unificarlas, usa *Marcas → Asignar a la marca*:

- Armani · Giorgio Armani · Emporio Armani
- Dior · Miss Dior
- Tommy Hilfiger · Tommy Girl
- Bharara · Mast Perfume

## Cambios detectados respecto a importaciones anteriores

### Precio sugerido distinto del publicado
_Ninguno._

### Nombres que cambiaron en el proveedor (no se tocaron en la tienda)
_Ninguno._

### Ocultadas porque el proveedor ya no las tiene disponibles
_Ninguno._

## Validación

### Filas inválidas
_Ninguno._

### Referencias repetidas
_Ninguno._

### Nombres repetidos (se importaron: tienen URL distinta)
_Ninguno._

### Margen que no cuadra con precio sugerido − precio partner
_Ninguno._

## Referencias sin género, por marca (213)

**Afnan** (3): Afnan 9 PM Elixir · Afnan 9PM Eau de Parfum · Afnan 9PM Rebel Eau de Parfum

**Ahli** (1): Ahli Corvus Eau de Parfum

**Al Haramain** (9): Al Haramain Amber Oud Dubai Night · Al Haramain Amber Oud Eau de Parfum · Al Haramain Amber Oud Gold Edition · Al Haramain Amber Oud Gold Edition 999.9 · Al Haramain Amber Oud Gold Edition Extreme · Al Haramain Detour Noir · Al Haramain L'Aventure · Al Haramain L'Aventure Blanche · Al Haramain L'Aventure Rose

**Ariana Grande** (4): Ariana Grande Cloud 2.0 Intense Eau de Parfum · Ariana Grande Mod Blush Eau de Parfum · Ariana Grande R.E.M. Eau de Parfum · Ariana Grande Thank U, Next 2.0 Eau de Parfum

**Armaf** (19): Armaf Club de Nuit Iconic · Armaf Club De Nuit Imperiale · Armaf Club de Nuit Maleka · Armaf Club de Nuit Milestone · Armaf Club de Nuit Oud · Armaf Club de Nuit Precieux 1 · Armaf Club de Nuit Sillage · Armaf Club de Nuit Untold Eau de Parfum · Armaf Island Breeze Eau de Parfum · Armaf Mandarin Sky Eau de Parfum · Armaf Odyssey Aqua Edition · Armaf Odyssey Artisto · Armaf Odyssey Bahamas Tropical · Armaf Odyssey Candee · Armaf Odyssey Dubai Chocolat · Armaf Odyssey Limoni · Armaf Odyssey Mandarin Sky Elixir · Armaf Odyssey Mega · Armaf Yum Yum Eau de Parfum

**Azzaro** (1): Azzaro Wanted Eau de Toilette

**Bharara** (7): Bharara King Eau de Parfum · Bharara King Parfum · Bharara King Soleil · Bharara Mast Perfume Rome Paradox · Bharara Mast Perfume Velvet Rose · Bharara Queen · Bharara Rose

**Billie Eilish** (1): Billie Eilish Eilish Eau de Parfum

**Bond No. 9** (2): Bond No. 9 Bleecker Street Eau de Parfum · Bond No. 9 Tribeca Eau de Parfum

**Britney Spears** (1): Britney Spears Fantasy Eau de Parfum

**Burberry** (3): Burberry Brit Eau de Toilette · Burberry Goddess Eau de Parfum · Burberry Goddess Eau de Parfum Intense

**Bvlgari** (1): Bvlgari Omnia Coral Eau de Toilette

**By Kilian** (2): By Kilian Angels' Share Eau de Parfum · By Kilian Apple Brandy On The Rocks Eau de Parfum

**Byredo** (1): Byredo Bal D'Afrique Eau de Parfum

**Calvin Klein** (2): Calvin Klein CK One Eau de Toilette · Calvin Klein Euphoria Eau de Parfum

**Carolina Herrera** (1): Carolina Herrera 212 Heroes Eau de Toilette

**Chanel** (1): Chanel Chance Eau Tendre Eau de Parfum

**Chloé** (1): Chloé Eau de Parfum

**Coach** (1): Coach Floral Eau de Parfum

**Creed** (2): Creed Millésime Impérial Eau de Parfum · Creed Silver Mountain Water Eau de Parfum

**Diesel** (1): Diesel Only The Brave Eau de Toilette

**Dior** (2): Dior Hypnotic Poison Eau de Parfum · Dior J'adore Eau de Parfum

**DKNY** (1): DKNY Be Delicious Eau de Parfum

**Dolce & Gabbana** (3): Dolce & Gabbana Light Blue Summer Vibes Eau de Toilette · Dolce & Gabbana Velvet Infusion Eau de Parfum · Dolce & Gabbana Light Blue Eau de Toilette

**Dumont** (1): Dumont Nitro Red Eau de Parfum

**Emporio Armani** (1): Emporio Armani Because It's You Eau de Parfum

**French Avenue** (3): French Avenue Venus de Milo Eau de Parfum · French Avenue Vulcan Feu Eau de Parfum · French Avenue Vulcan Sable Eau de Parfum

**Giorgio Armani** (1): Giorgio Armani Acqua di Giò Profondo Eau de Parfum

**Gucci** (3): Gucci Bloom Eau de Parfum · Gucci Flora Gorgeous Gardenia Eau de Parfum · Gucci Guilty Eau de Parfum

**Guerlain** (2): Guerlain Mon Guerlain Eau de Parfum · Guerlain Shalimar Eau de Parfum

**Hermès** (1): Hermès Terre d'Hermès Eau de Toilette

**Hugo Boss** (2): Hugo Boss Bottled Eau de Toilette · Hugo Boss Hugo Just Different Eau de Toilette

**Ilmin** (2): Ilmin Kakuno Eau de Parfum · Ilmin Roso Eau de Parfum

**Initio** (1): Initio Oud For Greatness Eau de Parfum

**Issey Miyake** (2): Issey Miyake L'Eau d'Issey Eau de Toilette · Issey Miyake Le Sel d'Issey Eau de Parfum

**Jean Paul Gaultier** (5): Jean Paul Gaultier Le Beau Eau de Toilette · Jean Paul Gaultier Le Male Elixir Parfum · Jean Paul Gaultier Scandal Absolu Parfum Concentré · Jean Paul Gaultier Scandal Le Parfum Eau de Parfum Intense · Jean Paul Gaultier Scandal Eau de Parfum

**Jimmy Choo** (1): Jimmy Choo I Want Choo Eau de Parfum

**Jo Milano** (12): Game Of Spades All In · Game of Spades BID Jo Milano · Game of Spades High Roller · Game of Spades Win Jo Milano · Jo Milano Game of Spades Boston · Jo Milano Game Of Spades Full House · Jo Milano Game of Spades Moon · Jo Milano Game of Spades Opal · Jo Milano Game of Spades Platinum · Jo Milano Game Of Spades Queen · Jo Milano Game Of Spades Royale Eau de Parfum · Jo Milano Game Of Spades Wildcard Eau de Parfum

**Kayali** (1): Kayali Vanilla 28 Eau de Parfum

**Lacoste** (3): Lacoste Essential Eau de Toilette · Lacoste L.12.12 Blanc Eau de Toilette · Lacoste Touch Of Pink Eau de Toilette

**Lancôme** (2): Lancôme La Vie Est Belle Eau de Parfum · Lancôme Tresor Eau de Parfum

**Lattafa** (31): Lattafa Ana Abiyedh Eau de Parfum · Lattafa Angham · Lattafa Asad Bourbon Eau de Parfum · Lattafa Asad Eau de Parfum · Lattafa Asad Elixir Eau de Parfum · Lattafa Asad Zanzibar Eau de Parfum · Lattafa Atlas · Lattafa Badee Al Oud Amethyst · Lattafa Badee Al Oud Oud For Glory · Lattafa Fakhar Black · Lattafa Fakhar Eau de Parfum · Lattafa Fakhar Gold Extrait · Lattafa Give Me Gourmand Berry On Top · Lattafa Give Me Gourmand Choco · Lattafa Give Me Gourmand Cookie · Lattafa Give Me Gourmand Mallow Madness · Lattafa Give Me Gourmand Vanilla Freak · Lattafa Give Me Gourmand Whipped Pleasure · Lattafa Haya Eau de Parfum · Lattafa Khamrah Dukhan Eau de Parfum · Lattafa Khamrah Eau de Parfum · Lattafa Khamrah Waha Eau de Parfum · Lattafa Mayar · Lattafa Musamam White Intense · Lattafa Pride Nebras · Lattafa Shaheen Gold · Lattafa Shaheen Silver · Lattafa Victoria · Lattafa Yara · Lattafa Yara Moi · Lattafa Yara Tous

**Le Labo** (2): Le Labo Santal 33 · Le Labo The Matcha 26

**Loewe** (1): Loewe Solo Loewe

**Maison Alhambra** (11): Maison Alhambra Dark Door Intense · Maison Alhambra Delilah · Maison Alhambra Delilah Blanc · Maison Alhambra Jean Lowe Azure · Maison Alhambra Jean Lowe Immortel · Maison Alhambra Jean Lowe Noir · Maison Alhambra Jean Lowe Vibe · Maison Alhambra Kismet Eau de Parfum · Maison Alhambra Lovely Cherie · Maison Alhambra Porto Neroli · Maison Alhambra Sceptre Malachite

**Maison Francis Kurkdjian** (2): Maison Francis Kurkdjian Baccarat Rouge 540 · Maison Francis Kurkdjian Grand Soir

**Maison Margiela** (1): Maison Margiela Replica By The Fireplace

**Marc Jacobs** (2): Marc Jacobs Daisy Eau de Toilette · Marc Jacobs Perfect Eau de Parfum

**Mast Perfume** (1): Mast Perfume Rome Extradose By Bharara

**Michael Kors** (1): Michael Kors Sexy Amber Eau de Parfum

**Montale** (1): Montale Starry Nights Eau de Parfum

**Montblanc** (2): Montblanc Emblem Eau de Toilette · Montblanc Starwalker Eau de Toilette

**Moschino** (2): Moschino Fresh Couture Eau de Toilette · Moschino Toy 2 Pearl Eau de Parfum

**Nusuk** (1): Nusuk Ana Al Awwal Eau de Parfum

**Orientica** (1): Orientica Amber Rouge Eau de Parfum

**Paco Rabanne** (6): Paco Rabanne 1 Million Parfum · Paco Rabanne Black XS Eau de Toilette · Paco Rabanne Fame Blooming Pink Eau de Parfum · Paco Rabanne Invictus Victory Eau de Parfum · Paco Rabanne Olympea Eau de Parfum · Paco Rabanne Phantom Eau de Toilette

**Parfums de Marly** (1): Parfums de Marly Delina Eau de Parfum

**Paris Hilton** (2): Paris Hilton Eau de Parfum · Paris Hilton Rose Rush Eau de Parfum

**Prada** (2): Prada Candy Eau de Parfum · Prada Paradoxe Eau de Parfum

**Ralph Lauren** (2): Ralph Lauren Polo Blue Parfum · Ralph Lauren Ralph Eau de Toilette

**Rasasi** (11): Rasasi Hawas Black · Rasasi Hawas Diva · Rasasi Hawas Eclat · Rasasi Hawas Elixir Eau de Parfum · Rasasi Hawas Fire · Rasasi Hawas Ice · Rasasi Hawas Kobra · Rasasi Hawas Malibu · Rasasi Hawas Pink · Rasasi Hawas Tropical · Rasasi Hawas Verde

**Swiss Arabian** (1): Swiss Arabian Shaghaf Oud Eau de Parfum

**Thierry Mugler** (2): Thierry Mugler Alien Eau de Parfum · Thierry Mugler Angel Eau de Parfum

**Tom Ford** (4): Tom Ford Black Orchid Eau de Parfum · Tom Ford Café Rose Eau de Parfum · Tom Ford Lost Cherry Eau de Parfum · Tom Ford Tobacco Vanille Eau de Parfum

**Tommy Hilfiger** (1): Tommy Hilfiger Tommy Eau de Toilette

**Versace** (3): Versace Bright Crystal Eau de Toilette · Versace Eros Eau de Parfum · Versace Eros Eau de Toilette

**Viktor & Rolf** (2): Viktor & Rolf Flowerbomb Eau de Parfum · Viktor & Rolf Spicebomb Eau de Toilette

**Yves Saint Laurent** (4): Yves Saint Laurent Libre Intense Eau de Parfum · Yves Saint Laurent Mon Paris Eau de Parfum · Yves Saint Laurent Opium Eau de Parfum · Yves Saint Laurent Y Eau de Toilette
