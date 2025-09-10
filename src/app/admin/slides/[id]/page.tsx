"use client";

import React, { useState, useEffect, use } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../../firebase/config';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Imports do Material-UI
import { Box, Typography, Button, CircularProgress, Paper, Grid, IconButton, LinearProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

// Interface para um slide individual
interface Slide {
  imageUrl: string;
  storagePath: string; // Caminho no Storage para podermos excluir depois
}

// Interface para a apresentação completa
interface Slideshow {
  id: string;
  title: string;
  slides: Slide[];
}

export default function EditSlideshowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchSlideshow = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'slideshows', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSlideshow({ id: docSnap.id, ...docSnap.data() } as Slideshow);
        } else {
          console.log("Apresentação não encontrada!");
        }
      } catch (error) {
        console.error("Erro ao buscar apresentação:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlideshow();
  }, [id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !slideshow) return;

    setIsUploading(true);
    setUploadProgress(0);

    const file = files[0];
    const storagePath = `slideshows/${id}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Erro no upload:", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newSlide: Slide = { imageUrl: downloadURL, storagePath: storagePath };

        const slideshowRef = doc(db, 'slideshows', id);
        await updateDoc(slideshowRef, {
          slides: arrayUnion(newSlide)
        });

        setSlideshow(prev => prev ? { ...prev, slides: [...prev.slides, newSlide] } : null);
        setIsUploading(false);
      }
    );
  };

  const handleDeleteSlide = async (slideToDelete: Slide) => {
    if (!slideshow || !window.confirm("Tem certeza que deseja excluir este slide?")) return;

    try {
      const imageRef = ref(storage, slideToDelete.storagePath);
      await deleteObject(imageRef);

      const slideshowRef = doc(db, 'slideshows', id);
      await updateDoc(slideshowRef, {
        slides: arrayRemove(slideToDelete)
      });
      
      setSlideshow(prev => prev ? { ...prev, slides: prev.slides.filter(s => s.imageUrl !== slideToDelete.imageUrl) } : null);

    } catch (error) {
      console.error("Erro ao excluir slide:", error);
      alert("Falha ao excluir o slide.");
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (!slideshow) {
    return <Typography sx={{ p: 3 }}>Apresentação não encontrada.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/admin/slides')}>
        Voltar para todas as apresentações
      </Button>

      <Typography variant="h4" sx={{ my: 3 }}>
        Editando Slides: <strong>{slideshow.title}</strong>
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Adicionar Novos Slides</Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<AddPhotoAlternateIcon />}
          disabled={isUploading}
        >
          Escolher Imagem
          <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
        </Button>
        {isUploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" align="center">{Math.round(uploadProgress)}%</Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>Slides Atuais</Typography>
      {slideshow.slides.length === 0 && !isUploading ? (
        <Alert severity="info">Nenhum slide adicionado a esta apresentação ainda.</Alert>
      ) : (
        <Grid container spacing={2}>
          {slideshow.slides.map((slide, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              <Paper sx={{ position: 'relative', aspectRatio: '16/9' }}>
                <Image
                  src={slide.imageUrl}
                  alt={`Slide ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'contain', borderRadius: '4px' }}
                />
                <IconButton 
                  sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'} }}
                  size="small"
                  onClick={() => handleDeleteSlide(slide)}
                >
                  <DeleteIcon sx={{ color: 'white' }} />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}