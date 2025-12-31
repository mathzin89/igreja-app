// src/app/culto/FreeSlidesClient.tsx
"use client";

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText, Divider, Alert } from '@mui/material';

import preMadeSlidesData from '@/data/slides.json'; // <-- USANDO ALIAS @/data

// --- ATUALIZADO: Definições de Tipos ---
interface PreMadeSlide {
  id: string;
  title: string;
  content: string; // Para slides de texto
  type: 'text-slide' | 'image-slide'; // Diferenciar os tipos
  imageUrl?: string; // NOVO: URL da imagem, opcional para slides de texto
}

// O formato que o componente pai (WorshipPanelClient) espera
type SlidePayload = {
    title: string;
    content: string; // Pode ser o texto ou uma descrição para imagem
    type: 'hino' | 'biblia' | 'text-slide' | 'slide-custom' | 'image-slide'; // Adicionado 'text-slide' e 'image-slide'
    imageUrl?: string; // NOVO: Para passar a URL da imagem
};

interface FreeSlidesClientProps {
  onSlideSelect: (slide: SlidePayload) => void;
}

export default function FreeSlidesClient({ onSlideSelect }: FreeSlidesClientProps) {
  const [customSlideText, setCustomSlideText] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleAddPreMadeSlide = (slide: PreMadeSlide) => {
    setAlertMessage(null);
    onSlideSelect({
      title: slide.title,
      content: slide.content, 
      type: slide.type === 'image-slide' ? 'image-slide' : 'text-slide', // Usa o tipo do JSON
      imageUrl: slide.imageUrl // Passa a URL da imagem se existir
    });
  };

  const handleAddCustomSlide = () => {
    setAlertMessage(null);
    if (customSlideText.trim() === '') {
      setAlertMessage("Por favor, digite algum texto para criar um slide.");
      return;
    }
    onSlideSelect({
      title: "Slide Personalizado", 
      content: customSlideText,
      type: 'slide-custom'
    });
    setCustomSlideText('');
  };

  return (
    <Box sx={{ p: 2 }}>
      {alertMessage && <Alert severity="warning" sx={{ mb: 2 }}>{alertMessage}</Alert>}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Criar Slide Personalizado</Typography>
        <TextField
          label="Texto do Slide"
          multiline
          rows={4}
          fullWidth
          value={customSlideText}
          onChange={(e) => setCustomSlideText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleAddCustomSlide} fullWidth>
          Adicionar Slide Personalizado
        </Button>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Slides Pré-Prontos</Typography>
        <List>
          {(preMadeSlidesData as PreMadeSlide[]).map((slide) => (
            <ListItem 
              key={slide.id} 
              sx={{ pr: { xs: '150px', sm: '180px', md: '200px', lg: '220px' } }} 
              secondaryAction={
                <Button variant="outlined" size="small" onClick={() => handleAddPreMadeSlide(slide)}>
                  Adicionar
                </Button>
              }
            >
              <ListItemText 
                primary={slide.title} 
                secondary={slide.type === 'text-slide' ? (slide.content.split('\n')[0] + (slide.content.split('\n').length > 1 ? '...' : '')) : ""} 
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}