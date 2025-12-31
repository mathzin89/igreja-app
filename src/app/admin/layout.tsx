// src/app/admin/layout.tsx
"use client";
import DashboardIcon from '@mui/icons-material/Dashboard';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../firebase/AuthContext';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase/config';
import { updateUserProfile } from './perfil/actions';

import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, CssBaseline, CircularProgress, Button, IconButton,
  Avatar, Menu, MenuItem as MuiMenuItem, Tooltip, Divider, Badge, Collapse, Alert
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DisplaySettings from '@mui/icons-material/DisplaySettings';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import GroupsIcon from '@mui/icons-material/Groups';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WebIcon from '@mui/icons-material/Web';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 280;

interface MenuItemDef { text: string; icon: React.ReactNode; path: string; allowedRoles: string[]; }

// Definições dos itens do menu
const mainMenuItems: MenuItemDef[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', allowedRoles: ['pastor_presidente', 'dirigente', 'secretario', 'tesoureiro'] },
  { text: 'Gerenciar Membros', icon: <GroupsIcon />, path: '/admin/membros', allowedRoles: ['pastor_presidente', 'dirigente', 'secretario'] },
];

const contentMenuItems: MenuItemDef[] = [
  { text: 'Agenda Ministerial', icon: <EditNoteIcon />, path: '/admin/agenda', allowedRoles: ['pastor_presidente', 'dirigente'] },
  { text: 'Devocionais', icon: <RateReviewIcon />, path: '/admin/devocionais', allowedRoles: ['pastor_presidente', 'dirigente'] },
  { text: 'Galeria de Fotos', icon: <PhotoLibraryIcon />, path: '/admin/galeria', allowedRoles: ['pastor_presidente', 'dirigente', 'midia', 'midia1'] },
  { text: 'Ministérios', icon: <GroupsIcon />, path: '/admin/ministerios', allowedRoles: ['pastor_presidente', 'dirigente'] },
  { text: 'Palavra do Pastor', icon: <EditNoteIcon />, path: '/admin/palavra-pastor', allowedRoles: ['pastor_presidente', 'dirigente'] },
  { text: 'Slides Carrossel', icon: <SlideshowIcon />, path: '/admin/carrossel', allowedRoles: ['pastor_presidente', 'dirigente'] },

];

const operationalMenuItems: MenuItemDef[] = [
  { text: 'Culto', icon: <DisplaySettings />, path: '/admin/projecao', allowedRoles: ['midia', 'midia1'] },
  { text: 'Estoque', icon: <InventoryIcon />, path: '/admin/estoque', allowedRoles: ['pastor_presidente', 'dirigente'] },
  { text: 'Transmissão Ao Vivo', icon: <LiveTvIcon />, path: '/admin/transmissao', allowedRoles: ['pastor_presidente', 'dirigente', 'midia', 'midia1'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading, refreshUserProfile, pendingRequestCount } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contentMenuOpen, setContentMenuOpen] = useState(true);

  // Efeito para verificar autenticação e redirecionar
  useEffect(() => {
    if (loading) return; // Espera o auth carregar

    if (!user) {
      router.push('/login');
      return;
    }

    // Espera o perfil do usuário (que contém a role) carregar
    if (!userProfile) return;

    // Agora temos o perfil, vamos verificar a role
    const userRole = userProfile.role;
    const isMidia = userRole === 'midia' || userRole === 'midia1';

    // Se for 'midia' E estiver tentando acessar a página /admin (raiz),
    // redireciona para a página de projeção.
    if (isMidia && pathname === '/admin') {
      router.push('/admin/projecao');
    }
  }, [loading, user, userProfile, pathname, router]);

  // Funções de manipulação de eventos
  const handleDrawerToggle = () => { setDrawerOpen(!drawerOpen); };
  const handleLogout = async () => { try { await signOut(auth); router.push('/login'); } catch (error) { console.error("Erro ao fazer logout: ", error); } };
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Função para upload da foto de perfil
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      handleClose();
      const formData = new FormData();
      formData.append('photo', file);
      const result = await updateUserProfile(user.uid, formData);
      if (result.success) {
        await refreshUserProfile();
      } else {
        alert(result.message || "Erro ao carregar a foto.");
      }
      setIsUploading(false);
    }
  };

  // Função para obter o título da página
  const getPageTitle = () => {
    if (!pathname) return '';
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/projecao')) return 'Culto'; // Título correto
    if (pathname.startsWith('/admin/perfil')) return 'Meu Perfil';
    const allItems = [...mainMenuItems, ...contentMenuItems, ...operationalMenuItems];
    const currentItem = allItems.find(item => pathname.startsWith(item.path) && item.path !== '/admin');
    return currentItem ? currentItem.text : '';
  };

  const userRole = userProfile?.role;
  const isMidia = userRole === 'midia' || userRole === 'midia1';

  // Conteúdo do Menu Lateral (Drawer)
  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>AD Plenitude</Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexDirection: 'column', mt: 2 }}>
        <Avatar src={userProfile?.foto || ''} sx={{ width: 80, height: 80, mb: 1, border: '2px solid white' }}>
          {userProfile?.nome?.charAt(0)}
        </Avatar>
        <Typography variant="h6" sx={{ color: 'white' }}>{userProfile?.nome}</Typography>
        <Typography variant="body2" sx={{ color: 'grey.400' }}>{userProfile?.role}</Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 2, mx: 2 }} />

      <List>
        {/* Mapeia os menus principais (já filtrados por role) */}
        {mainMenuItems.map((item) => {
          const hasPermission = userRole && item.allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
          if (hasPermission) {
            return (
              <Link href={item.path} key={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem disablePadding>
                  <ListItemButton selected={pathname === item.path}>
                    <ListItemIcon sx={{ color: pathname === item.path ? 'white' : 'grey.400', minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          }
          return null;
        })}

        {/* Menu colapsável "Conteúdo do Site" */}
        <ListItemButton onClick={() => setContentMenuOpen(!contentMenuOpen)}>
          <ListItemIcon sx={{ color: 'grey.400', minWidth: 40 }}><WebIcon /></ListItemIcon>
          <ListItemText primary="Conteúdo do Site" />
          {contentMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={contentMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {contentMenuItems.map((item) => {
              const hasPermission = userRole && item.allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
              if (hasPermission) {
                return (
                  <Link href={item.path} key={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ListItem disablePadding sx={{ pl: 2 }}>
                      <ListItemButton selected={pathname === item.path}>
                        <ListItemIcon sx={{ color: pathname === item.path ? 'white' : 'grey.400', minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                );
              }
              return null;
            })}
          </List>
        </Collapse>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 2, mx: 2 }} />

        {/* Mapeia os menus operacionais (já filtrados por role) */}
        {operationalMenuItems.map((item) => {
          const hasPermission = userRole && item.allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase());
          if (hasPermission) {
            return (
              <Link href={item.path} key={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem disablePadding>
                  <ListItemButton selected={pathname === item.path}>
                    <ListItemIcon sx={{ color: pathname === item.path ? 'white' : 'grey.400', minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              </Link>
            );
          }
          return null;
        })}
      </List>
    </div>
  );

  // Telas de Loading
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6F8' }}><CircularProgress /></Box>;
  }

  // Tela de Erro/Perfil Pendente
  if (!userProfile && user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6F8', p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar o seu perfil. O seu registo pode estar pendente de aprovação ou ocorreu um erro.
        </Alert>
        <Button variant="contained" onClick={handleLogout}>Voltar para o Login</Button>
      </Box>
    );
  }

  // Tela de Loading (se o usuário não estiver logado, o useEffect cuidará do redirect)
  if (!user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6F8' }}><CircularProgress /></Box>;
  }

  // Renderização Principal do Layout
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
      >
        {/* === CORREÇÃO DO LAYOUT DA BARRA === */}
        <Toolbar>
          {/* Bloco da Esquerda (Menu e Ícones Condicionais) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Ícones que SOMEM para a 'midia' */}
            {!isMidia && (
              <>
                <Tooltip title="Finanças">
                  <IconButton color="inherit" component={Link} href="/admin/financas">
                    <AttachMoneyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gerenciar Usuários">
                  <IconButton color="inherit" component={Link} href="/admin/users">
                    <PeopleIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>

          {/* Título Centralizado (Corrigido) */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}
          >
            {getPageTitle()}
          </Typography>

          {/* Bloco da Direita (Home, Notificações, Perfil) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} href="/" startIcon={<HomeIcon />}></Button>

            {userProfile?.role === 'pastor_presidente' && (
              <Tooltip title="Solicitações Pendentes">
                <IconButton color="inherit" component={Link} href="/admin/solicitacoes">
                  <Badge badgeContent={pendingRequestCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Opções da Conta">
              <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                <Avatar src={userProfile?.foto || ''}>
                  {isUploading ? <CircularProgress size={24} color="inherit" /> : userProfile?.nome?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{ '& .MuiPaper-root': { borderRadius: '8px', mt: 1 } }}
            >
              <MuiMenuItem onClick={() => { router.push('/admin/perfil'); handleClose(); }}>
                <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                Meu Perfil
              </MuiMenuItem>
              <MuiMenuItem onClick={() => { handleClose(); fileInputRef.current?.click(); }}>
                <ListItemIcon><PhotoCamera fontSize="small" /></ListItemIcon>
                Alterar Foto
              </MuiMenuItem>
              <Divider />
              <MuiMenuItem onClick={() => { handleLogout(); handleClose(); }}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Sair
              </MuiMenuItem>
            </Menu>
            <input type='file' ref={fileInputRef} onChange={handlePhotoUpload} hidden accept="image/*" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer (Menu Lateral) */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            // Estilo do Drawer (menu lateral)
            backgroundColor: '#111827', // Um fundo escuro
            color: 'white'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Conteúdo Principal da Página */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          bgcolor: 'background.default', // Fundo cinza claro
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}