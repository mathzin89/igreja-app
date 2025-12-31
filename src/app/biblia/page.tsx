// src/app/biblia/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation'; // Adicionei se precisar
import { getBookList } from '@/app/admin/projecao/server-actions'; // Ou o caminho correto para suas server-actions
import { BibleBook } from '@/lib/bible'; // Importe BibleBook se for usá-lo em outro lugar.

// Defina as interfaces para o que getBookList realmente retorna
interface BookListItem {
  nome: string;
  id: string;
}

interface BibleLists {
  antigoTestamento: BookListItem[];
  novoTestamento: BookListItem[];
}

export default async function BibliaIndexPage() {
  // CORREÇÃO AQUI: Receba o objeto completo ou desestruture-o corretamente
  const { antigoTestamento, novoTestamento }: BibleLists = await getBookList();
  // Se você precisa de 'books' como um array único, você pode combinar:
  // const allBooks = [...antigoTestamento, ...novoTestamento];
  // Mas para a renderização abaixo, não é necessário.

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Bíblia Sagrada</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Antigo Testamento</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {antigoTestamento.map((book) => (
            <Link key={book.id} href={`/biblia/${book.id}/1`}>
              <div className="book-card p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow cursor-pointer text-center text-white">
                {book.nome}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Novo Testamento</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {novoTestamento.map((book) => (
            <Link key={book.id} href={`/biblia/${book.id}/1`}>
              <div className="book-card p-4 bg-gray-700 hover:bg-gray-600 rounded-lg shadow cursor-pointer text-center text-white">
                {book.nome}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}