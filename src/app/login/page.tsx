"use client";

import React, { useState } from 'react';
// Imports do Firebase e Next.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/config';
import { useRouter } from 'next/navigation';
// Imports do Material-UI
import {
  Box, Typography, Button, TextField, Paper, Alert
} from '@mui/material';

export default function PaginaLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // --- A MUDANÇA CRUCIAL ESTÁ AQUI ---
      // Redireciona para o painel de administração
      router.push('/admin'); 
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        console.error(err);
      }
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper 
        component="form" 
        onSubmit={handleLogin}
        elevation={6} 
        sx={{ 
          padding: 4, 
          width: '100%', 
          maxWidth: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Acesso Restrito
        </Typography>
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Senha"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          fullWidth
        >
          Entrar
        </Button>
      </Paper>
    </Box>
  );
}