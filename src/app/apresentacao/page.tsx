"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../..../../../firebase/config";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { IconButton } from "@mui/material";

interface Slide {
  type: 'letra' | 'biblia' | 'aviso';
  title: string;
  content: string;
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);

  useEffect(() => {
    // Escuta em tempo real o documento 'liveState' na coleção 'presenting'
    const unsub = onSnapshot(doc(db, "presenting", "liveState"), (doc) => {
      if (doc.exists()) {
        setCurrentSlide(doc.data().currentSlide as Slide);
      } else {
        setCurrentSlide(null);
      }
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsub();
  }, []);

  const handleFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  return (
    <div style={styles.container}>
      <div style={styles.fullscreenButton}>
        <IconButton onClick={handleFullscreen} color="primary">
            <FullscreenIcon fontSize="large" />
        </IconButton>
      </div>
      {currentSlide ? (
        <div style={styles.slide}>
          <h1 style={styles.title}>{currentSlide.title}</h1>
          {/* A tag <pre> preserva as quebras de linha do texto */}
          <pre style={styles.content}>{currentSlide.content}</pre>
        </div>
      ) : (
        <div style={styles.slide}>
          <h1 style={styles.title}>Aguardando Início da Apresentação</h1>
        </div>
      )}
    </div>
  );
}

// Estilos básicos para a tela de apresentação
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        color: '#FFF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '5%',
    },
    fullscreenButton: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '50%'
    },
    slide: {
        width: '100%',
    },
    title: {
        fontSize: '3.5vw',
        marginBottom: '2rem',
    },
    content: {
        fontSize: '3vw',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap', // Garante a quebra de linha em textos longos
        fontFamily: 'inherit',
    },
};