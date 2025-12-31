"use client";

import { useState, useMemo } from "react";
import rawHarpaJson from "@/data/harpa.json";

export type Hymn = {
  id: number;
  hino: string;
  estrofes: string[];
  coro?: string;
};

export default function HymnListPageClient() {
  // Transforma o JSON cru em array de Hymn
  const allHymns: Hymn[] = useMemo(() => {
    return Object.entries(rawHarpaJson)
      .filter(([key, value]) => "hino" in value) // remove metadados como "-1"
      .map(([key, value]) => ({
        id: Number(key),
        hino: value.hino,
        estrofes: Object.values(value.verses),
        coro: value.coro,
      }));
  }, []);

  const [selectedHymnId, setSelectedHymnId] = useState<number | null>(null);

  const selectedHymn = selectedHymnId !== null 
    ? allHymns.find((h) => h.id === selectedHymnId) 
    : null;

  return (
    <div className="hymn-list-page">
      <h1>Harpa Cristã</h1>

      {/* Lista de hinos */}
      <ul className="hymn-list">
        {allHymns.map((hymn) => (
          <li key={hymn.id}>
            <button onClick={() => setSelectedHymnId(hymn.id)}>
              {hymn.id} - {hymn.hino}
            </button>
          </li>
        ))}
      </ul>

      {/* Exibe o hino selecionado */}
      {selectedHymn && (
        <div className="hymn-presentation">
          <h2>{selectedHymn.id} - {selectedHymn.hino}</h2>
          {selectedHymn.estrofes.map((estrofe, i) => (
            <div key={i} className="estrofe-slide">
              <p>{estrofe}</p>
              {selectedHymn.coro && (
                <div className="coro-slide">
                  <p>{selectedHymn.coro}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
