"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Imports de autenticação do Firebase
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from '../../firebase/config';
// Imports do Material-UI
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, CircularProgress, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import SlideshowIcon from '@mui/icons-material/Slideshow'; // ✅ Ícone adicionado

const drawerWidth = 240;

// ✅ Menu estático, como era antes, mas com o item "Slides"
const menuItems = [
  { text: 'Membros', icon: <PeopleIcon />, path: '/admin' },
  { text: 'Finanças', icon: <AttachMoneyIcon />, path: '/admin/financas' },
  { text: 'Eventos', icon: <EventIcon />, path: '/admin/eventos' },
  { text: 'Slides', icon: <SlideshowIcon />, path: '/admin/slides' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
      alert("Não foi possível sair. Tente novamente.");
    }
  };

// Depois
const getPageTitle = () => {
  // 1. Adicione esta verificação no início
  if (!pathname) {
    return 'Painel Administrativo'; // Retorna um título padrão se pathname for nulo
  }

  // 2. O resto do seu código agora é seguro
  const currentItem = menuItems.find(item => pathname.startsWith(item.path) && (item.path !== '/admin' || pathname === '/admin'));
  if (pathname.includes('/admin/slides/')) return 'Editar Slides';
  return currentItem ? currentItem.text : 'Painel Administrativo';
};

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        className="non-printable"
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Typography variant="h6" noWrap component="div">
            {getPageTitle()}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        className="non-printable"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1C2536', color: 'white',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Typography variant="h5" sx={{fontWeight: 'bold', color: 'white'}}>
                Igreja App
            </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <Link href={item.path} key={item.text} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  sx={{
                    '&.Mui-selected': { backgroundColor: 'rgba(25, 118, 210, 0.5)' },
                    '&.Mui-selected:hover': { backgroundColor: 'rgba(25, 118, 210, 0.6)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar className="non-printable" />
        {children}
      </Box>
    </Box>
  );
}
