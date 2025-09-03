"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';

export default function PaginaApresentacaoHino() {
  const params = useParams();
  const numeroHino = params?.numero as string;
  const [hino, setHino] = useState<any>(null);
  const [estrofeAtual, setEstrofeAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHino = useCallback(async () => {
    if (!numeroHino) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/harpa/api/${numeroHino}`);
      if (!response.ok) {
        throw new Error('Hino não encontrado ou erro na API.');
      }
      const data = await response.json();

      // --- CORREÇÃO PRINCIPAL AQUI: Limpar e validar estrofes ---
      if (data && Array.isArray(data.estrofes)) {
        const estrofesLimpas = data.estrofes
          .map((s: any) => typeof s === 'string' ? s.trim() : String(s).trim()) // Garante string e remove espaços
          .filter((s: string) => s.length > 0); // Remove estrofes vazias após o trim

        if (estrofesLimpas.length === 0) {
          throw new Error('Hino encontrado, mas sem estrofes válidas para exibir.');
        }

        setHino({ ...data, estrofes: estrofesLimpas });
        setEstrofeAtual(0); // Reinicia para a primeira estrofe
      } else {
        throw new Error('Formato das estrofes inválido ou ausente.');
      }
      // --- FIM DA CORREÇÃO PRINCIPAL ---

    } catch (err: any) {
      console.error("Erro ao carregar hino para apresentação:", err);
      setError(err.message || "Erro desconhecido ao carregar o hino.");
      setHino(null);
    } finally {
      setLoading(false);
    }
  }, [numeroHino]);

  useEffect(() => {
    fetchHino();
  }, [fetchHino]);

  const irParaProximaEstrofe = () => {
    if (hino && hino.estrofes && estrofeAtual < hino.estrofes.length - 1) {
      setEstrofeAtual(prev => prev + 1);
    }
  };

  const irParaEstrofeAnterior = () => {
    if (estrofeAtual > 0) {
      setEstrofeAtual(prev => prev - 1);
    }
  };

  const voltarParaHome = () => {
    if (window.opener) {
        window.close();
    } else {
        window.location.href = '/harpa'; // Fallback se não conseguir fechar a aba
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      irParaProximaEstrofe();
    } else if (event.key === 'ArrowLeft') {
      irParaEstrofeAnterior();
    } else if (event.key === 'Escape') {
      voltarParaHome();
    }
  }, [irParaProximaEstrofe, irParaEstrofeAnterior, voltarParaHome]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: 'black', color: 'white' }}>
        <Typography variant="h5">Carregando Hino {numeroHino}...</Typography>
        <CircularProgress sx={{ mt: 2, color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: 'black', color: 'red' }}>
        <Typography variant="h5">Erro ao carregar o hino:</Typography>
        <Typography variant="body1">{error}</Typography>
        <Button onClick={voltarParaHome} variant="contained" sx={{ mt: 3 }}>Voltar</Button>
      </Box>
    );
  }

  if (!hino || !hino.estrofes || hino.estrofes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: 'black', color: 'white' }}>
        <Typography variant="h5">Hino {numeroHino} não encontrado ou sem estrofes válidas para exibir.</Typography>
        <Button onClick={voltarParaHome} variant="contained" sx={{ mt: 3 }}>Voltar</Button>
      </Box>
    );
  }

  const estrofeParaExibir = hino.estrofes[estrofeAtual] || ''; // Garante que é uma string vazia se undefined

  return (
    <Box
      sx={{
        backgroundColor: 'black',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButton onClick={voltarParaHome} color="primary" sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <HomeIcon />
        </IconButton>
      </Box>

      <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        {hino.numero}. {hino.titulo}
      </Typography>

      {estrofeParaExibir && (
        <Typography
          variant="h4"
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap', // Permite quebras de linha
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '90%',
            fontWeight: 'bold',
          }}
        >
          {estrofeParaExibir.trim()}
        </Typography>
      )}

      <Box sx={{ position: 'absolute', bottom: 16, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={irParaEstrofeAnterior}
          disabled={estrofeAtual === 0}
          startIcon={<ArrowBackIcon />}
        >
          Anterior
        </Button>
        <Button
          variant="contained"
          onClick={irParaProximaEstrofe}
          disabled={estrofeAtual >= hino.estrofes.length - 1} {/* Fix: Use >= to prevent going past the last element */}
          endIcon={<ArrowForwardIcon />}
        >
          Próxima
        </Button>
      </Box>

      <Box sx={{ position: 'absolute', bottom: 16, right: 16, color: 'text.secondary' }}>
        <Typography variant="body2">
          Estrofe {estrofeAtual + 1} de {hino?.estrofes?.length || 0}
        </Typography>
      </Box>
    </Box>
  );
}