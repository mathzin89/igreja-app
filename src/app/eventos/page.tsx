import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, CardActions, Button } from '@mui/material';
import { fetchEvents } from '@/lib/events';
import { ChurchEvent } from '@/types/event';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Helper para formatar a data
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
};

export default async function EventosPage() {
  const allEvents = await fetchEvents();

  const upcomingEvents = allEvents
    .filter(event => event.data >= new Date())
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', py: 6, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          textAlign="center" 
          sx={{ fontWeight: 'bold', fontFamily: 'var(--font-merriweather)', color: '#1c3d5a' }}
        >
          Nossos Eventos
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          textAlign="center" 
          sx={{ mb: 6 }}
        >
          Participe conosco e seja abençoado!
        </Typography>

        {upcomingEvents.length > 0 ? (
          <Grid container spacing={4}>
            {upcomingEvents.map((evento: ChurchEvent) => (
              <Grid item key={evento.id} xs={12} sm={6} md={4}>
                <Card className="event-card">
                  
                  {/* === LÓGICA PRINCIPAL AQUI === */}
                  {/* Se o evento TIVER uma imagem, mostre a imagem */}
                  {evento.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="220"
                      image={evento.imageUrl}
                      alt={`Imagem para ${evento.titulo}`}
                      className="event-card-media"
                    />
                  ) : (
                    // Se NÃO TIVER imagem, mostre um fundo colorido
                    <Box 
                      sx={{ 
                        height: '220px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        padding: 2,
                      }}
                    >
                      <Typography variant="h4" component="h2" textAlign="center" sx={{ fontFamily: 'var(--font-merriweather)', textShadow: '1px 1px 4px rgba(0,0,0,0.4)'}}>
                        {evento.titulo}
                      </Typography>
                    </Box>
                  )}

                  <CardContent className="event-card-content">
                    {/* Se o evento NÃO tem imagem, o título já foi mostrado.
                        Se TEM imagem, mostramos o título aqui embaixo. */}
                    {evento.imageUrl && (
                      <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                        {evento.titulo}
                      </Typography>
                    )}

                    <Box display="flex" alignItems="center" my={1.5} color="text.secondary">
                      <EventIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                      <Typography variant="body1" sx={{ fontWeight: '600' }}>
                        {formatDate(evento.data)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                      <LocationOnIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {evento.local}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {evento.descricao}
                    </Typography>
                  </CardContent>

                  <CardActions className="event-card-actions">
                    <Button size="small" variant="text" color="primary">
                      Ver Detalhes
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h5" textAlign="center" color="text.secondary" sx={{ mt: 8 }}>
            Nenhum evento agendado no momento. Fique atento para novidades!
          </Typography>
        )}
      </Container>
    </Box>
  );
}