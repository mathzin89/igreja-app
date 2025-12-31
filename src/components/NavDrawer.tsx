// src/components/NavDrawer.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import {
  AppBar, Toolbar, Button, Box, Container, Typography, IconButton, Tooltip,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'; // Mantenho, caso use futuramente
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';

export default function NavDrawer() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=1a61b486-b9a6-49ab-bfc1-56140700f9cb"
        alt="Logo AD Plenitude"
        width={260}
        height={100}
        style={{ objectFit: 'contain', margin: '16px auto' }}
        priority
      />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/">
            <ListItemIcon><HomeIcon color="primary" /></ListItemIcon> {/* Ícone primary */}
            <ListItemText primary="Início" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/sobre-nos">
            <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Sobre Nós" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/eventos">
            <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Eventos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/contato">
            <ListItemIcon><ContactMailIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Contato" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/login">
            <ListItemIcon><LoginIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Acesso Restrito" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ 
      backgroundColor: 'background.paper', // Usa branco definido no tema
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)' // Sombra suave
    }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ minHeight: '64px', py: 1, alignItems: "center" }}> 
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{
                width: { xs: '120px', sm: '160px' }, 
                height: { xs: '90px', sm: '120px' },
                display: 'flex', 
                alignItems: 'center', 
                position: 'relative'
            }}>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=1a61b486-b9a6-49ab-bfc1-56140700f9cb"
                alt="Logo AD Plenitude"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Link>
          <Box sx={{ flexGrow: 1 }} />

          {/* --- MENU PARA TELAS GRANDES (MD E ACIMA) --- */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Button color="inherit" sx={{ color: 'text.primary', fontWeight: 600 }} component={Link} href="/">Início</Button>
            <Button color="inherit" sx={{ color: 'text.primary', fontWeight: 600 }} component={Link} href="/sobre-nos">Sobre Nós</Button>
            <Button color="inherit" sx={{ color: 'text.primary', fontWeight: 600 }} component={Link} href="/contato">Contato</Button>
            <Button variant="contained" color="primary" component={Link} href="/login" sx={{ ml: 2, borderRadius: '20px', alignItems: 'center' }}>
              Acesso Restrito
            </Button>
          </Box>

          {/* --- MENU PARA TELAS PEQUENAS (XS) --- */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <Button variant="contained" size="small" color="primary" component={Link} href="/login" sx={{ mr: 1, borderRadius: '20px' }}>
              Acesso
            </Button>
            <IconButton
              color="primary" // Ícone do menu na cor primária
              aria-label="abrir menu"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* DRAWER (MENU LATERAL) PARA MOBILE */}
      <nav>
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawerContent}
        </Drawer>
      </nav>
      <Toolbar />
    </AppBar>
  );
}