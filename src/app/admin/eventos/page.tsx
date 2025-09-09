"use client";

import React, { useState, useEffect, useCallback } from "react";
// Firebase (importações atualizadas)
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
// MUI
import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  IconButton, // ✅ Importado
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit"; // ✅ Importado
import DeleteIcon from "@mui/icons-material/Delete"; // ✅ Importado

// --- Adicionada uma Interface para tipagem forte ---
interface Evento {
  id?: string;
  titulo: string;
  data: string;
  horario: string;
  local: string;
  descricao: string;
}

const estadoInicialEvento: Evento = {
  titulo: "",
  data: new Date().toISOString().split("T")[0],
  horario: "",
  local: "",
  descricao: "",
};

export default function PaginaEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modais de Adicionar, Editar e Excluir
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [novoEvento, setNovoEvento] = useState<Evento>(estadoInicialEvento);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "eventos"), orderBy("data", "asc"));
      const querySnapshot = await getDocs(q);
      const eventosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Evento[];
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

  // --- Handlers para os Modais ---
  const handleOpenAddModal = () => {
    setNovoEvento(estadoInicialEvento);
    setAddModalOpen(true);
  };
  
  const handleOpenEditModal = (evento: Evento) => {
    setEventoSelecionado(evento);
    setEditModalOpen(true);
  };

  const handleOpenDeleteModal = (evento: Evento) => {
    setEventoSelecionado(evento);
    setDeleteModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setEventoSelecionado(null);
  };
  
  // --- Handlers para os formulários ---
  const handleChangeNovo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoEvento((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (eventoSelecionado) {
      setEventoSelecionado({ ...eventoSelecionado, [name]: value });
    }
  };
  
  // --- Funções de CRUD (Create, Read, Update, Delete) ---
  const handleSalvar = async () => {
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.horario) {
      alert("Por favor, preencha Título, Data e Horário.");
      return;
    }
    try {
      await addDoc(collection(db, "eventos"), novoEvento);
      alert(`Evento "${novoEvento.titulo}" salvo com sucesso!`);
      handleCloseModals();
      fetchEventos();
    } catch (e) {
      console.error("Erro ao salvar evento: ", e);
      alert("Ocorreu um erro ao salvar o evento.");
    }
  };

  const handleUpdate = async () => {
    if (!eventoSelecionado || !eventoSelecionado.id) return;
    try {
      const eventoRef = doc(db, "eventos", eventoSelecionado.id);
      await updateDoc(eventoRef, {
        titulo: eventoSelecionado.titulo,
        data: eventoSelecionado.data,
        horario: eventoSelecionado.horario,
        local: eventoSelecionado.local,
        descricao: eventoSelecionado.descricao,
      });
      alert("Evento atualizado com sucesso!");
      handleCloseModals();
      fetchEventos();
    } catch (e) {
      console.error("Erro ao atualizar evento: ", e);
      alert("Ocorreu um erro ao atualizar o evento.");
    }
  };
  
  const handleDelete = async () => {
    if (!eventoSelecionado || !eventoSelecionado.id) return;
    try {
      await deleteDoc(doc(db, "eventos", eventoSelecionado.id));
      alert("Evento excluído com sucesso!");
      handleCloseModals();
      fetchEventos();
    } catch (e) {
      console.error("Erro ao excluir evento: ", e);
      alert("Ocorreu um erro ao excluir o evento.");
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + "T00:00:00-03:00");
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Próximos Eventos</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
          Adicionar Evento
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : eventos.length === 0 ? (
        <Typography sx={{ mt: 4, textAlign: "center" }}>
          Nenhum evento cadastrado.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {eventos.map((evento) => (
            <Grid key={evento.id} item xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {evento.titulo}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{formatarData(evento.data)}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{evento.horario}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2} color="text.secondary">
                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{evento.local || "Local a definir"}</Typography>
                  </Box>
                  <Typography variant="body2">{evento.descricao}</Typography>
                </CardContent>
                {/* --- Ações de Editar e Excluir --- */}
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleOpenEditModal(evento)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteModal(evento)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* --- Modal de Adicionar Evento --- */}
      <Dialog open={isAddModalOpen} onClose={handleCloseModals} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Novo Evento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField name="titulo" label="Título do Evento" fullWidth value={novoEvento.titulo} onChange={handleChangeNovo} /></Grid>
            <Grid item xs={6}><TextField name="data" label="Data" type="date" fullWidth value={novoEvento.data} onChange={handleChangeNovo} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField name="horario" label="Horário" type="time" fullWidth value={novoEvento.horario} onChange={handleChangeNovo} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField name="local" label="Local (Ex: Sede da Igreja)" fullWidth value={novoEvento.local} onChange={handleChangeNovo} /></Grid>
            <Grid item xs={12}><TextField name="descricao" label="Descrição do Evento" fullWidth multiline rows={4} value={novoEvento.descricao} onChange={handleChangeNovo} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancelar</Button>
          <Button onClick={handleSalvar} variant="contained">Salvar Evento</Button>
        </DialogActions>
      </Dialog>
      
      {/* --- Modal de Editar Evento --- */}
      {eventoSelecionado && (
        <Dialog open={isEditModalOpen} onClose={handleCloseModals} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}><TextField name="titulo" label="Título do Evento" fullWidth value={eventoSelecionado.titulo} onChange={handleChangeEdit} /></Grid>
              <Grid item xs={6}><TextField name="data" label="Data" type="date" fullWidth value={eventoSelecionado.data} onChange={handleChangeEdit} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={6}><TextField name="horario" label="Horário" type="time" fullWidth value={eventoSelecionado.horario} onChange={handleChangeEdit} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12}><TextField name="local" label="Local (Ex: Sede da Igreja)" fullWidth value={eventoSelecionado.local} onChange={handleChangeEdit} /></Grid>
              <Grid item xs={12}><TextField name="descricao" label="Descrição do Evento" fullWidth multiline rows={4} value={eventoSelecionado.descricao} onChange={handleChangeEdit} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleUpdate} variant="contained">Salvar Alterações</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* --- Modal de Confirmação de Exclusão --- */}
      {eventoSelecionado && (
        <Dialog open={isDeleteModalOpen} onClose={handleCloseModals}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>Tem certeza que deseja excluir o evento "{eventoSelecionado.titulo}"? Esta ação não pode ser desfeita.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancelar</Button>
            <Button onClick={handleDelete} variant="contained" color="error">Excluir</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
