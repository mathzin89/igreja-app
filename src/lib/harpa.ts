import hymnsData from '@/data/harpa.json';

export interface Hymn {
  id: number;
  title: string;
  estrofes: string[][];
}

export async function getHymnById(id: number): Promise<Hymn | undefined> {
  // Agora hymnsData é um array, então .find() funciona perfeitamente!
  const hymnArray = hymnsData as Hymn[];

  const hymn = hymnArray.find((h: Hymn) => h.id === Number(id));
  
  return hymn;
}