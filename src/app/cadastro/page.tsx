"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitRegistrationRequest } from './actions';
import Link from 'next/link';

// Imports do Material-UI
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link as MuiLink,
  Grid
} from '@mui/material';
import Image from 'next/image';

const FIREBASE_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/site-ad-plenitude.firebasestorage.app/o/logo-plenitude.png?alt=media&token=93be6db4-4ca5-4fee-9322-37c9baf39ce7";

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!nome || !email) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const result = await submitRegistrationRequest({ nome, email });

    if (result.success) {
      setMessage(result.message);
      setNome('');
      setEmail('');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #1C2536, #2A3A5A)',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={12}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '16px',
            backgroundColor: 'rgba(10, 25, 41, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Image
              src={FIREBASE_LOGO_URL}
              alt="AD Plenitude Logo"
              width={150}
              height={75}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Solicitar Acesso
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'grey.300', textAlign: 'center' }}>
            Preencha seus dados. Sua conta será aprovada por um administrador.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Nome Completo"
              name="nome"
              autoComplete="name"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={{
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'grey.500' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' },
                },
                '& .MuiInputLabel-root': { color: 'grey.400' },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'grey.500' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' },
                },
                '& .MuiInputLabel-root': { color: 'grey.400' },
              }}
            />
            {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{message}</Alert>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Solicitação'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" passHref>
                  <MuiLink variant="body2" sx={{ color: 'grey.400' }}>
                    Já tem uma conta? Entrar
                  </MuiLink>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
