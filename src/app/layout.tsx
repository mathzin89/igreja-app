

import type { Metadata } from 'next';
import { Merriweather, Lato } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

// Imports do Material-UI, incluindo os ÍCONES
import { AppBar, Toolbar, Button, Box, Container, Typography, IconButton, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups'; // <-- NOVO ÍCONE
import EventIcon from '@mui/icons-material/Event';
import ContactMailIcon from '@mui/icons-material/ContactMail';

// Importando o AuthProvider
import { AuthProvider } from '../firebase/AuthContext';  // Ajuste o caminho conforme necessário

import ThemeRegistry from '@/theme/ThemeRegistry';
import './globals.css';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: 'AD Plenitude',
  description: 'Igreja Assembleia de Deus Plenitude',
};

const LinkIconButton = React.forwardRef<HTMLAnchorElement, { href: string; title: string; children: React.ReactNode }>((props, ref) => {
  const { href, title, children } = props;
  return (
    <Link href={href} passHref ref={ref}>
      <IconButton color="primary" aria-label={title}>{children}</IconButton>
    </Link>
  );
});
LinkIconButton.displayName = 'LinkIconButton';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={`${merriweather.variable} ${lato.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Envolvendo a aplicação com o AuthProvider */}
        <AuthProvider>
          <ThemeRegistry>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <AppBar position="sticky" sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', boxShadow: 'none' }}>
                <Container maxWidth="lg">
                  <Toolbar sx={{ minHeight: '64px', py: 1 }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      <Image
                        src="https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=1a61b486-b9a6-49ab-bfc1-56140700f9cb"
                        alt="Logo AD Plenitude"
                        width={160}
                        height={45}
                        style={{ objectFit: 'contain' }}
                        priority
                      />
                    </Link>
                    <Box sx={{ flexGrow: 1 }} />

                    {/* --- MENU RESPONSIVO --- */}
                    <Box>
                      {/* Botões com texto para telas médias (md) e maiores */}
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <Button color="inherit" sx={{ color: '#333', fontWeight: 600 }} component={Link} href="/">Início</Button>
                        <Button color="inherit" sx={{ color: '#333', fontWeight: 600 }} component={Link} href="/culto">Painel de Culto</Button>
                        <Button color="inherit" sx={{ color: '#333', fontWeight: 600 }} component={Link} href="/sobre-nos">Sobre Nós</Button>
                        <Button color="inherit" sx={{ color: '#333', fontWeight: 600 }} component={Link} href="/contato">Contato</Button>
                        <Button variant="contained" color="primary" component={Link} href="/login" sx={{ ml: 2, borderRadius: '20px' }}>
                          Acesso Restrito
                        </Button>
                      </Box>

                      {/* Botões com ÍCONES para telas pequenas (xs) */}
                      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                        <Tooltip title="Início">
                          <LinkIconButton href="/" title="Início"><HomeIcon /></LinkIconButton>
                        </Tooltip>
                        <Tooltip title="Painel de Culto">
                          <LinkIconButton href="/culto" title="Painel de Culto"><LibraryMusicIcon /></LinkIconButton>
                        </Tooltip>
                        <Tooltip title="Sobre Nós">
                          <LinkIconButton href="/sobre-nos" title="Sobre Nós"><PeopleIcon /></LinkIconButton>
                        </Tooltip>
                        <Tooltip title="Eventos">
                          <LinkIconButton href="/eventos" title="Eventos"><EventIcon /></LinkIconButton>
                        </Tooltip>
                        <Tooltip title="Contato">
                          <LinkIconButton href="/contato" title="Contato"><ContactMailIcon /></LinkIconButton>
                        </Tooltip>
                        <Button variant="contained" size="small" color="primary" component={Link} href="/login" sx={{ ml: 1, borderRadius: '20px' }}>
                          Acesso
                        </Button>
                      </Box>
                    </Box>

                  </Toolbar>
                </Container>
              </AppBar>

              <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'var(--background-light)' }}>
                {children}
              </Box>

              <Box
                component="footer"
                sx={{ backgroundColor: '#1C2536', color: 'white', py: 4, mt: 'auto' }}
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
            </Box>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
