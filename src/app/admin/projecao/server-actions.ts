// src/app/admin/projecao/server-actions.ts
"use server";

import { 
  getBibleBookByIdServer, 
  getBibleChapterContentServer, 
  getFullBible as getFullBibleFromLib, 
  getBibleBookListServer // Importado getBibleBookListServer
} from '@/lib/server-data';

import { BibleBook, ChapterContent } from '@/lib/bible';
import { getHymnByNumber } from '@/lib/harpa';

// ✅ Defina as interfaces diretamente ou importe-as de onde elas são definidas (ex: '@/lib/bible')
interface BookListItem {
  nome: string;
  id: string;
  testament: 'VT' | 'NT'; // Adicionado testament para poder filtrar
}

interface BibleLists {
  antigoTestamento: BookListItem[];
  novoTestamento: BookListItem[];
}

// --- EXPORTAÇÕES DE FUNÇÕES DA BÍBLIA ---

export async function getAllBibleBooks(): Promise<BibleBook[]> {
  return await getFullBibleFromLib();
}

export async function getBook(bookIdOrSlug: string): Promise<BibleBook | undefined> {
  const allBooks = await getFullBibleFromLib();
  return allBooks.find(book => book.id === bookIdOrSlug || book.abreviatura === bookIdOrSlug);
}

// ✅ CORREÇÃO AQUI: getBookList agora retorna BibleLists
export async function getBookList(): Promise<BibleLists> {
  const allBooksMetaData = await getBibleBookListServer(); // Pega a lista simplificada de livros

  const antigoTestamento: BookListItem[] = [];
  const novoTestamento: BookListItem[] = [];

  allBooksMetaData.forEach(book => {
    const bookListItem: BookListItem = {
      id: book.id,
      nome: book.nome,
      testament: book.testament as 'VT' | 'NT', // Assumindo que 'testament' existe e é 'VT' ou 'NT'
    };

    if (book.testament === 'VT') {
      antigoTestamento.push(bookListItem);
    } else if (book.testament === 'NT') {
      novoTestamento.push(bookListItem);
    }
  });

  return { antigoTestamento, novoTestamento };
}

export { getAllBibleBooks as getFullBible }; // Alias

export async function fetchChapterContent(bookId: string, chapterNumber: number): Promise<ChapterContent | undefined> {
  const book = await getBibleBookByIdServer(bookId);
  if (book) {
    return book.chapters.find(c => c.chapter === chapterNumber);
  }
  return undefined;
}

// --- EXPORTAÇÃO DE FUNÇÕES DA HARPA ---
export { getHymnByNumber };

// ... (se houver outras server actions, mantenha-as aqui)