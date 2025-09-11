// src/app/harpa/HymnListPageClient.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Reimporte o useRouter

// O useRouter não é mais necessário para esta lógica
// import { useRouter } from 'next/navigation';

// --- 1. Definições de Tipos Corrigidas ---
// É importante que o tipo 'Hymn' aqui seja o mesmo esperado pelo componente pai
type Hymn = {
  title: string;
  content: string;
};

// No arquivo HymnListPageClient.tsx
type Props = {
  hideTitle?: boolean;
  onHymnSelect?: (hino: Hymn) => void; // ✅ O '?' torna a prop opcional
};

// --- 2. Função para Buscar os Dados do Hino (Exemplo) ---
// Você precisará implementar a lógica real para buscar os dados de um arquivo, API, etc.
// Esta é uma função de exemplo que retorna dados fictícios.
async function fetchHymnData(id: number): Promise<Hymn | null> {
  // LÓGICA FICTÍCIA: Substitua isso pela sua busca real
  if (id > 0 && id <= 640) {
    // Exemplo: Em um caso real, você poderia fazer um fetch para uma API ou ler um arquivo JSON
    const response = await fetch(`/api/hymns/${id}`); // Exemplo de chamada a uma API
    if (!response.ok) return null;
    const data = await response.json(); // Espera-se que a API retorne { title, content }
    return data;
  }
  return null;
}


export default function HymnListPageClient({ hideTitle = false, onHymnSelect }: Props) { 
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // ✅ Inicialize o router

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId, 10);
    // ... (sua validação de ID) ...

    setIsLoading(true);
    const hymnData = await fetchHymnData(id);
    setIsLoading(false);

    if (hymnData) {
      // ✅ LÓGICA CONDICIONAL AQUI
      if (onHymnSelect) {
        // Se a função foi passada (estamos no painel de culto), use-a.
        onHymnSelect(hymnData);
      } else {
        // Se não (estamos na página /harpa), navegue para a página do hino.
        router.push(`/harpa/${id}`);
      }
      setSearchId('');
    } else {
      alert(`Não foi possível encontrar o hino de número ${id}.`);
    }
  };

  return (
    <div className="bible-navigation-container"> 
      {!hideTitle && (
        <h1>Harpa Cristã</h1>
      )}
      
      <p>Digite o número do hino para adicioná-lo à playlist.</p>

      <form onSubmit={handleSearch} className="bible-search-form">
        <input
          type="number"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Número do hino (ex: 291)"
          min="1"
          max="640"
          autoFocus
          disabled={isLoading} // Desabilita o campo durante o carregamento
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Adicionar'}
        </button>
      </form>
    </div>
  );
}