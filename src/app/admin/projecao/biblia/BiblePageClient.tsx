// src/app/admin/projecao/biblia/BiblePageClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { BibleBook, ChapterContent } from '@/lib/bible';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, Divider, List, ListItem, ListItemText } from '@mui/material';
import { fetchChapterContent } from '@/app/admin/projecao/actions'; // Importe a server action

// Interface para o item da Bíblia que será adicionado à playlist
interface BiblePlaylistItem {
  title: string;          // Ex: "Gênesis 1"
  content: string;        // O texto completo do capítulo (pode ser grande, considere usar um placeholder)
  bookName: string;       // Nome do livro (Ex: Gênesis)
  chapterNumber: number;  // Número do capítulo (Ex: 1)
  startIndex?: number;    // Índice do versículo inicial (0-based)
}

interface BiblePageClientProps {
  allBooks: BibleBook[]; // Lista de todos os livros da Bíblia
  onVerseSelect: (item: BiblePlaylistItem) => void; // Callback para adicionar à playlist
}

export default function BiblePageClient({ allBooks, onVerseSelect }: BiblePageClientProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number | ''>('');
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | ''>(''); // 0-based
  const [chapterVerses, setChapterVerses] = useState<ChapterContent | null>(null);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [errorVerses, setErrorVerses] = useState<string | null>(null);

  const selectedBook = allBooks.find(book => book.id === selectedBookId);

  // Carregar os versículos do capítulo quando o livro ou capítulo muda
  useEffect(() => {
    async function loadVerses() {
      if (selectedBookId && selectedChapterNumber !== '') {
        setLoadingVerses(true);
        setErrorVerses(null);
        setChapterVerses(null);
        setSelectedVerseIndex(''); // Resetar seleção de versículo

        try {
          // fetchChapterContent precisa do ID do livro, não do nome
          const content = await fetchChapterContent(selectedBookId, selectedChapterNumber as number);
          if (content && content.verses) {
            setChapterVerses(content);
          } else {
            setErrorVerses("Não foi possível carregar os versículos para este capítulo.");
          }
        } catch (error) {
          console.error("Erro ao buscar versículos:", error);
          setErrorVerses("Erro ao carregar versículos.");
        } finally {
          setLoadingVerses(false);
        }
      } else {
        setChapterVerses(null);
        setSelectedVerseIndex('');
      }
    }
    loadVerses();
  }, [selectedBookId, selectedChapterNumber]);

  const handleAddChapterToPlaylist = () => {
    if (selectedBook && selectedChapterNumber !== '') {
      const chapterTitle = `${selectedBook.nome} ${selectedChapterNumber}`;
      let chapterContentText = "Conteúdo completo do capítulo será exibido na apresentação."; // Placeholder
      
      if (chapterVerses) {
        // Se quisermos o texto completo do capítulo para a prop 'content'
        chapterContentText = chapterVerses.verses.map(v => `${v.verse}. ${v.text}`).join('\n');
      }

      onVerseSelect({
        title: chapterTitle,
        content: chapterContentText, // Pode ser o texto completo ou um marcador
        bookName: selectedBook.nome, // Nome do livro para o PresentationView
        chapterNumber: selectedChapterNumber as number,
        startIndex: selectedVerseIndex !== '' ? selectedVerseIndex as number : 0,
      });
      // Opcional: Resetar seleção após adicionar
      // setSelectedBookId('');
      // setSelectedChapterNumber('');
      // setSelectedVerseIndex('');
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Adicionar Bíblia à Playlist</Typography>

      {/* Seletor de Livro */}
      <FormControl fullWidth>
        <InputLabel id="select-book-label">Livro</InputLabel>
        <Select
          labelId="select-book-label"
          id="select-book"
          value={selectedBookId}
          label="Livro"
          onChange={(e) => {
            setSelectedBookId(e.target.value as string);
            setSelectedChapterNumber(''); // Resetar capítulo ao mudar o livro
          }}
        >
          {allBooks.map((book) => (
            <MenuItem key={book.id} value={book.id}>
              {book.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Seletor de Capítulo */}
      {selectedBook && (
        <FormControl fullWidth>
          <InputLabel id="select-chapter-label">Capítulo</InputLabel>
          <Select
            labelId="select-chapter-label"
            id="select-chapter"
            value={selectedChapterNumber}
            label="Capítulo"
            onChange={(e) => setSelectedChapterNumber(e.target.value as number)}
            disabled={!selectedBook}
          >
            {[...Array(selectedBook.chapters.length)].map((_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                Capítulo {index + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Seletor de Versículo (opcional, só se um capítulo for selecionado e tiver versículos) */}
      {selectedBook && selectedChapterNumber !== '' && chapterVerses && chapterVerses.verses.length > 0 && (
        <>
          <FormControl fullWidth>
            <InputLabel id="select-verse-label">Versículo Inicial (Opcional)</InputLabel>
            <Select
              labelId="select-verse-label"
              id="select-verse"
              value={selectedVerseIndex}
              label="Versículo Inicial (Opcional)"
              onChange={(e) => setSelectedVerseIndex(e.target.value as number)}
            >
              <MenuItem value="">Todos os versículos (desde o início)</MenuItem>
              {chapterVerses.verses.map((verse, index) => (
                <MenuItem key={verse.verse} value={index}>
                  {verse.verse}. {verse.text.substring(0, 50)}...
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider />
          <Typography variant="h6">Pré-visualização do Capítulo:</Typography>
          {loadingVerses ? (
            <Typography>Carregando versículos...</Typography>
          ) : errorVerses ? (
            <Typography color="error">{errorVerses}</Typography>
          ) : (
            <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', p: 1 }}>
              {chapterVerses?.verses.map((verse) => (
                <Typography key={verse.verse} variant="body2">
                  <span style={{ fontWeight: 'bold' }}>{verse.verse}.</span> {verse.text}
                </Typography>
              ))}
            </Box>
          )}
        </>
      )}


      <Button
        variant="contained"
        color="primary"
        onClick={handleAddChapterToPlaylist}
        disabled={!selectedBook || selectedChapterNumber === ''}
        sx={{ mt: 2 }}
      >
        Adicionar Capítulo à Playlist
      </Button>
    </Box>
  );
}