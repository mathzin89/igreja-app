"use server";

import { adminDb, adminAuth } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(uid: string, newRole: string) {
  if (!uid || !newRole) {
    return { success: false, message: "ID do usuário ou novo cargo não fornecido." };
  }

  try {
    // Passo 1: Atualiza o campo 'role' no documento do Firestore
    await adminDb.collection('users').doc(uid).update({
      role: newRole
    });

    // Passo 2: Atualiza as Custom Claims no Firebase Authentication (boa prática para regras)
    await adminAuth.setCustomUserClaims(uid, { role: newRole });

    // Invalida o cache da página para forçar a busca de dados atualizados
    revalidatePath('/admin/users');
    
    return { success: true };

  } catch (error: any) {
    console.error("Erro ao atualizar cargo:", error);
    return { success: false, message: error.message };
  }
}