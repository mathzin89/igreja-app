// src/lib/utils.ts
export function normalizeString(str: string): string {
  if (!str) return ''; // Adiciona uma verificação para evitar erros
  
  return str
    .toLowerCase()
    .normalize("NFD") // Separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/[^a-z0-9]/g, ''); // Remove caracteres não alfanuméricos
}