"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Imports do Firebase
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../../../firebase/config';
// Imports do Material-UI
import {
  Box, Typography, Button, Paper, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, CircularProgress, Card, CardContent, CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const estadoInicialEvento = {
    titulo: '',
    data: new Date().toISOString().split('T')[0], // Data de hoje por padrão
    horario: '',
    local: '',
    descricao: ''
};

export default function PaginaEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [novoEvento, setNovoEvento] = useState(estadoInicialEvento);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      // Cria uma consulta que ordena os eventos pela data, do mais próximo para o mais distante
      const q = query(collection(db, "eventos"), orderBy("data", "asc"));
      const querySnapshot = await getDocs(q);
      const eventosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(eventosData);
    } catch (error) {
      console.error("Erro ao buscar eventos: ", error);
      alert("Falha ao carregar os eventos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleOpenModal = () => {
    setNovoEvento(estadoInicialEvento);
    setModalOpen(true);
  };
  const handleCloseModal = () => { setModalOpen(false); };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNovoEvento(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.horario) {
      alert("Por favor, preencha Título, Data e Horário.");
      return;
    }
    try {
      await addDoc(collection(db, "eventos"), novoEvento);
      alert(`Evento "${novoEvento.titulo}" salvo com sucesso!`);
      handleCloseModal();
      fetchEventos(); // Re-busca os dados para atualizar a lista
    } catch (e) {
      console.error("Erro ao salvar evento: ", e);
      alert("Ocorreu um erro ao salvar o evento.");
    }
  };

  // Função para formatar a data para um formato amigável
  const formatarData = (dataString: string) => {
    const data = new Date(dataString + 'T00:00:00-03:00'); // Considera o fuso horário
    return data.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Próximos Eventos</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
          Adicionar Evento
        </Button>
      </Box>

      {/* Lista de Eventos em Cards */}
      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box>
      ) : eventos.length === 0 ? (
        <Typography sx={{mt: 4, textAlign: 'center'}}>Nenhum evento cadastrado.</Typography>
      ) : (
        <Grid container spacing={3}>
          {eventos.map((evento) => (
            <Grid item xs={12} sm={6} md={4} key={evento.id}>
              <Card elevation={3} sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                <CardContent sx={{flexGrow: 1}}>
                  <Typography variant="h5" component="div" gutterBottom>{evento.titulo}</Typography>
                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <CalendarMonthIcon fontSize="small" sx={{mr: 1}} />
                    <Typography variant="body2">{formatarData(evento.data)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <AccessTimeIcon fontSize="small" sx={{mr: 1}} />
                    <Typography variant="body2">{evento.horario}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                    <LocationOnIcon fontSize="small" sx={{mr: 1}} />
                    <Typography variant="body2">{evento.local || 'Local a definir'}</Typography>
                  </Box>
                  <Typography variant="body2">{evento.descricao}</Typography>
                </CardContent>
                <CardActions>
                  {/* Botões para Editar/Excluir podem ser adicionados aqui no futuro */}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* MODAL DE ADICIONAR EVENTO */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Novo Evento</DialogTitle>
        <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    <TextField name="titulo" label="Título do Evento" fullWidth value={novoEvento.titulo} onChange={handleChange}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField name="data" label="Data" type="date" fullWidth value={novoEvento.data} onChange={handleChange} InputLabelProps={{ shrink: true }}/>
                </Grid>
                <Grid item xs={6}>
                    <TextField name="horario" label="Horário" type="time" fullWidth value={novoEvento.horario} onChange={handleChange} InputLabelProps={{ shrink: true }}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField name="local" label="Local (Ex: Sede da Igreja)" fullWidth value={novoEvento.local} onChange={handleChange}/>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name="descricao"
                        label="Descrição do Evento"
                        fullWidth
                        multiline
                        rows={4}
                        value={novoEvento.descricao}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained">Salvar Evento</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}