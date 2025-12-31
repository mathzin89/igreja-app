// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { Merriweather, Lato } from 'next/font/google';

// Definindo as fontes
const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

// Cores baseadas no logo e sugestões para harmonia
const primaryBlueLight = '#87CEEB'; // Um azul celeste claro, como a pomba
const primaryBlueDark = '#1976D2'; // Um azul mais escuro e sóbrio para contraste
const lightGrayBackground = '#bbbabaff'; // Um cinza muito claro para o fundo geral
const white = '#FFFFFF';
const darkText = '#333333'; // Cor de texto escuro
const mutedText = '#616161'; // Cor de texto mais suave

const theme = createTheme({
  typography: {
    fontFamily: lato.style.fontFamily, // Lato como fonte padrão
    h1: { fontFamily: merriweather.style.fontFamily, color: darkText },
    h2: { fontFamily: merriweather.style.fontFamily, color: darkText },
    h3: { fontFamily: merriweather.style.fontFamily, color: darkText },
    h4: { fontFamily: merriweather.style.fontFamily, color: darkText },
    h5: { fontFamily: merriweather.style.fontFamily, color: darkText },
    h6: { fontFamily: merriweather.style.fontFamily, color: darkText },
    body1: { color: darkText },
    body2: { color: mutedText },
    button: { fontFamily: lato.style.fontFamily },
  },
  palette: {
    mode: 'light', // Força o tema claro
    primary: {
      main: primaryBlueDark, // Azul principal para botões e links
      light: primaryBlueLight, // Azul claro para realces
      dark: '#1565C0', // Uma versão mais escura para hover
      contrastText: white, // Texto branco em botões primários
    },
    secondary: {
      main: '#FFB74D', // Um laranja/dourado suave, como o "Plenitude" no logo
      light: '#FFCC80',
      dark: '#FB8C00',
      contrastText: darkText,
    },
    error: { main: '#D32F2F' },
    warning: { main: '#FBC02D' },
    info: { main: '#2196F3' },
    success: { main: '#4CAF50' },
    background: {
      default: lightGrayBackground, // Fundo geral da página (body)
      paper: white, // Fundo para Cards, Paper, Drawer, etc.
    },
    text: {
      primary: darkText, // Cor principal do texto em elementos claros
      secondary: mutedText, // Cor secundária do texto
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: white, // Navbar branca
          borderBottom: '1px solid #E0E0E0', // Borda sutil para separar do conteúdo
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)', // Sombra leve
          color: darkText, // Garante que o texto padrão da AppBar seja escuro
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: white, // Fundo branco para elementos Paper
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)', // Sombra leve para Cards, etc.
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          // Já configurado pelo palette.primary.main
        },
        textPrimary: {
          color: primaryBlueDark, // Para botões de texto com cor primária
        },
        outlinedPrimary: {
          color: primaryBlueDark, // Para botões outline com cor primária
          borderColor: primaryBlueDark,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: mutedText, // Ícones padrão na cor cinza
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: white, // Drawer lateral branco
          color: darkText, // Texto do drawer escuro
        },
      },
    },
    // Adicione outros overrides conforme necessário para componentes específicos.
  },
});

export default theme;