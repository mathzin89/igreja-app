'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config'; // Verifique o caminho para sua config do Firestore (db)

interface AuthState {
  user: User | null;
  role: string | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário está logado. Agora vamos buscar seu documento no Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Encontramos o documento, vamos pegar o cargo (role).
          const userRole = userDoc.data().role || null;
          setAuthState({ user, role: userRole, loading: false });
        } else {
          // O usuário está autenticado, mas não tem um registro correspondente no Firestore.
          // Isso pode acontecer se o cadastro ainda não foi aprovado.
          setAuthState({ user, role: null, loading: false });
        }
      } else {
        // Usuário não está logado.
        setAuthState({ user: null, role: null, loading: false });
      }
    });

    // Limpa o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  return authState;
}

