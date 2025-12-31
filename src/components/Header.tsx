"use client";

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// Imports do Menu Dropdown
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const FIREBASE_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=93be6db4-4ca5-4fee-9322-37c9baf39ce7";

const navItems = [
  { label: 'Início', path: '/' },
  { label: 'Sobre Nós', path: '/sobre-nos' },
  { label: 'Ministérios', path: '/ministerios' },
  { label: 'Devocionais', path: '/devocionais' },
  { label: 'Contato', path: '/contato' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para o Menu Desktop e Mobile
  const [anchorElMinistries, setAnchorElMinistries] = useState<null | HTMLElement>(null);
  const [mobileMinistriesOpen, setMobileMinistriesOpen] = useState(false);
  
  const theme = useTheme();

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 0); };
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, []);

  const handleDrawerToggle = () => { setMobileMenuOpen((prevState) => !prevState); };

  // Funções para abrir/fechar menu Desktop (AGORA APENAS CLIQUE)
  const handleOpenMinistries = (event: React.MouseEvent<HTMLElement>) => { 
    setAnchorElMinistries(event.currentTarget); 
  };
  const handleCloseMinistries = () => { 
    setAnchorElMinistries(null); 
  };

  // Drawer Mobile
  const drawerContent = (
    <Box sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2 }}>Navegação</Typography>
      <Divider />
      <List>
        {navItems.map((item) => {
          if (item.label === 'Ministérios') {
            return (
              <React.Fragment key={item.label}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton 
                    onClick={() => setMobileMinistriesOpen(!mobileMinistriesOpen)}
                    sx={{ textAlign: 'center' }}
                  >
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ fontSize: '0.875rem' }} 
                    />
                    {mobileMinistriesOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </ListItemButton>
                  
                  <Collapse in={mobileMinistriesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItemButton 
                        component={Link} 
                        href="/agenda" 
                        sx={{ pl: 4, backgroundColor: 'rgba(0,0,0,0.03)' }} 
                        onClick={handleDrawerToggle}
                      >
                         <ListItemText 
                           primary="Agenda Ministerial" 
                           primaryTypographyProps={{ fontSize: '0.8rem' }}
                         />
                      </ListItemButton>
                      <ListItemButton 
                        component={Link} 
                        href="/ministerios" 
                        sx={{ pl: 4, backgroundColor: 'rgba(0,0,0,0.03)' }} 
                        onClick={handleDrawerToggle}
                      >
                         <ListItemText 
                           primary="Ver todos" 
                           primaryTypographyProps={{ fontSize: '0.8rem' }}
                         />
                      </ListItemButton>
                    </List>
                  </Collapse>
                </ListItem>
              </React.Fragment>
            );
          }
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={handleDrawerToggle}
                sx={{ textAlign: 'center' }}
              >
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const baseHeight = { xs: '70px', md: '100px' };
  const scrolledHeight = { xs: '60px', md: '70px' };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: `linear-gradient(to right, #1A237E 0%, #42A5F5 100%)`,
          height: scrolled ? scrolledHeight : baseHeight,
          justifyContent: 'center',
          transition: 'height 0.3s ease-in-out',
          zIndex: theme.zIndex.drawer + 1,
          borderRadius: 0,
          boxShadow: 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', px: '0 !important' }}>
            <Link href="/" passHref style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Image
                src={FIREBASE_LOGO_URL}
                alt="AD Plenitude Logo"
                width={scrolled ? 100 : 130}
                height={scrolled ? 50 : 65}
                style={{ objectFit: 'contain', transition: 'all 0.3s ease-in-out' }}
              />
            </Link>

            {/* Menu Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => {
                
                // Lógica de BOTÃO DIVIDIDO para Ministérios
                if (item.label === 'Ministérios') {
                  return (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                      
                      {/* PARTE 1: O Texto (Leva para a página) */}
                      <Button
                        component={Link}
                        href={item.path}
                        sx={{
                          color: 'white',
                          fontSize: '0.875rem',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                          borderTopRightRadius: 0, // Cola com a seta
                          borderBottomRightRadius: 0,
                          pr: 1
                        }}
                      >
                        {item.label}
                      </Button>

                      {/* PARTE 2: A Seta (Abre o Menu) */}
                      <Button
                        onClick={handleOpenMinistries} // CLIQUE AQUI ABRE O MENU
                        sx={{
                          color: 'white',
                          minWidth: '30px', // Seta compacta
                          p: 0.5,
                          borderTopLeftRadius: 0, // Cola com o texto
                          borderBottomLeftRadius: 0,
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                         <KeyboardArrowDownIcon fontSize="small" />
                      </Button>
                      
                      {/* O Menu Suspenso */}
                      <Menu
                        id="menu-ministerios"
                        anchorEl={anchorElMinistries}
                        open={Boolean(anchorElMinistries)}
                        onClose={handleCloseMinistries}
                        elevation={0}
                        sx={{ mt: 1 }}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            background: `linear-gradient(to right, #1A237E 0%, #42A5F5 100%)`,
                            color: 'white',
                            borderRadius: '12px',
                            minWidth: 180,
                            border: 'none',
                          }
                        }}
                      >
                        <MenuItem 
                          component={Link} 
                          href="/agenda" 
                          onClick={handleCloseMinistries}
                          sx={{ 
                            fontSize: '0.875rem', 
                            color: 'white',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            py: 1.5,
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                          }}
                        >
                          Agenda Ministerial
                        </MenuItem>
                      </Menu>
                    </Box>
                  );
                }

                // Botões Normais
                return (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.path}
                    sx={{
                      color: 'white',
                      fontSize: '0.875rem',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}

              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                href="/admin"
                sx={{
                  ml: 2,
                  fontSize: '0.875rem',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white' }
                }}
              >
                Acesso Restrito
              </Button>
            </Box>

            {/* Menu Mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                component={Link}
                href="/admin"
                sx={{ mr: 1, fontSize: '0.75rem', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                Acesso
              </Button>
              <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            borderRadius: 0,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}