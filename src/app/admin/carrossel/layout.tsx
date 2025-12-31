// src/app/admin/carrossel/layout.tsx
import { ReactNode } from 'react';

interface CarrosselLayoutProps {
  children: ReactNode;
}

export default function CarrosselLayout({ children }: CarrosselLayoutProps) {
  return (
    <div>
      {/* Você pode adicionar um cabeçalho ou navegação específica para a seção do carrossel aqui, se necessário */}
      {children}
    </div>
  );
}