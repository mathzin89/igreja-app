"use server";

import { adminDb, adminAuth } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';

export async function acceptRequest(solicitacaoId: string, igrejaId: string, role: string) {
  try {
    const requestRef = adminDb.collection('registrationRequests').doc(solicitacaoId);
    const requestDoc = await requestRef.get();

    // ✅ CORREÇÃO: ".exists" é uma propriedade, não uma função.
    if (!requestDoc.exists) {
      throw new Error('Solicitação não encontrada.');
    }
    const { email, nome } = requestDoc.data()!;

    const userRecord = await adminAuth.createUser({ email, displayName: nome, emailVerified: true });
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      nome,
      email,
      role,
      igrejaId,
      createdAt: new Date(),
    });

    await requestRef.delete();

    revalidatePath('/admin/solicitacoes');
    revalidatePath('/admin');
    
    return { success: true, message: 'Utilizador aprovado e criado com sucesso!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function rejectRequest(solicitacaoId: string) {
  try {
    const requestRef = adminDb.collection('registrationRequests').doc(solicitacaoId);
    const requestDoc = await requestRef.get();
    
    // ✅ CORREÇÃO: ".exists" é uma propriedade, não uma função.
    if (!requestDoc.exists) {
      throw new Error('Solicitação não encontrada.');
    }

    await requestRef.delete();

    revalidatePath('/admin/solicitacoes');
    revalidatePath('/admin');

    return { success: true, message: 'Solicitação rejeitada com sucesso.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}