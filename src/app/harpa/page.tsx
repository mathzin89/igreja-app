// SEM "use client" AQUI! Este é o Server Component.

// Não precisamos mais de getAllHymns aqui
// import { getAllHymns } from '@/lib/hymns'; 
import HymnListPageClient from './HymnListPageClient'; // Importa o componente de cliente

export default async function HarpaPage() {
  // Não precisamos buscar os hinos aqui, pois o componente cliente não os lista mais.
  // const hymns = await getAllHymns(); 

  // Apenas renderiza o componente de cliente
  return <HymnListPageClient />;
}