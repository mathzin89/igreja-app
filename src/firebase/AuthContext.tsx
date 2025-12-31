"use client";

import React, { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile extends DocumentData {
  role: string;
  nome: string;
  igrejaId: string;
  igrejaNome?: string;
  foto?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  pendingRequestCount: number;
  refreshUserProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  pendingRequestCount: 0,
  refreshUserProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const fetchUserProfile = useCallback(async (currentUser: User) => {
    // --- PONTO DE DEPURAÇÃO ---
    console.log("AuthContext: Utilizador autenticado. A procurar perfil com UID:", currentUser.uid);
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    
    try {
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("AuthContext: SUCESSO! Documento do perfil encontrado:", userDoc.data());
        const profileData = userDoc.data() as UserProfile;
        
        if (profileData.igrejaId) {
          try {
            const igrejaDocRef = doc(db, 'igrejas', profileData.igrejaId);
            const igrejaDoc = await getDoc(igrejaDocRef);
            if (igrejaDoc.exists()) {
              profileData.igrejaNome = igrejaDoc.data().nome;
            }
          } catch (error) {
            console.error("AuthContext: Erro ao buscar nome da igreja:", error);
          }
        }
        setUserProfile(profileData);
      } else {
        // --- PONTO DE DEPURAÇÃO ---
        console.error("AuthContext: FALHA! Nenhum documento encontrado na coleção 'users' com o ID:", currentUser.uid);
        setUserProfile(null);
      }
    } catch (error) {
        console.error("AuthContext: ERRO DE PERMISSÃO OU REDE ao tentar buscar o documento do utilizador:", error);
        setUserProfile(null);
    }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (userProfile?.role === 'pastor_presidente') {
      const q = query(collection(db, "registrationRequests"), where("status", "==", "pendente"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingRequestCount(snapshot.size);
      });
      return () => unsubscribe();
    } else {
        setPendingRequestCount(0);
    }
  }, [userProfile]);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
        setLoading(true);
        await fetchUserProfile(user);
        setLoading(false);
    }
  }, [user, fetchUserProfile]);

  const value = { user, userProfile, loading, refreshUserProfile, pendingRequestCount };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};