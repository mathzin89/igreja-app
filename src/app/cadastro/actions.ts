// app/cadastro/actions.ts
'use server';

import { adminDb } from '@/firebase/admin'; // Usando o Admin SDK
import { Timestamp } from 'firebase-admin/firestore';

interface RequestData {
  nome: string;
  email: string;
}

export async function submitRegistrationRequest(data: RequestData) {
  const { nome, email } = data;

  if (!nome || !email) {
    return { success: false, message: 'Nome e e-mail são obrigatórios.' };
  }

  try {
    const requestsRef = adminDb.collection('registrationRequests');
    // Verifica se já existe uma solicitação ou usuário com este e-mail
    const existingRequest = await requestsRef.where('email', '==', email).get();
    if (!existingRequest.empty) {
      return { success: false, message: 'Já existe uma solicitação de cadastro para este e-mail.' };
    }
    // Adicionar verificação na coleção 'users' também é uma boa prática

    await requestsRef.add({
      nome,
      email,
      status: 'pendente',
      createdAt: Timestamp.now(),
    });

    return { success: true, message: 'Solicitação enviada com sucesso! Aguarde a aprovação.' };
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error);
    return { success: false, message: 'Ocorreu um erro ao enviar sua solicitação.' };
  }
}