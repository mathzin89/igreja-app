import { getHymnById, getAllHymns } from '@/lib/hymns';
import HymnPresentationClient from './HymnPresentationClient';

type PageProps = {
  params: {
    id: string;
  };
};

// Esta página busca os dados no servidor
export default async function HymnPresentationPage({ params }: PageProps) {
  const hymnId = parseInt(params.id, 10);
  const hymn = await getHymnById(hymnId);

  // E passa os dados para o componente de cliente, que cuida da apresentação
  return <HymnPresentationClient hymn={hymn} />;
}


// (Opcional, mas recomendado para performance)
// Gera as páginas estaticamente durante a build
export async function generateStaticParams() {
  const hymns = await getAllHymns();
 
  return hymns.map((hymn) => ({
    id: hymn.id.toString(),
  }));
}