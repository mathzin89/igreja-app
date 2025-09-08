// src/lib/hymns.ts
import fs from 'fs/promises';
import path from 'path';
import { Hymn } from '@/types/hymn';

export async function getAllHymns(): Promise<Hymn[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'harpa.json');
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const hymnsObject = JSON.parse(fileContent);

    // Transforma o objeto de hinos em um array
    const hymnsArray: Hymn[] = Object.entries(hymnsObject)
      // Filtra para remover a chave de metadados "-1" e garantir que o valor seja um objeto
      .filter(([key, value]) => key !== "-1" && typeof value === 'object' && value !== null && value.hino)
      .map(([key, value]: [string, any]) => {
        // Converte o objeto 'verses' em um array de strings
        const stanzas = value.verses ? Object.values(value.verses) as string[] : [];

        return {
          id: parseInt(key, 10),
          title: value.hino.replace(/^\d+\s*-\s*/, ''), // Remove o "1 - " do título
          chorus: value.coro || null, // Se o coro for uma string vazia, se torna null
          stanzas: stanzas,
        };
      });

    return hymnsArray;
  } catch (error) {
    console.error("Falha ao ler ou processar os dados dos hinos:", error);
    return [];
  }
}

export async function getHymnById(id: number): Promise<Hymn | undefined> {
  const hymns = await getAllHymns();
  return hymns.find(hymn => hymn.id === id);
}