"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hymn } from '@/lib/harpa';

type Props = {
  hymn: Hymn | undefined;
};

export default function HymnPresentationClient({ hymn }: Props) {
  const router = useRouter();
  const slides = hymn?.slides || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
      else if (e.key === 'ArrowLeft') setCurrentSlide(prev => Math.max(prev - 1, 0));
      else if (e.key === 'Escape') router.back();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, router]);

  if (!hymn) {
    return (
      <div className="presentation-page">
        <div className="presentation-content">
          <p>Hino não encontrado.</p>
        </div>
        <button onClick={() => router.back()} className="presentation-back-button">
          &larr; Voltar
        </button>
      </div>
    );
  }

  return (
    <main className="presentation-page">
      <button onClick={() => router.back()} className="presentation-back-button">
        &larr; Voltar
      </button>

      <div className="presentation-content">
        {slides.length > 0 ? <p>{slides[currentSlide]}</p> : <p>Este hino não possui letra.</p>}
      </div>

      <footer className="presentation-footer">
        <div className="presentation-title">
          {currentSlide > 0 && `${hymn.number} - ${hymn.title}`}
        </div>
        {slides.length > 0 && (
          <div className="presentation-counter">
            {currentSlide + 1} / {slides.length}
          </div>
        )}
      </footer>
    </main>
  );
}
