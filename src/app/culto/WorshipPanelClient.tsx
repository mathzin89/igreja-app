// No arquivo: src/app/culto/WorshipPanelClient.tsx
"use client";

import { useState } from "react";
import { BibleBook } from "@/lib/bible";
import HymnListPageClient from "../harpa/HymnListPageClient";
import BiblePageClient from "../biblia/BiblePageClient";
import PresentationView from "@/components/PresentationView"; // ✅ Importa o novo componente

// MUI
import { Paper, Box, Tabs, Tab, Grid } from "@mui/material";

type Content = { title: string; content: string; startIndex?: number };

type Props = {
  allBooks: BibleBook[];
};

export default function WorshipPanelClient({ allBooks }: Props) {
  const [activeTab, setActiveTab] = useState<'harpa' | 'biblia'>('harpa');
  
  // ✅ NOVO ESTADO: Armazena o conteúdo a ser apresentado ou 'null' se estiver no modo de seleção.
  const [presentationContent, setPresentationContent] = useState<Content | null>(null);

  // ✅ FUNÇÕES ATUALIZADAS: Em vez de adicionar à playlist, elas definem o conteúdo para apresentação.
  const handleHymnSelect = (hino: Content) => {
    setPresentationContent(hino);
  };

  const handleVerseSelect = (verso: Content) => {
    setPresentationContent(verso);
  };

  // Se houver conteúdo para apresentar, renderiza a tela cheia.
  if (presentationContent) {
    return (
      <PresentationView 
        content={presentationContent}
        onClose={() => setPresentationContent(null)} // Função para voltar ao modo de seleção
      />
    );
  }

  // Caso contrário, mostra o modo de seleção.
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
<Grid item xs={12} md={10} lg={8}>
        <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
                <Tab label="Harpa Cristã" value="harpa" />
                <Tab label="Bíblia Sagrada" value="biblia" />
            </Tabs>
            <Box sx={{ mt: 2 }}>
              {activeTab === 'harpa' && (
                <HymnListPageClient hideTitle={true} onHymnSelect={handleHymnSelect} />
              )}
              {activeTab === 'biblia' && (
                <BiblePageClient allBooks={allBooks} onVerseSelect={handleVerseSelect} />
              )}
            </Box>
        </Paper>
      </Grid>
    </Box>
  );
}