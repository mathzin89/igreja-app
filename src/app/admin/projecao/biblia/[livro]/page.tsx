// src/app/biblia/[livro]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
// ✅ Importa getBibleBookByIdServer e getFullBible (que existe em src/lib/server-data.ts)
import { getBibleBookByIdServer, getFullBible } from '@/lib/server-data'; 
import { BibleBook, ChapterContent } from '@/lib/bible'; // Importa a interface BibleBook e ChapterContent para tipagem
import '../bible.css'; // Mantenha se você tem

// ✅ REMOVIDO: import { getBook } from '@/app/admin/projecao/server-actions'; // Não é usado aqui

interface LivroPageProps {
  params: {
    livro: string; // ID do livro (ex: 'GEN', 'EXO')
  };
}

// Para metadados (SEO) - Opcional, mas boa prática
export async function generateMetadata({ params }: LivroPageProps) {
  const { livro: bookId } = params;
  const book: BibleBook | undefined = await getBibleBookByIdServer(bookId);

  if (!book) {
    return {
      title: 'Livro não encontrado',
    };
  }

  return {
    title: `${book.nome} - Bíblia Online`,
    description: `Capítulos do livro de ${book.nome}.`,
  };
}

// Para gerar rotas estáticas (SSG) - Opcional, mas recomendado para performance
export async function generateStaticParams() {
  // ✅ CORRIGIDO: Usando getFullBible que existe em src/lib/server-data.ts
  const allBooks: BibleBook[] = await getFullBible(); 
  return allBooks.map((book) => ({
    livro: book.id,
  }));
}

export default async function LivroPage({ params }: LivroPageProps) {
  const { livro: bookId } = params;

  const book: BibleBook | undefined = await getBibleBookByIdServer(bookId);

  if (!book) {
    notFound();
  }

  // Este componente lista os capítulos de um livro
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-400">
        {book.nome}
      </h1>
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
        {/* ✅ CORRIGIDO: Tipagem explícita para os parâmetros _chapter e index */}
        {book.chapters.map((_chapter: ChapterContent, index: number) => ( 
          <Link
            key={index + 1}
            href={`/biblia/${book.id}/${index + 1}`}
            className="block text-center p-4 border border-blue-200 dark:border-blue-700 rounded-lg shadow-md hover:bg-blue-100 dark:hover:bg-blue-700 transition duration-200 text-lg font-semibold text-blue-800 dark:text-blue-200"
          >
            Capítulo {index + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}