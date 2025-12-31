"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, CircularProgress, Alert, Paper } from '@mui/material';
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { getPastorMessage, savePastorMessage } from '../actions';

interface PastorMessage {
  text: string;
  imageUrl: string;
  mainTitle: string;
  roleTitle: string;
}

export default function AdminPastorMessagePage() {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mainTitle, setMainTitle] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessage() {
      setLoading(true);
      const data = await getPastorMessage();
      if (data) {
        setMessage(data.text || '');
        setImageUrl(data.imageUrl || '');
        setMainTitle(data.mainTitle || 'Uma Palavra de Boas-Vindas');
        setRoleTitle(data.roleTitle || 'Pastor Presidente');
      }
      setLoading(false);
    }
    fetchMessage();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await savePastorMessage({ text: message, imageUrl: imageUrl || '', mainTitle: mainTitle, roleTitle: roleTitle });
      alert("Mensagem salva com sucesso!");
    } catch (err) {
      setError("Ocorreu um erro ao salvar a mensagem.");
      console.error(err);
    }
    setIsSaving(false);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Gerir Palavra do Pastor
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Título Principal"
          variant="outlined"
          fullWidth
          value={mainTitle}
          onChange={(e) => setMainTitle(e.target.value)}
          sx={{ mb: 3 }}
          disabled={isSaving}
        />
        <TextField
          label="Subtítulo (Cargo)"
          variant="outlined"
          fullWidth
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          sx={{ mb: 3 }}
          disabled={isSaving}
        />
        <TextField
          label="Mensagem de Boas-Vindas"
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 3 }}
          disabled={isSaving}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2, border: '1px dashed grey', borderRadius: '4px', mb: 3 }}>
          <Typography variant="body2">Foto do Pastor</Typography>
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            onClientUploadComplete={(res) => { if (res?.[0]?.url) { setImageUrl(res[0].url); alert("Upload da foto concluído!"); } }}
            onUploadError={(error: Error) => { alert(`ERRO no upload! ${error.message}`); }}
          />
          {imageUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption">Pré-visualização:</Typography>
              <img src={imageUrl} alt="Preview" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }} />
            </Box>
          )}
        </Box>

        <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaving} fullWidth size="large">
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Salvar Mensagem'}
        </Button>
      </Paper>
    </Container>
  );
}