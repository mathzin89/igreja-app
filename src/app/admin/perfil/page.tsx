"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/firebase/AuthContext';
import { updateUserProfile } from './actions';

import {
  Box, Typography, Button, CircularProgress, Paper, Avatar,
  Alert, Grid, TextField
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

export default function PerfilPage() {
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  
  // Estados para os campos editáveis
  const [nome, setNome] = useState('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Inicializa o estado do formulário quando o perfil do utilizador é carregado
  useEffect(() => {
    if (userProfile) {
      setNome(userProfile.nome || '');
    }
  }, [userProfile]);

  // Cria uma URL de pré-visualização para a nova foto
  useEffect(() => {
    if (newPhoto) {
      const url = URL.createObjectURL(newPhoto);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [newPhoto]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewPhoto(event.target.files[0]);
      setSuccess(null);
      setError(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    const hasNameChanged = nome.trim() !== '' && nome !== userProfile?.nome;
    const hasPhotoChanged = newPhoto !== null;

    if (!hasNameChanged && !hasPhotoChanged) {
      setError("Nenhuma alteração foi feita.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    if (hasNameChanged) {
        formData.append('nome', nome);
    }
    if (hasPhotoChanged && newPhoto) {
        formData.append('photo', newPhoto);
    }

    const result = await updateUserProfile(user.uid, formData);

    if (result.success) {
      setSuccess("Perfil atualizado com sucesso!");
      await refreshUserProfile(); // Refresca os dados do perfil na UI
      setNewPhoto(null);
      setPreviewUrl(null);
    } else {
      setError(result.message || "Ocorreu um erro ao atualizar o perfil.");
    }
    setIsSubmitting(false);
  };
  
  // Verifica se existem alterações para ativar o botão de salvar
  const hasChanges = (nome.trim() !== '' && nome !== userProfile?.nome) || newPhoto !== null;

  if (authLoading || !userProfile) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Meu Perfil</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <Avatar 
              src={previewUrl || userProfile.foto || ''} 
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            >
              {nome.charAt(0)}
            </Avatar>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Alterar Foto
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {newPhoto && <Typography variant="caption" display="block" mt={1}>{newPhoto.name}</Typography>}
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              label="Email"
              value={user?.email || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
              variant="filled"
              helperText="O email não pode ser alterado."
            />
             <TextField
              label="Cargo"
              value={userProfile.role || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
              variant="filled"
            />
             <TextField
              label="Igreja"
              value={userProfile.igrejaNome || userProfile.igrejaId || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
              variant="filled"
            />
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!hasChanges || isSubmitting}
            onClick={handleSaveChanges}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Salvar Alterações'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}