// src/app/admin/page.tsx
import React from 'react';
import { adminDb } from '@/firebase/admin';
import { Box, Typography } from '@mui/material';
import Greeting from './Greeting';
import DashboardClientView from './DashboardClientView';

// ✅ Força a página a sempre buscar os dados mais recentes no servidor, evitando cache.
export const dynamic = 'force-dynamic';

// Função para buscar dados que não mudam com frequência (como a lista de igrejas)
async function getStaticData() {
    try {
        const igrejasSnapshot = await adminDb.collection('igrejas').get();
        const igrejas = igrejasSnapshot.docs.map(doc => ({
            id: doc.id,
            nome: doc.data().nome as string,
        }));
        return { igrejas };
    } catch (error) {
        console.error("Erro ao buscar dados estáticos do dashboard:", error);
        return { igrejas: [] };
    }
}

export default async function AdminDashboardPage() {
    const { igrejas } = await getStaticData();

    return (
        <Box>
            <Greeting />
            <Typography variant="h4" gutterBottom sx={{ mt: 1, mb: 3 }}>
                Dashboard
            </Typography>

            {/* Renderiza o componente de cliente, que cuidará dos dados em tempo real */}
            <DashboardClientView igrejas={igrejas} />
        </Box>
    );
}

