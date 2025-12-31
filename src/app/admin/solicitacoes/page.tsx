// src/app/admin/solicitacoes/page.tsx

// ✅ CORREÇÃO DEFINITIVA: Força a página a ser renderizada dinamicamente a cada acesso
export const dynamic = 'force-dynamic';

import { adminDb } from '@/firebase/admin';
import SolicitacoesClient from './SolicitacoesClient'; 
import { Box, Typography } from '@mui/material';

export interface Solicitacao {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
}

async function getSolicitacoes(): Promise<Solicitacao[]> {
  const snapshot = await adminDb.collection('registrationRequests')
                                .where('status', '==', 'pendente')
                                .orderBy('createdAt', 'asc')
                                .get();
  
  if (snapshot.empty) {
    return [];
  }

  const solicitacoes: Solicitacao[] = snapshot.docs.map(doc => ({
    id: doc.id,
    nome: doc.data().nome,
    email: doc.data().email,
    createdAt: doc.data().createdAt.toDate().toLocaleDateString('pt-BR'),
  }));
  
  return solicitacoes;
}

export default async function SolicitacoesPage() {
  const solicitacoes = await getSolicitacoes();
  const igrejasSnapshot = await adminDb.collection('igrejas').get();
  const igrejas = igrejasSnapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));

  const roles = [
    { id: 'membro', nome: 'Membro' },
    { id: 'tesoureiro', nome: 'Tesoureiro(a)' },
    { id: 'secretario', nome: 'Secretário(a)' },
    { id: 'dirigente', nome: 'Dirigente' },
    { id: 'midia', nome: 'Mídia' },
    { id: 'midia1', nome: 'Mídia 2' },
    { id: 'pastor_presidente', nome: 'Pastor Presidente' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Solicitações de Cadastro Pendentes
      </Typography>
      <SolicitacoesClient initialSolicitacoes={solicitacoes} igrejas={igrejas} roles={roles} />
    </Box>
  );
}