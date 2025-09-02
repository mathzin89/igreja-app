"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Imports do Firebase para buscar um documento específico
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../../../../firebase/config'; // Ajuste o caminho para a sua config
import { FichaParaImpressao } from '../../../../../components/FichaParaImpressao'; // Ajuste o caminho
import { Box, CircularProgress, Typography } from '@mui/material';

// O { params } é como o Next.js nos dá o ID do membro que está na URL
export default function PaginaImpressao({ params }: { params: { id: string } }) {
  const [membro, setMembro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembro = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const membroDocRef = doc(db, "membros", id);
      const docSnap = await getDoc(membroDocRef);

      if (docSnap.exists()) {
        setMembro({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Membro não encontrado.");
      }
    } catch (err) {
      setError("Erro ao buscar dados do membro.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchMembro(params.id);
    }
  }, [params.id, fetchMembro]);

  // Efeito que chama a impressão assim que os dados do membro carregam
  useEffect(() => {
    if (membro && !loading) {
      setTimeout(() => {
        window.print();
      }, 500); // Um pequeno atraso para garantir que tudo está renderizado
    }
  }, [membro, loading]);

  if (loading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // A ref foi removida aqui
  return membro ? <FichaParaImpressao membro={membro} /> : null;
}