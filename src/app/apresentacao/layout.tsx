export default function SlideshowLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, backgroundColor: "black" }}>
        {children}
      </body>
    </html>
  );
}
