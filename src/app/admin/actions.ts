"use server";

import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, deleteDoc, orderBy, addDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/firebase/config';
import { ref, deleteObject } from 'firebase/storage';
import { getHymnByNumber, Hymn } from '@/lib/harpa';
import rawHarpaJson from '@/data/harpa.json';
import { getBibleBookByIdServer, getFullBible as getFullBibleFromLib, getBibleBookListServer } from '@/lib/server-data';
import { BibleBook, ChapterContent } from '@/lib/bible';
import { PresentationContent, BiblePresentation, HymnPresentation, SlidePresentation } from '@/types/worship-types';
import fs from 'fs/promises'; // ✅ Importação adicionada
import path from 'path';     // ✅ Importação adicionada

// Interfaces
interface CustomSlideAdmin { id: string; type: 'aviso' | 'imagem'; title: string; content?: string; imageUrl?: string; createdAt: string; igrejaId: string; }
interface GalleryImageAdmin { id: string; imageUrl: string; timestamp: string; }
interface PastorMessage { text: string; imageUrl: string; mainTitle: string; roleTitle: string; }
interface PastorMessageAdmin extends PastorMessage { lastUpdated: string | null; }
interface Ministry { id?: string | null; name: string; description: string; leader: string; imageUrl: string; }
interface Devotional { id?: string | null; title: string; author: string; content: string; }

// --- FUNÇÕES DE BUSCA DE DADOS ---
export async function getAllBibleBooks(): Promise<BibleBook[]> { return await getFullBibleFromLib(); }
export async function fetchChapterContent(bookId: string, chapterNumber: number): Promise<ChapterContent | undefined> { const book = await getBibleBookByIdServer(bookId); if (book) return book.chapters.find(c => c.chapter === chapterNumber); return undefined; }
export async function getBook(bookId: string): Promise<BibleBook | undefined> { return await getBibleBookByIdServer(bookId); }
export async function getBookList() { const allBooks = await getBibleBookListServer(); return { antigoTestamento: allBooks.filter(b => b.testament === 'VT'), novoTestamento: allBooks.filter(b => b.testament === 'NT') }; }

// --- FUNÇÕES DE PROJEÇÃO ---
async function updateLivePresentation(slideData: PresentationContent) { try { await setDoc(doc(db, 'presenting', 'liveState'), { currentSlide: slideData }); } catch (error) { console.error("ERRO ao atualizar o Firestore:", error); } }
export async function setHymnContent(hymnNumber: string): Promise<HymnPresentation | null> { const hymn = getHymnByNumber(rawHarpaJson, Number(hymnNumber)); if (!hymn) return null; const slide: HymnPresentation = { id: `hino-${hymn.number}-${Date.now()}`, type: 'hino', hymn: hymn, initialStanzaIndex: 0 }; await updateLivePresentation(slide); return slide; }
export async function setBibleContent(bookId: string, chapter: number, verse: number): Promise<BiblePresentation | null> { const book = await getBibleBookByIdServer(bookId); if (!book) return null; const slide: BiblePresentation = { id: `${book.id}-${chapter}-${verse}-${Date.now()}`, type: 'biblia', book: book, chapterNumber: chapter, initialVerseIndex: verse - 1 }; await updateLivePresentation(slide); return slide; }
export async function setTextSlideContent(title: string, content: string): Promise<SlidePresentation | null> { const slide: SlidePresentation = { id: `text-${Date.now()}`, type: 'text-slide', title: title, content: content }; await updateLivePresentation(slide); return slide; }
export async function setImageSlideContent(title: string, imageUrl: string): Promise<SlidePresentation | null> { const slide: SlidePresentation = { id: `image-${Date.now()}`, type: 'image-slide', title: title, imageUrl: imageUrl, content: '' }; await updateLivePresentation(slide); return slide; }
export async function clearPresentation(): Promise<SlidePresentation | null> { const slide: SlidePresentation = { id: `clear-${Date.now()}`, type: 'text-slide', title: '', content: '' }; await updateLivePresentation(slide); return slide; }

// --- GESTÃO DE SLIDES PERSONALIZADOS ---
const slidesCollectionRef = collection(db, 'customSlides');
export async function saveCustomSlide(slideData: { type: 'aviso' | 'imagem'; title: string; content?: string; imageUrl?: string; igrejaId: string; }) { await addDoc(slidesCollectionRef, { ...slideData, createdAt: serverTimestamp() }); }
export async function getCustomSlides(igrejaId: string): Promise<CustomSlideAdmin[]> { if (!igrejaId) return []; try { const q = query(slidesCollectionRef, where("igrejaId", "==", igrejaId)); const snapshot = await getDocs(q); const slides = snapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, ...data, createdAt: data.createdAt?.toDate().toISOString() || null }; }); slides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); return slides as CustomSlideAdmin[]; } catch (error) { console.error("Erro ao buscar slides:", error); return []; } }
export async function deleteCustomSlide(slideId: string): Promise<void> { try { await deleteDoc(doc(db, 'customSlides', slideId)); } catch (error) { console.error("Erro ao excluir slide:", error); } }

// --- GESTÃO DA GALERIA ---
const galleryCollectionRef = collection(db, 'galleryImages');
export async function getGalleryImagesForAdmin(): Promise<GalleryImageAdmin[]> { try { const q = query(galleryCollectionRef, orderBy('timestamp', 'desc')); const snapshot = await getDocs(q); return snapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, imageUrl: data.imageUrl, timestamp: data.timestamp?.toDate().toISOString() }; }) as GalleryImageAdmin[]; } catch (error) { console.error("Erro ao buscar imagens da galeria:", error); return []; } }
export async function saveGalleryImage(imageUrl: string) { try { await addDoc(galleryCollectionRef, { imageUrl, timestamp: serverTimestamp() }); } catch (error) { console.error("Erro ao salvar imagem da galeria:", error); } }
export async function deleteGalleryImage(id: string, imageUrl: string) { try { await deleteDoc(doc(db, 'galleryImages', id)); const imageRef = ref(storage, imageUrl); await deleteObject(imageRef); } catch (error) { console.error("Erro ao excluir imagem da galeria:", error); } }

// --- GESTÃO DA "PALAVRA DO PASTOR" ---
const pastorMessageRef = doc(db, 'siteContent', 'pastorMessage');
export async function getPastorMessage(): Promise<PastorMessageAdmin | null> { try { const docSnap = await getDoc(pastorMessageRef); if (docSnap.exists()) { const data = docSnap.data(); return { text: data.text, imageUrl: data.imageUrl, mainTitle: data.mainTitle, roleTitle: data.roleTitle, lastUpdated: data.lastUpdated?.toDate().toISOString() || null }; } return null; } catch (error) { console.error("Erro ao buscar a palavra do pastor:", error); return null; } }
export async function savePastorMessage(data: PastorMessage): Promise<void> { try { await setDoc(pastorMessageRef, { text: data.text, imageUrl: data.imageUrl, mainTitle: data.mainTitle, roleTitle: data.roleTitle, lastUpdated: serverTimestamp() }, { merge: true }); } catch (error) { console.error("Erro ao salvar a palavra do pastor:", error); throw new Error("Falha ao salvar a mensagem."); } }

// --- GESTÃO DE MINISTÉRIOS ---
const ministriesCollectionRef = collection(db, 'ministries');
export async function getMinistries() { try { const q = query(ministriesCollectionRef, orderBy('name', 'asc')); const snapshot = await getDocs(q); return snapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, name: data.name, description: data.description, leader: data.leader, imageUrl: data.imageUrl, timestamp: data.timestamp?.toDate().toISOString() || null }; }); } catch (error) { console.error("Erro ao buscar ministérios:", error); return []; } }
export async function saveMinistry(ministry: Ministry) { try { if (ministry.id) { const { id, ...dataToUpdate } = ministry; await updateDoc(doc(db, 'ministries', id), { ...dataToUpdate, lastUpdated: serverTimestamp() }); } else { await addDoc(ministriesCollectionRef, { ...ministry, timestamp: serverTimestamp() }); } } catch (error) { console.error("Erro ao salvar ministério:", error); } }
export async function deleteMinistry(id: string) { try { await deleteDoc(doc(db, 'ministries', id)); } catch (error) { console.error("Erro ao excluir ministério:", error); } }

// --- GESTÃO DE DEVOCIONAIS ---
const devotionalsCollectionRef = collection(db, 'devotionals');
export async function getDevotionals() {
  try {
    const q = query(devotionalsCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        author: data.author,
        content: data.content,
        createdAt: data.createdAt?.toDate().toISOString() || null
      };
    });
  } catch (error) {
    console.error("Erro ao buscar devocionais:", error);
    return [];
  }
}
export async function saveDevotional(devotional: Devotional) {
  try {
    const { id, ...data } = devotional;
    if (id) {
      // Atualiza um devocional existente
      const docRef = doc(db, 'devotionals', id);
      await updateDoc(docRef, { ...data, lastUpdated: serverTimestamp() });
    } else {
      // Cria um novo devocional
      await addDoc(devotionalsCollectionRef, { ...data, createdAt: serverTimestamp() });
    }
  } catch (error) {
    console.error("Erro ao salvar devocional:", error);
  }
}
export async function deleteDevotional(id: string) {
  try {
    await deleteDoc(doc(db, 'devotionals', id));
  } catch (error) {
    console.error("Erro ao excluir devocional:", error);
  }
}

/**
 * ✅ NOVA FUNÇÃO ADICIONADA:
 * Lê ficheiros da pasta 'public' do projeto e converte-os para Base64.
 * @param fileNames Um array de nomes de ficheiros (ex: ['Ficha.jpg', 'logo-plenitude.png']).
 * @returns Um objeto com o status de sucesso e um array de strings Base64.
 */
export async function getLocalFilesAsBase64(fileNames: string[]) {
  try {
    const readPromises = fileNames.map(async (fileName) => {
      // Constrói o caminho completo para o ficheiro dentro da pasta 'public'
      const filePath = path.join(process.cwd(), 'public', fileName);
      
      const fileBuffer = await fs.readFile(filePath);
      const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      const base64 = fileBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    });

    const base64Images = await Promise.all(readPromises);
    return { success: true, images: base64Images };

  } catch (error: any) {
    console.error("Erro na Server Action getLocalFilesAsBase64:", error);
    return { success: false, message: error.message };
  }
}

