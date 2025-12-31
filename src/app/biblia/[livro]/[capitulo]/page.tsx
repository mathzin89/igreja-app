// src/app/biblia/[livro]/[capitulo]/page.tsx
import { notFound } from 'next/navigation';
// Importa getBook das server-actions (assumindo que você centralizou lá)
import { getBook } from '@/app/admin/projecao/server-actions'; 
import React from 'react';
import { BibleBook } from '@/lib/bible'; 

// Importa seu componente CLIENTE de apresentação da Bíblia
// O nome que você está usando é BiblePresentationClient
import BiblePresentationClient from '@/app/biblia/[livro]/[capitulo]/BiblePresentationClient'; 
// OBSERVAÇÃO: Se este componente BiblePresentationClient.tsx está em '@/components/BiblePresentationClient',
// você precisará ajustar o caminho de importação acima.
// Pelo erro, parece que ele está na mesma pasta, por isso o caminho relativo.

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
    notFound(); 
  }

  const book: BibleBook | undefined = await getBook(bookId);

  if (!book) {
    notFound(); 
  }

  // Não há mais necessidade de uma variável 'content' aqui,
  // pois BiblePresentationClient já recebe 'book' e 'chapterNumber'.
  // A prop 'onClose' também não é esperada pelo BiblePresentationClient no meu último código.
  // Se você precisa de onClose, terá que adicioná-la à interface BiblePresentationClientProps.

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      <BiblePresentationClient 
        book={book} // <--- PASSA AS PROPS ESPERADAS PELO COMPONENTE CLIENTE
        chapterNumber={chapterNumber} // <--- PASSA AS PROPS ESPERADAS PELO COMPONENTE CLIENTE
        // initialVerseIndex={0} // Opcional, se quiser um índice inicial diferente de 0
      />
    </div>
  );
}