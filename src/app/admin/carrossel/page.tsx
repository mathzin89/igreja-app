// src/app/admin/carrossel/page.tsx
"use client"; // Este é um Client Component porque vai lidar com upload, estado, etc.

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Grid,Container, Typography, Box, Button, TextField, Paper,
  List, ListItem, ListItemText, IconButton, CircularProgress,
  Alert, Card, CardMedia, CardContent, CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/system'; // Para o botão de upload customizado

// Importe suas configurações do Firebase
import { db, storage } from '@/firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Estilo para o input de arquivo oculto
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Tipo para os slides do carrossel
interface CarouselSlide {
  id: string;
  imageUrl: string;
  title: string;
  order: number; // Para controle da ordem
  timestamp: Date; // Para ordenação por upload
}

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSlideFile, setNewSlideFile] = useState<File | null>(null);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

const carouselCollectionRef = collection(db, 'carouselImages'); // <-- CORRIGIDO AQUI

  // --- Funções de Carregamento de Slides ---
  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(carouselCollectionRef, orderBy('order', 'asc'), orderBy('timestamp', 'desc')); // Ordena por ordem, depois por mais recente
      const snapshot = await getDocs(q);
      const fetchedSlides: CarouselSlide[] = snapshot.docs.map(doc => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
        title: doc.data().title,
        order: doc.data().order,
        timestamp: doc.data().timestamp.toDate(), // Converter Timestamp para Date
      }));
      setSlides(fetchedSlides);
    } catch (err) {
      console.error("Erro ao buscar slides do carrossel:", err);
      setError("Não foi possível carregar os slides do carrossel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []); // Carrega os slides uma vez ao montar o componente

  // --- Função de Upload de Imagem ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewSlideFile(event.target.files[0]);
    } else {
      setNewSlideFile(null);
    }
  };

  const handleUploadSlide = async () => {
    if (!newSlideFile) {
      setError("Por favor, selecione uma imagem para upload.");
      return;
    }
    setError(null);
    setUploading(true);

    const storageRef = ref(storage, `carousel/${newSlideFile.name}`); // Caminho no Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, newSlideFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (uploadError) => {
        console.error("Erro no upload:", uploadError);
        setError(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Encontre a maior ordem existente e adicione 1
          const maxOrder = slides.reduce((max, slide) => Math.max(max, slide.order), 0);

          await addDoc(carouselCollectionRef, {
            imageUrl: downloadURL,
            title: newSlideTitle || `Slide ${new Date().toLocaleDateString()}`,
            order: maxOrder + 1, // Atribui uma ordem sequencial
            timestamp: new Date(), // Adiciona um timestamp
          });

          setNewSlideFile(null);
          setNewSlideTitle('');
          setUploadProgress(0);
          setUploading(false);
          await fetchSlides(); // Recarrega a lista de slides
        } catch (firestoreError) {
          console.error("Erro ao salvar dados no Firestore:", firestoreError);
          setError("Erro ao salvar URL da imagem no banco de dados.");
          setUploading(false);
        }
      }
    );
  };

// --- Função de Exclusão de Slide ---
const handleDeleteSlide = async (slideId: string, imageUrl: string) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;

    // --- LOGS DE DEBUG ---
    console.log("----- DEBUG INÍCIO DA DELEÇÃO -----");
    console.log("DEBUG: Tentando deletar slide com ID (Firestore):", slideId);
    console.log("DEBUG: E URL da imagem (Storage):", imageUrl);
    console.log("----- DEBUG FIM DOS VALORES -----");

    try {
        // 1. Excluir do Firestore
        // ATENÇÃO: Corrigido o nome da coleção de 'carousel_slides' para 'carouselImages'
        await deleteDoc(doc(db, 'carouselImages', slideId));
        console.log("DEBUG: Documento do Firestore excluído com sucesso:", slideId);

        // 2. Excluir do Firebase Storage
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log("DEBUG: Imagem do Storage excluída com sucesso:", imageUrl);

        await fetchSlides(); // Recarrega a lista de slides após a exclusão
        setError(null); // Limpa qualquer erro anterior
    } catch (err: any) { // Use 'any' para o erro para facilitar o debug
        console.error("DEBUG: Erro DETALHADO ao excluir slide:", err);
        setError(`Não foi possível excluir o slide: ${err.message || String(err)}`);
    }
};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Gerenciar Carrossel da Página Inicial
      </Typography>

      {/* Seção de Upload */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Upload de Nova Imagem</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Título do Slide (Opcional)"
          variant="outlined"
          fullWidth
          value={newSlideTitle}
          onChange={(e) => setNewSlideTitle(e.target.value)}
          sx={{ mb: 2 }}
          disabled={uploading}
        />

        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ mb: 2 }}
          disabled={uploading}
        >
          {newSlideFile ? newSlideFile.name : 'Selecionar Imagem'}
          <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handleUploadSlide}
          disabled={!newSlideFile || uploading}
          fullWidth
        >
          {uploading ? `Enviando... ${uploadProgress.toFixed(0)}%` : 'Fazer Upload'}
        </Button>
        {uploading && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>{uploadProgress.toFixed(0)}%</Typography>
          </Box>
        )}
      </Paper>

      {/* Seção de Slides Existentes */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Slides Atuais</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !slides.length ? (
          <Alert severity="error">{error}</Alert>
        ) : slides.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhum slide no carrossel. Faça o upload do primeiro!</Typography>
        ) : (
          <Grid container spacing={2}>
            {slides.map((slide) => (
              <Grid item xs={12} sm={6} md={4} key={slide.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={slide.imageUrl}
                    alt={slide.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ minHeight: '60px' }}>
                    <Typography variant="subtitle2" component="div">
                      {slide.title} (Ordem: {slide.order})
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      aria-label="excluir"
                      onClick={() => handleDeleteSlide(slide.id, slide.imageUrl)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}