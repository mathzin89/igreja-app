// src/types/worship-types.ts

import { BibleBook } from '@/lib/bible';
import { Hymn } from '@/lib/harpa'; // Importar Hymn para usar em HymnPresentation

// --- Seus tipos existentes ---
export interface BiblePresentation {
  id: string;
  type: 'biblia';
  book: BibleBook;
  chapterNumber: number;
  initialVerseIndex: number;
}

export interface HymnPresentation {
  id: string;
  type: 'hino';
  hymn: Hymn; // O objeto Hymn já contém number, title e content
  initialStanzaIndex: number;
}

export interface SlidePresentation {
  id: string;
  type: 'text-slide' | 'image-slide';
  title?: string; // O título do slide
  content?: string; // O conteúdo de texto do slide (para text-slide)
  imageUrl?: string; // O URL da imagem (para image-slide)
}

export interface YouTubePresentation {
  id: string;
  type: 'youtube';
  videoId: string;
  title?: string; // Título opcional
}

// -----------------------------------------------------------------
// 1. INTERFACE 'CustomSlide' MOVIDA PARA CÁ
// -----------------------------------------------------------------
// Esta definição estava no seu 'ProjecaoPage'
export interface CustomSlide {
  id: string;
  type: 'aviso' | 'imagem';
  title: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  igrejaId: string;
}

// -----------------------------------------------------------------
// 2. NOVO TIPO PARA O "SLIDESHOW"
// -----------------------------------------------------------------
export interface SlideShowPresentation {
  id: string;
  type: 'slide-show';         // Um novo tipo
  slides: CustomSlide[];      // A lista inteira de slides
  initialIndex: number;       // O índice do slide que foi clicado
}


// -----------------------------------------------------------------
// 3. TIPO UNIFICADO ATUALIZADO
// -----------------------------------------------------------------
export type PresentationContent = 
  | BiblePresentation 
  | HymnPresentation 
  | SlidePresentation 
  | YouTubePresentation
  | SlideShowPresentation; // <-- Adicionado o novo tipo