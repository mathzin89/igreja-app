import { getBook } from '@/lib/bible';
import { notFound } from 'next/navigation';
import BiblePresentationClient from './BiblePresentationClient';

type PageProps = {
  params: { livro: string; capitulo: string };
};

export default async function BiblePresentationPage({ params }: PageProps) {
  const book = await getBook(params.livro);
  const chapterNumber = parseInt(params.capitulo, 10);

  if (!book || isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > book.capitulos.length) {
    notFound();
  }

  return <BiblePresentationClient book={book} chapterNumber={chapterNumber} />;
}