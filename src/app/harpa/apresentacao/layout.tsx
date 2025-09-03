import React from 'react';

// Este é o layout que se aplicará APENAS às páginas de apresentação.
// Ele garante um fundo preto e que o conteúdo ocupe o ecrã inteiro.
export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, backgroundColor: 'black' }}>
        {children}
      </body>
    </html>
  )
}