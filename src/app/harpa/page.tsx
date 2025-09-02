"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, TextField, Paper, Container } from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';

export default function PaginaHarpa() {
  const [numeroHino, setNumeroHino] = useState('');
  const router = useRouter();

  const handleProjetar = (e: React.FormEvent) => {
    e.preventDefault();
    if (numeroHino && Number(numeroHino) > 0 && Number(numeroHino) <= 640) {
      // Abre a página de apresentação numa nova aba
      window.open(`/harpa/apresentacao/${numeroHino}`, '_blank');
    } else {
      alert("Por favor, digite um número de hino válido (1 a 640).");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
          Harpa Cristã
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Digite o número do hino que deseja projetar no telão.
        </Typography>
        <Box component="form" onSubmit={handleProjetar} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Número do Hino"
            type="number"
            variant="outlined"
            value={numeroHino}
            onChange={(e) => setNumeroHino(e.target.value)}
            fullWidth
            autoFocus
            inputProps={{ min: 1, max: 640 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            startIcon={<SlideshowIcon />}
            sx={{ px: 4 }}
          >
            Projetar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}