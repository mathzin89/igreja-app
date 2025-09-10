"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from '../../../firebase/config';
import Link from 'next/link';

// Imports do Material-UI
import {
  Box, Typography, Button, Paper, List, ListItem, ListItemText,
  IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, ListItemSecondaryAction, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SlideshowIcon from '@mui/icons-material/Slideshow';

// Interface para a estrutura de uma apresentação
interface Slideshow {
  id: string;
  title: string;
  createdAt: Timestamp;
}

export default function PaginaSlides() {
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os modais
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slideshowToDelete, setSlideshowToDelete] = useState<Slideshow | null>(null);

  const fetchSlideshows = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "slideshows"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Slideshow[];
      setSlideshows(data);
    } catch (error) {
      console.error("Erro ao buscar apresentações: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlideshows();
  }, [fetchSlideshows]);

  // Funções para Criar Apresentação
  const handleOpenAddModal = () => {
    setNewTitle("");
    setAddModalOpen(true);
  };

  const handleCreateSlideshow = async () => {
    if (!newTitle.trim()) {
      alert("Por favor, insira um título.");
      return;
    }
    try {
      await addDoc(collection(db, "slideshows"), {
        title: newTitle,
        createdAt: Timestamp.now(),
        slides: [] // Inicia com uma lista de slides vazia
      });
      setAddModalOpen(false);
      fetchSlideshows(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao criar apresentação: ", error);
    }
  };

  // Funções para Excluir Apresentação
  const handleOpenDeleteModal = (slideshow: Slideshow) => {
    setSlideshowToDelete(slideshow);
    setDeleteModalOpen(true);
  };

  const handleDeleteSlideshow = async () => {
    if (!slideshowToDelete) return;
    try {
      await deleteDoc(doc(db, "slideshows", slideshowToDelete.id));
      setDeleteModalOpen(false);
      fetchSlideshows(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao excluir apresentação: ", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Apresentações de Slides</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
          Criar Nova Apresentação
        </Button>
      </Box>

      <Paper elevation={2}>
        <List>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : slideshows.length === 0 ? (
            <ListItem><ListItemText primary="Nenhuma apresentação criada ainda." /></ListItem>
          ) : (
            slideshows.map((slideshow, index) => (
              <React.Fragment key={slideshow.id}>
                <ListItem>
                  <ListItemText 
                    primary={slideshow.title} 
                    secondary={`Criado em: ${slideshow.createdAt.toDate().toLocaleDateString('pt-BR')}`} 
                  />
                  <ListItemSecondaryAction>
                    <Link href={`/admin/slides/${slideshow.id}`} passHref>
                      <IconButton edge="end" aria-label="edit" title="Editar Slides">
                        <EditIcon />
                      </IconButton>
                    </Link>
                    <Link href={`/apresentacao/${slideshow.id}`} passHref>
                        <IconButton edge="end" aria-label="present" title="Apresentar" target="_blank" sx={{ ml: 1 }}>
                            <SlideshowIcon />
                        </IconButton>
                    </Link>
                    <IconButton edge="end" aria-label="delete" title="Excluir Apresentação" sx={{ ml: 1 }} onClick={() => handleOpenDeleteModal(slideshow)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < slideshows.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
      
      {/* Modal para Adicionar Nova Apresentação */}
      <Dialog open={isAddModalOpen} onClose={() => setAddModalOpen(false)}>
        <DialogTitle>Criar Nova Apresentação</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título da Apresentação"
            type="text"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateSlideshow} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal para Confirmar Exclusão */}
      <Dialog open={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a apresentação "<strong>{slideshowToDelete?.title}</strong>"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteSlideshow} variant="contained" color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}