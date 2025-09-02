"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Função 'fetcher' que o SWR usará para buscar os dados.
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('A resposta da rede não foi ok.');
  }
  return res.json();
});

export default function PaginaApresentacaoHarpa({ params }: { params: { numero: string } }) {
  const [estrofeAtual, setEstrofeAtual] = useState(0);
  // --- A MUDANÇA CRUCIAL ESTÁ AQUI ---
  // Agora chamamos a nossa própria API, que está dentro do nosso projeto
  const apiUrl = `/harpa/api/${params.numero}`;

  const { data, error, isLoading } = useSWR(apiUrl, fetcher);

  useEffect(() => {
    if (data) {
      setEstrofeAtual(0);
    }
  }, [data]);
  
  const irParaProxima = () => {
    const totalEstrofes = (data?.chorus ? data.stanzas.length + 1 : data.stanzas.length);
    if (data && estrofeAtual < totalEstrofes - 1) {
      setEstrofeAtual(estrofeAtual + 1);
    }
  };

  const irParaAnterior = () => {
    if (estrofeAtual > 0) {
      setEstrofeAtual(estrofeAtual - 1);
    }
  };

  if (isLoading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white'}}><CircularProgress color="inherit" /></Box>;
  }

  if (error || !data || !data.title) {
    return (
        <Box sx={{display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', p: 3}}>
            <Typography variant="h5">Hino não encontrado ou falha ao carregar.</Typography>
            <Typography variant="body2" sx={{mt: 1, color: 'grey.500'}}>Verifique o número do hino e a sua conexão.</Typography>
        </Box>
    );
  }
  
  const hino = {
    title: `${data.number} - ${data.title}`,
    stanzas: data.chorus ? [data.chorus, ...data.stanzas] : data.stanzas
  };

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