"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Image from 'next/image';

interface CarouselImage {
  id: string;
  imageUrl: string;
  link?: string;
  order: number;
  timestamp: string; 
}

interface CarouselProps {
  images: CarouselImage[];
}

export default function CarouselClient({ images }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const validImages = useMemo(() => 
    images.filter(image => image && typeof image.imageUrl === 'string' && image.imageUrl.trim() !== ''),
    [images]
  );
  
  const nextSlide = useCallback(() => {
    if (validImages.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % validImages.length);
    }
  }, [validImages.length]);

  const prevSlide = useCallback(() => {
    if (validImages.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  }, [validImages.length]);

  useEffect(() => {
    if (validImages.length > 1) {
      const slideInterval = setInterval(nextSlide, 5000);
      return () => clearInterval(slideInterval);
    }
  }, [validImages.length, nextSlide]);

  if (!validImages || validImages.length === 0) {
    return (
      <Box sx={{ paddingTop: '56.25%', backgroundColor: '#e0e0e0', borderRadius: 2, position: 'relative', boxShadow: 5 }}>
         <Typography sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'text.secondary' }}>
            Nenhuma imagem no carrossel.
         </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '1152px', mx: 'auto', borderRadius: 2, boxShadow: 5, overflow: 'hidden' }}>
      
      <Box sx={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
        {validImages.map((image, index) => (
          <Box
            key={image.id}
            sx={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.7s ease-in-out',
            }}
          >
            <Image
              src={image.imageUrl}
              alt={`Slide ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Box>
        ))}
      </Box>

      {validImages.length > 1 && (
        <>
          <IconButton onClick={prevSlide} sx={{ position: 'absolute', top: '50%', left: {xs: 1, md: 2}, transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' } }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <IconButton onClick={nextSlide} sx={{ position: 'absolute', top: '50%', right: {xs: 1, md: 2}, transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' } }}>
            <ArrowForwardIosIcon />
          </IconButton>

          <Box sx={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
            {validImages.map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrentSlide(i)}
                sx={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  cursor: 'pointer', backgroundColor: i === currentSlide ? 'white' : 'grey.400',
                  transition: 'background-color 0.3s', border: '1px solid rgba(0,0,0,0.2)'
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}