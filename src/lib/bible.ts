import fs from 'fs/promises';
import path from 'path';

// --- Interfaces de Tipos ---
export interface BibleBook {
  id: string;
  periodo: string;
  nome: string;
  abrev: string;
  capitulos: string[][];
}

export interface BookRef {
  nome: string;
  slug: string;
}

export interface BibleIndex {
  antigoTestamento: BookRef[];
  novoTestamento: BookRef[];
}

// --- Funções de Leitura ---

// Função auxiliar para criar 'slugs' (nomes para URL)
function normalizeSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '');
}

// Função principal que lê o arquivo único da Bíblia
async function getBibleData(): Promise<BibleBook[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'biblia.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent).filter((book: any) => book.id !== "0");
}

// ✅ IMPORTANTE: A FUNÇÃO QUE ESTAVA FALTANDO
// Função para retornar a Bíblia inteira (usada no Painel de Culto)
export async function getFullBible(): Promise<BibleBook[]> {
  const allBooks = await getBibleData();
  // Adiciona o slug a cada livro para ser usado pelo cliente
  return allBooks.map(book => ({
    ...book,
    slug: normalizeSlug(book.nome)
  }));
}

// Função para gerar a lista de livros, separada por testamento
export async function getBookList(): Promise<BibleIndex> {
  const allBooks = await getBibleData();
  
  const antigoTestamento = allBooks
    .filter(book => book.periodo.includes('Antigo'))
    .map(book => ({ nome: book.nome, slug: normalizeSlug(book.nome) }));

  const novoTestamento = allBooks
    .filter(book => book.periodo.includes('Novo'))
    .map(book => ({ nome: book.nome, slug: normalizeSlug(book.nome) }));

  return { antigoTestamento, novoTestamento };
}

// Função para buscar um livro específico pelo slug
export async function getBook(slug: string): Promise<BibleBook | undefined> {
  const allBooks = await getBibleData();
  return allBooks.find(book => normalizeSlug(book.nome) === slug);
}