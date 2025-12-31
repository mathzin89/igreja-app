// src/lib/server-data.ts
"use server"; // Adicione esta diretiva no topo do arquivo
import { readFileSync } from 'fs';
import path from 'path';
import {
  BibleBook, ChapterContent, VerseContent,
  RawBibleBookJson, RawVerseContent, // ✅ Importe as Raw interfaces
  bibleBookMetadata
} from '@/lib/bible'; // Importe os tipos e metadados


let cachedBible: BibleBook[] | null = null;

export async function getFullBible(): Promise<BibleBook[]> {
  if (cachedBible) {
    console.log('[lib/server-data.ts] Bíblia carregada do cache.');
    return cachedBible;
  }

  const filePath = path.join(process.cwd(), 'src', 'data', 'biblia.json');
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const rawBibleData: RawBibleBookJson[] = JSON.parse(fileContent); // ✅ Use RawBibleBookJson

    const processedBible: BibleBook[] = rawBibleData.map(rawBook => {
      const metadata = bibleBookMetadata[rawBook.abbrev.toLowerCase()]; // Garante que a chave é minúscula
      if (!metadata) {
        console.warn(`Metadados não encontrados para a abreviação: ${rawBook.abbrev}`);
        return null;
      }

      const chapters: ChapterContent[] = rawBook.chapters.map((rawVerses, chapterIndex) => {
        const verses: VerseContent[] = rawVerses.map(rawVerse => ({
          verse: rawVerse.verse,
          text: rawVerse.text
        }));
        return {
          chapter: chapterIndex + 1, // Capítulos geralmente começam de 1
          verses: verses
        };
      });

      return {
        id: metadata.id,
        nome: metadata.nome,
        abreviatura: rawBook.abbrev, // Mantenha a abreviação original do JSON ou use metadata.id
        testament: metadata.testament,
        chapters: chapters,
      };
    }).filter(Boolean) as BibleBook[]; // Filtra qualquer livro que não tenha metadados

    cachedBible = processedBible;
    console.log(`[lib/server-data.ts] Bíblia carregada com ${processedBible.length} livros.`);
    return processedBible;

  } catch (error) {
    console.error('Erro ao carregar a Bíblia:', error);
    return [];
  }
}

export async function getBibleBookByIdServer(bookId: string): Promise<BibleBook | undefined> {
  const bible = await getFullBible();
  return bible.find(book => book.id === bookId);
}

// Se você tiver uma função para buscar um capítulo específico (usado em PresentationView)
export async function getBibleChapterContentServer(bookId: string, chapterNumber: number): Promise<ChapterContent | undefined> {
  const book = await getBibleBookByIdServer(bookId);
  return book?.chapters.find(chapter => chapter.chapter === chapterNumber);
}

// Opcional: Função para listar apenas os metadados dos livros
export async function getBibleBookListServer(): Promise<Omit<BibleBook, 'chapters'>[]> {
  const bible = await getFullBible();
  return bible.map(({ id, nome, abreviatura, testament }) => ({ id, nome, abreviatura, testament }));
}