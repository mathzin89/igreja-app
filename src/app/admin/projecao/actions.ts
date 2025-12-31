"use server";

// ADICIONADO: 'updateDoc' para a função de editar
import { setDoc, doc, collection, addDoc, getDocs, serverTimestamp, query, where, deleteDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '@/firebase/config';
import { getHymnByNumber, Hymn } from '@/lib/harpa';
import rawHarpaJson from '@/data/harpa.json';
import { getBibleBookByIdServer, getFullBible as getFullBibleFromLib, getBibleBookListServer } from '@/lib/server-data';
import { BibleBook, ChapterContent } from '@/lib/bible';

import { 
    PresentationContent, 
    BiblePresentation, 
    HymnPresentation, 
    SlidePresentation,
    CustomSlide 
} from '@/types/worship-types';


// --- FUNÇÕES DE BUSCA DE DADOS ---
export async function getAllBibleBooks(): Promise<BibleBook[]> {
  return await getFullBibleFromLib();
}

export async function getBook(bookId: string): Promise<BibleBook | undefined> {
    return await getBibleBookByIdServer(bookId);
}

export async function getBookList() {
    const allBooksMetaData = await getBibleBookListServer();
    const antigoTestamento = allBooksMetaData.filter(b => b.testament === 'VT');
    const novoTestamento = allBooksMetaData.filter(b => b.testament === 'NT');
    return { antigoTestamento, novoTestamento };
}

export async function fetchChapterContent(bookId: string, chapterNumber: number): Promise<ChapterContent | undefined> {
  const book = await getBibleBookByIdServer(bookId);
  if (book) {
    return book.chapters.find(c => c.chapter === chapterNumber);
  }
  return undefined;
}


// --- FUNÇÕES DE PROJEÇÃO ---
async function updateLivePresentation(slideData: PresentationContent) {
  try {
    const liveStateRef = doc(db, 'presenting', 'liveState');
    await setDoc(liveStateRef, { currentSlide: slideData });
  } catch (error) {
    console.error("ERRO ao atualizar o Firestore:", error);
  }
}

export async function setHymnContent(hymnNumber: string): Promise<HymnPresentation | null> {
  const hymn: Hymn | undefined = getHymnByNumber(rawHarpaJson, Number(hymnNumber));
  if (!hymn) { return null; }
  
  const slide: HymnPresentation = {
    id: `hino-${hymn.number}-${Date.now()}`, type: 'hino', hymn: hymn, initialStanzaIndex: 0
  };
  await updateLivePresentation(slide);
  return slide;
}

export async function setBibleContent(
  book: BibleBook, 
  chapter: number, 
  verse: number
): Promise<BiblePresentation | null> {
  
  if (!book) { return null; }
  
  const slide: BiblePresentation = {
    id: `${book.id}-${chapter}-${verse}-${Date.now()}`, 
    type: 'biblia', 
    book: book, 
    chapterNumber: chapter, 
    initialVerseIndex: verse - 1,
  };
  await updateLivePresentation(slide);
  return slide;
}

export async function setTextSlideContent(title: string, content: string): Promise<SlidePresentation | null> {
  const slide: SlidePresentation = {
    id: `text-${Date.now()}`, type: 'text-slide', title: title, content: content,
  };
  await updateLivePresentation(slide);
  return slide;
}

export async function setImageSlideContent(title: string, imageUrl: string): Promise<SlidePresentation | null> {
    const slide: SlidePresentation = {
    id: `image-${Date.now()}`, type: 'image-slide', title: title, imageUrl: imageUrl, content: ''
  };
  await updateLivePresentation(slide);
  return slide;
}

export async function clearPresentation(): Promise<SlidePresentation | null> {
    const slide: SlidePresentation = { 
        id: `clear-${Date.now()}`, type: 'text-slide', title: '', content: '' 
    };
    await updateLivePresentation(slide);
    return slide;
}

// --- FUNÇÕES DE GESTÃO DE SLIDES PERSONALIZADOS ---

const slidesCollectionRef = collection(db, 'customSlides');

export async function saveCustomSlide(slideData: { type: 'aviso' | 'imagem'; title: string; content?: string; imageUrl?: string; igrejaId: string; }) {
  await addDoc(slidesCollectionRef, { ...slideData, createdAt: serverTimestamp() });
}

// -----------------------------------------------------------------
// ✅ NOVA FUNÇÃO DE EDITAR
// -----------------------------------------------------------------
export async function updateCustomSlide(
  slideId: string, 
  slideData: { title: string; content?: string; imageUrl?: string; type: 'aviso' | 'imagem'; }
) {
  try {
    const slideDocRef = doc(db, 'customSlides', slideId);
    // Atualiza o documento. 'serverTimestamp' não é usado aqui para não
    // reordenar o slide, mas poderíamos adicionar um 'updatedAt' se quiséssemos.
    await updateDoc(slideDocRef, slideData); 
  } catch (error) {
    console.error(`Erro ao atualizar o slide ${slideId}:`, error);
  }
}
// -----------------------------------------------------------------

export async function getCustomSlides(igrejaId: string): Promise<CustomSlide[]> {
  if (!igrejaId) return [];
  try {
    const q = query(slidesCollectionRef, where("igrejaId", "==", igrejaId));
    const querySnapshot = await getDocs(q);
    const slides = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const plainData = {
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || null,
        };
        return { id: doc.id, ...plainData };
    });
    // Ordena pelos mais recentes
    slides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return slides as CustomSlide[];
  } catch (error) {
    console.error("Erro ao buscar slides personalizados:", error);
    return [];
  }
}

export async function deleteCustomSlide(slideId: string): Promise<void> {
  try {
    const slideDocRef = doc(db, 'customSlides', slideId);
    await deleteDoc(slideDocRef);
  } catch (error) {
    console.error(`Erro ao excluir o slide ${slideId}:`, error);
  }
}