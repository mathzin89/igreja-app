"use client";

import { useState, useEffect, use } from 'react'; // ✅ Importa o 'use'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface Slide {
  imageUrl: string;
}

// ✅ O tipo da prop 'params' agora é uma Promise
export default function SlideshowPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Usamos o hook use() para "desembrulhar" a Promise e pegar o id
  const { id } = use(params);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // ✅ Usamos a variável 'id' que já foi resolvida
    if (id) {
      const fetchSlideshow = async () => {
        try {
          // ✅ Usamos a variável 'id' aqui também
          const docRef = doc(db, 'slideshows', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title);
            setSlides(data.slides || []);
          } else {
            console.log("Nenhuma apresentação encontrada!");
          }
        } catch (error) {
          console.error("Erro ao buscar apresentação:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSlideshow();
    }
  }, [id]); // ✅ E aqui na lista de dependências

  // Efeito para controlar com as setas do teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides, currentSlide]);

  const handleNext = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const handlePrev = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
  };

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

// Estilos (sem alteração)
const styles = {
    // ...
};