import { getBook } from '@/lib/bible';
import { notFound } from 'next/navigation';
import BiblePresentationClient from './BiblePresentationClient';

type PageProps = {
  params: { livro: string; capitulo: string };
};

// Em /app/biblia/[livro]/[capitulo]/page.tsx

export default async function BiblePresentationPage({ params }: PageProps) {
  
  // Adicione este log para ver o que está sendo buscado
  console.log('Buscando livro com abrev:', params.livro);

  const book = await getBook(params.livro);
  
  // Adicione este log para ver o resultado da busca
  console.log('Livro encontrado:', book);

  const chapterNumber = parseInt(params.capitulo, 10);

  if (!book || isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > book.capitulos.length) {
    notFound();
  }

  return <BiblePresentationClient book={book} chapterNumber={chapterNumber} />;
}