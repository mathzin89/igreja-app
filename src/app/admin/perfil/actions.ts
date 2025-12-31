"use server";

import { adminDb, adminAuth } from '@/firebase/admin';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage as clientStorage } from '@/firebase/config';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(uid: string, formData: FormData) {
  if (!uid) {
    return { success: false, message: "ID do utilizador não fornecido." };
  }

  const nome = formData.get('nome') as string | null;
  const photo = formData.get('photo') as File | null;

  if (!nome && !photo) {
    return { success: false, message: "Nenhuma informação para atualizar." };
  }

  try {
    const firestoreUpdateData: { [key: string]: any } = {};
    const authUpdateData: { [key: string]: any } = {};

    // Lida com o upload da foto se uma nova foto for fornecida
    if (photo) {
      const filePath = `user-profiles/${uid}/${Date.now()}-${photo.name}`;
      const storageRef = ref(clientStorage, filePath);
      
      const photoBuffer = await photo.arrayBuffer();
      await uploadBytes(storageRef, photoBuffer, { contentType: photo.type });

      const photoURL = await getDownloadURL(storageRef);
      firestoreUpdateData.foto = photoURL;
      authUpdateData.photoURL = photoURL;
    }

    // Lida com a atualização do nome se um novo nome for fornecido
    if (nome) {
      firestoreUpdateData.nome = nome;
      authUpdateData.displayName = nome;
    }

    // Atualiza o documento no Firestore
    if (Object.keys(firestoreUpdateData).length > 0) {
      await adminDb.collection('users').doc(uid).update(firestoreUpdateData);
    }
    
    // Atualiza o perfil na Autenticação do Firebase
    if (Object.keys(authUpdateData).length > 0) {
      await adminAuth.updateUser(uid, authUpdateData);
    }

    revalidatePath('/admin/perfil');
    
    return { success: true };

  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, message: "Falha ao atualizar o perfil." };
  }
}