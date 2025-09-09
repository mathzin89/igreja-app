// Conteúdo completo para o arquivo /src/lib/hymn.ts

import fs from 'fs/promises';
import path from 'path';

// 1. DEFINIÇÃO DO TIPO (A "PLANTA" DO HINO)
// Definimos e exportamos o tipo Hymn aqui mesmo.
export type Hymn = {
  id: number;
  title: string;
  stanzas: string[];
  chorus: string | null;
};

// 2. FUNÇÕES QUE USAM O TIPO DEFINIDO ACIMA
export async function getAllHymns(): Promise<Hymn[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'harpa.json');
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const hymnsObject = JSON.parse(fileContent);

    const hymnsArray: Hymn[] = Object.entries(hymnsObject)
      .filter(([key, value]: [string, any]) => key !== "-1" && typeof value === 'object' && value !== null && value.hino)
      .map(([key, value]: [string, any]) => {
        const stanzas = value.verses ? Object.values(value.verses) as string[] : [];

        return {
          id: parseInt(key, 10),
          title: value.hino.replace(/^\d+\s*-\s*/, ''),
          chorus: value.coro || null,
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