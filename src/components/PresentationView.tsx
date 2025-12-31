// src/components/PresentationView.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { BibleBook } from '@/lib/bible';
import { BibleContentRenderer } from '@/components/BibleContentRenderer';
import Portal from '@/components/Portal';

import { 
  PresentationContent, 
  BiblePresentation, 
  HymnPresentation, 
  SlidePresentation,
  YouTubePresentation,
  SlideShowPresentation,
  CustomSlide
} from '@/types/worship-types'; 

interface PresentationProps {
  content: PresentationContent;
  onClose: () => void;
  allBooks: BibleBook[]; 
}

const textTypographyStyle = {
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
    lineHeight: 1.3, 
    fontWeight: 'normal',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 180px)', 
    fontSize: { xs: '3rem', sm: '4rem', md: '4.5rem', lg: '4.5rem' },
    p: { xs: 2, md: 4 }, 
    width: '100%',
};

export default function PresentationView({ content, onClose, allBooks }: PresentationProps) {
  
  const subSlides = useMemo(() => {
    if (content.type === 'hino') {
      return (content as HymnPresentation).hymn.slides;
    } else if (content.type === 'text-slide' && content.content) {
      return (content.content || '').split('\n\n').filter((s: string) => s.trim() !== '');
    }
    return [];
  }, [content]);

  const totalSlides = useMemo(() => {
    if (content.type === 'slide-show') {
      return (content as SlideShowPresentation).slides.length;
    }
    if (content.type === 'hino' || content.type === 'text-slide') {
      return subSlides.length > 0 ? subSlides.length : 1;
    }
    return 1;
  }, [content, subSlides]);

  const initialSlideIndex = useMemo(() => {
    if (content.type === 'slide-show' && content.initialIndex !== undefined) {
      return content.initialIndex;
    }
    if (content.type === 'hino' && content.initialStanzaIndex !== undefined) {
      return content.initialStanzaIndex;
    }
    return 0;
  }, [content]);

  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialSlideIndex);
    setOpacity(1);
  }, [content.id, initialSlideIndex]);

  const changeSlide = useCallback((newIndex: number) => {
    setOpacity(0);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setOpacity(1);
    }, 200);
  }, []); 

  const handleNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      changeSlide(currentIndex + 1);
    }
  }, [currentIndex, totalSlides, changeSlide]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      changeSlide(currentIndex - 1);
    }
  }, [currentIndex, changeSlide]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (content.type === 'biblia' || content.type === 'youtube') {
        if (event.key === 'Escape') onClose();
        return;
      }
      
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault(); 
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, onClose, content.type]);


  const renderSlideContent = () => {
    // (O corpo da função 'renderSlideContent' está correto, sem alterações)
    const commonTransition = { opacity: opacity, transition: 'opacity 0.2s ease-in-out' };

    if (content.type === 'biblia') {
      const bibleContent = content as BiblePresentation;
      if (!bibleContent.book || bibleContent.chapterNumber === undefined) {
        return <Typography variant="h4" color="error">Dados da Bíblia incompletos.</Typography>;
      }
      return (
        <BibleContentRenderer
          book={bibleContent.book}
          chapterNumber={bibleContent.chapterNumber}
          initialVerseIndex={bibleContent.initialVerseIndex}
        />
      );
    } 
    
    if (content.type === 'image-slide') {
      const slideContent = content as SlidePresentation;
      if (!slideContent.imageUrl) { 
        return <Typography variant="h4" color="error">Slide de imagem sem URL.</Typography>;
      }
      return (
        <Image
          src={slideContent.imageUrl}
          alt={slideContent.title || "Slide de Imagem"}
          fill style={{ objectFit: 'cover', ...commonTransition }} 
          sizes="100vw" quality={100} priority
        />
      );
    } 
    
    if (content.type === 'youtube') {
      const youtubeContent = content as YouTubePresentation;
      return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <iframe
                style={{ width: '100%', aspectRatio: '16/9', border: 'none', maxWidth: '100vw', maxHeight: '100vh' }}
                src={`https://www.youtube.com/embed/${youtubeContent.videoId}?autoplay=1&controls=1&rel=0`}
                title={youtubeContent.title || "YouTube Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </Box>
      );
    }
    
    if (content.type === 'hino' || content.type === 'text-slide') {
      const isTitleSlide = currentIndex === 0 && content.type === 'hino';
      const currentText = subSlides[currentIndex] || "Nenhum conteúdo";
      return (
        <Typography
          sx={{
            ...textTypographyStyle,
            ...commonTransition,
            fontWeight: isTitleSlide ? 'bold' : 'normal',
            fontSize: isTitleSlide 
              ? { xs: '3.5rem', sm: '4.5rem', md: '5.5rem', lg: '5.5rem' }
              : textTypographyStyle.fontSize,
          }}
        >
          {currentText}
        </Typography>
      );
    }
    
    if (content.type === 'slide-show') {
      const { slides } = content as SlideShowPresentation;
      const currentSlide = slides[currentIndex];
      if (!currentSlide) {
        return <Typography variant="h4" color="error">Slide não encontrado.</Typography>;
      }
      if (currentSlide.type === 'imagem' && currentSlide.imageUrl) {
        return (
          <Image
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            fill style={{ objectFit: 'cover', ...commonTransition }} 
            sizes="100vw" quality={100} priority
          />
        );
      } 
      if (currentSlide.type === 'aviso') {
        const fullContent = `${currentSlide.title}\n\n${currentSlide.content || ''}`;
        return (
          <Typography
            sx={{
              ...textTypographyStyle,
              ...commonTransition,
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem', lg: '5rem' },
            }}
          >
            {fullContent}
          </Typography>
        );
      }
    }
    
    return null;
  };

  return (
    <Portal>
      <Box sx={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'black', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        p: 0, 
        zIndex: 1300,
        // --------------------------------------------------------
        // ✅ A CORREÇÃO ESTÁ AQUI
        // --------------------------------------------------------
        // Isto impede que o navegador tente selecionar o texto
        // e mostre o cursor a piscar.
        userSelect: 'none',
        // --------------------------------------------------------
      }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' } }}>
          <CloseIcon fontSize="large" />
        </IconButton>

        <Box sx={{
          flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
          width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
          px: { xs: 4, sm: 8, md: 12, lg: 16 },
        }}>
          {renderSlideContent()}
        </Box>

        {/* Bloco de Navegação (sem setas visuais) */}
        {(content.type !== 'biblia' && content.type !== 'youtube') && totalSlides > 1 && (
          <>
            {/* O Contador de Slides foi MANTIDO */}
            <Typography sx={{
              position: 'absolute', bottom: 16, color: 'white',
              fontSize: { xs: '1rem', md: '1.2rem' }, zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px',
            }}>
              {currentIndex + 1} / {totalSlides}
            </Typography>
          </>
        )}
      </Box>
    </Portal>
  );
}