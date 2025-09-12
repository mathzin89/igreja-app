import hymnsData from '@/data/harpa.json';

// Interfaces (sem alteração)
export interface Hymn {
  id: number;
  title: string;
  estrofes: string[][];
}

interface RawHymn {
  hino: string;
  coro: string;
  verses: { [key: string]: string };
}

export async function getHymnById(id: number): Promise<Hymn | undefined> {
  const rawHymn = (hymnsData as any)[id];

  if (!rawHymn || !rawHymn.hino) {
    return undefined;
  }

  // --- ✅ LÓGICA DE INTERCALAÇÃO DO CORO ---
  
  // 1. Prepara a estrofe do coro primeiro.
  let chorusStanza: string[] | null = null;
  if (rawHymn.coro && rawHymn.coro.trim() !== "") {
    // Adiciona uma marcação "[Coro]" para clareza na apresentação
    const chorusText = "[Coro]\n" + rawHymn.coro.replace(/<br>/g, '\n');
    chorusStanza = chorusText.split('\n').map((line: string) => line.trim());
  }

  const estrofes: string[][] = [];

  // 2. Itera sobre os versos e intercala o coro.
  if (rawHymn.verses) {
    const verseEntries = Object.values<string>(rawHymn.verses);
    
    verseEntries.forEach((verseText, index) => {
      // Adiciona a estrofe do verso atual
      const verseLines = verseText.replace(/<br>/g, '\n').split('\n').map((line: string) => line.trim());
      estrofes.push(verseLines);
      
      // Adiciona o coro logo em seguida, se ele existir
      if (chorusStanza) {
        estrofes.push(chorusStanza);
      }
    });
  }

  const hymn: Hymn = {
    id: Number(id),
    title: rawHymn.hino.substring(rawHymn.hino.indexOf('-') + 1).trim(),
    estrofes: estrofes,
  };
  
  return hymn;
}