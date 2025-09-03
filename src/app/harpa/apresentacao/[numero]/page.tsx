"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Box, Typography, CircularProgress, IconButton, Button } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HomeIcon from '@mui/icons-material/Home';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('A resposta da rede não foi ok.');
  }
  return res.json();
});

export default function PaginaApresentacaoHarpa({ params }: { params: { numero: string } }) {
  const [estrofeAtual, setEstrofeAtual] = useState(0);
  const apiUrl = `/harpa/api/${params.numero}`;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  useEffect(() => {
    if (data) {
      setEstrofeAtual(0);
    }
  }, [data]);

  const hino = data ? {
    title: `${data.number} - ${data.title}`,
    stanzas: data.chorus ? [data.chorus, ...data.stanzas] : data.stanzas
  } : null;

  const irParaProxima = () => {
    if (hino && estrofeAtual < hino.stanzas.length - 1) {
      setEstrofeAtual(estrofeAtual + 1);
    }
  };

  const irParaAnterior = () => {
    if (estrofeAtual > 0) {
      setEstrofeAtual(estrofeAtual - 1);
    }
  };
  
  const voltarParaHome = () => {
    if (window.opener) {
        window.close();
    } else {
        window.location.href = '/harpa';
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      irParaProxima();
    } else if (event.key === 'ArrowLeft') {
      irParaAnterior();
    } else if (event.key === 'Escape') {
      voltarParaHome();
    }
  }, [hino, estrofeAtual]); // Dependências atualizadas

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (isLoading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white'}}><CircularProgress color="inherit" /></Box>;
  }

  if (error || !hino) {
    return (
        <Box sx={{display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', p: 3}}>
            <Typography variant="h5">Hino não encontrado ou falha ao carregar.</Typography>
            <Typography variant="body2" sx={{mt: 1, color: 'grey.500'}}>Verifique o número do hino e a sua conexão.</Typography>
            <Button onClick={voltarParaHome} variant="contained" sx={{ mt: 3 }}>Voltar</Button>
        </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        color: 'white', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        p: 4
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButton onClick={voltarParaHome} sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
          <HomeIcon />
        </IconButton>
      </Box>

      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>{hino.title}</Typography>

      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Typography 
          sx={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}
        >
          {hino.stanzas[estrofeAtual]}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <IconButton color="inherit" onClick={irParaAnterior} disabled={estrofeAtual === 0} size="large"><ArrowBackIosIcon fontSize="large" /></IconButton>
        <Typography>
          {data.chorus && estrofeAtual === 0 ? 'Coro' : `Estrofe ${data.chorus ? estrofeAtual : estrofeAtual + 1}`}
          {' / '}
          {hino.stanzas.length}
        </Typography>
        <IconButton color="inherit" onClick={irParaProxima} disabled={estrofeAtual === hino.stanzas.length - 1} size="large"><ArrowForwardIosIcon fontSize="large" /></IconButton>
      </Box>
    </Box>
  );
}