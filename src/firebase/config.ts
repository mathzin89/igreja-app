// Imports necessários do SDK do Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


// A sua configuração web do Firebase (CORRIGIDA)
const firebaseConfig = {
  apiKey: "AIzaSyD5DKF-MN0JyIVI0uNxqvqaKu8ozr7sWTE",
  authDomain: "site-ad-plenitude.firebaseapp.com",
  projectId: "site-ad-plenitude",
  storageBucket: "site-ad-plenitude.firebasestorage.app",
  messagingSenderId: "612531878513",
  appId: "1:612531878513:web:e0a5cc939d3f68d27cb9d0",
  measurementId: "G-BQCK04DEES"
};

// Lógica segura para inicializar o Firebase no Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporte os serviços que vamos usar no resto da aplicação
export const db = getFirestore(app);      // O banco de dados Firestore
export const auth = getAuth(app);         // O sistema de Autenticação
export const storage = getStorage(app);   // O sistema de Armazenamento de ficheiros