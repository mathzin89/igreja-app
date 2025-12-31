"use server";

import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// --- Interfaces ---
interface CarouselImage { id: string; imageUrl: string; order: number; timestamp: string; title: string; }
interface Evento { id: string; titulo: string; data: string; horario: string; local?: string; descricao?: string; }
interface GalleryImage { id: string; imageUrl: string; }
interface PastorMessage { text: string; imageUrl: string; mainTitle: string; roleTitle: string; }
interface Ministry { id: string; name: string; description: string; leader: string; imageUrl: string; }
interface Devotional { id: string; title: string; author: string; content: string; createdAt: string; }

// --- Funções de Busca ---

export async function getCarouselImages(): Promise<CarouselImage[]> {
  try {
    const q = query(collection(db, "carouselImages"), orderBy("order", "asc"), limit(5));
    const querySnapshot = await getDocs(q);
    const images = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            imageUrl: data.imageUrl,
            order: data.order,
            title: data.title,
            timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        }
    }).filter(image => image.imageUrl);
    return images as CarouselImage[];
  } catch (error) { 
    console.error("Erro ao buscar imagens do carrossel:", error); 
    return []; 
  }
}

export async function getUpcomingEvents(): Promise<Evento[]> {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const q = query(collection(db, "eventos"), where("data", ">=", hoje), orderBy("data", "asc"), limit(3));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento));
      } catch (error) { 
        console.error("Erro ao buscar eventos:", error); 
        return []; 
      }
}

export async function getGalleryImagesForHomepage(): Promise<GalleryImage[]> {
  try {
    const q = query(collection(db, "galleryImages"), orderBy("timestamp", "desc"), limit(4));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
    })).filter(image => image.imageUrl);
  } catch (error) { 
    console.error("Erro ao buscar imagens da galeria (homepage):", error); 
    return []; 
  }
}

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  try {
    const q = query(collection(db, "galleryImages"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
    })).filter(image => image.imageUrl);
  } catch (error) { 
    console.error("Erro ao buscar todas as imagens da galeria:", error); 
    return []; 
  }
}

export async function getPastorMessage(): Promise<PastorMessage | null> {
  try {
    const docRef = doc(db, 'siteContent', 'pastorMessage');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        text: data.text,
        imageUrl: data.imageUrl,
        mainTitle: data.mainTitle,
        roleTitle: data.roleTitle,
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar a palavra do pastor:", error);
    return null;
  }
}

export async function getMinistriesForPublicPage(): Promise<Ministry[]> {
  try {
    const q = query(collection(db, 'ministries'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ministry[];
  } catch (error) {
    console.error("Erro ao buscar ministérios:", error);
    return [];
  }
}

export async function getAllDevotionals(): Promise<Devotional[]> {
  try {
    const q = query(collection(db, "devotionals"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        author: data.author,
        content: data.content,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    }) as Devotional[];
  } catch (error) {
    console.error("Erro ao buscar todos os devocionais:", error);
    return [];
  }
}

// ✅ FUNÇÃO QUE FALTAVA
export async function getDevotionalById(id: string): Promise<Devotional | null> { 
  try { 
    const docRef = doc(db, "devotionals", id); 
    const docSnap = await getDoc(docRef); 
    if (docSnap.exists()) { 
      const data = docSnap.data(); 
      return { id: docSnap.id, title: data.title, author: data.author, content: data.content, createdAt: data.createdAt.toDate().toISOString() } as Devotional; 
    } 
    return null; 
  } catch (error) { 
    console.error("Erro ao buscar devocional por ID:", error); 
    return null; 
  } 
}