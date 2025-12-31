// src/app/admin/projecao/biblia/page.tsx
import { getBookList } from '@/app/admin/projecao/actions'; // Importa getBookList do server-actions
import Link from 'next/link';
import React from 'react';
import { BibleBook } from '@/lib/bible'; // <--- IMPORTA BibleBook para o tipo (se for usar)
import './bible.css'; // Se este arquivo CSS for específico para esta rota

interface BookList {
  nome: string;
  id: string;
}

interface BibleLists {
  antigoTestamento: BookList[];
  novoTestamento: BookList[];
}

export default async function ProjecaoBibliaPage() {
  const { antigoTestamento, novoTestamento }: BibleLists = await getBookList(); // <--- ATRIBUIÇÃO CORRETA E TYPAGEM
  // Removi a tentativa de tipar como `BibleBook[]` diretamente na desestruturação.

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Selecionar Livro da Bíblia (Projeção)</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Antigo Testamento</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {antigoTestamento.map((book) => (
            <Link key={book.id} href={`/admin/projecao/biblia/${book.id}/1`}>
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
            <Link key={book.id} href={`/admin/projecao/biblia/${book.id}/1`}>
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