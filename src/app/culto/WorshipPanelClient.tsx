"use client";

import { useState, useEffect } from "react";
import { BibleBook } from "@/lib/bible";
import HymnListPageClient from "../harpa/HymnListPageClient";
import BiblePageClient from "../biblia/BiblePageClient";
import { doc, setDoc } from "firebase/firestore"; // ✅ Para o controle em tempo real
import { db } from "../../firebase/config"; // ✅ Verifique se o caminho está correto

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

// Tipos para os parâmetros das funções
type Hymn = { title: string; content: string };
type Verse = { title: string; content: string };

// Definindo as propriedades para o componente
type Props = {
  allBooks: BibleBook[];
  onHymnSelect: (hino: Hymn) => void;  // Tipando corretamente a função de seleção de hino
  onVerseSelect: (verso: Verse) => void;  // Tipando corretamente a função de seleção de versículo
};

export default function WorshipPanelClient({ allBooks, onHymnSelect, onVerseSelect }: Props) {
  const [activeTab, setActiveTab] = useState<'harpa' | 'biblia'>('harpa');
  const [playlist, setPlaylist] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);
  const [isLive, setIsLive] = useState(false);

  // Estados para o modal de slide customizado
  const [customSlideModalOpen, setCustomSlideModalOpen] = useState(false);
  const [customSlideData, setCustomSlideData] = useState(estadoInicialSlideCustomizado);

  // --- EFEITO PARA ATUALIZAR O FIREBASE EM TEMPO REAL ---
  useEffect(() => {
    if (isLive && currentSlideIndex >= 0 && playlist[currentSlideIndex]) {
      const currentSlide = playlist[currentSlideIndex];
      // Atualiza o Firebase
      setDoc(doc(db, "presenting", "liveState"), { currentSlide });
    } else if (isLive && currentSlideIndex === -1) {
      setDoc(doc(db, "presenting", "liveState"), { currentSlide: null });
    }
  }, [currentSlideIndex, isLive, playlist]);

  // Função para adicionar slide na playlist
  const handleAddToPlaylist = (item: { type: 'letra' | 'biblia' | 'aviso', title: string, content: string }) => {
    const newSlide: Slide = { id: new Date().toISOString(), ...item };
    setPlaylist(prev => [...prev, newSlide]);
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
            <HymnListPageClient hideTitle={true} onHymnSelect={hino => onHymnSelect(hino)} />
          )}
          {activeTab === 'biblia' && (
            <BiblePageClient allBooks={allBooks} onVerseSelect={verso => onVerseSelect(verso)} />
          )}
        </div>
      </div>
    </div>
  );
}
