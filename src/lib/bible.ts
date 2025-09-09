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

// ✅ NOVO TIPO: Para o retorno da função getFullBible
export interface BibleBookWithSlug extends BibleBook {
  slug: string;
}

export interface BookRef {
  nome: string;
  slug: string;
}

export interface BibleIndex {
  antigoTestamento: BookRef[];
  novoTestamento: BookRef[];
}

// ✅ OTIMIZAÇÃO: Variável para guardar os dados em cache
let cachedBibleData: BibleBook[] | null = null;

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

// ✅ OTIMIZAÇÃO: Função principal agora usa cache
async function getBibleData(): Promise<BibleBook[]> {
  // Se os dados já estiverem em cache, retorna-os imediatamente
  if (cachedBibleData) {
    return cachedBibleData;
  }
  
  // Se não, lê o arquivo do disco
  const filePath = path.join(process.cwd(), 'src', 'data', 'biblia.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(fileContent).filter((book: any) => book.id !== "0");
  
  // Guarda os dados no cache para as próximas chamadas
  cachedBibleData = data;
  return data;
}

// ✅ CORREÇÃO DE TIPO: Retorna o novo tipo BibleBookWithSlug
export async function getFullBible(): Promise<BibleBookWithSlug[]> {
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

// ✅ CORREÇÃO DO ERRO 404: Busca pela abreviação (abrev)
export async function getBook(slug: string): Promise<BibleBook | undefined> {
  const allBooks = await getBibleData();
  // Compara a abreviação do livro (em minúsculas) com o slug da URL
  return allBooks.find(book => book.abrev.toLowerCase() === slug.toLowerCase());
}