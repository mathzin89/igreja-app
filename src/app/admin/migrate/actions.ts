"use server";

import { adminDb } from '@/firebase/admin';

export async function migrateMembersData(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Buscar todas as igrejas para criar um mapa de correspondência
    const igrejasSnapshot = await adminDb.collection('igrejas').get();
    const igrejasMap = new Map<string, string>();
    igrejasSnapshot.forEach(doc => {
      igrejasMap.set(doc.data().nome, doc.id);
    });

    // Adiciona uma correspondência manual para o caso de "1° de Maio"
    if (igrejasMap.has('1º de Maio')) {
        igrejasMap.set('1° de Maio', igrejasMap.get('1º de Maio')!);
    }


    // 2. Buscar todos os membros
    const membrosSnapshot = await adminDb.collection('membros').get();
    
    const batch = adminDb.batch();
    let updatedCount = 0;

    membrosSnapshot.docs.forEach(doc => {
      const membro = doc.data();
      
      // 3. Verifica se o membro já tem um `igrejaId` para não o substituir
      if (membro.igrejaId) {
        return; // Já está atualizado, passa para o próximo
      }

      // 4. Encontra o ID da igreja com base no nome da congregação
      const igrejaId = igrejasMap.get(membro.congregacao);

      if (igrejaId) {
        // 5. Adiciona a operação de atualização ao lote
        const membroRef = adminDb.collection('membros').doc(doc.id);
        batch.update(membroRef, { igrejaId: igrejaId });
        updatedCount++;
      }
    });

    // 6. Executa todas as atualizações de uma só vez
    await batch.commit();

    if (updatedCount === 0) {
      return { success: true, message: 'Migração concluída. Nenhum membro precisou de ser atualizado.' };
    }

    return { success: true, message: `Migração concluída com sucesso! ${updatedCount} membros foram atualizados.` };

  } catch (error: any) {
    console.error("Erro durante a migração de dados:", error);
    return { success: false, message: `Ocorreu um erro: ${error.message}` };
  }
}
