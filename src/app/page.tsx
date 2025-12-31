// src/app/page.tsx

import { getCarouselImages, getUpcomingEvents, getGalleryImagesForHomepage, getPastorMessage, getAllDevotionals } from "./actions"; 
import CarouselClient from "@/components/CarouselClient";
import { Box, Container, Typography, Grid, Button, Card, CardContent, CardActions } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import Link from "next/link";

const horariosFixos = [
  { titulo: "Culto de Ensino", dia: "Toda Quarta-Feira", horario: "19:30", icon: MenuBookIcon },
  { titulo: "Círculo de Oração", dia: "Toda Sexta-Feira", horario: "19:00", icon: MenuBookIcon },
  { titulo: "Culto de Santa Ceia", dia: "Todo Primeiro Sábado do Mês", horario: "19:00", icon: MenuBookIcon },
  { titulo: "Escola Bíblica Dominical", dia: "Todo Domingo", horario: "09:00", icon: SchoolIcon },
  { titulo: "Culto da Família", dia: "Todo Domingo", horario: "18:30", icon: FamilyRestroomIcon }
];

const formatarData = (dataString: string) => {
    if (!dataString) return 'Data a confirmar';
    try {
        const data = new Date(dataString + 'T00:00:00-03:00');
        if (isNaN(data.getTime())) return 'Data inválida';
        return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch (e) { return 'Data inválida'; }
};

export default async function HomePage() {
  const [carouselImages, upcomingEvents, galleryImages, pastorMessage, latestDevotionals] = await Promise.all([
    getCarouselImages(),
    getUpcomingEvents(),
    getGalleryImagesForHomepage(),
    getPastorMessage(),
    getAllDevotionals().then(devs => devs.slice(0, 3)) // Busca todos e pega os 3 mais recentes
  ]);

  return (
    <Box sx={{ backgroundColor: 'rgb(249 250 251)' }}>
      
      <Box sx={{ textAlign: 'center', py: {xs: 8, md: 10}, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <CarouselClient images={carouselImages} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', mt: 8 }}>
            Um lugar de fé, esperança e amor.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '768px', mx: 'auto' }}>
            Somos uma comunidade dedicada a servir a Deus e ao próximo. Explore o nosso site para conhecer mais sobre a nossa fé e os nossos horários.
          </Typography>
        </Container>
      </Box>


      {latestDevotionals && latestDevotionals.length > 0 && (
        <Box sx={{ py: 10, backgroundColor: 'white' }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Últimas Reflexões</Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}>
              Uma palavra de fé e esperança para o seu dia.
            </Typography>
            <Grid container spacing={4}>
              {latestDevotionals.map((devotional) => (
                <Grid item xs={12} md={4} key={devotional.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>{devotional.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Por {devotional.author}</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {devotional.content}
                      </Typography>
                    </CardContent>
                    <CardActions><Button component={Link} href={`/devocionais/${devotional.id}`} size="small">Ler Mais</Button></CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
             <Box sx={{ textAlign: 'center', mt: 4 }}><Button variant="contained" size="large" component={Link} href="/devocionais">Ver Todos os Devocionais</Button></Box>
          </Container>
        </Box>
      )}
      
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Nossos Horários</Typography>
          <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}>
            Participe conosco! Estes são os nossos encontros semanais.
          </Typography>
          <Grid container spacing={4}>
            {horariosFixos.map((horario) => (
              <Grid item xs={12} sm={6} md={4} key={horario.titulo}>
                 <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' }}}>
                    <horario.icon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{horario.titulo}</Typography>
                    <Typography color="text.secondary">{horario.dia}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>às {horario.horario}</Typography>
                 </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {pastorMessage && (
        <Box sx={{ py: 10, backgroundColor: 'white' }}>
          <Container maxWidth="lg">
            <Grid container alignItems="center" spacing={6}>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: 250, height: 250, borderRadius: '50%', overflow: 'hidden', mx: 'auto', boxShadow: 5 }}><img src={pastorMessage.imageUrl || "https://placehold.co/300x300?text=Foto"} alt="Foto do Pastor" style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{pastorMessage.mainTitle || 'Uma Palavra de Boas-Vindas'}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>{pastorMessage.roleTitle || 'Pastor Presidente'}</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{pastorMessage.text}</Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Nossa Comunidade em Fotos</Typography>
          <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}>
            Veja alguns momentos especiais que compartilhamos juntos.
          </Typography>
          {galleryImages.length > 0 ? (
            <Grid container spacing={2}>
                {galleryImages.map((image) => (
                  <Grid item xs={6} sm={4} md={3} key={image.id}>
                      <Box sx={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}><img src={image.imageUrl} alt="Foto da Galeria" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} /></Box>
                  </Grid>
                ))}
            </Grid>
          ) : ( <Typography align="center" color="text.secondary">A galeria de fotos será atualizada em breve.</Typography> )}
          {galleryImages.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}><Button variant="contained" size="large" component={Link} href="/galeria">Ver Galeria Completa</Button></Box>
          )}
        </Container>
      </Box>
      
      <Box sx={{ py: 10, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>Visite-nos!</Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '600px', mx: 'auto' }}>
              Será uma alegria receber você e sua família.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={5}>
                    <Box sx={{ border: '1px solid #ddd', p: 4, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Sede</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>R. Tauro, 70 - Jd. Novo Horizonte, Carapicuíba - SP</Typography>
                        <Button variant="contained" href="https://www.google.com/maps/place/R.+Tauro,+70+-+Jardim+Novo+Horizonte,+Carapicu%C3%ADba+-+SP" target="_blank">Ver no Mapa</Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Box sx={{ border: '1px solid #ddd', p: 4, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>1º de Maio</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>R. Nelson Mandela, 143 - Jd. 1º de maio, Osasco - SP</Typography>
                        <Button variant="contained" href="https://www.google.com/maps/place/R.+Nelson+Mandela,+143+-+Primeiro+de+Maio,+Osasco+-+SP" target="_blank">Ver no Mapa</Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
      </Box>
    </Box>
  );
}