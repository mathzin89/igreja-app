"use client";

import { useState } from 'react';
import Link from 'next/link'; // Usando Link do Next.js para navegação
import { BibleBook } from '@/lib/bible';
import { Button } from '@mui/material'; // Button importado do Material-UI

type Props = {
  allBooks: BibleBook[];
  onVerseSelect: (verse: { title: string; content: string }) => void;  // Tipagem correta da função onVerseSelect
};

export default function BiblePageClient({ allBooks, onVerseSelect }: Props) {
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
      const verse = selectedBook.capitulos[selectedChapterNum - 1][verseNumber - 1]; // Acessando o conteúdo do versículo
      onVerseSelect({ title: verse.title, content: verse.content }); // Chamando a função onVerseSelect com os dados do versículo
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
        <Button onClick={() => setView('chapters')} variant="outlined" color="primary">
          &larr; Voltar para Capítulos
        </Button>
        <h2>{selectedBook.nome} {selectedChapterNum}</h2>
        <p>Selecione um versículo para iniciar a apresentação:</p>
        <div className="verse-grid">
          {verses.map((_, index) => {
            const verseNumber = index + 1;
            return (
              <Button
                key={verseNumber}
                onClick={() => handleVerseClick(verseNumber)}
                variant="contained"
                color="secondary"
                className="verse-button"
              >
                {verseNumber}
              </Button>
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
        <Button onClick={() => { setView('books'); setSelectedBook(null); }} variant="outlined" color="primary">
          &larr; Voltar para a Lista de Livros
        </Button>
        <h2>{selectedBook.nome}</h2>
        <p>Selecione um capítulo:</p>
        <div className="chapter-grid">
          {selectedBook.capitulos.map((_, index) => {
            const chapterNumber = index + 1;
            return (
              <Button
                key={chapterNumber}
                onClick={() => handleChapterClick(chapterNumber)}
                variant="contained"
                color="primary"
                className="chapter-link"
              >
                {chapterNumber}
              </Button>
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
            <Button
              key={book.nome}
              onClick={() => handleBookClick(book)}
              variant="outlined"
              color="primary"
              className="book-button"
            >
              {book.nome}
            </Button>
          ))}
        </div>
      </div>

      <div className="testament-section">
        <h2>Novo Testamento</h2>
        <div className="bible-book-grid">
          {novoTestamento.map(book => (
            <Button
              key={book.nome}
              onClick={() => handleBookClick(book)}
              variant="outlined"
              color="primary"
              className="book-button"
            >
              {book.nome}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
