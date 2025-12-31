"use client";

import { useState } from 'react';
import { Button } from '@mui/material';
import { BibleBook } from '@/lib/bible';

// --- Tipos e Props ---
interface VersePayload {
  bookName: string; // <--- ADICIONADO
  chapter: number; // <--- ADICIONADO
  verse: number; // <--- ADICIONADO (se for o verso clicado)
  text: string; // <--- ADICIONADO (o texto do verso/capítulo)
  // O 'title' e 'content' que você já tinha podem ser formados a partir destes
  // ou serem propriedades adicionais se preferir passar o texto completo do capítulo.
}

interface BiblePageClientProps {
  allBooks: BibleBook[];
  onVerseSelect: (verse: VersePayload) => void;
}

export default function BiblePageClient({ allBooks, onVerseSelect }: BiblePageClientProps) {
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapterNum, setSelectedChapterNum] = useState<number | null>(null);

  // --- Corrigido: usa testament no lugar de periodo ---
  const antigoTestamento = allBooks.filter(b => b.testament === 'VT');
  const novoTestamento = allBooks.filter(b => b.testament === 'NT');

  const handleBookClick = (book: BibleBook) => {
    setSelectedBook(book);
    setView('chapters');
  };

  const handleChapterClick = (chapterNumber: number) => {
    setSelectedChapterNum(chapterNumber);
    setView('verses');
  };

  const handleVerseClick = (verseNumber: number) => {
    if (!selectedBook || selectedChapterNum === null) return;

const chapter = selectedBook.chapters[selectedChapterNum - 1];
if (!chapter) return;

// Se você quer que o PlaylistItem contenha APENAS o verso clicado:
const selectedVerseText = chapter.verses[verseNumber - 1]?.text || "";
onVerseSelect({
  bookName: selectedBook.nome,
  chapter: selectedChapterNum,
  verse: verseNumber,
  text: selectedVerseText,
});
  };

  // --- Renderização Condicional ---
  if (view === 'verses' && selectedBook && selectedChapterNum !== null) {
    const chapter = selectedBook.chapters[selectedChapterNum - 1];
    const chapterVersesStrings: string[] = chapter ? chapter.verses.map(v => v.text) : [];
    const verseNumbers = Array.from({ length: chapterVersesStrings.length }, (_, i) => i + 1);

    return (
      <div className="bible-navigation-container">
        <Button onClick={() => setView('chapters')} variant="outlined" color="primary">
          &larr; Voltar para Capítulos
        </Button>
        <h2>{selectedBook.nome} {selectedChapterNum}</h2>
        <p>Selecione um versículo para adicionar à playlist:</p>
        <div className="verse-grid">
          {verseNumbers.map((verseNumber) => (
            <Button
              key={verseNumber}
              onClick={() => handleVerseClick(verseNumber)}
              variant="contained"
              color="secondary"
              className="verse-button"
            >
              {verseNumber}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'chapters' && selectedBook) {
    const totalChapters = selectedBook.chapters.length;
    const chapterNumbers = Array.from({ length: totalChapters }, (_, i) => i + 1);

    return (
      <div className="bible-navigation-container">
        <Button onClick={() => { setView('books'); setSelectedBook(null); }} variant="outlined" color="primary">
          &larr; Voltar para a Lista de Livros
        </Button>
        <h2>{selectedBook.nome}</h2>
        <p>Selecione um capítulo:</p>
        <div className="chapter-grid">
          {chapterNumbers.map((chapterNumber) => (
            <Button
              key={chapterNumber}
              onClick={() => handleChapterClick(chapterNumber)}
              variant="contained"
              color="primary"
              className="chapter-link"
            >
              {chapterNumber}
            </Button>
          ))}
        </div>
      </div>
    );
  }

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
