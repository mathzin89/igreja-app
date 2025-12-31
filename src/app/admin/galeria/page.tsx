// src/app/admin/galeria/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, CircularProgress, Alert, Card, CardMedia, CardActions, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ✅ CORREÇÃO: Importa as funções do novo ficheiro central 'actions.ts' do admin
import { getGalleryImagesForAdmin, saveGalleryImage, deleteGalleryImage } from '../actions';

interface GalleryImage {
  id: string;
  imageUrl: string;
  timestamp: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const fetchedImages = await getGalleryImagesForAdmin();
    setImages(fetchedImages);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (image: GalleryImage) => {
    if (window.confirm("Tem a certeza de que deseja excluir esta imagem?")) {
      setImages(prevImages => prevImages.filter(img => img.id !== image.id));
      await deleteGalleryImage(image.id, image.imageUrl);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Gerir Galeria de Fotos
      </Typography>

      <Box sx={{ p: 3, mb: 4, border: '1px dashed grey', borderRadius: '4px', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Adicionar Nova Foto à Galeria</Typography>
        <UploadButton<OurFileRouter, "imageUploader">
          endpoint="imageUploader"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={async (res) => {
            if (res?.[0]?.url) {
              await saveGalleryImage(res[0].url);
              await fetchImages();
              alert("Upload Concluído!");
            }
            setIsUploading(false);
          }}
          onUploadError={(error: Error) => {
            alert(`ERRO! ${error.message}`);
            setIsUploading(false);
          }}
        />
        {isUploading && <CircularProgress sx={{ mt: 2 }} />}
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>Imagens Atuais na Galeria</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" sx={{ my: 4 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : images.length === 0 ? (
          <Typography color="text.secondary">Nenhuma imagem na galeria.</Typography>
        ) : (
          <Grid container spacing={2}>
            {images.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card>
                  <CardMedia component="img" height="160" image={image.imageUrl} alt="Imagem da Galeria" sx={{ objectFit: 'cover' }} />
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton aria-label="excluir" onClick={() => handleDelete(image)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}