// src/app/admin/projecao/culto/[bookSlug]/[chapterNum]/page.tsx
// (Ou qualquer nome que você tenha dado para esta rota de apresentação de versículo)
"use client"; // Se este é um Client Component que faz a exibição. Se for Server Component, remova.

import { notFound } from 'next/navigation';
// Importa getBook e fetchChapterContent das server-actions
import { getBook, fetchChapterContent } from '@/app/admin/projecao/server-actions'; 
import React from 'react';
import { BibleBook, ChapterContent } from '@/lib/bible'; 
import { BibleContentRenderer } from '@/components/BibleContentRenderer';

interface BibleVerseSlideClientProps {
  book: BibleBook;
  chapterNumber: number;
  initialVerseIndex?: number;
}

// Se este arquivo é um Client Component para o slide, ele não deveria ser um `page.tsx`
// mas sim um componente em `src/components/` (como `BibleContentRenderer`).
// Se este É um `page.tsx`, ele deve ser um Server Component e passar as props para um Client Component.
// Dada a estrutura, parece que este `page.tsx` tenta renderizar o slide diretamente.

// Vamos assumir que este `page.tsx` é um SERVER COMPONENT que prepara os dados
// e passa para um CLIENT COMPONENT de slide.

interface CultoBookChapterPageProps {
  params: {
    bookSlug: string;
    chapterNum: string;
  };
}

export default async function CultoBookChapterPage({ params }: CultoBookChapterPageProps) {
  const bookId = params.bookSlug;
  const chapterNumber = parseInt(params.chapterNum);

  if (isNaN(chapterNumber) || chapterNumber <= 0) {
    notFound();
  }

  const book = await getBook(bookId); // getBook é assíncrono agora
  if (!book) {
    notFound();
  }

  const chapterContent: ChapterContent | undefined = await fetchChapterContent(bookId, chapterNumber); // Assíncrono
  if (!chapterContent || chapterContent.verses.length === 0) {
    return <div className="text-white text-center text-3xl p-8">Capítulo não encontrado ou sem versículos.</div>;
  }

  // Agora, formatamos os versículos CORRETAMENTE para passar para o cliente,
  // ou se o cliente já lida com ChapterContent, passamos ChapterContent.
  // O ideal é que o cliente receba o `ChapterContent` e faça a formatação.
  // Vou assumir que o `BibleVerseSlideClient` recebe `ChapterContent` e o `book`
  // de forma semelhante ao `BibleContentRenderer`.

  // Se você está usando `BibleVerseSlideClient` aqui, ele deve ter as mesmas props que `BibleContentRenderer`
  // Ou seja, `book` e `chapterNumber`.

  // Se seu BibleVerseSlideClient (ou qualquer componente que mostra o slide)
  // é o que está dando erro de `.map` em ChapterContent, então o problema é LÁ.

  // Se o erro está *neste* page.tsx, então a linha problemática é onde você está tentando mapear.
  // Vou te dar um exemplo de como seria a passagem de props para um cliente aqui.

  // Exemplo de como preparar os dados para um cliente se ele espera array de strings:
  const versesAsStrings = chapterContent.verses.map(v => `${v.verse}. ${v.text}`);

  // Assumindo que seu BibleVerseSlideClient espera `book`, `chapterNumber` e `verses` (string[]):
  // IMPORTANTE: Se BibleVerseSlideClient já tem a lógica de BibleContentRenderer, ele pode
  // receber apenas book e chapterNumber.

  // import BibleVerseSlideClient from '@/components/BibleVerseSlideClient'; // Importe seu componente aqui

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-4">{book.nome} {chapterNumber}</h1>
      {/* Se BibleVerseSlideClient espera apenas o texto do versículo atual */}
      {/* Você precisaria de um estado de índice de versículo aqui no Server Component
          ou de um Client Component que gerencie o estado.
          O modelo `BibleContentRenderer` já faz isso. Se você tem este `page.tsx`
          e um `BibleContentRenderer`, você pode estar duplicando funcionalidade ou
          usando o slide de forma diferente. */}

      {/* Se BibleVerseSlideClient é o componente que mostra 1 versículo por vez */}
      {/* e precisa de um array de versículos formatados: */}
      {/* <BibleVerseSlideClient
        book={book} // Passa o objeto do livro
        chapterNumber={chapterNumber}
        verses={versesAsStrings} // Passa o array de strings formatadas
      /> */}

      {/* Se você está usando o `BibleContentRenderer` que te dei,
          então o ideal é usá-lo aqui: */}
      <BibleContentRenderer 
        book={book}
        chapterNumber={chapterNumber}
      />
      {/* Remova qualquer lógica de `map` no `page.tsx` se `BibleContentRenderer` já faz isso. */}

    </div>
  );
}