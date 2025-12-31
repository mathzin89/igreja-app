// src/types/bible-presentation.ts
import { BibleBook } from "@/lib/bible";

// Payload enviado quando um versículo é selecionado

// Props para o componente de apresentação da Bíblia
export interface BiblePresentationClientProps {
  book: BibleBook;
  chapterNumber: number;
  initialVerseIndex?: number; // índice zero-based opcional
}
