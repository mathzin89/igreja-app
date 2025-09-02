"use client";

import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, backgroundColor: '#f4f6f8' }}>
        {/* CABEÇALHO DO SITE PÚBLICO */}
        <AppBar position="static" color="primary" elevation={1}>
          <Container maxWidth="lg">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  AD Plenitude
                </Link>
              </Typography>
              <Box>
                <Button color="inherit" component={Link} href="/">Início</Button>
                {/* --- NOVIDADE AQUI --- */}
                <Button color="inherit" component={Link} href="/harpa">Harpa Cristã</Button>
                <Button color="inherit">Sobre Nós</Button>
                <Button color="inherit">Eventos</Button>
                <Button color="inherit">Contato</Button>
                <Button variant="outlined" color="inherit" component={Link} href="/login" sx={{ ml: 2 }}>
                  Acesso Restrito
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* O CONTEÚDO DA PÁGINA VAI AQUI */}
        <main>
          {children}
        </main>

        {/* RODAPÉ DO SITE PÚBLICO */}
        <Box 
          component="footer" 
          sx={{ 
            backgroundColor: '#1C2536', // Cor escura do seu painel de ADM
            color: 'white', 
            py: 4, 
            mt: 6 
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body1" align="center" gutterBottom>
              Assembleia de Deus Plenitude
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" align="center">
              Sede: R. Tauro, 70 - Jd. Novo Horizonte - Carapicuíba - SP
            </Typography>
          </Container>
        </Box>
      </body>
    </html>
  )
}