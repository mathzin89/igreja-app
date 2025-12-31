import { getMinistriesForPublicPage } from "../actions"; 
import { Box, Container, Typography, Grid, Card, CardActionArea, CardMedia } from '@mui/material';
import Link from 'next/link';

interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: string;
  imageUrl: string;
}

export default async function MinistriesPage() {
  const ministries = await getMinistriesForPublicPage();

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {/* Secção de Introdução com Destaque */}
      <Box sx={{ backgroundColor: '#f3f4f6', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
            <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', textAlign: 'center', mb: 2 }}>
              Nossos Ministérios
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: '700px', mx: 'auto', fontSize: { xs: '1rem', md: '1.125rem'} }}>
              Acreditamos que cada membro é um ministro. Descubra os diversos departamentos da nossa igreja onde você pode servir, crescer e usar os dons que Deus lhe deu para abençoar a nossa comunidade.
            </Typography>
        </Container>
      </Box>

{/* Grelha de Cards dos Ministérios */}
<Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
  {ministries.length > 0 ? (
    <Grid container spacing={4} justifyContent="center"> {/* ✅ ALTERAÇÃO AQUI */}
      {ministries.filter(Boolean).map((ministry: Ministry, index: number) => (
        <Grid item xs={12} sm={6} md={4} key={ministry.id || index}>
          <Card sx={{ 
              height: 400, 
              borderRadius: 4, 
              position: 'relative',
              overflow: 'hidden', // Adicionado para garantir que a imagem não vaze no hover
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
              }
          }}>
              <CardActionArea
                  component={Link}
                  href={`#`} // Altere para o link do ministério se houver
                  sx={{ height: '100%' }}
              >
                  <CardMedia
                      component="img"
                      image={ministry.imageUrl || 'https://placehold.co/600x400'}
                      alt={ministry.name}
                      sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease-in-out',
                          // Mover o hover da imagem para dentro do hover do CardActionArea
                          // para uma melhor experiência
                          '.MuiCardActionArea-root:hover &': {
                              transform: 'scale(1.1)',
                          }
                      }}
                  />
                  {/* Box para o gradiente e o conteúdo */}
                  <Box sx={{
                      position: 'relative',
                      height: '100%',
                      width: '100%',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 3,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 20%, transparent 100%)',
                  }}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                          {ministry.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'grey.300', mt: 0.5 }}>
                          {ministry.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'grey.400', fontWeight: 'bold' }}>
                          Líder: {ministry.leader}
                      </Typography>
                  </Box>
              </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  ) : (
    <Typography align="center" color="text.secondary" sx={{ mt: 8 }}>
      Os ministérios da nossa igreja serão listados aqui em breve.
    </Typography>
  )}
</Container>
    </Box>
  );
}

