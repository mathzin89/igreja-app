import { ChurchEvent } from "@/types/event";
import { db } from "@/firebase/config"; // Verifique se o caminho para seu config está correto!
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore"; // Mantemos o Timestamp para o tipo, se necessário

export async function fetchEvents(): Promise<ChurchEvent[]> {
  try {
    const eventsCollectionRef = collection(db, "eventos");
    const q = query(eventsCollectionRef, orderBy("data", "desc"));
    const querySnapshot = await getDocs(q);

    const events: ChurchEvent[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // --- ESTA É A CORREÇÃO ---
      // Como 'data' e 'horario' são strings, nós as juntamos para criar um objeto Date.
      // Ex: "2025-10-25" + "T" + "18:30" -> "2025-10-25T18:30"
      const dateString = `${data.data}T${data.horario || '00:00:00'}`;
      const eventDate = new Date(dateString);

      return {
        id: doc.id,
        titulo: data.titulo || 'Título não encontrado',
        data: eventDate, // Usamos a data que acabamos de converter
        local: data.local || 'Local a definir',
        descricao: data.descricao || '',
        imageUrl: data.imageUrl || '',
      };
    });

    return events;

  } catch (error) {
    console.error("Erro ao buscar eventos do Firebase:", error);
    return [];
  }
}

// Mantenha esta função para a página de detalhes do evento
export async function fetchEventById(id: string): Promise<ChurchEvent | null> {
    try {
      const { doc, getDoc } = await import("firebase/firestore"); // Importação local para Server Components
      const eventDocRef = doc(db, "eventos", id);
      const docSnap = await getDoc(eventDocRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const dateString = `${data.data}T${data.horario || '00:00:00'}`;
        const eventDate = new Date(dateString);
        
        return {
          id: docSnap.id,
          titulo: data.titulo || 'Título não encontrado',
          data: eventDate,
          local: data.local || 'Local a definir',
          descricao: data.descricao || 'Sem descrição.',
          imageUrl: data.imageUrl || '',
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar evento por ID:", error);
      return null;
    }
  }