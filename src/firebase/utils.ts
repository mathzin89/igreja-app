import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Busca o nome de uma igreja no Firestore a partir do seu ID.
 * @param igrejaId O ID do documento da igreja.
 * @returns O nome da igreja ou o próprio ID como fallback.
 */
export async function getIgrejaNome(igrejaId: string): Promise<string> {
  if (!igrejaId) return 'Igreja não definida';
  try {
    const igrejaDocRef = doc(db, 'igrejas', igrejaId);
    const igrejaDocSnap = await getDoc(igrejaDocRef);
    if (igrejaDocSnap.exists()) {
      // Retorna o nome da igreja se encontrar
      return igrejaDocSnap.data().nome as string;
    }
    // Se não encontrar o documento da igreja, retorna o ID como fallback
    return igrejaId;
  } catch (error) {
    console.error("Erro ao buscar nome da igreja:", error);
    // Em caso de erro, retorna o ID como fallback
    return igrejaId;
  }
}

