"use client";
import { createTheme, ThemeProvider, type Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

// Módulo de Augmentation
declare module '@mui/material/styles' {
  interface Theme {
    customGradients: {
      primary: string;
      sidebar: string;
    };
  }
  interface ThemeOptions {
    customGradients?: {
      primary?: string;
      sidebar?: string;
    };
  }
}

const theme = createTheme({
  customGradients: {
    primary: 'linear-gradient(90deg, #1E3A8A 0%, #3B82F6 100%)',
    sidebar: 'linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%)',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82F6',
    },
    secondary: {
      main: '#64748B',
    },
    background: {
      default: '#EBF5FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #D6E2E9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          background: theme.customGradients.primary,
          color: '#FFFFFF',
          boxShadow: 'none',
          left: 0, 
          right: 0,
          top: 0,
          // ✅ CORREÇÃO FINAL: Garante que o AppBar não tenha nenhuma borda
          border: 0,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }: { theme: Theme }) => ({
          background: theme.customGradients.sidebar,
          color: '#E5E7EB',
          // ✅ CORREÇÃO FINAL: Remove TODAS as bordas do menu, incluindo a superior
          border: 0,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          margin: '4px 12px',
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: '#3B82F6',
            color: '#FFFFFF',
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
            '&:hover': {
              backgroundColor: '#2563EB',
            }
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          }
        }
      }
    }
  },
});

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}