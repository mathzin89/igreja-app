"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  hideTitle?: boolean;
};

export default function HymnListPageClient({ hideTitle = false }: Props) { 
  const [searchId, setSearchId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchId, 10);
    if (!isNaN(id) && id > 0 && id <= 640) {
      // Abre a apresentação do hino em uma nova aba
      router.push(`/harpa/${id}`);
    } else {
      alert("Por favor, digite um número de hino válido (1 a 640).");
    }
  };

  return (
    <div className="bible-navigation-container"> 
      {!hideTitle && (
        <h1>Harpa Cristã</h1>
      )}
      
      <p>Digite o número do hino para iniciar a apresentação.</p>

      {/* A classe do formulário foi corrigida aqui */}
      <form onSubmit={handleSearch} className="bible-search-form">
        <input
          type="number"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Número do hino (ex: 291)"
          min="1"
          autoFocus
        />
        <button type="submit">Procurar</button>
      </form>
    </div>
  );
} 