import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Divider } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupIcon from '@mui/icons-material/Group';
import WomanIcon from '@mui/icons-material/Woman';
import ChildCareIcon from '@mui/icons-material/ChildCare';

// --- DADOS COMPLETOS DOS MINISTÉRIOS ---
const ministerios = [
  {
    nome: "Grupo de Louvor",
    icone: <MusicNoteIcon fontSize="large" />,
    descricao: "Responsável por conduzir a igreja em adoração através da música e do canto em cada culto.",
    lideres: [
      { nome: 'Joel Santos', cargo: 'Líder', foto: '/images/lider-placeholder.jpg' },
    ]
  },
  {
    nome: "Grupo de Jovens",
    icone: <GroupIcon fontSize="large" />,
    descricao: "Um espaço para os jovens se conectarem, crescerem na fé e servirem a Deus com energia e paixão.",
    lideres: [
      { nome: 'Joel Santos', cargo: 'Líder', foto: '/images/lider-placeholder.jpg' },
      { nome: 'Djair', cargo: 'Líder', foto: '/images/lider-placeholder.jpg' },
      { nome: 'Jaqueline Santos', cargo: 'Regente', foto: '/images/lider-placeholder.jpg' },
    ]
  },
  {
    nome: "Grupo das Irmãs (Círculo de Oração)",
    icone: <WomanIcon fontSize="large" />,
    descricao: "A coluna de oração da nossa igreja, intercedendo pelas famílias, pela igreja e por nossa nação.",
    lideres: [
      { nome: 'Ivonete Alves', cargo: 'Líder', foto: '/images/lider-placeholder.jpg' },
      { nome: 'Rosana', cargo: 'Regente', foto: '/images/lider-placeholder.jpg' },
      { nome: 'Ivonildes', cargo: 'Regente', foto: '/images/lider-placeholder.jpg' },
    ]
  },
  {
    nome: "Grupo das Crianças",
    icone: <ChildCareIcon fontSize="large" />,
    descricao: "Ensinando os pequeninos no caminho em que devem andar com amor e dedicação.",
    lideres: [
      { nome: 'Jaqueline Santos', cargo: 'Líder e Regente', foto: '/images/lider-placeholder.jpg' },
    ]
  }
];

export default function MinisteriosPage() {
  return (
    <Box sx={{ backgroundColor: '#f8f9fa', py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          textAlign="center"
          sx={{ fontWeight: 'bold', fontFamily: 'var(--font-merriweather)', color: '#1c3d5a' }}
        >
          Nossos Ministérios
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 8, maxWidth: '700px', mx: 'auto' }}
        >
          Conheça os grupos que servem e fortalecem nossa comunidade com seus dons e talentos.
        </Typography>

        {ministerios.map((ministerio) => (
          <Box key={ministerio.nome} sx={{ mb: 7 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ color: 'primary.main', mb: 1 }}>
                {ministerio.icone}
              </Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: 'var(--font-merriweather)' }}>
                {ministerio.nome}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '600px', mx: 'auto' }}>
                {ministerio.descricao}
              </Typography>
            </Box>
            
            <Grid container spacing={4} justifyContent="center">
              {ministerio.lideres.map((lider) => (
                <Grid item xs={12} sm={6} md={3} key={lider.nome}>
                  <Card className="leader-card">
                    <CardMedia
                      component="img"
                      height="280"
                      image={lider.foto}
                      alt={`Foto de ${lider.nome}`}
                    />
                    <CardContent className="leader-card-content">
                      <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {lider.nome}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                        {lider.cargo}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
        
      </Container>
    </Box>
  );
}