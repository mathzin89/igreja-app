// src/app/admin/projecao/biblia/[livro]/[capitulo]/BiblePresentationClient.tsx
"use client";

import React, { useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PresentationContent, BiblePresentation } from '@/types/worship-types'; // Apenas o que é necessário
import { BibleContentRenderer } from '@/components/BibleContentRenderer'; // Importa o renderer real da Bíblia
import { BibleBook } from '@/lib/bible'; // Para o tipo BibleBook

interface BiblePresentationClientProps {
  // O 'content' aqui deve ser SEMPRE do tipo 'biblia'
  content: BiblePresentation; // ✅ Agora sabemos que é apenas BiblePresentation
  onClose: () => void;
  allBooks: BibleBook[]; // Precisamos de todos os livros para encontrar o livro específico
}

export default function BiblePresentationClient({ content, onClose, allBooks }: BiblePresentationClientProps) {

  // A navegação de versículos será gerenciada INTERNAMENTE pelo BibleContentRenderer.
  // Este componente apenas se preocupa em passar os dados corretos.

  // Encontra o livro completo usando o ID do livro na content (que é do tipo BiblePresentation)
  const book = allBooks.find(b => b.id === content.book.id);

  // Se o livro não for encontrado ou faltarem dados essenciais, exibe uma mensagem de erro
  if (!book || content.chapterNumber === undefined || content.initialVerseIndex === undefined) {
    return (
      <Box sx={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'black', color: 'white',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1300
      }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 10 }}>
          <CloseIcon fontSize="large" />
        </IconButton>
        <Typography variant="h4" color="error" sx={{ textAlign: 'center' }}>
          Erro: Dados da Bíblia incompletos ou livro não encontrado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'black', color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      p: 0,
      zIndex: 1300
    }}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 10 }}>
        <CloseIcon fontSize="large" />
      </IconButton>

      {/* ✅ AQUI ESTÁ O CORAÇÃO: Ele renderiza o componente que faz o trabalho pesado */}
      <BibleContentRenderer
        book={book}
        chapterNumber={content.chapterNumber}
        initialVerseIndex={content.initialVerseIndex}
      />
    </Box>
  );
}