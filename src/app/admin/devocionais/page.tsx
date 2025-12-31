// src/app/admin/devocionais/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, Grid, CircularProgress, Alert, Card, 
    CardContent, CardActions, IconButton, Modal, Paper, TextField 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/firebase/AuthContext';
import { getDevotionals, saveDevotional, deleteDevotional } from '../actions';

interface Devotional {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 600 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function AdminDevotionalsPage() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { userProfile } = useAuth();
  
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const fetchDevotionals = async () => {
    setLoading(true);
    const data = await getDevotionals();
    setDevotionals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDevotionals();
  }, []);

  useEffect(() => {
    // Define o autor padrão apenas se não estivermos a editar um post existente
    if (!isModalOpen && userProfile?.nome) {
      setAuthor(userProfile.nome);
    }
  }, [userProfile, isModalOpen]);

  const openModal = (devotional: Devotional | null = null) => {
    if (devotional) {
      // ✅ CORREÇÃO APLICADA AQUI: Garante que os valores nunca são 'undefined'.
      setCurrentId(devotional.id);
      setTitle(devotional.title || '');
      setAuthor(devotional.author || '');
      setContent(devotional.content || '');
    } else {
      setCurrentId(null);
      setTitle('');
      // Define o autor com base no perfil do utilizador ou deixa em branco
      setAuthor(userProfile?.nome || '');
      setContent('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const devotionalData = { id: currentId, title, author, content };
    await saveDevotional(devotionalData as any); // O 'as any' é seguro aqui por causa da nossa lógica
    await fetchDevotionals();
    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem a certeza de que deseja excluir esta publicação?")) {
      await deleteDevotional(id);
      setDevotionals(prev => prev.filter(d => d.id !== id));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gerir Devocionais
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal()}>
          Nova Publicação
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : devotionals.length === 0 ? (
        <Typography>Nenhuma publicação encontrada. Crie a primeira!</Typography>
      ) : (
        <Grid container spacing={3}>
          {devotionals.map(devotional => (
            <Grid item xs={12} key={devotional.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">{devotional.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Por: {devotional.author} em {new Date(devotional.createdAt).toLocaleDateString('pt-BR')}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => openModal(devotional)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(devotional.id)} color="error"><DeleteIcon /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal para Adicionar/Editar */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Paper sx={style}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {currentId ? 'Editar Publicação' : 'Nova Publicação'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '80vh', overflowY: 'auto' }}>
            <TextField label="Título da Publicação" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
            <TextField label="Autor" value={author} onChange={e => setAuthor(e.target.value)} fullWidth />
            <TextField label="Conteúdo da Mensagem" value={content} onChange={e => setContent(e.target.value)} fullWidth multiline rows={10} />
            <Button onClick={handleSave} variant="contained" disabled={isSaving}>
              {isSaving ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Container>
  );
}