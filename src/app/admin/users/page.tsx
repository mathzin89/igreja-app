export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { adminDb } from '@/firebase/admin';
// ✅ CORREÇÃO: Caminho de importação ajustado para ser absoluto
import UsersClientComponent from '@/app/admin/users/UsersClientComponent';
import { Box, Typography } from '@mui/material';

// Define a estrutura completa dos dados do usuário que vamos usar
export interface UserData {
  uid: string;
  nome: string;
  email: string;
  role: string;
  igrejaId: string;
  igrejaNome: string;
}

// Função de servidor para buscar todos os usuários e seus respectivos nomes de igreja
async function getUsers(): Promise<UserData[]> {
  const usersSnapshot = await adminDb.collection('users').orderBy('nome').get();
  const igrejasSnapshot = await adminDb.collection('igrejas').get();

  // Cria um mapa para acesso rápido aos nomes das igrejas (ID => Nome)
  const igrejasMap = new Map<string, string>();
  igrejasSnapshot.forEach(doc => {
    igrejasMap.set(doc.id, doc.data().nome);
  });

  const users = usersSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      nome: data.nome || 'Nome não encontrado',
      email: data.email || 'Email não encontrado',
      role: data.role || 'membro',
      igrejaId: data.igrejaId || '',
      // Busca o nome da igreja no mapa, ou usa o ID se não encontrar
      igrejaNome: igrejasMap.get(data.igrejaId) || data.igrejaId,
    };
  });

  return users;
}

export default async function UsersPage() {
  const users = await getUsers();
  
  // Lista de cargos disponíveis para o dropdown
  const roles = [
    { id: 'pastor_presidente', nome: 'Pastor Presidente' },
    { id: 'dirigente', nome: 'Dirigente' },
    { id: 'secretario', nome: 'Secretário(a)' },
    { id: 'tesoureiro', nome: 'Tesoureiro(a)' },
    { id: 'midia', nome: 'Mídia' },
    { id: 'midia1', nome: 'Mídia 1' },
    { id: 'membro', nome: 'Membro' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciar Usuários
      </Typography>
      <UsersClientComponent initialUsers={users} roles={roles} />
    </Box>
  );
}

