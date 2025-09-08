'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BibleBook } from '@/lib/bible';

interface BibleVerseSlideClientProps {
  book: BibleBook;
  chapterIndex: number; // Índice do capítulo (0-based)
  initialVerseIndex?: number; // Versículo inicial (0-based)
}

export default function BibleVerseSlideClient({
  book,
  chapterIndex,
  initialVerseIndex = 0,
}: BibleVerseSlideClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verifica se o capítulo existe antes de tentar acessar
  const chapter = book.capitulos[chapterIndex];
  const totalVerses = chapter ? chapter.length : 0;

  const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex);

  // Atualiza o versículo inicial se a prop mudar
  useEffect(() => {
    setCurrentVerseIndex(initialVerseIndex);
  }, [initialVerseIndex]);

  // Atualiza a URL com o versículo atual
  useEffect(() => {
    if (chapter && totalVerses > 0) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('versiculo', (currentVerseIndex + 1).toString());
      router.replace(`?${current.toString()}`);
    }
  }, [currentVerseIndex, chapter, totalVerses, router, searchParams]);

  const goToNextVerse = useCallback(() => {
    if (currentVerseIndex < totalVerses - 1) {
      setCurrentVerseIndex(prev => prev + 1);
    }
  }, [currentVerseIndex, totalVerses]);

  const goToPreviousVerse = useCallback(() => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(prev => prev - 1);
    }
  }, [currentVerseIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') { // Seta direita ou espaço
        goToNextVerse();
      } else if (event.key === 'ArrowLeft') { // Seta esquerda
        goToPreviousVerse();
      }
    },
    [goToNextVerse, goToPreviousVerse]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!chapter || totalVerses === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-4xl text-white bg-black">
        Capítulo não encontrado ou vazio.
      </div>
    );
  }

  const currentVerseText = chapter[currentVerseIndex];

  // Regex para encontrar as referências e destacar
  const highlightReferences = (text: string) => {
    // Melhorado para capturar números de versículos no início ou fim
    const regex = /(\b\d+\s+\w+\s+\d+:\d+(?:-\d+)?\b|\b\w+\s+\d+:\d+(?:-\d+)?\b)/g;
    return text.split(regex).map((part, index) => {
      if (part.match(regex)) {
        return <span key={index} className="text-blue-400 font-bold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-black text-white p-8">
      {/* Botões de navegação */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
        <button
          onClick={goToPreviousVerse}
          disabled={currentVerseIndex === 0}
          className="bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white p-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &lt;
        </button>
      </div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
        <button
          onClick={goToNextVerse}
          disabled={currentVerseIndex === totalVerses - 1}
          className="bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white p-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &gt;
        </button>
      </div>

      {/* Conteúdo principal do slide */}
      <h1 className="text-7xl font-bold mb-8 text-yellow-400 text-center">
        {book.nome} {chapterIndex + 1}:{currentVerseIndex + 1}
      </h1>
      <p className="text-6xl text-center leading-tight max-w-4xl">
        {highlightReferences(currentVerseText)}
      </p>

      {/* Indicador de progresso */}
      <div className="absolute bottom-8 text-3xl text-gray-400">
        {currentVerseIndex + 1} / {totalVerses}
      </div>
    </div>
  );
}