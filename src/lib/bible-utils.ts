import { BibleBook } from "@/lib/bible";

/**
 * Normaliza texto: remove acentos e deixa em maiúsculas.
 */
export function normalizeAbbrev(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/**
 * Busca livro pelo abreviação ignorando acentos e maiúsculas
 */
export function findBookByAbbrev(allBooks: BibleBook[], abbrev: string): BibleBook | undefined {
  const normAbbrev = normalizeAbbrev(abbrev);
  return allBooks.find((book) => normalizeAbbrev(book.abreviatura) === normAbbrev);
}
