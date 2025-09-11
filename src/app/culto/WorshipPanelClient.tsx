"use client";

import { useState, useEffect } from "react";
import { BibleBook } from "@/lib/bible";
import HymnListPageClient from "../harpa/HymnListPageClient";
import BiblePageClient from "../biblia/BiblePageClient";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

// MUI para a nova interface
import { Paper, Box, Typography, List, ListItem, ListItemText, IconButton, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

// --- ESTRUTURAS DE DADOS ---
interface Slide {
  id: string;
  type: 'letra' | 'biblia' | 'aviso';
  title: string;
  content: string;
}

const estadoInicialSlideCustomizado = {
  title: "",
  content: "",
};

type Hymn = { title: string; content: string };
type Verse = { title: string; content: string };

// --- ✅ CORREÇÃO 1: SIMPLIFICAR AS PROPS ---
// O componente agora só precisa receber a lista de livros.
// As funções onHymnSelect e onVerseSelect foram removidas daqui.
type Props = {
  allBooks: BibleBook[];
};

export default function WorshipPanelClient({ allBooks }: Props) {
  const [activeTab, setActiveTab] = useState<'harpa' | 'biblia'>('harpa');
  const [playlist, setPlaylist] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);
  const [isLive, setIsLive] = useState(false);
  const [customSlideModalOpen, setCustomSlideModalOpen] = useState(false);
  const [customSlideData, setCustomSlideData] = useState(estadoInicialSlideCustomizado);

  useEffect(() => {
    if (isLive && currentSlideIndex >= 0 && playlist[currentSlideIndex]) {
      const currentSlide = playlist[currentSlideIndex];
      setDoc(doc(db, "presenting", "liveState"), { currentSlide });
    } else if (isLive && currentSlideIndex === -1) {
      setDoc(doc(db, "presenting", "liveState"), { currentSlide: null });
    }
  }, [currentSlideIndex, isLive, playlist]);

  const handleAddToPlaylist = (item: { type: 'letra' | 'biblia' | 'aviso', title: string, content: string }) => {
    const newSlide: Slide = { id: new Date().toISOString(), ...item };
    setPlaylist(prev => [...prev, newSlide]);
  };

  // --- ✅ CORREÇÃO 2: LÓGICA DE SELEÇÃO DENTRO DO COMPONENTE ---
  // Estas funções agora vivem aqui e chamam handleAddToPlaylist.
  const handleHymnSelect = (hino: Hymn) => {
    handleAddToPlaylist({
      type: 'letra',
      title: hino.title,
      content: hino.content,
    });
  };

  const handleVerseSelect = (verso: Verse) => {
    handleAddToPlaylist({
      type: 'biblia',
      title: verso.title,
      content: verso.content,
    });
  };

  const handleAddCustomSlide = () => {
    handleAddToPlaylist({
      type: 'aviso',
      title: customSlideData.title,
      content: customSlideData.content,
    });
    setCustomSlideData(estadoInicialSlideCustomizado);
    setCustomSlideModalOpen(false);
  };

  const handleRemoveFromPlaylist = (slideId: string) => {
    setPlaylist(prev => prev.filter(slide => slide.id !== slideId));
  };

  const handleStartPresentation = () => {
    setIsLive(true);
    setCurrentSlideIndex(0);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < playlist.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleStopPresentation = () => {
    setIsLive(false);
    setCurrentSlideIndex(-1);
    setDoc(doc(db, "presenting", "liveState"), { currentSlide: null });
  };

  return (
    <div className="worship-panel-grid">
      {/* Coluna da Esquerda: Seleção de Conteúdo */}
      <div className="content-selector">
        <div className="tab-buttons">
          <button className={activeTab === 'harpa' ? 'active' : ''} onClick={() => setActiveTab('harpa')}>Harpa Cristã</button>
          <button className={activeTab === 'biblia' ? 'active' : ''} onClick={() => setActiveTab('biblia')}>Bíblia Sagrada</button>
        </div>
        <div className="tab-content">
          {activeTab === 'harpa' && (
            // --- ✅ CORREÇÃO 3: PASSANDO A FUNÇÃO CORRETA ---
            // Agora passamos a função 'handleHymnSelect' que criamos aqui dentro.
            <HymnListPageClient hideTitle={true} onHymnSelect={handleHymnSelect} />
          )}
          {activeTab === 'biblia' && (
            // --- ✅ CORREÇÃO 4: PASSANDO A FUNÇÃO CORRETA ---
            // E aqui passamos a função 'handleVerseSelect'.
            <BiblePageClient allBooks={allBooks} onVerseSelect={handleVerseSelect} />
          )}
        </div>
      </div>
      
      {/* Você pode adicionar a UI da playlist e dos controles aqui */}
      {/* Exemplo: */}
      {/*
      <div className="playlist-manager">
        <h2>Playlist</h2>
        <List>
          {playlist.map(slide => (
            <ListItem key={slide.id}>
              <ListItemText primary={slide.title} />
              <IconButton onClick={() => handleRemoveFromPlaylist(slide.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <div className="presentation-controls">
           <Button onClick={handleStartPresentation}>Iniciar</Button>
           <Button onClick={handleStopPresentation}>Parar</Button>
           <Button onClick={handlePrevSlide}>Anterior</Button>
           <Button onClick={handleNextSlide}>Próximo</Button>
        </div>
      </div>
      */}
    </div>
  );
}