"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from '../../../../../firebase/config';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField,
  FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

// --- TIPAGEM CORRETA ---
interface Membro {
  nome: string;
  foto: File | null;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  estadoCivil: string;
  tel: string;
  celular: string;
  filiacaoMae: string;
  filiacaoPai: string;
  batizadoEspiritoSanto: string;
  batismoAguasData: string;
  cargo: string;
  recebidoMinisterioData: string;
  status: string;
}

const estadoInicialFormulario: Membro = {
  nome: '', foto: null, endereco: '', numero: '', complemento: '', bairro: '',
  cidade: '', estado: '', cep: '', rg: '', cpf: '', dataNascimento: '',
  estadoCivil: '', tel: '', celular: '', filiacaoMae: '', filiacaoPai: '',
  batizadoEspiritoSanto: 'Nao', batismoAguasData: '', cargo: '', recebidoMinisterioData: '',
  status: 'Ativo'
};

const DetalheCampo = ({ label, value }: { label: string, value?: string }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label.toUpperCase()}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || 'Não informado'}
      </Typography>
    </Box>
  </Grid>
);

export default function PaginaMembros() {
  const [membros, setMembros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [novoMembro, setNovoMembro] = useState<Membro>(estadoInicialFormulario);
  const [nomeArquivoFoto, setNomeArquivoFoto] = useState('');
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [membroParaEditar, setMembroParaEditar] = useState<any>(null);

  const fetchMembros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "membros"));
      const membrosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembros(membrosData);
    } catch (err) {
      console.error("ERRO DETALHADO AO BUSCAR MEMBROS: ", err);
      setError("Falha ao carregar os dados. Verifique o console.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembros();
  }, [fetchMembros]);

  const handleAddClickOpen = () => { setNovoMembro(estadoInicialFormulario); setNomeArquivoFoto(''); setAddModalOpen(true); };
  const handleAddClose = () => { setAddModalOpen(false); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isEditModalOpen) {
      setMembroParaEditar((prev: any) => ({ ...prev, [name]: value }));
    } else {
      setNovoMembro(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNovoMembro(prev => ({ ...prev, foto: file }));
      setNomeArquivoFoto(file.name);
    }
  };

  const handleSalvarMembro = async () => {
    if (!novoMembro.nome.trim()) { alert('O nome do membro é obrigatório!'); return; }
    try {
      const { foto, ...dadosParaSalvar } = novoMembro;
      await addDoc(collection(db, "membros"), dadosParaSalvar);
      alert(`Membro "${dadosParaSalvar.nome}" adicionado com sucesso!`);
      handleAddClose();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
    }
  };

  const handleViewClickOpen = (membro: any) => { setMembroSelecionado(membro); setViewModalOpen(true); };
  const handleViewClose = () => { setViewModalOpen(false); setMembroSelecionado(null); };

  const handleEditClickOpen = (membro: any) => {
    setMembroParaEditar(membro);
    setEditModalOpen(true);
  };
  const handleEditClose = () => { setEditModalOpen(false); setMembroParaEditar(null); };
  const handleUpdateMembro = async () => {
    if (!membroParaEditar || !membroParaEditar.nome.trim()) {
      alert('O nome do membro é obrigatório!');
      return;
    }
    try {
      const membroDocRef = doc(db, "membros", membroParaEditar.id);
      const { id, ...dadosParaAtualizar } = membroParaEditar;
      await updateDoc(membroDocRef, dadosParaAtualizar);
      alert(`Dados de "${dadosParaAtualizar.nome}" atualizados com sucesso!`);
      handleEditClose();
      fetchMembros();
    } catch (e) {
      console.error("Erro ao atualizar documento: ", e);
      alert("Ocorreu um erro ao atualizar os dados do membro.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Membros Cadastrados</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClickOpen}>Adicionar Novo</Button>
      </Box>

      {error && <Typography color="error" sx={{ my: 4 }}>{error}</Typography>}

      {!error && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Foto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Telemóvel</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cidade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
                ) : membros.length > 0 ? (
                  membros.map((membro) => (
                    <TableRow hover key={membro.id}>
                      <TableCell><Avatar>{membro.nome.charAt(0)}</Avatar></TableCell>
                      <TableCell>{membro.nome}</TableCell>
                      <TableCell>{membro.celular}</TableCell>
                      <TableCell>{membro.cidade}</TableCell>
                      <TableCell>
                        <Chip label={membro.status} color={membro.status === 'Ativo' ? 'success' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton color="default" size="small" onClick={() => handleViewClickOpen(membro)}><VisibilityIcon /></IconButton>
                        <IconButton color="primary" size="small" onClick={() => handleEditClickOpen(membro)}><EditIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} align="center">Nenhum membro encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* --- Modais (Adicionar, Visualizar, Editar) --- */}
      {/* ... aqui você mantém os mesmos modais do seu código original ... */}
    </Box>
  );
}
