"use client"; // Essencial para o formulário funcionar

import { useState } from 'react';
import { Container, Typography, Box, Grid, TextField, Button, Paper } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function ContatoPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você integraria um serviço de envio de email (ex: EmailJS, Resend)
    console.log({ nome, email, mensagem });
    alert('Mensagem enviada com sucesso! (Simulação)');
    // Limpa o formulário
    setNome('');
    setEmail('');
    setMensagem('');
  };

  return (
    <Box sx={{ backgroundColor: '#fff', py: 6 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          textAlign="center" 
          sx={{ fontWeight: 'bold', fontFamily: 'var(--font-merriweather)' }}
        >
          Fale Conosco
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          textAlign="center" 
          sx={{ mb: 6 }}
        >
          Adoraríamos ouvir você. Envie-nos uma mensagem ou visite-nos.
        </Typography>

        <Grid container spacing={5}>
          {/* Coluna de Informações */}
          <Grid item xs={12} md={5}>
            <Typography variant="h5" gutterBottom sx={{ fontFamily: 'var(--font-merriweather)' }}>
              Informações de Contato
            </Typography>
            <Box display="flex" alignItems="center" my={2}>
              <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="body1">
                R. Tauro, 70 - Jd. Novo Horizonte<br/>Carapicuíba - SP
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" my={2}>
              <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="body1">
                contato@adplenitude.com.br
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" my={2}>
              <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="body1">
                (11) 99999-9999
              </Typography>
            </Box>
          </Grid>

          {/* Coluna do Formulário */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontFamily: 'var(--font-merriweather)' }}>
                Envie uma Mensagem
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nome"
                  label="Seu Nome"
                  name="nome"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Seu Email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="mensagem"
                  label="Sua Mensagem"
                  id="mensagem"
                  multiline
                  rows={5}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                >
                  Enviar Mensagem
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}