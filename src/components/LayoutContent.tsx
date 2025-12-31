"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface Slide {
  imageUrl: string;
}

// ✅ CORREÇÃO: Em Client Components, 'params' é um objeto simples, não uma Promise.
export default function SlideshowPage({ params }: { params: { id: string } }) {
  // ✅ O 'id' é acessado diretamente do objeto params.
  const { id } = params;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (id) {
      const fetchSlideshow = async () => {
        try {
          const docRef = doc(db, 'slideshows', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || 'Apresentação');
            setSlides(data.slides || []);
          } else {
            console.log("Nenhuma apresentação encontrada!");
            setTitle("Apresentação não encontrada");
          }
        } catch (error) {
          console.error("Erro ao buscar apresentação:", error);
          setTitle("Erro ao carregar");
        } finally {
          setLoading(false);
        }
      };
      fetchSlideshow();
    }
  }, [id]);

  // ✅ OTIMIZAÇÃO: Usando useCallback para evitar recriar as funções a cada renderização.
  const handleNext = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);
  
  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') handleNext();
      else if (event.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]); // ✅ Dependências estáveis graças ao useCallback.

  if (loading) {
    return <Box sx={styles.container}><CircularProgress color="inherit" /></Box>;
  }

  return (
    <Box sx={styles.container}>
      <IconButton onClick={handleFullscreen} sx={styles.fullscreenButton}>
        <FullscreenIcon />
      </IconButton>

      {slides.length > 0 ? (
        <>
          <Box component="img" src={slides[currentSlide].imageUrl} sx={styles.slideImage} />
          
          <IconButton onClick={handlePrev} sx={{ ...styles.navButton, ...styles.leftButton }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton onClick={handleNext} sx={{ ...styles.navButton, ...styles.rightButton }}>
            <ArrowForwardIosIcon />
          </IconButton>

          <Box sx={styles.slideCounter}>
            <Typography>{currentSlide + 1} / {slides.length}</Typography>
          </Box>
        </>
      ) : (
        <Typography variant="h4" color="inherit">{title}</Typography>
      )}
    </Box>
  );
}

// ✅ Estilos completos para uma apresentação funcional
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#000',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Garante que a imagem inteira apareça sem distorção
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
  },
  leftButton: {
    left: '10px',
  },
  rightButton: {
    right: '10px',
  },
  fullscreenButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    color: 'white',
    zIndex: 10,
  },
  slideCounter: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '2px 10px',
    borderRadius: '10px',
  },
};