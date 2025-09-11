// src/app/harpa/HymnListPageClient.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- 1. Definição de Tipos ---
// Este é o formato que a função onHymnSelect espera
type HymnPayload = {
  title: string;
  content: string;
};

// Este é o formato que a API retorna
interface HymnFromAPI {
    id: number;
    title: string;
    estrofes: string[][];
}

type Props = {
  hideTitle?: boolean;
  onHymnSelect?: (hino: HymnPayload) => void;
};

export default function HymnListPageClient({ hideTitle = false, onHymnSelect }: Props) { 
  const [searchId, setSearchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId, 10);

    if (isNaN(id) || id <= 0 || id > 640) {
      alert("Por favor, digite um número de hino válido (1 a 640).");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/hymns/${id}`);

      if (response.ok) {
        const data: HymnFromAPI = await response.json();

        // --- 2. TRANSFORMAÇÃO DOS DADOS ---
        // Juntamos todas as estrofes e linhas em um único parágrafo (string)
        // para corresponder ao formato { title, content }
        const content = data.estrofes
          .map(estrofe => estrofe.join('\n')) // Junta as linhas de uma estrofe
          .join('\n\n'); // Junta as estrofes com um espaço duplo

        const hymnPayload: HymnPayload = {
            title: data.title,
            content: content
        };

        if (onHymnSelect) {
          // Enviamos os dados já transformados para a playlist
          onHymnSelect(hymnPayload);
        } else {
          router.push(`/harpa/${id}`);
        }
        
        setSearchId('');
      } else {
        alert(`Não foi possível encontrar o hino de número ${id}.`);
      }
    } catch (error) {
      console.error("Falha ao buscar hino:", error);
      alert("Ocorreu um erro de rede ao buscar o hino.");
    }

    setIsLoading(false);
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
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Adicionar'}
        </button>
      </form>
    </div>
  );
}