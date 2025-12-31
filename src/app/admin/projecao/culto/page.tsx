// src/app/admin/projecao/culto/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react';
import WorshipPanelClient from './WorshipPanelClient';
import PresentationView from '@/components/PresentationView';
import { getAllBibleBooks } from '@/app/admin/projecao/actions'; // Corrigido para 'actions'
import rawHarpaJson from '@/data/harpa.json';
import { getAllHymns } from '@/lib/harpa';
import { BibleBook } from '@/lib/bible';
import { Hymn } from '@/lib/harpa';
import { PresentationContent } from '@/types/worship-types';
import './culto.css';

export default function ProjecaoPage() {
  const [allBooks, setAllBooks] = useState<BibleBook[]>([]);
  const [allHymns, setAllHymns] = useState<Hymn[]>([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentPresentationContent, setCurrentPresentationContent] = useState<PresentationContent | null>(null);

  useEffect(() => {
    async function loadData() {
      const booksData = await getAllBibleBooks();
      setAllBooks(booksData);
      const hymns = getAllHymns(rawHarpaJson);
      setAllHymns(hymns);
    }
    loadData();
  }, []);

  const handleOpenPresentation = (content: PresentationContent) => {
    setCurrentPresentationContent(content);
    setIsPresentationMode(true);
  };

  const handleClosePresentation = () => {
    setIsPresentationMode(false);
    setCurrentPresentationContent(null);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <div className="page-container">
        <h1>Painel de Projeção</h1>
        
        {/* ✅ CORREÇÃO APLICADA AQUI: 
            A propriedade 'onOpenPresentation' foi atualizada para 'onProject'.
            Adicionei também 'savedSlides' e 'onSlideSave' com valores vazios para satisfazer o contrato do componente.
        */}
        <WorshipPanelClient
          allBooks={allBooks}
          allHymns={allHymns}
          savedSlides={[]} 
          onSlideSave={() => {}} 
          onProject={handleOpenPresentation}
        />
      </div>

      {isPresentationMode && currentPresentationContent && (
        <PresentationView
          content={currentPresentationContent}
          onClose={handleClosePresentation}
          allBooks={allBooks}
        />
      )}
    </>
  );
}