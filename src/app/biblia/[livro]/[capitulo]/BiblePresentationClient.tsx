"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BibleBook } from '@/lib/bible';

type Props = {
  book: BibleBook | undefined;
  chapterNumber: number;
};

export default function BiblePresentationClient({ book, chapterNumber }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Encontra o índice do capítulo (base 0)
  const chapterIndex = chapterNumber - 1;
  const verses = book?.capitulos[chapterIndex] || [];
  
  // Pega o versículo inicial da URL ou começa do 0
  const initialVerseIndex = parseInt(searchParams?.get('versiculo') || '1', 10) - 1;

  const [currentVerseIndex, setCurrentVerseIndex] = useState(
    // Garante que o versículo inicial seja válido
    initialVerseIndex >= 0 && initialVerseIndex < verses.length ? initialVerseIndex : 0
  );

  const goToNextVerse = useCallback(() => {
    setCurrentVerseIndex(prev => Math.min(prev + 1, verses.length - 1));
  }, [verses.length]);

  const goToPreviousVerse = useCallback(() => {
    setCurrentVerseIndex(prev => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextVerse();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousVerse();
      } else if (e.key === 'Escape') {
        window.close(); // Fecha a aba/janela
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextVerse, goToPreviousVerse]);

  if (!book) {
    return <div className="presentation-page"><p>Livro não encontrado.</p></div>;
  }

  return (
    <main className="presentation-page">
      <button onClick={() => window.close()} className="presentation-back-button">
        Fechar (Esc)
      </button>

      <div className="presentation-content">
        {verses.length > 0 ? (
          <p>{verses[currentVerseIndex]}</p>
        ) : (
          <p>Este capítulo não possui texto.</p>
        )}
      </div>

      <footer className="presentation-footer">
        <div className="presentation-title">{book.nome} {chapterNumber}:{currentVerseIndex + 1}</div>
        {verses.length > 0 && (
          <div className="presentation-counter">
            {currentVerseIndex + 1} / {verses.length}
          </div>
        )}
      </footer>
    </main>
  );
}