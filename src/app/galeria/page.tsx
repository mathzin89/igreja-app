// src/app/galeria/page.tsx

import { getAllGalleryImages } from "../actions"; // ✅ CORREÇÃO: Importa do ficheiro de actions principal
import { Box, Container, Typography, Grid } from '@mui/material';

// ✅ Interface para as imagens
interface GalleryImage {
    id: string;
    imageUrl: string;
}

export default async function GalleryPage() {
  const allImages: GalleryImage[] = await getAllGalleryImages();

  return (
    <Box sx={{ backgroundColor: 'rgb(249 250 251)', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', textAlign: 'center', mb: 2 }}>
          Galeria de Fotos
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}>
          Recorde os momentos especiais que vivemos em comunhão.
        </Typography>

        {allImages.length > 0 ? (
          <Grid container spacing={2}>
              {allImages.map((image: GalleryImage) => ( // ✅ CORREÇÃO: Adiciona o tipo ao parâmetro 'image'
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                    <Box sx={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      height: '250px' 
                    }}>
                      <img 
                        src={image.imageUrl} 
                        alt="Foto da Galeria" 
                        style={{
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          display: 'block'
                        }} 
                      />
                    </Box>
                </Grid>
              ))}
          </Grid>
        ) : (
          <Typography align="center" color="text.secondary" sx={{ mt: 8 }}>
            A nossa galeria está a ser preparada. Volte em breve!
          </Typography>
        )}
      </Container>
    </Box>
  );
}