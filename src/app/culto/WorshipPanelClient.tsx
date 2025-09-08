"use client";

import { useState } from "react";
import { BibleBook } from "@/lib/bible"; // ALTERADO: Importa o tipo correto
import HymnListPageClient from "../harpa/HymnListPageClient";
import BiblePageClient from "../biblia/BiblePageClient";

type Props = {
  allBooks: BibleBook[]; // ALTERADO: Recebe a lista completa de livros
};

export default function WorshipPanelClient({ allBooks }: Props) { // ALTERADO
  const [activeTab, setActiveTab] = useState<'harpa' | 'biblia'>('harpa');

  return (
    <div className="worship-panel">
      <div className="tab-buttons">
        {/* ... botões das abas ... */}
        <button
          className={activeTab === 'harpa' ? 'active' : ''}
          onClick={() => setActiveTab('harpa')}
        >
          Harpa Cristã
        </button>
        <button
          className={activeTab === 'biblia' ? 'active' : ''}
          onClick={() => setActiveTab('biblia')}
        >
          Bíblia Sagrada
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'harpa' && (
          // O componente da Harpa continua igual, focado na busca por número
          <HymnListPageClient hideTitle={true} />
        )}
        {activeTab === 'biblia' && (
          // O componente da Bíblia agora recebe a lista e gerencia a navegação
          <BiblePageClient allBooks={allBooks} /> // ALTERADO
        )}
      </div>
    </div>
  );
}