// src/app/admin/ministerios/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, Grid, CircularProgress, Alert, Card, 
    CardMedia, CardContent, CardActions, IconButton, Modal, Paper, TextField 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ✅ CORREÇÃO: Importa as funções do ficheiro de actions central do admin
import { getMinistries, saveMinistry, deleteMinistry } from '../actions';

interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: string;
  imageUrl: string;
  timestamp: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function AdminMinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leader, setLeader] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchMinistries = async () => {
    setLoading(true);
    const data = await getMinistries();
    setMinistries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMinistries();
  }, []);

  const openModal = (ministry: Ministry | null = null) => {
    if (ministry) {
      setCurrentId(ministry.id);
      setName(ministry.name);
      setDescription(ministry.description);
      setLeader(ministry.leader);
      setImageUrl(ministry.imageUrl);
    } else {
      setCurrentId(null);
      setName('');
      setDescription('');
      setLeader('');
      setImageUrl('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); };

  const handleSave = async () => {
    setIsSaving(true);
    const ministryData = { id: currentId, name, description, leader, imageUrl };
    await saveMinistry(ministryData);
    await fetchMinistries();
    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem a certeza de que deseja excluir este ministério?")) {
      await deleteMinistry(id);
      setMinistries(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gerir Ministérios
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal()}>
          Adicionar Novo
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : ministries.length === 0 ? (
        <Typography>Nenhum ministério encontrado.</Typography>
      ) : (
        <Grid container spacing={3}>
          {ministries.map(ministry => (
            <Grid item xs={12} sm={6} md={4} key={ministry.id}>
              <Card>
                <CardMedia component="img" height="160" image={ministry.imageUrl} alt={ministry.name} sx={{ objectFit: 'cover' }} />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">{ministry.name}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{ministry.description}</Typography>
                  <Typography variant="caption" color="text.secondary">Líder: {ministry.leader}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => openModal(ministry)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(ministry.id)} color="error"><DeleteIcon /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Modal open={isModalOpen} onClose={closeModal}>
        <Paper sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {currentId ? 'Editar Ministério' : 'Adicionar Ministério'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nome do Ministério" value={name} onChange={e => setName(e.target.value)} fullWidth />
            <TextField label="Descrição Curta" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} />
            <TextField label="Nome do Líder" value={leader} onChange={e => setLeader(e.target.value)} fullWidth />
            <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: '4px', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Imagem de Capa</Typography>
              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                onClientUploadComplete={(res) => { if (res?.[0]?.url) { setImageUrl(res[0].url); } }}
                onUploadError={(error: Error) => { alert(`ERRO! ${error.message}`); }}
              />
              {imageUrl && <img src={imageUrl} alt="preview" style={{ marginTop: '10px', width: '100%', objectFit: 'cover' }} />}
            </Box>
            <Button onClick={handleSave} variant="contained" disabled={isSaving}>
              {isSaving ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Container>
  );
}