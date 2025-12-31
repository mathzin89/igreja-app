// src/app/admin/projecao/biblia/[livro]/[capitulo]/page.tsx
import { notFound } from 'next/navigation';
// Importa getBook e fetchChapterContent das server-actions
import { getBook, fetchChapterContent } from '@/app/admin/projecao/actions'; 
import React from 'react';
import { BibleBook } from '@/lib/bible'; // Apenas para o tipo BibleBook

// Importa o componente cliente de apresentação (o que você renomeou)
import { BibleContentRenderer } from '@/components/BibleContentRenderer'; 

interface BibleChapterPageProps {
  params: {
    livro: string; // bookId
    capitulo: string; // chapterNumber
  };
}

export default async function BibleChapterPage({ params }: BibleChapterPageProps) {
  const bookId = params.livro;
  const chapterNumber = parseInt(params.capitulo);

  if (isNaN(chapterNumber) || chapterNumber <= 0) {
    notFound(); // Se o capítulo não for um número válido
  }

  const book: BibleBook | undefined = await getBook(bookId);

  if (!book) {
    notFound(); // Se o livro não for encontrado
  }

  // Não precisamos mais buscar o chapterContent aqui, pois o BibleContentRenderer
  // já recebe o 'book' completo e lida com a seleção do capítulo e versículos internamente.
  // A prop `fetchChapterContent` na interface `BiblePresentationClientProps` não existe mais
  // no `BibleContentRenderer`.

  // O componente BibleContentRenderer precisa do objeto 'book' completo e do 'chapterNumber'.
  // Ele mesmo vai extrair o capítulo correto de 'book.chapters'.

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      {/* Agora passamos o 'book' completo e o 'chapterNumber' para o BibleContentRenderer */}
      <BibleContentRenderer 
        book={book} 
        chapterNumber={chapterNumber} 
      />
    </div>
  );
}