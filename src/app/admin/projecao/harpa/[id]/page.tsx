import { getHymnByNumber, getAllHymns } from '@/lib/harpa';
import rawHarpaJson from '@/data/harpa.json';
import HymnPresentationClient from './HymnPresentationClient';

type PageProps = {
  params: {
    id: string;
  };
};

// Página do hino individual
export default async function HymnPresentationPage({ params }: PageProps) {
  const hymnId = parseInt(params.id, 10);

  // ⚠ Passa o rawHarpaJson como primeiro argumento
  const hymn = getHymnByNumber(rawHarpaJson, hymnId);

  return <HymnPresentationClient hymn={hymn} />;
}

// Para gerar os static paths
export async function generateStaticParams() {
  const hymns = getAllHymns(rawHarpaJson);
  return hymns.map(h => ({ id: h.number.toString() }));
}
