import { getFullBible } from '@/lib/bible'; // ALTERADO: Usa a nova função
import WorshipPanelClient from './WorshipPanelClient';
import './culto.css';

export default async function CultoPage() {
  // ALTERADO: Busca a Bíblia inteira de uma vez
  const allBooks = await getFullBible(); 

  return (
    <div className="page-container">
      <h1>Painel de Culto</h1>
      {/* ALTERADO: Passa todos os livros para o componente cliente */}
      <WorshipPanelClient allBooks={allBooks} /> 
    </div>
  );
}