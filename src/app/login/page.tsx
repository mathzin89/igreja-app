"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ✅ Importa a função de redefinição de senha
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useAuth } from '@/firebase/AuthContext';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Novos estados para gerir o modo de redefinição de senha
  const [resetMode, setResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResetMessage('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Erro de autenticação:", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Email ou senha inválidos. Por favor, tente novamente.");
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      }
      setIsSubmitting(false);
    }
  };

  // ✅ Nova função para lidar com o pedido de redefinição de senha
  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setError("Por favor, insira o seu endereço de email.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setResetMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Email de redefinição enviado! Verifique a sua caixa de entrada (e a pasta de spam).");
    } catch (err: any) {
      console.error("Erro ao redefinir senha:", err.code);
      if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email'){
        setError("O email fornecido não foi encontrado no nosso sistema.");
      } else {
        setError("Ocorreu um erro ao tentar enviar o email de redefinição.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || user) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1C2536' }}>
              <CircularProgress />
          </Box>
      );
  }

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
            {/* ✅ O título muda de acordo com o modo */}
            {resetMode ? 'Redefinir Senha' : 'Acesso Restrito'}
          </Typography>

          {/* Renderização condicional do formulário */}
          {resetMode ? (
            // ✅ Formulário de Redefinição de Senha
            <Box component="form" onSubmit={handlePasswordReset} sx={{ mt: 1, width: '100%' }}>
               <Typography variant="body2" sx={{ mt: 1, mb: 2, color: 'grey.300', textAlign: 'center' }}>
                Insira o seu email para receber um link de redefinição de senha.
              </Typography>
              <TextField margin="normal" required fullWidth id="email" label="Endereço de Email" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'grey.500' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                  }}
                  InputLabelProps={{ style: { color: 'grey.300' } }}
                  inputProps={{ style: { color: 'white' } }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link'}
              </Button>
            </Box>
          ) : (
            // ✅ Formulário de Login (o seu código original)
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
              <TextField margin="normal" required fullWidth id="email" label="Endereço de Email" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'grey.500' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                  }}
                  InputLabelProps={{ style: { color: 'grey.300' } }}
                  inputProps={{ style: { color: 'white' } }}
              />
              <TextField margin="normal" required fullWidth name="password" label="Senha" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'grey.500' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                  }}
                  InputLabelProps={{ style: { color: 'grey.300' } }}
                  inputProps={{ style: { color: 'white' } }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>
          )}

          {/* Mensagens de erro e sucesso */}
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {resetMessage && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{resetMessage}</Alert>}

          {/* Links inferiores */}
          <Grid container sx={{ mt: 2 }} justifyContent="space-between">
            <Grid item>
              <MuiLink component={Link} href="/cadastro" variant="body2" sx={{ color: 'grey.200' }}>
                Solicitar acesso
              </MuiLink>
            </Grid>
            <Grid item>
              {/* ✅ O link agora alterna entre os modos */}
              <MuiLink component="button" variant="body2" sx={{ color: 'grey.200', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setResetMode(!resetMode); setError(null); setResetMessage(''); }}>
                {resetMode ? 'Voltar para o Login' : 'Esqueceu a senha?'}
              </MuiLink>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

