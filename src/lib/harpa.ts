// src/lib/harpa.ts

export interface RawHarpaHymnVerse {
  [verseNumber: string]: string;
}

export interface RawHarpaHymn {
  hino: string | null | undefined;
  coro?: string | null | undefined;
  verses?: RawHarpaHymnVerse | null | undefined;
}

export interface RawHarpaJson {
  [hymnNumber: string]: RawHarpaHymn;
}

export interface Hymn {
  id: string;
  number: number;
  title: string;
  estrofes: string[][];
  coro?: string[][];
  slides: string[];
}

export function mapRawHarpaToHymns(rawData: RawHarpaJson): Hymn[] {
  const hymns: Hymn[] = [];

  for (const key in rawData) {
    if (!Object.prototype.hasOwnProperty.call(rawData, key)) continue;
    const rawHymn = rawData[key];
    const hymnNumber = parseInt(key, 10);
    if (isNaN(hymnNumber)) continue;

    const title =
      rawHymn.hino && typeof rawHymn.hino === 'string'
        ? rawHymn.hino.replace(/^\d+\s*-\s*/, '').trim()
        : `Hino ${hymnNumber} (Sem Título)`;

    const estrofes: string[][] = [];
    if (rawHymn.verses) {
      const sortedKeys = Object.keys(rawHymn.verses).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
      for (const k of sortedKeys) {
        const line = rawHymn.verses[k];
        estrofes.push(line ? line.split('<br>').map(l => l.trim()) : ['']);
      }
    }

    const coroContent: string[][] | undefined =
      rawHymn.coro?.split('<br>').map(l => [l.trim()]);

    const coroString = coroContent?.map(c => c.join('\n')).join('\n').trim();

    // ✅ LÓGICA DE GERAÇÃO DE SLIDES MAIS ROBUSTA
    const slides: string[] = [];
    slides.push(`${hymnNumber} - ${title}`); // Slide 1: Título

    estrofes.forEach((estrofeArray) => {
        const estrofeString = estrofeArray.join('\n').trim();
        
        // Só adiciona a estrofe se ela não for uma string vazia
        if (estrofeString) {
            slides.push(estrofeString);
        }

        // Só adiciona o coro se ele existir e não for uma string vazia
        if (coroString) {
            slides.push(coroString);
        }
    });

    // Caso especial: se não houver estrofes mas houver coro
    if (estrofes.length === 0 && coroString) {
        slides.push(coroString);
    }
    
    // Filtro final para garantir que não há slides vazios
    const finalSlides = slides.filter(slide => slide && slide.trim() !== '');

    hymns.push({ id: `hino-${hymnNumber}`, number: hymnNumber, title, estrofes, coro: coroContent, slides: finalSlides });
  }

  return hymns.sort((a, b) => a.number - b.number);
}

export function getHymnByNumber(rawData: RawHarpaJson, number: number): Hymn | undefined {
  const hymns = mapRawHarpaToHymns(rawData);
  return hymns.find(h => h.number === number);
}

export function getAllHymns(rawData: RawHarpaJson): Hymn[] {
  return mapRawHarpaToHymns(rawData);
}