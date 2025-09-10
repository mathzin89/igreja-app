export default function ApresentacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, padding: 0, backgroundColor: 'black' }}>
        {children}
      </body>
    </html>
  );
}
