// src/components/ConditionalHeaderWrapper.tsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header'; // O seu menu do topo
import { Box, Container, Typography } from '@mui/material'; // Imports para o rodapé

export default function ConditionalHeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Verifica se a rota atual é uma rota de administração ou de login
  const isAuthRoute = !!pathname && (pathname.startsWith('/admin') || pathname === '/login');

  // Se for uma rota de admin/login, renderiza APENAS o conteúdo da página
  // (que será o seu AdminLayout com o menu lateral, etc.)
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Se NÃO for uma rota de admin/login, renderiza o layout completo do site principal
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {/* Espaçamento para compensar a altura do Header fixo */}
      <Box sx={{ mt: { xs: '70px', md: '100px' } }} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* O SEU RODAPÉ, exatamente como estava no seu layout.tsx original */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          backgroundColor: '#212121',
          color: 'white',
          textAlign: 'center',
          borderTop: '1px solid #333',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="inherit">
            Assembleia de Deus Plenitude {new Date().getFullYear()}{'. Todos os direitos reservados.'}
          </Typography>
          <Typography variant="body2" color="inherit">
            Desenvolvido por Matheus Silva
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}