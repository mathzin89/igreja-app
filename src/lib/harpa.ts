import hymnsData from '@/data/harpa.json';

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

  const estrofes: string[][] = [];

  if (rawHymn.verses) {
    Object.values<string>(rawHymn.verses).forEach(verseText => {
      // ✅ CORREÇÃO APLICADA AQUI
      const lines = verseText.split('<br>').map((line: string) => line.trim());
      estrofes.push(lines);
    });
  }

  if (rawHymn.coro && rawHymn.coro.trim() !== "") {
    // ✅ E AQUI TAMBÉM
    const lines = rawHymn.coro.split('<br>').map((line: string) => line.trim());
    estrofes.push(lines);
  }

  const hymn: Hymn = {
    id: Number(id),
    title: rawHymn.hino.substring(rawHymn.hino.indexOf('-') + 1).trim(),
    estrofes: estrofes,
  };
  
  return hymn;
}