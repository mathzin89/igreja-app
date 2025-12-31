import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import MuiThemeProvider from './theme-provider';
import { AuthProvider } from "@/firebase/AuthContext"; 
import ConditionalHeaderWrapper from '@/components/ConditionalHeaderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AD Plenitude',
  description: 'Assembleia de Deus Plenitude - Oficial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider> {/* A MÁGICA ACONTECE AQUI */}
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <MuiThemeProvider>
              <ConditionalHeaderWrapper>
                {children}
              </ConditionalHeaderWrapper>
            </MuiThemeProvider>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

