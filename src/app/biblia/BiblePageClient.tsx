"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';

// ✅ Importe a interface BibleBook do seu arquivo de definição
import { BibleBook } from '@/lib/bible';

// ✅ Interface Props para este componente
interface BiblePageClientProps {
  allBooks: BibleBook[];
  // O tipo de 'onVerseSelect' agora está correto, a implementação é que muda
  onVerseSelect: (verse: { book: string; chapter: number; verse: number; content: string }) => void;
}


export default function BiblePageClient({ allBooks, onVerseSelect }: BiblePageClientProps) {
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapterNum, setSelectedChapterNum] = useState<number | null>(null);

  const antigoTestamento = allBooks.filter(b => b.periodo?.includes('Antigo'));
  const novoTestamento = allBooks.filter(b => b.periodo?.includes('Novo'));


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
    if (selectedBook && selectedChapterNum !== null) {
      // ✅ CORREÇÃO AQUI: Acessando diretamente o texto do versículo.
      // selectedBook.capitulos[selectedChapterNum - 1] é o array de strings de versículos para o capítulo.
      // [verseNumber - 1] é o índice do versículo dentro desse array.
      const chapterVerses: string[] = selectedBook.capitulos[selectedChapterNum - 1];
      const verseContent = chapterVerses[verseNumber - 1]; // Obtém a string do versículo

      if (verseContent !== undefined) { // ✅ Garante que o versículo existe nesse índice
        onVerseSelect({
          book: selectedBook.nome, // Ou selectedBook.abrev, como você preferir
          chapter: selectedChapterNum,
          verse: verseNumber,
          content: verseContent // ✅ Passa o conteúdo do versículo diretamente
        });
        
        const path = `/apresentacao/biblia/${selectedBook.abrev}/${selectedChapterNum}/${verseNumber}`;
        window.open(path, '_blank');
      } else {
        console.error("Versículo não encontrado para o índice fornecido.");
      }
    }
  };

  // --- Renderização Condicional ---

  // Visualização de VERSÍCULOS
  if (view === 'verses' && selectedBook && selectedChapterNum !== null) {
    // ✅ CORREÇÃO AQUI: 'capitulos' já é um array de arrays de strings.
    // selectedBook.capitulos[selectedChapterNum - 1] é o array de strings para o capítulo.
    const chapterVersesStrings: string[] = selectedBook.capitulos[selectedChapterNum - 1] || [];
    const totalVerses = chapterVersesStrings.length;
    const verseNumbers = Array.from({ length: totalVerses }, (_, i) => i + 1); // Gerar números de 1 ao total de versículos

    return (
      <div className="bible-navigation-container">
        <Button onClick={() => setView('chapters')} variant="outlined" color="primary">
          &larr; Voltar para Capítulos
        </Button>
        <h2>{selectedBook.nome} {selectedChapterNum}</h2>
        <p>Selecione um versículo para iniciar a apresentação:</p>
        <div className="verse-grid">
          {verseNumbers.map((verseNumber) => ( // ✅ Iterar sobre os números de versículos gerados
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

  // Visualização de CAPÍTULOS
  if (view === 'chapters' && selectedBook) {
    // ✅ CORREÇÃO AQUI: O número de capítulos é o length do array 'capitulos'
    const totalChapters = selectedBook.capitulos.length;
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