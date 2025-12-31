// src/app/biblia/[livro]/[capitulo]/BiblePresentationClient.tsx
"use client";

import React, { useState, useEffect } from "react"; // Adicionei useEffect se precisar
import { BibleBook, ChapterContent, VerseContent } from "@/lib/bible"; // Importe VerseContent também

interface BiblePresentationClientProps {
  book: BibleBook;
  chapterNumber: number; // número 1-based
  initialVerseIndex?: number;
}

export default function BiblePresentationClient({ // Alterado para export default se estiver em page.tsx
  book,
  chapterNumber,
  initialVerseIndex = 0,
}: BiblePresentationClientProps) {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex);

  // Seleciona o capítulo (capítulo 1 está no índice 0)
  const selectedChapterContent: ChapterContent | undefined = book.chapters[chapterNumber - 1];

  // CORREÇÃO AQUI: Verifique selectedChapterContent antes de tentar acessar verses.length
  if (!selectedChapterContent || selectedChapterContent.verses.length === 0) {
    return <div>Capítulo não encontrado ou sem versículos.</div>;
  }

  // Extrair SOMENTE os TEXTOS DOS VERSÍCULOS
  // Usamos selectedChapterContent.verses para acessar o array de versículos
  const verseTexts: string[] = selectedChapterContent.verses.map(v => `${v.verse}. ${v.text}`);

  // CORREÇÃO AQUI: Certifique-se de que currentVerseIndex está dentro dos limites de verseTexts
  const currentVerse = verseTexts[currentVerseIndex];

  // Ajuste o estado do índice se, por algum motivo, o initialVerseIndex for maior que o número de versículos
  useEffect(() => {
    if (initialVerseIndex >= verseTexts.length && verseTexts.length > 0) {
      setCurrentVerseIndex(0);
    } else if (initialVerseIndex < 0) {
      setCurrentVerseIndex(0);
    } else {
      setCurrentVerseIndex(initialVerseIndex);
    }
  }, [initialVerseIndex, verseTexts.length]);


  const nextVerse = () => {
    if (currentVerseIndex < verseTexts.length - 1) { // CORREÇÃO: Usar verseTexts.length
      setCurrentVerseIndex(currentVerseIndex + 1);
    }
  };

  const prevVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">
        {book.nome} {chapterNumber}
      </h2>

      <div className="mb-6 text-xl">
        <span className="font-bold">{currentVerseIndex + 1}. </span>
        {currentVerse}
      </div>

      <div className="flex gap-4">
        <button
          onClick={prevVerse}
          disabled={currentVerseIndex === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
          Anterior
        </button>

        <button
          onClick={nextVerse}
          disabled={currentVerseIndex === verseTexts.length - 1} // CORREÇÃO: Usar verseTexts.length
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}