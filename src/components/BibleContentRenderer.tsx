"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { BibleBook, ChapterContent } from '@/lib/bible';

import { fetchChapterContent } from '@/app/admin/projecao/actions';

interface BibleContentRendererProps {
  book: BibleBook;
  chapterNumber: number;
  initialVerseIndex?: number;
}

export function BibleContentRenderer({ book, chapterNumber, initialVerseIndex = 0 }: BibleContentRendererProps) {
  const [chapterData, setChapterData] = useState<ChapterContent | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(initialVerseIndex);
  const [opacity, setOpacity] = useState(1);
  const [isLoadingChapter, setIsLoadingChapter] = useState(true);

  useEffect(() => {
    async function loadChapter() {
      setIsLoadingChapter(true);
      const data = await fetchChapterContent(book.id, chapterNumber);
      if (data) {
        setChapterData(data);
        setCurrentVerseIndex(initialVerseIndex);
      } else {
        setChapterData(null);
      }
      setIsLoadingChapter(false);
    }
    loadChapter();
  }, [book.id, chapterNumber, initialVerseIndex]);

  const totalVerses = useMemo(() => chapterData?.verses.length || 0, [chapterData]);

  const changeVerse = useCallback((newIndex: number) => {
    setOpacity(0);
    setTimeout(() => {
      setCurrentVerseIndex(newIndex);
      setOpacity(1);
    }, 200);
  }, []);

  const handleNextVerse = useCallback(() => {
    if (currentVerseIndex < totalVerses - 1) {
      changeVerse(currentVerseIndex + 1);
    }
  }, [currentVerseIndex, totalVerses, changeVerse]);

  const handlePrevVerse = useCallback(() => {
    if (currentVerseIndex > 0) {
      changeVerse(currentVerseIndex - 1);
    }
  }, [currentVerseIndex, changeVerse]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') handleNextVerse();
      else if (event.key === 'ArrowLeft') handlePrevVerse();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextVerse, handlePrevVerse]);

  if (isLoadingChapter) {
    return <Typography sx={{color: 'white'}}>A carregar capítulo...</Typography>;
  }

  if (!chapterData) {
    return <Typography color="error">Capítulo não encontrado.</Typography>;
  }

  const currentVerse = chapterData.verses[currentVerseIndex];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      px: { xs: 4, lg: 16 },
      py: { xs: 2, md: 4 },
      position: 'relative',
      opacity: opacity,
      transition: 'opacity 0.2s ease-in-out',
      overflow: 'hidden',
    }}>
      {/* Título do Capítulo */}
      <Typography
        sx={{
          mb: { xs: 2, md: 4 },
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'white',
          // ✅ AQUI PODE DIMINUIR A FONTE DO TÍTULO DA BÍBLIA
          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '3.5rem', lg: '4.5rem' },
        }}
      >
        {book.nome} {chapterNumber}
      </Typography>

      {/* Conteúdo do Versículo */}
      {currentVerse ? (
        <Typography
          sx={{
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
            lineHeight: 1.2,
            color: 'white',
            // ✅ AQUI PODE DIMINUIR A FONTE DO TEXTO DO VERSÍCULO
            fontSize: { xs: '3.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' }, 
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 250px)',
            width: '100%',
          }}
        >
          <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>{currentVerse.verse}.</Box>
          {currentVerse.text}
        </Typography>
      ) : (
        <Typography color="error">Versículo não encontrado.</Typography>
      )}

      {/* Navegação de Versículos */}
      {totalVerses > 1 && (
        <Box sx={{ position: 'absolute', bottom: { xs: 80, sm: 20 }, width: '100%', display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 8 }, zIndex: 10 }}>
          <IconButton onClick={handlePrevVerse} disabled={currentVerseIndex === 0} sx={{ color: 'white' }}>
            <ArrowBackIosNewIcon style={{ fontSize: 60 }} />
          </IconButton>
          <Typography sx={{ color: 'white', fontSize: { xs: '1.5rem', md: '2rem' }, alignSelf: 'center' }}>
            {currentVerseIndex + 1} / {totalVerses}
          </Typography>
          <IconButton onClick={handleNextVerse} disabled={currentVerseIndex === totalVerses - 1} sx={{ color: 'white' }}>
            <ArrowForwardIosIcon style={{ fontSize: 60 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}