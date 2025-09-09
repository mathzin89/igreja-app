"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BibleBook } from '@/lib/bible';

type Props = {
  allBooks: BibleBook[];
};

export default function BiblePageClient({ allBooks }: Props) {
  const router = useRouter();

  // Estados para controlar a visualização
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapterNum, setSelectedChapterNum] = useState<number | null>(null);

  const antigoTestamento = allBooks.filter(b => b.periodo.includes('Antigo'));
  const novoTestamento = allBooks.filter(b => b.periodo.includes('Novo'));

  // Funções para controlar a navegação
  const handleBookClick = (book: BibleBook) => {
    setSelectedBook(book);
    setView('chapters');
  };

  const handleChapterClick = (chapterNumber: number) => {
    setSelectedChapterNum(chapterNumber);
    setView('verses');
  };

  const handleVerseClick = (verseNumber: number) => {
    if (selectedBook && selectedChapterNum) {
      // Abre a apresentação em uma nova aba, começando no versículo correto
      // CORREÇÃO APLICADA AQUI: trocado .slug por .abrev
      const path = `/biblia/${selectedBook.abrev}/${selectedChapterNum}?versiculo=${verseNumber}`;
      window.open(path, '_blank');
    }
  };

  // --- Renderização Condicional ---

  // Visualização de VERSÍCULOS
  if (view === 'verses' && selectedBook && selectedChapterNum) {
    const verses = selectedBook.capitulos[selectedChapterNum - 1] || [];
    return (
      <div className="bible-navigation-container">
        <button onClick={() => setView('chapters')} className="back-button">
          &larr; Voltar para Capítulos
        </button>
        <h2>{selectedBook.nome} {selectedChapterNum}</h2>
        <p>Selecione um versículo para iniciar a apresentação:</p>
        <div className="verse-grid">
          {verses.map((_, index) => {
            const verseNumber = index + 1;
            return (
              <button
                key={verseNumber}
                onClick={() => handleVerseClick(verseNumber)}
                className="verse-button"
              >
                {verseNumber}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Visualização de CAPÍTULOS
  if (view === 'chapters' && selectedBook) {
    return (
      <div className="bible-navigation-container">
        <button onClick={() => { setView('books'); setSelectedBook(null); }} className="back-button">
          &larr; Voltar para a Lista de Livros
        </button>
        <h2>{selectedBook.nome}</h2>
        <p>Selecione um capítulo:</p>
        <div className="chapter-grid">
          {selectedBook.capitulos.map((_, index) => {
            const chapterNumber = index + 1;
            return (
              <button
                key={chapterNumber}
                onClick={() => handleChapterClick(chapterNumber)}
                className="chapter-link"
              >
                {chapterNumber}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Visualização de LIVROS (Padrão)
  return (
    <div className="bible-navigation-container">
      <div className="testament-section">
        <h2>Antigo Testamento</h2>
        <div className="bible-book-grid">
          {antigoTestamento.map(book => (
            // CORREÇÃO APLICADA AQUI: trocado key={book.slug} por key={book.nome}
            <button key={book.nome} onClick={() => handleBookClick(book)} className="book-button">
              {book.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="testament-section">
        <h2>Novo Testamento</h2>
        <div className="bible-book-grid">
          {novoTestamento.map(book => (
            // CORREÇÃO APLICADA AQUI: trocado key={book.slug} por key={book.nome}
            <button key={book.nome} onClick={() => handleBookClick(book)} className="book-button">
              {book.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}