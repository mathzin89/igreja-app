// src/app/harpa/HymnListPageClient.tsx
"use client";

import { useState } from 'react';
// O useRouter não é mais necessário para esta lógica
// import { useRouter } from 'next/navigation';

// --- 1. Definições de Tipos Corrigidas ---
// É importante que o tipo 'Hymn' aqui seja o mesmo esperado pelo componente pai
type Hymn = {
  title: string;
  content: string;
};

type Props = {
  hideTitle?: boolean;
  onHymnSelect: (hino: Hymn) => void; // ✅ Propriedade adicionada
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
  const [isLoading, setIsLoading] = useState(false); // Estado para feedback de carregamento

  // --- 3. Lógica de Busca Modificada ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId, 10);

    if (isNaN(id) || id <= 0 || id > 640) {
      alert("Por favor, digite um número de hino válido (1 a 640).");
      return;
    }

    setIsLoading(true);
    const hymnData = await fetchHymnData(id);
    setIsLoading(false);

    if (hymnData) {
      // Em vez de navegar, chama a função do componente pai para adicionar à playlist
      onHymnSelect(hymnData);
      setSearchId(''); // Limpa o campo após a seleção
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