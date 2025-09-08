// A única mudança é aqui: de getBookData para getBook
import { getBook } from '@/lib/bible';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../bible.css';

type PageProps = {
  params: { livro: string };
};

export default async function BookPage({ params }: PageProps) {
  // A única mudança é aqui: de getBookData para getBook
  const book = await getBook(params.livro);

  if (!book) {
    notFound();
  }

  // O resto do código continua igual...
  return (
    <div className="bible-container">
      <h1>{book.nome}</h1>
      <p>Selecione um capítulo</p>
      <div className="chapter-grid">
        {book.capitulos.map((_, index) => {
          const chapterNumber = index + 1;
          return (
            <Link 
              key={chapterNumber} 
              href={`/biblia/${params.livro}/${chapterNumber}`}
              className="chapter-link"
            >
              {chapterNumber}
            </Link>
          );
        })}
      </div>
    </div>
  );
}