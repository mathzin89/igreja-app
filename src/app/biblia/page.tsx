import { getBookList } from '@/lib/bible';
import Link from 'next/link';
import './bible.css'; // Criaremos este CSS no passo final

export default async function BibliaIndexPage() {
  const bible = await getBookList();

  return (
    <div className="bible-container">
      <h1>Bíblia Sagrada</h1>
      
      <div className="testament-section">
        <h2>Antigo Testamento</h2>
        <div className="bible-book-grid">
          {bible.antigoTestamento.map(book => (
            <Link key={book.slug} href={`/biblia/${book.slug}`} className="book-link">
              {book.nome}
            </Link>
          ))}
        </div>
      </div>

      <div className="testament-section">
        <h2>Novo Testamento</h2>
        <div className="bible-book-grid">
          {bible.novoTestamento.map(book => (
            <Link key={book.slug} href={`/biblia/${book.slug}`} className="book-link">
              {book.nome}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}