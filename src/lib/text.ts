/** Minúsculas sin tildes: base del buscador y de los slugs. */
export function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function slugify(valor: string): string {
  return normalizar(valor)
    .replace(/[’'"]/g, '')
    .replace(/&/g, ' ')
    .replace(/º/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Texto que se indexa para buscar un producto. */
export function textoBuscador(partes: (string | null | undefined)[]): string {
  return normalizar(partes.filter(Boolean).join(' ')).replace(/\s+/g, ' ');
}
