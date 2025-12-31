// (Provavelmente src/app/admin/projecao/page.tsx)
"use client";

import React, { useState, useEffect } from 'react';
import WorshipPanelClient from './culto/WorshipPanelClient';
import PresentationView from '@/components/PresentationView';
import { getCustomSlides, getAllBibleBooks } from './actions'; 
import { getAllHymns } from '@/lib/harpa';
import { BibleBook } from '@/lib/bible';
import { Hymn } from '@/lib/harpa';
import './culto/culto.css';
import rawHarpaJson from '@/data/harpa.json';
import { useAuth } from '@/firebase/AuthContext';

// ATUALIZADO: Importar 'CustomSlide' junto com 'PresentationContent'
import { PresentationContent, CustomSlide } from '@/types/worship-types';

/* REMOVIDO: Esta interface foi movida para 'worship-types.ts'
export interface CustomSlide {
  id: string;
  type: 'aviso' | 'imagem';
  title: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  igrejaId: string;
}
*/

export default function ProjecaoPage() {
  const { userProfile, loading: authLoading } = useAuth();
  
  const [allBooks, setAllBooks] = useState<BibleBook[]>([]);
  const [allHymns, setAllHymns] = useState<Hymn[]>([]);
  const [customSlides, setCustomSlides] = useState<CustomSlide[]>([]); // <- Tipo agora é importado
  const [isLoading, setIsLoading] = useState(true);
  const [presentationContent, setPresentationContent] = useState<PresentationContent | null>(null);

  const refreshCustomSlides = async (igrejaId: string) => {
    // Garante que os dados recebidos sejam tratados como o tipo 'CustomSlide' importado
    const slidesData = await getCustomSlides(igrejaId);
    setCustomSlides(slidesData as CustomSlide[]);
  };

  useEffect(() => {
    async function loadData() {
        if (authLoading || !userProfile) {
            return; 
        }

        setIsLoading(true);
        const hymnsData = getAllHymns(rawHarpaJson);
        setAllHymns(hymnsData);
        await Promise.all([
            getAllBibleBooks().then(setAllBooks),
            refreshCustomSlides(userProfile.igrejaId) 
        ]);
        setIsLoading(false);
    }
    
    loadData();
  }, [authLoading, userProfile]);

  const handleProject = (content: PresentationContent) => {
    setPresentationContent(content);
  };

  const handleClosePresentation = () => {
    setPresentationContent(null);
    if (document.fullscreenElement) document.exitFullscreen();
  };

  if (authLoading || isLoading) {
    return <div className="page-container"><h1>A carregar dados do painel...</h1></div>;
  }
  if (!userProfile) {
    return <div className="page-container"><h1>Erro: Perfil de utilizador não encontrado. Não é possível carregar os slides.</h1></div>;
  }

  return (
    <>
      <div className="page-container">
        <h1>Painel de Projeção ({userProfile.igrejaNome || userProfile.igrejaId})</h1>
        <WorshipPanelClient
          allBooks={allBooks}
          allHymns={allHymns}
          savedSlides={customSlides}
          onSlideSave={() => refreshCustomSlides(userProfile.igrejaId)}
          onProject={handleProject}
        />
      </div>
      
      {presentationContent && (
        <PresentationView 
          content={presentationContent}
          onClose={handleClosePresentation}
          allBooks={allBooks} // <- Passar allBooks para o PresentationView
        />
      )}
    </>
  );
}