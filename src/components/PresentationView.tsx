// No arquivo: src/components/PresentationView.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface PresentationProps {
  content: {
    title: string;
    content: string;
  };
  startIndex?: number; // ✅ 1. CORREÇÃO: Propriedade para o índice inicial
  onClose: () => void;
}

export default function PresentationView({ content, startIndex = 0, onClose }: PresentationProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [opacity, setOpacity] = useState(1); // Estado para controlar a animação

  const slides = useMemo(() => content.content.split('\n\n').filter(s => s.trim() !== ''), [content.content]);

  // Função para mudar de slide com animação
  const changeSlide = (newIndex: number) => {
    setOpacity(0); // Começa a animação de fade-out
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setOpacity(1); // Após a troca, aplica a animação de fade-in
    }, 200); // Duração do fade-out
  };

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      changeSlide(currentIndex + 1);
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      changeSlide(currentIndex - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') handleNext();
      else if (event.key === 'ArrowLeft') handlePrev();
      else if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, onClose]);

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'black', color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      p: 4, zIndex: 1300
    }}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 10 }}>
        <CloseIcon fontSize="large" />
      </IconButton>

      <Typography variant="h3" sx={{ 
        position: 'absolute', top: 24, textAlign: 'center',
        // ✅ 3. FONTES RESPONSIVAS
        fontSize: { xs: '1.5rem', md: '2.5rem' } 
      }}>
        {content.title}
      </Typography>

      <Typography sx={{ 
        textAlign: 'center', 
        whiteSpace: 'pre-wrap',
        // ✅ 2. TRANSIÇÃO SUAVE
        transition: 'opacity 0.2s ease-in-out',
        opacity: opacity,
        // ✅ 3. FONTES RESPONSIVAS
        fontSize: { xs: '2rem', md: '3.5rem', lg: '4.5rem' },
        lineHeight: 1.5
      }}>
        {slides[currentIndex]}
      </Typography>
      
      {currentIndex > 0 && (
        <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 16, top: '50%', color: 'white', transform: 'translateY(-50%)' }}>
          <ArrowBackIosNewIcon style={{ fontSize: 60 }} />
        </IconButton>
      )}
      {currentIndex < slides.length - 1 && (
        <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 16, top: '50%', color: 'white', transform: 'translateY(-50%)' }}>
          <ArrowForwardIosIcon style={{ fontSize: 60 }} />
        </IconButton>
      )}
      
      <Typography sx={{ position: 'absolute', bottom: 24 }}>
        {currentIndex + 1} / {slides.length}
      </Typography>
    </Box>
  );
}