"use client";

import { useState, useEffect, useMemo } from 'react';
import { Hymn } from '@/types/hymn';

// --- Componente para a Tela de Apresentação ---
type PresentationViewProps = {
  hymn: Hymn;
  onClose: () => void;
};

function PresentationView({ hymn, onClose }: PresentationViewProps) {
  const slides = useMemo(() => {
    const generatedSlides: { type: 'stanza' | 'chorus'; content: string }[] = [];
    hymn.stanzas.forEach((stanza) => {
      generatedSlides.push({ type: 'stanza', content: stanza });
      if (hymn.chorus) {
        generatedSlides.push({ type: 'chorus', content: hymn.chorus });
      }
    });
    if (hymn.stanzas.length === 0 && hymn.chorus) {
        generatedSlides.push({ type: 'chorus', content: hymn.chorus });
    }
    return generatedSlides;
  }, [hymn]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slides.length, onClose]);

  if (slides.length === 0) {
    return (
        <div className="presentation-overlay" onClick={onClose}>
            <button onClick={onClose} className="presentation-close-btn">&times;</button>
            <div className="presentation-content">
                <p>Este hino não possui letra para apresentar.</p>
            </div>
        </div>
    );
  }

  const currentContent = slides[currentSlide];
  const cleanText = currentContent.content.replace(/<br\s*\/?>/gi, '\n');

  return (
    <div className="presentation-overlay">
      <button onClick={onClose} className="presentation-close-btn">&times;</button>
      <div className="presentation-content">
        <h2>{currentContent.type === 'chorus' ? '(Coro)' : `${hymn.title}`}</h2>
        <p>{cleanText}</p>
      </div>
      <div className="presentation-controls">
        <span>Slide {currentSlide + 1} / {slides.length}</span> (Use ← → para navegar, ESC para sair)
      </div>
    </div>
  );
}


// --- Componente Principal de Cliente para a Página do Hino ---
export default function HymnDetailPageClient({ hymn }: { hymn: Hymn | undefined }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!hymn) {
    return <div>Hino não encontrado.</div>;
  }

  return (
    <>
      <article style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>{hymn.id} - {hymn.title}</h1>
          <button onClick={() => setIsFullscreen(true)} style={{padding: '0.5rem 1rem'}}>
            Tela Cheia
          </button>
        </div>

        {hymn.stanzas.map((stanza, index) => (
          <div key={index} style={{ marginBottom: '1.5em' }}>
            <p>
              <strong>{index + 1}</strong><br />
              <span dangerouslySetInnerHTML={{ __html: stanza }} />
            </p>
            {hymn.chorus && (
              <blockquote style={{ fontStyle: 'italic', marginLeft: '2em' }}>
                <strong>(Coro)</strong><br />
                <span dangerouslySetInnerHTML={{ __html: hymn.chorus }} />
              </blockquote>
            )}
          </div>
        ))}
         {hymn.chorus && hymn.stanzas.length === 0 && (
            <blockquote style={{ fontStyle: 'italic', marginLeft: '2em' }}>
                <strong>(Coro)</strong><br />
                <span dangerouslySetInnerHTML={{ __html: hymn.chorus }} />
            </blockquote>
        )}
      </article>

      {isFullscreen && <PresentationView hymn={hymn} onClose={() => setIsFullscreen(false)} />}
    </>
  );
}